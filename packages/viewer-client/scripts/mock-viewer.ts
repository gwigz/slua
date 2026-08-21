/**
 * A stand-in for the viewer's external script editor server.
 *
 * The real one only exists on the viewer's `project/lua_editor` branch, so this
 * speaks just enough of the protocol to exercise the CLI end to end:
 *
 *   bun packages/viewer-client/scripts/mock-viewer.ts
 *   bun packages/viewer-client/src/cli/index.ts objects --json
 *
 * Push a file containing the word BREAK to see the compile-failure path.
 *
 * Two environment variables reproduce viewer behaviour that is otherwise only
 * visible against a real one:
 *
 *   MOCK_PUBLISH_MS=5000  publish nothing until this long after the handshake,
 *                         the way the viewer publishes only when its button is
 *                         pressed, so `--wait` has something to wait for
 *   MOCK_STALE_SAVE=1     drop the object from `object.list` for a read or two
 *                         after a save, as the viewer briefly does
 *   MOCK_RUNTIME_ERROR=1  report a script error the way the viewer does: an
 *                         empty `runtime.error`, then the text as a separate
 *                         `runtime.debug`
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"

const PORT = Number(process.env.PORT ?? 9020)

const OBJECT_ID = "aaaaaaaa-1111-2222-3333-444444444444"
const ITEM_ID = "bbbbbbbb-1111-2222-3333-444444444444"

const object = {
  object_id: OBJECT_ID,
  object_name: "Mock Object",
  object_description: "",
  region: "Testville",
  // Set MOCK_SAVE_BACK=1 to pretend the object was rezzed from a prim.
  can_save_back: process.env.MOCK_SAVE_BACK === "1",
  inventory: [
    { item_id: ITEM_ID, name: "Main", type: "script", subtype: 1, vm: "luau", running: true },
  ],
  linked_objects: [],
}

/** Unset until the mock "publishes", which MOCK_PUBLISH_MS delays. */
let published = process.env.MOCK_PUBLISH_MS === undefined

/** Reads still owed a stale listing, as the viewer serves right after a save. */
let staleReads = 0

const contents = new Map<string, string>([[ITEM_ID, "ll.OwnerSay('hello from the mock viewer')\n"]])

const challenges = new WeakMap<object, { dir: string; path: string; value: string }>()

/** Drops a connection's challenge directory, handshake completed or not. */
async function clearChallenge(ws: object) {
  const challenge = challenges.get(ws)

  if (!challenge) return

  challenges.delete(ws)

  await rm(challenge.dir, { recursive: true, force: true })
}

function send(ws: { send(data: string): void }, payload: unknown) {
  ws.send(JSON.stringify(payload))
}

function result(ws: { send(data: string): void }, id: unknown, value: unknown) {
  send(ws, { jsonrpc: "2.0", id, result: value })
}

async function handle(ws: any, message: any): Promise<void> {
  const { id, method, params } = message

  switch (method) {
    case "object.list": {
      if (!published) return result(ws, id, { objects: [] })

      // The viewer's listing goes briefly stale after a save: first the object
      // disappears, then it comes back with the item still missing.
      if (staleReads > 0) {
        const shape = staleReads-- > 1 ? [] : [{ ...object, inventory: [] }]

        return result(ws, id, { objects: shape })
      }

      return result(ws, id, { objects: [object] })
    }

    case "object.request":
      return result(ws, id, { object })

    case "object.content.get":
      return result(ws, id, {
        success: true,
        prim_id: params.prim_id,
        item_id: params.item_id,
        content: contents.get(params.item_id) ?? "",
      })

    case "object.content.save": {
      // Stand in for a compile failure so the error path can be exercised.
      if (params.content.includes("BREAK")) {
        const line =
          params.content.split("\n").findIndex((text: string) => text.includes("BREAK")) + 1

        return result(ws, id, {
          success: true,
          prim_id: params.prim_id,
          item_id: params.item_id,
          compiled: false,
          errors: [`[string "Main"]:${line}: Expected identifier, got 'BREAK'`],
        })
      }

      contents.set(params.item_id, params.content)

      if (process.env.MOCK_STALE_SAVE === "1") staleReads = 2

      // A save restarts the script, so its startup output follows immediately.
      // That is the gap `push --tail` drains.
      setTimeout(() => {
        send(ws, {
          jsonrpc: "2.0",
          method: "runtime.debug",
          params: {
            script_id: "",
            object_id: OBJECT_ID,
            object_name: object.object_name,
            item: { root_id: OBJECT_ID, name: "Main" },
            channel: "owner_say",
            message: "hello from state_entry",
          },
        })
      }, 150)

      return result(ws, id, {
        success: true,
        prim_id: params.prim_id,
        item_id: params.item_id,
        compiled: true,
      })
    }

    case "object.script.reset":
    case "object.script.set_running":
      return result(ws, id, { success: true })

    case "object.modify": {
      if (params.description !== undefined) {
        object.object_description = params.description
      }

      if (params.name !== undefined) object.object_name = params.name

      return result(ws, id, { success: true, prim_id: params.prim_id })
    }

    case "command.execute": {
      if (params.command === "viewer.object.save_back_to_contents") {
        if (!object.can_save_back) {
          return result(ws, id, {
            success: false,
            error_code: 3,
            message: "Save back is not available for this object",
          })
        }

        return result(ws, id, { success: true, result: { object_id: params.object_id } })
      }

      return result(ws, id, { success: false, error_code: 1, message: "unknown command" })
    }

    case "language.syntax.id":
      return result(ws, id, { id: "cccccccc-1111-2222-3333-444444444444" })

    case "language.syntax.cache":
      return result(ws, id, { success: true, files: ["defs.lua", "defs.lsl"] })

    case "language.syntax":
      return result(ws, id, { id: "cccccccc", success: true, defs: { functions: {} } })

    case "session.ping":
      return result(ws, id, { timestamp: params?.timestamp ?? 0, server_time: Date.now() })

    case "session.disconnect":
      return

    default:
      if (id !== undefined) {
        send(ws, {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        })
      }
  }
}

