import { describe, expect, it } from "bun:test"
import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { HandshakeError, ViewerUnavailableError } from "./errors"
import { FakeTransport, waitFor } from "./fake-transport"
import { buildHandshakeResponse, ViewerConnection, webSocketTransport } from "./peer"
import { CommandError, type SessionDisconnect, type SessionHandshake } from "./types"

const handshake = (challenge?: string): SessionHandshake => ({
  server_version: "1.0.0",
  protocol_version: "1.0",
  viewer_name: "Second Life Project Lua",
  viewer_version: "7.1.13",
  agent_id: "11111111-2222-3333-4444-555555555555",
  agent_name: "test.resident",
  challenge,
  languages: ["lsl", "luau"],
  syntax_id: "66666666-7777-8888-9999-000000000000",
  features: { live_sync: true, compilation: true, commands: true },
})

async function challengeFile(contents: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "slua-challenge-"))
  const path = join(dir, "sl_script_challenge.tmp")

  await writeFile(path, contents, "utf8")

  return path
}

/** The connection wires its handlers only after the transport factory resolves. */
async function ready(transport: FakeTransport) {
  await waitFor(() => transport.onmessage !== null)
}

/** Drives the viewer's half: handshake request, then session.ok. */
async function completeHandshake(transport: FakeTransport, challenge?: string) {
  await ready(transport)

  transport.receive({
    jsonrpc: "2.0",
    id: 1,
    method: "session.handshake",
    params: handshake(challenge),
  })

  await waitFor(() => transport.reply(1) !== undefined)

  const response = transport.reply(1)

  transport.receive({ jsonrpc: "2.0", method: "session.ok" })

  return response
}

describe("buildHandshakeResponse", () => {
  it("echoes the challenge file contents verbatim", async () => {
    // Whatever the file holds goes back untouched; the viewer parses it.
    const path = await challengeFile("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee\n")
    const response = await buildHandshakeResponse(handshake(path))

    expect(response.challenge_response).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee\n")
  })

  it("omits challenge_response entirely when no challenge was sent", async () => {
    const response = await buildHandshakeResponse(handshake())

    expect("challenge_response" in response).toBe(false)
    expect(response.protocol_version).toBe("1.0")
    expect(response.languages).toEqual(["lsl", "luau"])
  })

  it("fails loudly when the challenge file cannot be read", async () => {
    expect(buildHandshakeResponse(handshake("/nope/does-not-exist"))).rejects.toBeInstanceOf(
      HandshakeError,
    )
  })
})

