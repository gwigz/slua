import { describe, expect, it } from "bun:test"
import { ConnectionClosedError, RpcError, RpcErrorCode, RpcTimeoutError } from "./errors"
import { FakeTransport, waitFor } from "./fake-transport"
import { JsonRpcPeer } from "./jsonrpc"

describe("JsonRpcPeer", () => {
  it("omits id entirely on notifications", () => {
    const transport = new FakeTransport()
    new JsonRpcPeer(transport).notify("session.disconnect", { reason: 0, message: "bye" })

    expect(transport.sent).toHaveLength(1)
    // A null id reads as a request to some peers, so the key must be absent.
    expect(transport.sent[0]).not.toContain('"id"')
    expect(transport.messages()[0]).toEqual({
      jsonrpc: "2.0",
      method: "session.disconnect",
      params: { reason: 0, message: "bye" },
    })
  })

  it("resolves a call with its response result", async () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)
    const pending = peer.call("object.list", {})

    const request = transport.messages()[0]

    expect(request.method).toBe("object.list")
    expect(request.params).toEqual({})

    transport.receive({ jsonrpc: "2.0", id: request.id, result: { objects: [] } })

    expect(await pending).toEqual({ objects: [] })
  })

  it("rejects with the numeric code intact", async () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)
    const pending = peer.call("object.content.get", {})

    transport.receive({
      jsonrpc: "2.0",
      id: transport.messages()[0].id,
      error: { code: RpcErrorCode.Forbidden, message: "not published" },
    })

    const error = await pending.catch((reason) => reason)

    expect(error).toBeInstanceOf(RpcError)
    expect(error.code).toBe(RpcErrorCode.Forbidden)
    expect(error.method).toBe("object.content.get")
  })

  it("times out a call that is never answered", async () => {
    const peer = new JsonRpcPeer(new FakeTransport())

    await expect(peer.call("session.ping", {}, 5)).rejects.toBeInstanceOf(RpcTimeoutError)
  })

  it("rejects pending calls when the transport closes", async () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)
    const pending = peer.call("object.list", {})

    transport.close()

    await expect(pending).rejects.toBeInstanceOf(ConnectionClosedError)
  })

  it("routes notifications to every listener", () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)
    const seen: string[] = []

    peer.on("runtime.debug", (params: { message: string }) => seen.push(params.message))
    const off = peer.on("runtime.debug", () => seen.push("second"))

    transport.receive({ jsonrpc: "2.0", method: "runtime.debug", params: { message: "hi" } })
    off()
    transport.receive({ jsonrpc: "2.0", method: "runtime.debug", params: { message: "again" } })

    expect(seen).toEqual(["hi", "second", "again"])
  })

  it("treats a null id as a notification rather than replying", () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)
    let calls = 0

    peer.on("session.ok", () => {
      calls++
    })

    transport.receive({ jsonrpc: "2.0", id: null, method: "session.ok" })

    expect(calls).toBe(1)
    expect(transport.sent).toHaveLength(0)
  })

  it("answers an inbound request from its handler", async () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)

    peer.handle("session.ping", (params: { timestamp: number }) => ({ echo: params.timestamp }))

    transport.receive({ jsonrpc: "2.0", id: 7, method: "session.ping", params: { timestamp: 42 } })

    await waitFor(() => transport.reply(7) !== undefined)

    expect(transport.reply(7).result).toEqual({ echo: 42 })
  })

  it("replies method not found for an unhandled request", async () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)

    transport.receive({ jsonrpc: "2.0", id: 3, method: "nope" })

    await waitFor(() => transport.reply(3) !== undefined)

    expect(transport.reply(3).error.code).toBe(RpcErrorCode.MethodNotFound)

    peer.close()
  })

  it("reports a parse error for malformed input", () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)

    transport.receive("{ not json")

    expect(transport.messages()[0].error.code).toBe(RpcErrorCode.ParseError)

    peer.close()
  })

  it("rejects batch arrays, which this protocol never uses", () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)

    transport.receive([{ jsonrpc: "2.0", method: "session.ok" }])

    expect(transport.messages()[0].error.code).toBe(RpcErrorCode.InvalidRequest)

    peer.close()
  })

  it("accepts a response whose id came back as a string", async () => {
    // JSON-RPC 2.0 permits string ids and does not oblige a peer to echo the
    // type it was sent, so "1" has to settle the call that sent 1.
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)
    const call = peer.call("object.list", {})

    transport.receive({ jsonrpc: "2.0", id: "1", result: { objects: [] } })

    expect(await call).toEqual({ objects: [] })
  })

  it("tells close listeners when the transport goes away on its own", () => {
    const transport = new FakeTransport()
    const peer = new JsonRpcPeer(transport)

    let closed = 0

    peer.onClose(() => closed++)

    // The far end hanging up, rather than us calling close().
    transport.onclose?.()

    expect(closed).toBe(1)

    // And only once, however many times it is reported.
    peer.close()

    expect(closed).toBe(1)
  })
})