const server = Bun.serve({
  port: PORT,
  fetch: (request, self) =>
    self.upgrade(request) ? undefined : new Response("websocket only", { status: 400 }),
  websocket: {
    async open(ws) {
      // The viewer proves co-location by writing a UUID to a local file and
      // sending only the path; the client must read it back.
      const dir = await mkdtemp(join(tmpdir(), "mock-viewer-"))
      const value = randomUUID()
      // The filename gets its own token, or the path alone would give the
      // value away and a client could answer without reading anything.
      const path = join(dir, `sl_script_challenge_${randomUUID()}.tmp`)

      await writeFile(path, value, "utf8")
      challenges.set(ws as object, { dir, path, value })

      send(ws, {
        jsonrpc: "2.0",
        id: 1,
        method: "session.handshake",
        params: {
          server_version: "1.0.0",
          protocol_version: "1.0",
          viewer_name: "Mock Viewer",
          viewer_version: "0.0.0",
          agent_id: "dddddddd-1111-2222-3333-444444444444",
          agent_name: "mock.resident",
          challenge: path,
          languages: ["lsl", "luau"],
          syntax_id: "cccccccc-1111-2222-3333-444444444444",
          features: { live_sync: true, compilation: true, syntax_cache: true, commands: true },
        },
      })
    },

    async message(ws, raw) {
      const message = JSON.parse(String(raw))

      if (message.id === 1 && message.result) {
        const challenge = challenges.get(ws as object)

        await clearChallenge(ws as object)

        if (message.result.challenge_response !== challenge!.value) {
          send(ws, {
            jsonrpc: "2.0",
            method: "session.disconnect",
            params: { reason: 2, message: "Invalid challenge response" },
          })
          ws.close()

          return
        }

        console.error(`handshake ok from ${message.result.client_name}`)
        send(ws, { jsonrpc: "2.0", method: "session.ok" })

        if (!published) {
          const delay = Number(process.env.MOCK_PUBLISH_MS)

          console.error(`publishing in ${delay}ms`)

          setTimeout(() => {
            published = true

            send(ws, { jsonrpc: "2.0", method: "object.publish", params: { object } })
          }, delay)
        }

        if (process.env.MOCK_RUNTIME_ERROR === "1") {
          // The viewer sends the event with nothing in it, then the text as a
          // plain debug message a moment later.
          setTimeout(() => {
            send(ws, {
              jsonrpc: "2.0",
              method: "runtime.error",
              params: {
                script_id: "",
                object_id: OBJECT_ID,
                object_name: object.object_name,
                message: "",
                error: "",
                line: 0,
              },
            })
            send(ws, {
              jsonrpc: "2.0",
              method: "runtime.debug",
              params: {
                script_id: "",
                object_id: OBJECT_ID,
                object_name: object.object_name,
                message: "lua_script:2: attempt to index nil with 'field'",
              },
            })
          }, 500)
        }

        // Trickle some runtime output so `logs` has something to show.
        const timer = setInterval(() => {
          send(ws, {
            jsonrpc: "2.0",
            method: "runtime.debug",
            params: {
              script_id: "",
              object_id: OBJECT_ID,
              object_name: object.object_name,
              message: `tick ${new Date().toISOString()}`,
            },
          })
        }, 3_000)

        ws.data = { timer }

        return
      }

      await handle(ws, message)
    },

    async close(ws) {
      clearInterval((ws.data as { timer?: ReturnType<typeof setInterval> })?.timer)

      // A client that never answers the handshake still leaves a directory.
      await clearChallenge(ws as object)
    },
  },
})

console.error(`mock viewer listening on ws://127.0.0.1:${server.port}`)
