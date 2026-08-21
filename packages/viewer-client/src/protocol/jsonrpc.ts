import { toCamel, toSnake } from "./case.js"
import { ConnectionClosedError, RpcError, RpcErrorCode, RpcTimeoutError } from "./errors.js"

/**
 * Minimal transport contract, shaped like `WebSocket` so the real one drops
 * straight in, but narrow enough that tests can supply a fake without opening
 * a port.
 */
export interface Transport {
  send(data: string): void
  close(): void
  onmessage: ((data: string) => void) | null
  onclose: (() => void) | null
  onerror: ((error: Error) => void) | null
}

export type RequestHandler = (params: any) => unknown | Promise<unknown>
export type NotificationHandler = (params: any) => void

export interface JsonRpcOptions {
  /** Default per-call timeout. Individual calls can override it. */
  timeoutMs?: number
}

interface Pending {
  method: string
  resolve: (value: any) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}

const JSONRPC_VERSION = "2.0"

/**
 * JSON-RPC 2.0 over a text transport: one object per frame, no batching.
 *
 * A peer rather than a client. The viewer calls us as often as we call it
 * (`session.handshake`, `session.ping`, `command.execute`), so both directions
 * are first class.
 */
export class JsonRpcPeer {
  private readonly transport: Transport
  private readonly timeoutMs: number
  private readonly pending = new Map<number, Pending>()
  private readonly requestHandlers = new Map<string, RequestHandler>()
  private readonly notificationHandlers = new Map<string, Set<NotificationHandler>>()
  private readonly closeListeners = new Set<() => void>()

  private nextId = 1
  private closed = false

  constructor(transport: Transport, options: JsonRpcOptions = {}) {
    this.transport = transport
    this.timeoutMs = options.timeoutMs ?? 30_000

    // oxlint-disable unicorn/prefer-add-event-listener -- `Transport` is a
    // plain WebSocket-shaped interface, not an `EventTarget`
    transport.onmessage = (data) => this.receive(data)
    transport.onclose = () => this.handleClose()
    // A socket error after open is terminal, and `handleClose` is idempotent,
    // so pending calls fail here rather than waiting out their timeouts.
    transport.onerror = () => this.handleClose()
    // oxlint-enable unicorn/prefer-add-event-listener
  }

  /** Registers the handler for an inbound request. One per method. */
  handle(method: string, handler: RequestHandler): void {
    this.requestHandlers.set(method, handler)
  }

  /** Subscribes to an inbound notification. Returns an unsubscribe function. */
  on(method: string, handler: NotificationHandler): () => void {
    let handlers = this.notificationHandlers.get(method)

    if (!handlers) {
      handlers = new Set()
      this.notificationHandlers.set(method, handlers)
    }

    handlers.add(handler)

    return () => {
      handlers.delete(handler)
    }
  }

  /**
   * Fires once when the connection goes away, whichever end let go.
   *
   * The transport reports its own close, so this covers the viewer quitting
   * as well as our own `close()`.
   */
  onClose(listener: () => void): () => void {
    this.closeListeners.add(listener)

    return () => {
      this.closeListeners.delete(listener)
    }
  }

  notify(method: string, params?: unknown): void {
    if (this.closed) {
      throw new ConnectionClosedError()
    }

    // Notifications must omit `id` entirely. A null id reads as a request to
    // some implementations, including sl-vscode-plugin's.
    this.transport.send(
      JSON.stringify({ jsonrpc: JSONRPC_VERSION, method, params: toSnake(params) }),
    )
  }

  call<T = unknown>(method: string, params?: unknown, timeoutMs = this.timeoutMs): Promise<T> {
    if (this.closed) {
      return Promise.reject(new ConnectionClosedError())
    }

    const id = this.nextId++

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new RpcTimeoutError(method, timeoutMs))
      }, timeoutMs)

      this.pending.set(id, { method, resolve, reject, timer })

      try {
        this.transport.send(
          JSON.stringify({ jsonrpc: JSONRPC_VERSION, id, method, params: toSnake(params) }),
        )
      } catch (error) {
        clearTimeout(timer)
        this.pending.delete(id)
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
  }

  close(): void {
    if (this.closed) return

    this.transport.close()
    this.handleClose()
  }

  private handleClose(): void {
    if (this.closed) return

    this.closed = true

    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer)
      this.pending.delete(id)
      pending.reject(new ConnectionClosedError())
    }

    for (const listener of this.closeListeners) {
      try {
        listener()
      } catch {
        // A listener throwing must not strand the remaining ones.
      }
    }
  }

  private receive(data: string): void {
    let message: any

    try {
      message = JSON.parse(data)
    } catch {
      this.sendError(null, RpcErrorCode.ParseError, "Parse error")

      return
    }

    if (message === null || typeof message !== "object" || Array.isArray(message)) {
      // Batches are not part of this protocol, so an array is as invalid as a scalar.
      this.sendError(null, RpcErrorCode.InvalidRequest, "Invalid request")

      return
    }

    if (typeof message.method === "string") {
      // A notification omits `id`. Treat an explicit null as one too, rather
      // than replying with `"id": null`.
      const isRequest = "id" in message && message.id !== null

      if (isRequest) {
        void this.dispatchRequest(message)
      } else {
        this.dispatchNotification(message)
      }

      return
    }

    this.dispatchResponse(message)
  }

  private dispatchNotification(message: { method: string; params?: unknown }): void {
    const handlers = this.notificationHandlers.get(message.method)

    if (!handlers) return

    const params = toCamel(message.params)

    for (const handler of handlers) {
      try {
        handler(params)
      } catch {
        // A listener throwing must not take the connection down with it.
      }
    }
  }

  private async dispatchRequest(message: {
    id: number | string
    method: string
    params?: unknown
  }): Promise<void> {
    const handler = this.requestHandlers.get(message.method)

    if (!handler) {
      this.sendError(message.id, RpcErrorCode.MethodNotFound, `Method not found: ${message.method}`)

      return
    }

    try {
      const result = await handler(toCamel(message.params))

      this.send({ jsonrpc: JSONRPC_VERSION, id: message.id, result: toSnake(result) ?? null })
    } catch (error) {
      const code = error instanceof RpcError ? error.code : RpcErrorCode.InternalError

      this.sendError(message.id, code, error instanceof Error ? error.message : String(error))
    }
  }

  private dispatchResponse(message: {
    id?: number | string
    result?: unknown
    error?: { code: number; message: string; data?: unknown }
  }): void {
    // We only ever send numeric ids, but JSON-RPC 2.0 does not require a peer
    // to echo the same type back, so "7" has to find the call that sent 7.
    const id = typeof message.id === "number" ? message.id : Number(message.id)

    if (!Number.isInteger(id)) return

    const pending = this.pending.get(id)

    if (!pending) return

    clearTimeout(pending.timer)
    this.pending.delete(id)

    if (message.error) {
      pending.reject(new RpcError(message.error, pending.method))

      return
    }

    if (!("result" in message)) {
      pending.reject(
        new RpcError(
          { code: RpcErrorCode.InternalError, message: "response had neither result nor error" },
          pending.method,
        ),
      )

      return
    }

    pending.resolve(toCamel(message.result))
  }

  private send(payload: unknown): void {
    if (this.closed) return

    this.transport.send(JSON.stringify(payload))
  }

  private sendError(id: number | string | null, code: number, message: string): void {
    this.send({ jsonrpc: JSONRPC_VERSION, id, error: { code, message } })
  }
}
