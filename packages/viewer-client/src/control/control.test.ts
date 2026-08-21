import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { connect as connectSocket } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { SessionHandshake } from "../protocol/types.js"
import { attachControl, type ControlClient } from "./client"
import { controlPath } from "./socket"
import { type ControlServer, SessionAlreadyRunningError, startControlServer } from "./server"

const roots: string[] = []
const servers: ControlServer[] = []
const clients: ControlClient[] = []

afterEach(async () => {
  for (const client of clients.splice(0)) client.close()
  for (const server of servers.splice(0)) await server.close()
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true })
})

/** What the viewer would have said, as the session reports it onwards. */
const HANDSHAKE: SessionHandshake = {
  serverVersion: "1.0.0",
  protocolVersion: "1.0",
  viewerName: "Mock Viewer",
  viewerVersion: "0.0.0",
  agentId: "dddddddd-1111-2222-3333-444444444444",
  agentName: "mock.resident",
  languages: ["lsl", "luau"],
  features: { liveSync: true, compilation: true, unifiedDiagnostics: true },
} as SessionHandshake

interface Recorded {
  forwarded: { method: string; params: unknown }[]
  pushed: (string[] | undefined)[]
}

/** The session a control client sees, with nothing behind it but this file. */
function handlers(
  recorded: Recorded = { forwarded: [], pushed: [] },
): Parameters<typeof startControlServer>[1] {
  return {
    handshake: () => HANDSHAKE,
    status: () => ({ connected: true, watching: true, pushing: false, cursor: 7, targets: [] }),
    logs: ({ since = 0 }) => ({
      cursor: 9,
      logs: [{ seq: 9, level: "debug", message: "after" }].filter((entry) => entry.seq > since),
      truncated: 0,
    }),
    push: async ({ targets }) => {
      recorded.pushed.push(targets)

      return { cursor: 5, targets: targets ?? ["main"] }
    },
    wait: async ({ since = 0 }) => ({
      settled: true,
      cursor: 12,
      targets: [{ name: "main", ok: true }],
      logs: [{ seq: since + 1, level: "debug", message: "settled" }],
      truncated: 0,
    }),
    forward: async (method, params) => {
      recorded.forwarded.push({ method, params })

      return { objects: [] }
    },
  }
}

async function session(overrides: Partial<Parameters<typeof startControlServer>[1]> = {}) {
  const root = await mkdtemp(join(tmpdir(), "slua-control-"))

  roots.push(root)

  const recorded: Recorded = { forwarded: [], pushed: [] }

  const server = await startControlServer(root, { ...handlers(recorded), ...overrides })

  servers.push(server)

  const client = await attachControl(root, { path: server.path })

  clients.push(client)

  return { root, server, client, recorded }
}

