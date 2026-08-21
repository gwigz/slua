import { randomUUID } from "node:crypto"
import { chmod, mkdtemp, rm, stat, unlink, writeFile } from "node:fs/promises"
import { connect, createServer, type Server, type Socket } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { JsonRpcPeer } from "../protocol/jsonrpc.js"
import type { SessionHandshake, SessionHandshakeResponse } from "../protocol/types.js"
import { controlPath, socketTransport } from "./socket.js"

/**
 * The viewer calls a control client may make through the session.
 *
 * Listed rather than pattern-matched. A handler is registered per method, and
 * a client asking for anything else deserves the protocol's own "method not
 * found" rather than a forwarded surprise.
 */
export const FORWARDED_METHODS = [
  "object.list",
  "object.request",
  "object.unpublish",
  "object.modify",
  "object.content.get",
  "object.content.save",
  "object.item.create",
  "object.item.delete",
  "object.item.modify",
  "object.script.set_running",
  "object.script.reset",
  "script.list",
  "script.subscribe",
  "language.syntax.id",
  "language.syntax",
  "language.syntax.cache",
  "language.syntax.get",
  "command.execute",
  "command.list",
]

/** How long a leftover socket has to answer before it counts as alive. */
const LIVENESS_TIMEOUT_MS = 500

/** Raised when the project already has a session listening on its socket. */
export class SessionAlreadyRunningError extends Error {
  constructor(readonly path: string) {
    super(`a session is already running for this project; its control socket is ${path}`)

    this.name = "SessionAlreadyRunningError"
  }
}

export interface ControlHandlers {
  /** The viewer's own handshake, so a client sees the real feature set. */
  handshake(): SessionHandshake | undefined
  status(): unknown
  logs(params: { since?: number; sinceMs?: number; limit?: number }): unknown
  push(params: { targets?: string[] }): Promise<unknown>
  wait(params: { since?: number; timeoutMs?: number }): Promise<unknown>
  forward(method: string, params: unknown): Promise<unknown>
}

export interface ControlServer {
  readonly path: string
  /** Passes a viewer notification on to every attached client. */
  broadcast(method: string, params: unknown): void
  readonly clients: number
  close(): Promise<void>
}

/** Whether something is listening on `path` right now. */
function answering(path: string): Promise<boolean> {
  return new Promise<boolean>((done) => {
    const socket = connect(path)

    const settle = (live: boolean) => {
      socket.destroy()
      done(live)
    }

    // A socket that connects but never speaks is still one somebody owns, so
    // the timeout answers yes.
    const timer = setTimeout(() => settle(true), LIVENESS_TIMEOUT_MS)

    socket.once("connect", () => {
      clearTimeout(timer)
      settle(true)
    })

    socket.once("error", () => {
      clearTimeout(timer)
      settle(false)
    })
  })
}

function inUse(error: unknown): boolean {
  return (error as NodeJS.ErrnoException | undefined)?.code === "EADDRINUSE"
}

/** Names the socket file, so a start cannot unlink one it never looked at. */
async function identity(path: string): Promise<string | undefined> {
  const stats = await stat(path).catch(() => undefined)

  return stats && `${stats.dev}:${stats.ino}`
}

/**
 * The auth challenge, the way the viewer does it.
 *
 * A unix socket at mode 0600 is already only reachable by this user, so this
 * is not what keeps it safe. It is here so `ViewerClient` attaches to a
 * session unchanged, answering the same handshake it answers for the viewer.
 */
async function challenge(): Promise<{ path: string; value: string; clean: () => Promise<void> }> {
  const directory = await mkdtemp(join(tmpdir(), "slua-control-"))
  const value = randomUUID()
  const path = join(directory, `sl_script_challenge_${randomUUID()}.tmp`)

  await writeFile(path, value, { encoding: "utf8", mode: 0o600 })

  return {
    path,
    value,
    clean: () => rm(directory, { recursive: true, force: true }),
  }
}

/**
 * Serves the control socket for a running `connect`.
 *
 * It speaks the viewer's own JSON-RPC, so `control.*` is the only namespace
 * it adds. Everything else a client already knows how to say is forwarded
 * upstream, and every viewer notification is passed back down.
 */
