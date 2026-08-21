import { connect as connectSocket } from "node:net"
import { ViewerClient } from "../client.js"
import { ViewerUnavailableError } from "../protocol/errors.js"
import type { Transport } from "../protocol/jsonrpc.js"
import { type ConnectOptions, ViewerConnection } from "../protocol/peer.js"
import { readSession, type SessionInfo } from "../state.js"
import { controlPath, socketTransport } from "./socket.js"

const CONNECT_TIMEOUT_MS = 5_000

export interface ControlStatus {
  connected: boolean
  watching: boolean
  pushing: boolean
  cursor: number
  targets: {
    name: string
    file: string
    item?: string
    lastPush?: Record<string, unknown>
  }[]
}

export interface WaitResult {
  settled: boolean
  cursor: number
  targets: Record<string, unknown>[]
  logs: Record<string, unknown>[]
  /** Records the cap left out. They are all in `.slua/logs.jsonl`. */
  truncated: number
  logPath?: string
}

/**
 * A `ViewerClient` attached to a running `connect`, plus the `control.*` calls.
 *
 * The session speaks the viewer's own protocol, so this is the same client
 * class over a different transport, and every existing command works against
 * it unchanged.
 */
export class ControlClient extends ViewerClient {
  status(): Promise<ControlStatus> {
    return this.connection.peer.call("control.status", {})
  }

  logs(params: { since?: number; sinceMs?: number; limit?: number } = {}): Promise<{
    cursor: number
    logs: Record<string, unknown>[]
    truncated: number
    logPath?: string
  }> {
    return this.connection.peer.call("control.logs", params)
  }

  /**
   * Pushes now, skipping the debounce, and returns the cursor to wait from.
   *
   * The cursor comes back from before the push starts, so handing it straight
   * to `wait` cannot match the previous run's results.
   */
  pushNow(targets?: string[]): Promise<{ cursor: number; waited: number; targets: string[] }> {
    return this.connection.peer.call("control.push", { targets })
  }

  /** Blocks until a push newer than `since` has settled, or the timeout. */
  wait(params: { since?: number; timeoutMs?: number } = {}): Promise<WaitResult> {
    // The call has to outlive the block it is asking for, or the transport
    // times out before the answer it was waiting for can arrive.
    return this.connection.peer.call("control.wait", params, (params.timeoutMs ?? 30_000) + 10_000)
  }
}

/** Opens a socket to a path, or reports it as unavailable. */
function pathTransport(path: string): () => Promise<Transport> {
  return () =>
    new Promise<Transport>((ready, failed) => {
      const socket = connectSocket(path)

      const timer = setTimeout(() => {
        socket.destroy()
        failed(new ViewerUnavailableError(path, `no response within ${CONNECT_TIMEOUT_MS}ms`))
      }, CONNECT_TIMEOUT_MS)

      socket.once("connect", () => {
        clearTimeout(timer)
        ready(socketTransport(socket))
      })

      socket.once("error", (error) => {
        clearTimeout(timer)
        failed(new ViewerUnavailableError(path, error.message))
      })
    })
}

export interface AttachOptions extends Pick<ConnectOptions, "timeoutMs" | "clientName"> {
  /** The socket to use instead of the one derived from the project root. */
  path?: string
}

/**
 * Attaches to a running session, or reports why it could not.
 *
 * Liveness is decided by connecting, never by the session file existing: a pid
 * file outlives the process that wrote it, and the socket does not lie.
 */
export async function attachControl(
  root: string,
  options: AttachOptions = {},
): Promise<ControlClient> {
  const session = await readSession(root)
  const path = options.path ?? session?.socket ?? controlPath(root)

  const connection = await ViewerConnection.connect({
    ...options,
    transport: pathTransport(path),
  })

  return new ControlClient(connection)
}

/** The session recorded for a project, whether or not it is still running. */
export async function sessionFor(root: string): Promise<SessionInfo | undefined> {
  return await readSession(root)
}
