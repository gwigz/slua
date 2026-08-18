import { readFile } from "node:fs/promises"
import { HandshakeError, ViewerUnavailableError } from "./errors.js"
import { JsonRpcPeer, type Transport } from "./jsonrpc.js"
import {
  type CommandExecuteParams,
  type CommandExecuteResponse,
  CommandError,
  type CommandInfo,
  DisconnectReason,
  type SessionDisconnect,
  type SessionHandshake,
  type SessionHandshakeResponse,
  type SessionPing,
} from "./types.js"

export const DEFAULT_PORT = 9020

/** The viewer blocks up to 60s on the asset upload, so saves need their own budget. */
export const SAVE_TIMEOUT_MS = 90_000

const DEFAULT_TIMEOUT_MS = 30_000
const PING_INTERVAL_MS = 30_000
const PING_TIMEOUT_MS = 10_000
const MAX_PING_FAILURES = 2

export type TransportFactory = (url: string) => Promise<Transport>

export interface ConnectOptions {
  port?: number
  host?: string
  timeoutMs?: number
  clientName?: string
  clientVersion?: string
  /** Handlers for `editor.*` commands the viewer may invoke on us. */
  commands?: Record<string, (params?: Record<string, unknown>) => unknown>
  /** Swap the transport out in tests. */
  transport?: TransportFactory
  /** Milliseconds to wait for the viewer to drive the handshake through to `session.ok`. */
  handshakeTimeoutMs?: number
  onPingLatency?: (latencyMs: number) => void
}

/** Opens a real WebSocket using the runtime's built-in global (Node 22+). */
export const webSocketTransport: TransportFactory = (url) =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket(url)

    let opened = false

    const transport: Transport = {
      send: (data) => socket.send(data),
      close: () => socket.close(),
      onmessage: null,
      onclose: null,
      onerror: null,
    }

    socket.addEventListener(
      "open",
      () => {
        opened = true
        resolve(transport)
      },
      { once: true },
    )

    socket.addEventListener("message", (event) => {
      const data = typeof event.data === "string" ? event.data : String(event.data)

      transport.onmessage?.(data)
    })

    // A failed connection reports `error` once the socket is already closed,
    // so `close` is where both the rejection and the reason come from.
    socket.addEventListener("close", (event) => {
      if (!opened) {
        reject(new ViewerUnavailableError(url, (event as CloseEvent).reason || undefined))

        return
      }

      transport.onclose?.()
    })

    socket.addEventListener("error", () => {
      if (!opened) return

      transport.onerror?.(new Error(`websocket error (${url})`))
    })
  })

/**
 * A live session with the viewer.
 *
 * The viewer drives the handshake: it opens with a `session.handshake` *call*
 * once we connect, so this serves that request (including the local-file auth
 * challenge) before it can make any calls of its own.
 */
export class ViewerConnection {
  readonly peer: JsonRpcPeer
  /** The viewer's handshake payload, available once connected. */
  handshake?: SessionHandshake

  private pingTimer?: ReturnType<typeof setInterval>
  private pingFailures = 0
  private disposed = false
  private readonly closeListeners = new Set<(reason?: SessionDisconnect) => void>()
  private disconnectReason?: SessionDisconnect

  private constructor(peer: JsonRpcPeer) {
    this.peer = peer

    // The transport reports its own close, so a viewer that quits reaches
    // `onClose` listeners immediately rather than waiting on ping failures.
    this.peer.onClose(() => this.handleClosed())
  }

  static async connect(options: ConnectOptions = {}): Promise<ViewerConnection> {
    const host = options.host ?? "127.0.0.1"
    const port = options.port ?? DEFAULT_PORT
    const factory = options.transport ?? webSocketTransport

    const transport = await factory(`ws://${host}:${port}`)
    const peer = new JsonRpcPeer(transport, { timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS })
    const connection = new ViewerConnection(peer)

    connection.registerHandlers(options)

    try {
      await connection.awaitSession(
        options.handshakeTimeoutMs ?? options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      )
    } catch (error) {
      // The transport is already open at this point, and an open socket keeps
      // the event loop alive, so a rejected handshake would hang the process.
      peer.close()

      throw error
    }

    connection.startPing(options.onPingLatency)

    return connection
  }

  /** Fires when the connection goes away, with the viewer's reason when it gave one. */
  onClose(listener: (reason?: SessionDisconnect) => void): () => void {
    this.closeListeners.add(listener)

    return () => {
      this.closeListeners.delete(listener)
    }
  }