describe("ViewerConnection", () => {
  it("answers the viewer's handshake and settles on session.ok", async () => {
    const transport = new FakeTransport()
    const path = await challengeFile("cafe1234-0000-0000-0000-000000000001")
    const connecting = ViewerConnection.connect({ transport: async () => transport })

    const response = await completeHandshake(transport, path)

    expect(response.result.challenge_response).toBe("cafe1234-0000-0000-0000-000000000001")
    expect(response.result.client_name).toBe("@gwigz/slua-viewer-client")

    const connection = await connecting

    expect(connection.handshake?.viewer_name).toBe("Second Life Project Lua")

    connection.close()
  })

  it("answers an inbound session.ping", async () => {
    const transport = new FakeTransport()
    const connecting = ViewerConnection.connect({ transport: async () => transport })

    await completeHandshake(transport)

    const connection = await connecting

    transport.receive({ jsonrpc: "2.0", id: 9, method: "session.ping", params: { timestamp: 123 } })

    await waitFor(() => transport.reply(9) !== undefined)

    const pong = transport.reply(9).result

    expect(pong.timestamp).toBe(123)
    expect(typeof pong.server_time).toBe("number")

    connection.close()
  })

  it("rejects when the viewer disconnects mid-handshake", async () => {
    const transport = new FakeTransport()
    const connecting = ViewerConnection.connect({ transport: async () => transport })

    await ready(transport)
    transport.receive({ jsonrpc: "2.0", id: 1, method: "session.handshake", params: handshake() })

    await waitFor(() => transport.reply(1) !== undefined)

    transport.receive({
      jsonrpc: "2.0",
      method: "session.disconnect",
      params: { reason: 2, message: "Invalid challenge response" },
    })

    expect(connecting).rejects.toBeInstanceOf(HandshakeError)
  })

  it("gives up if session.ok never arrives, and lets the transport go", async () => {
    const transport = new FakeTransport()

    await expect(
      ViewerConnection.connect({ transport: async () => transport, handshakeTimeoutMs: 10 }),
    ).rejects.toBeInstanceOf(HandshakeError)

    // An open socket keeps the event loop alive, so leaving it open here
    // hangs the process rather than exiting with the error.
    expect(transport.closed).toBe(true)
  })

  it("reports unknown editor commands rather than throwing", async () => {
    const transport = new FakeTransport()
    const connecting = ViewerConnection.connect({ transport: async () => transport })

    await completeHandshake(transport)

    const connection = await connecting

    transport.receive({
      jsonrpc: "2.0",
      id: 11,
      method: "command.execute",
      params: { command: "editor.open_file", params: { path: "x" } },
    })

    await waitFor(() => transport.reply(11) !== undefined)

    expect(transport.reply(11).result).toMatchObject({ success: false, error_code: 1 })

    connection.close()
  })

  it("runs a registered editor command", async () => {
    const transport = new FakeTransport()
    const seen: unknown[] = []
    const connecting = ViewerConnection.connect({
      transport: async () => transport,
      commands: {
        "editor.show_message": (params) => {
          seen.push(params)

          return "ok"
        },
      },
    })

    await completeHandshake(transport)

    const connection = await connecting

    transport.receive({
      jsonrpc: "2.0",
      id: 12,
      method: "command.execute",
      params: { command: "editor.show_message", params: { message: "hi" } },
    })

    await waitFor(() => transport.reply(12) !== undefined)

    expect(transport.reply(12).result).toEqual({ success: true, result: "ok" })
    expect(seen).toEqual([{ message: "hi" }])

    connection.close()
  })

  it("shortens the handshake wait with the shared timeout", async () => {
    const transport = new FakeTransport()

    await expect(
      ViewerConnection.connect({ transport: async () => transport, timeoutMs: 10 }),
    ).rejects.toBeInstanceOf(HandshakeError)
  })

  it("reports a transport close without waiting for pings to fail", async () => {
    const transport = new FakeTransport()
    const connecting = ViewerConnection.connect({ transport: async () => transport })

    await completeHandshake(transport)

    const connection = await connecting
    const reasons: (SessionDisconnect | undefined)[] = []

    connection.onClose((reason) => reasons.push(reason))

    transport.receive({ jsonrpc: "2.0", method: "session.disconnect", params: { reason: 3 } })

    // The viewer going away, rather than us asking for it.
    transport.close()

    await waitFor(() => reasons.length > 0)

    expect(reasons).toEqual([{ reason: 3 }])
  })

  it("does not report a close we asked for", async () => {
    const transport = new FakeTransport()
    const connecting = ViewerConnection.connect({ transport: async () => transport })

    await completeHandshake(transport)

    const connection = await connecting

    let closed = 0

    connection.onClose(() => closed++)
    connection.close()

    expect(closed).toBe(0)
  })

  it("awaits an async command handler before replying", async () => {
    const transport = new FakeTransport()
    const connecting = ViewerConnection.connect({
      transport: async () => transport,
      commands: {
        "editor.slow": async () => {
          await new Promise((done) => setTimeout(done, 1))

          return "done"
        },
        "editor.broken": async () => {
          throw new Error("nope")
        },
      },
    })

    await completeHandshake(transport)

    const connection = await connecting

    transport.receive({
      jsonrpc: "2.0",
      id: 20,
      method: "command.execute",
      params: { command: "editor.slow" },
    })

    await waitFor(() => transport.reply(20) !== undefined)

    expect(transport.reply(20).result).toEqual({ success: true, result: "done" })

    // A rejection has to become an error response, not an unhandled rejection.
    transport.receive({
      jsonrpc: "2.0",
      id: 21,
      method: "command.execute",
      params: { command: "editor.broken" },
    })

    await waitFor(() => transport.reply(21) !== undefined)

    expect(transport.reply(21).result).toMatchObject({
      success: false,
      error_code: CommandError.ExecutionError,
      message: "nope",
    })

    connection.close()
  })

  it("announces session.disconnect on close", async () => {
    const transport = new FakeTransport()
    const connecting = ViewerConnection.connect({ transport: async () => transport })

    await completeHandshake(transport)

    const connection = await connecting

    connection.close()

    expect(transport.find("session.disconnect")?.params).toMatchObject({ reason: 1 })
  })
})

describe("webSocketTransport", () => {
  it("rejects when nothing is listening", async () => {
    // The runtime fires `error` only after the socket is already closed, so
    // the rejection has to come from the close event or connect never settles.
    expect(webSocketTransport("ws://127.0.0.1:9")).rejects.toBeInstanceOf(ViewerUnavailableError)
  })
})
