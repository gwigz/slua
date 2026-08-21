import { createHash } from "node:crypto"
import type { Socket } from "node:net"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import type { Transport } from "../protocol/jsonrpc.js"

/**
 * Where a project's control socket lives.
 *
 * In tmpdir keyed by a hash of the project root, not in `.slua/`: macOS caps
 * a unix socket path at about 104 bytes and a deep project path blows that on
 * its own. The real path is recorded in `.slua/session.json`, so a client
 * still only has to read one file to find it.
 */
export function controlPath(root: string): string {
  const key = createHash("sha1").update(resolve(root)).digest("hex").slice(0, 16)

  // Windows has no unix sockets, but `node:net` speaks named pipes through the
  // same API, and a pipe name is not a path so the length cap does not apply.
  return process.platform === "win32"
    ? String.raw`\\.\pipe\slua-${key}`
    : join(tmpdir(), `slua-${key}.sock`)
}

/**
 * Frames a byte stream into the one-object-per-message the peer expects.
 *
 * A WebSocket hands over message boundaries; a socket hands over bytes. JSON
 * never contains a raw newline once encoded, so a newline is a free frame
 * separator here.
 */
export function socketTransport(socket: Socket): Transport {
  const transport: Transport = {
    send: (data) => {
      socket.write(`${data}\n`)
    },
    close: () => {
      socket.end()
    },
    onmessage: null,
    onclose: null,
    onerror: null,
  }

  let buffer = ""

  socket.setEncoding("utf8")

  socket.on("data", (chunk: string) => {
    buffer += chunk

    for (;;) {
      const end = buffer.indexOf("\n")

      if (end < 0) break

      const line = buffer.slice(0, end)

      buffer = buffer.slice(end + 1)

      if (line.trim() !== "") transport.onmessage?.(line)
    }
  })

  socket.on("close", () => transport.onclose?.())
  socket.on("error", (error) => transport.onerror?.(error))

  return transport
}