export async function startControlServer(
  root: string,
  handlers: ControlHandlers,
): Promise<ControlServer> {
  const path = controlPath(root)
  const peers = new Set<JsonRpcPeer>()

  const serve = async (socket: Socket) => {
    const peer = new JsonRpcPeer(socketTransport(socket))

    peers.add(peer)
    peer.onClose(() => peers.delete(peer))

    peer.handle("session.ping", (params?: { timestamp?: number }) => ({
      timestamp: params?.timestamp ?? 0,
      serverTime: Date.now(),
    }))

    peer.on("session.disconnect", () => peer.close())

    let auth: Awaited<ReturnType<typeof challenge>> | undefined

    try {
      auth = await challenge()

      const upstream = handlers.handshake()

      const response = await peer.call<SessionHandshakeResponse>("session.handshake", {
        ...upstream,
        // The viewer's own challenge file is long gone, and echoing a path we
        // do not own would be nonsense. This one is ours.
        challenge: auth.path,
        serverVersion: upstream?.serverVersion ?? "1.0.0",
        protocolVersion: upstream?.protocolVersion ?? "1.0",
        viewerName: upstream?.viewerName ?? "slua-viewer connect",
      })

      if (response?.challengeResponse !== auth.value) {
        peer.notify("session.disconnect", { reason: 2, message: "Invalid challenge response" })
        peer.close()

        return
      }
    } catch {
      // A client that cannot complete the handshake is not one we can serve.
      peer.close()

      return
    } finally {
      await auth?.clean()
    }

    // Registered only now. Everything below reaches the viewer or this
    // session's own state, and an unauthenticated caller reaches neither.
    peer.handle("control.status", () => handlers.status())
    peer.handle("control.logs", (params) => handlers.logs(params ?? {}))
    peer.handle("control.push", (params) => handlers.push(params ?? {}))
    peer.handle("control.wait", (params) => handlers.wait(params ?? {}))

    // Anything else the client knows how to say to a viewer, the session says
    // on its behalf. Ids remap for free, since this is a fresh call upstream.
    for (const method of FORWARDED_METHODS) {
      peer.handle(method, (params) => handlers.forward(method, params))
    }

    peer.notify("session.ok", {})
  }

  const server: Server = createServer((socket: Socket) => {
    void serve(socket)
  })

  const listen = () =>
    new Promise<void>((ready, failed) => {
      server.once("error", failed)
      server.listen(path, () => {
        server.off("error", failed)
        ready()
      })
    })

  // Binding is what settles who owns the project. Probing first and unlinking
  // after leaves a window where two starts both find nothing there, and the
  // loser deletes the winner's socket.
  try {
    await listen()
  } catch (error) {
    if (!inUse(error)) throw error

    // Only connecting settles whether the socket that refused the bind is
    // live. Unlinking one that still answers would strand the session behind
    // it with its clients attached.
    const refused = await identity(path)

    if (await answering(path)) throw new SessionAlreadyRunningError(path)

    // Another start may have cleaned the same corpse up while we were asking.
    // Its socket is live, and not ours to remove.
    if ((await identity(path)) === refused) await unlink(path).catch(() => {})

    try {
      await listen()
    } catch (retry) {
      if (!inUse(retry)) throw retry

      // Somebody bound it between the unlink and here; the project is theirs.
      throw new SessionAlreadyRunningError(path)
    }
  }

  // Only this user, which is what actually keeps the socket private. Named
  // pipes on Windows are not files, so there is nothing to chmod there.
  if (process.platform !== "win32") await chmod(path, 0o600).catch(() => {})

  const bound = await identity(path)

  return {
    path,

    get clients() {
      return peers.size
    },

    broadcast(method, params) {
      for (const peer of peers) {
        try {
          peer.notify(method, params)
        } catch {
          // A client that went away mid-broadcast is not the session's problem.
        }
      }
    },

    async close() {
      for (const peer of peers) peer.close()

      peers.clear()

      await new Promise<void>((done) => server.close(() => done()))

      // Only while the path is still the socket this session bound. A session
      // that took the project over in the meantime owns what is there now.
      if ((await identity(path)) === bound) await unlink(path).catch(() => {})
    },
  }
}