  /** Sends `session.disconnect` so the viewer logs a clean shutdown, then closes. */
  close(reason: number = DisconnectReason.EditorClosed, message = "client exited"): void {
    if (this.disposed) return

    try {
      this.peer.notify("session.disconnect", { reason, message })
    } catch {
      // Already gone; nothing to announce.
    }

    this.dispose()
    this.peer.close()
  }

  /** The single exit from a live session: stop pinging, then notify once. */
  private handleClosed(): void {
    if (this.disposed) return

    this.dispose()

    for (const listener of this.closeListeners) {
      listener(this.disconnectReason)
    }
  }

  private dispose(): void {
    if (this.disposed) return

    this.disposed = true

    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = undefined
    }
  }

  private registerHandlers(options: ConnectOptions): void {
    this.peer.handle("session.handshake", async (params: SessionHandshake) => {
      this.handshake = params

      return await buildHandshakeResponse(params, options)
    })

    this.peer.handle("session.ping", (params?: SessionPing) => ({
      timestamp: params?.timestamp ?? 0,
      server_time: Date.now(),
    }))

    const commands = options.commands ?? {}

    this.peer.handle("command.list", (): { commands: CommandInfo[] } => ({
      commands: Object.keys(commands).map((command) => ({ command })),
    }))

    this.peer.handle(
      "command.execute",
      async (params: CommandExecuteParams): Promise<CommandExecuteResponse> => {
        const handler = commands[params?.command]

        if (!handler) {
          return {
            success: false,
            error_code: CommandError.UnknownCommand,
            message: `unknown command: ${params?.command}`,
          }
        }

        try {
          // Awaited, or an async handler serialises as `{}` and its rejection
          // escapes this catch as an unhandled rejection.
          return { success: true, result: await handler(params.params) }
        } catch (error) {
          return {
            success: false,
            error_code: CommandError.ExecutionError,
            message: error instanceof Error ? error.message : String(error),
          }
        }
      },
    )

    this.peer.on("session.disconnect", (params: SessionDisconnect) => {
      this.disconnectReason = params
    })
  }

  /** Resolves on `session.ok`; rejects if the viewer disconnects or stalls. */
  private awaitSession(timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const settle = (fn: () => void) => {
        clearTimeout(timer)
        offOk()
        offDisconnect()
        fn()
      }

      const timer = setTimeout(() => {
        settle(() => reject(new HandshakeError(`no session.ok within ${timeoutMs}ms`)))
      }, timeoutMs)

      const offOk = this.peer.on("session.ok", () => settle(resolve))

      const offDisconnect = this.peer.on("session.disconnect", (params: SessionDisconnect) => {
        settle(() =>
          reject(
            new HandshakeError(
              `viewer refused the session (reason ${params?.reason}): ${params?.message ?? ""}`.trim(),
            ),
          ),
        )
      })
    })
  }

  private startPing(onLatency?: (latencyMs: number) => void): void {
    this.pingTimer = setInterval(() => {
      const sentAt = Date.now()

      this.peer
        .call<{ timestamp: number }>("session.ping", { timestamp: sentAt }, PING_TIMEOUT_MS)
        .then(() => {
          this.pingFailures = 0
          onLatency?.(Date.now() - sentAt)
        })
        .catch(() => {
          this.pingFailures += 1

          // Closing the peer fires `handleClosed` through the close hook.
          if (this.pingFailures >= MAX_PING_FAILURES) {
            this.peer.close()
          }
        })
    }, PING_INTERVAL_MS)

    // Node keeps the process alive for pending timers; a one-shot command
    // should still be able to exit while the interval is armed.
    this.pingTimer.unref?.()
  }
}

/**
 * Builds our side of the handshake, answering the local-file auth challenge.
 *
 * The viewer writes a UUID to a temp file and sends the *path*; proving we can
 * read it proves we are on the same machine as the viewer. The contents go
 * back unmodified, which is what sl-vscode-plugin does and what the viewer's
 * `asUUID()` comparison expects.
 */
export async function buildHandshakeResponse(
  handshake: SessionHandshake,
  options: Pick<ConnectOptions, "clientName" | "clientVersion" | "commands"> = {},
): Promise<SessionHandshakeResponse> {
  const response: SessionHandshakeResponse = {
    client_name: options.clientName ?? "@gwigz/slua-viewer-client",
    client_version: options.clientVersion ?? "1.0",
    protocol_version: "1.0",
    languages: ["lsl", "luau"],
    features: {
      object_publish: true,
      error_reporting: true,
      commands: true,
    },
  }

  if (handshake?.challenge) {
    try {
      response.challenge_response = await readFile(handshake.challenge, "utf8")
    } catch (error) {
      throw new HandshakeError(
        `could not read the auth challenge at ${handshake.challenge}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  return response
}