describe("the control socket", () => {
  it("hands a plain ViewerClient the viewer's own handshake", async () => {
    const { client } = await session()

    // The `unifiedDiagnostics` checks in the runtime view read this, so a
    // session that reported its own features would change how output is
    // filtered for every client attached to it.
    expect(client.connection.handshake?.viewerName).toBe("Mock Viewer")
    expect(client.connection.handshake?.features.unifiedDiagnostics).toBe(true)
  })

  it("forwards a viewer call upstream, unchanged", async () => {
    const { client, recorded } = await session()

    await client.objectList()

    expect(recorded.forwarded).toEqual([{ method: "object.list", params: {} }])
  })

  it("answers the control namespace", async () => {
    const { client } = await session()

    expect(await client.status()).toMatchObject({ connected: true, cursor: 7 })
    expect(await client.logs({ since: 5 })).toMatchObject({ cursor: 9, truncated: 0 })
  })

  it("hands back a cursor from before the push it triggers", async () => {
    const { client, recorded } = await session()

    const result = await client.pushNow(["main"])

    expect(recorded.pushed).toEqual([["main"]])

    // Waiting from this cursor has to match the push it just asked for, not
    // the one before it, which is why it comes from before the trigger.
    const settled = await client.wait({ since: result.cursor })

    expect(settled).toMatchObject({ settled: true, targets: [{ name: "main", ok: true }] })
    expect(settled.logs).toEqual([expect.objectContaining({ seq: result.cursor + 1 })])
  })

  it("broadcasts viewer notifications to every attached client", async () => {
    const { root, server } = await session()
    const second = await attachControl(root, { path: server.path })

    clients.push(second)

    const seen: string[] = []

    second.on("runtime.debug", (params) => seen.push(params.message))

    server.broadcast("runtime.debug", {
      scriptId: "",
      objectId: "id",
      objectName: "Object",
      message: "hello",
    })

    // The notification crosses a process boundary in real use, so give it a
    // turn of the loop to arrive.
    await new Promise((done) => setTimeout(done, 50))

    expect(seen).toEqual(["hello"])
  })

  it("serves nothing before the challenge is answered", async () => {
    const { server, recorded } = await session()

    const rogue = connectSocket(server.path)
    const lines: string[] = []

    rogue.setEncoding("utf8")
    rogue.on("data", (chunk: string) => lines.push(chunk))

    await new Promise((done) => setTimeout(done, 100))

    // Asked without ever answering the handshake the session just sent.
    rogue.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "control.status" })}\n`)
    rogue.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "object.list" })}\n`)

    await new Promise((done) => setTimeout(done, 100))

    const seen = lines.join("")

    // Method not found, rather than the session's state or a call the viewer
    // would have run on this caller's behalf.
    expect(seen).not.toContain('"cursor":7')
    expect(recorded.forwarded).toEqual([])
    expect(seen).toContain("-32601")

    rogue.destroy()
  })

  it("lets only one of two concurrent starts own the project", async () => {
    const root = await mkdtemp(join(tmpdir(), "slua-control-"))

    roots.push(root)

    // Both find nothing listening, which is the moment a probe-then-unlink
    // start deletes the socket the other one just bound.
    const starts = await Promise.allSettled([
      startControlServer(root, handlers()),
      startControlServer(root, handlers()),
    ])

    for (const start of starts) {
      if (start.status === "fulfilled") servers.push(start.value)
    }

    const bound = starts.filter((start) => start.status === "fulfilled")
    const refused = starts.find((start) => start.status === "rejected")

    expect(bound.length).toBe(1)
    expect(refused?.reason).toBeInstanceOf(SessionAlreadyRunningError)

    // Reachable, rather than listening on a socket the loser unlinked away.
    const client = await attachControl(root, { path: controlPath(root) })

    clients.push(client)

    expect(await client.status()).toMatchObject({ cursor: 7 })
  })

  // A named pipe is not a file, so there is no leftover to write on Windows.
  it.skipIf(process.platform === "win32")(
    "takes over a socket a crashed session left behind",
    async () => {
      const root = await mkdtemp(join(tmpdir(), "slua-control-"))

      roots.push(root)

      // What a SIGKILLed session leaves behind, refusing the bind and answering
      // nothing.
      await writeFile(controlPath(root), "", "utf8")

      const server = await startControlServer(root, handlers())

      servers.push(server)

      const client = await attachControl(root, { path: server.path })

      clients.push(client)

      expect(await client.status()).toMatchObject({ cursor: 7 })
    },
  )

  it("refuses a second session while the first is listening", async () => {
    const { root } = await session()

    await expect(startControlServer(root, handlers())).rejects.toBeInstanceOf(
      SessionAlreadyRunningError,
    )
  })

  it("refuses a client that cannot answer the challenge", async () => {
    const { server } = await session()

    // A process that never reads the challenge file is what anything other
    // than a real client on this socket looks like.
    const rogue = connectSocket(server.path)
    const lines: string[] = []

    rogue.setEncoding("utf8")
    rogue.on("data", (chunk: string) => lines.push(chunk))

    await new Promise((done) => setTimeout(done, 100))

    // The session drives the handshake, exactly as the viewer does.
    expect(lines.join("")).toContain("session.handshake")

    rogue.write(
      `${JSON.stringify({ jsonrpc: "2.0", id: 1, result: { challenge_response: "no" } })}\n`,
    )

    await new Promise((done) => setTimeout(done, 100))

    expect(lines.join("")).toContain("Invalid challenge response")

    rogue.destroy()
  })
})
