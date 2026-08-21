import { randomUUID } from "node:crypto"
import { chmod, mkdtemp, rm, unlink, writeFile } from "node:fs/promises"
import { createServer, type Server, type Socket } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { JsonRpcPeer } from "../protocol/jsonrpc.js"
import type { SessionHandshake, SessionHandshakeResponse } from "../protocol/types.js"
import { controlPath, socketTransport } from "./socket.js"

/**
 * The viewer calls a control client may make through the session.
 *
 * Listed rather than pattern-matched, because a handler is registered per
 * method and a client asking for anything else deserves the protocol's own
 * "method not found" rather than a forwarded surprise.
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

/** Everything a running session offers over the socket. */
export interface ControlHandlers {
  /** The viewer's own handshake, so a client sees the real feature set. */
  handshake(): SessionHandshake | undefined
  status(): unknown
  logs(params: { since?: number; sinceMs?: number; limit?: number }): unknown
  push(params: { targets?: string[] }): Promise<unknown>
  wait(params: { since?: number; timeoutMs?: number }): Promise<unknown>
  /** Passes a call through to the viewer. */
  forward(method: string, params: unknown): Promise<unknown>
}

export interface ControlServer {
  readonly path: string
  /** Sends a viewer notification on to every attached client. */
  broadcast(method: string, params: unknown): void
  readonly clients: number
  close(): Promise<void>
}

/**
 * The auth challenge, the way the viewer does it.
 *
 * A unix socket at mode 0600 is already only reachable by this user, so this
 * is not what makes the socket safe. It is here because it is what makes
 * `ViewerClient` connect to a session with no changes at all: the client
 * answers the same handshake it answers for the viewer.
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

  // A socket left behind by a session that crashed would refuse the bind, and
  // the liveness question is settled by connecting, not by the file existing.
  await unlink(path).catch(() => {})

  const serve = async (socket: Socket) => {
    const peer = new JsonRpcPeer(socketTransport(socket))

    peers.add(peer)
    peer.onClose(() => peers.delete(peer))

    peer.handle("session.ping", (params?: { timestamp?: number }) => ({
      timestamp: params?.timestamp ?? 0,
      serverTime: Date.now(),
    }))

    peer.on("session.disconnect", () => peer.close())

    peer.handle("control.status", () => handlers.status())
    peer.handle("control.logs", (params) => handlers.logs(params ?? {}))
    peer.handle("control.push", (params) => handlers.push(params ?? {}))
    peer.handle("control.wait", (params) => handlers.wait(params ?? {}))

    // Anything else the client knows how to say to a viewer, the session says
    // on its behalf. Ids are remapped for free: this is a fresh call upstream.
    for (const method of FORWARDED_METHODS) {
      peer.handle(method, (params) => handlers.forward(method, params))
    }

    const auth = await challenge()

    try {
      const upstream = handlers.handshake()

      const response = await peer.call<SessionHandshakeResponse>("session.handshake", {
        ...upstream,
        // The viewer's own challenge file is long gone, and echoing a path we
        // do not own would be nonsense; this one is ours.
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
      await auth.clean()
    }

    peer.notify("session.ok", {})
  }

  const server: Server = createServer((socket: Socket) => {
    void serve(socket)
  })

  await new Promise<void>((ready, failed) => {
    server.once("error", failed)
    server.listen(path, () => {
      server.off("error", failed)
      ready()
    })
  })

  // Only this user, which is what actually keeps the socket private. Named
  // pipes on Windows are not files, so there is nothing to chmod there.
  if (process.platform !== "win32") await chmod(path, 0o600).catch(() => {})

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
      await unlink(path).catch(() => {})
    },
  }
}
