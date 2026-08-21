import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { connect as connectSocket } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { SessionHandshake } from "../protocol/types.js"
import { attachControl, type ControlClient } from "./client"
import { type ControlServer, startControlServer } from "./server"

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

async function session(overrides: Partial<Parameters<typeof startControlServer>[1]> = {}) {
  const root = await mkdtemp(join(tmpdir(), "slua-control-"))

  roots.push(root)

  const recorded: Recorded = { forwarded: [], pushed: [] }

  const server = await startControlServer(root, {
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
    ...overrides,
  })

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
