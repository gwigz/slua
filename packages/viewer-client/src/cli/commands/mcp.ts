import type { ControlClient } from "../../control/client.js"
import { cliVersion } from "../../state.js"
import type { GlobalFlags } from "../args.js"
import { openClient, projectRoot } from "../connect.js"
import type { Reporter } from "../output.js"

/** Answered when the client asks for something we have never heard of. */
const DEFAULT_PROTOCOL = "2025-06-18"

const START_SESSION =
  'no slua session is running for this project. Start one in a terminal with "slua-viewer connect", then try again.'

interface Tool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  run: (control: ControlClient, args: Record<string, unknown>) => Promise<unknown>
}

const TOOLS: Tool[] = [
  {
    name: "slua_status",
    description:
      "What the running slua session is doing: viewer connection, targets, the last push for each, and the current log cursor.",
    inputSchema: { type: "object", properties: {} },
    run: (control) => control.status(),
  },
  {
    name: "slua_push",
    description:
      "Push the built output to the viewer now, skipping the watcher's debounce, and wait for it to settle. If you have just edited a source file, this waits for the build to produce it first, so it never deploys the build from before your edit. Returns the compile result for each target and the output the restarted script produced.",
    inputSchema: {
      type: "object",
      properties: {
        targets: {
          type: "array",
          items: { type: "string" },
          description: "Target names from slua.json. Every target when omitted.",
        },
        timeoutMs: { type: "number", description: "How long to wait for the push to settle." },
      },
    },
    run: async (control, args) => {
      // The cursor comes back from before the push starts, so waiting on it
      // cannot report the previous run's results as if they were this one's.
      const { cursor } = await control.pushNow(args.targets as string[] | undefined)

      return await control.wait({
        since: cursor,
        timeoutMs: (args.timeoutMs as number | undefined) ?? 30_000,
      })
    },
  },
  {
    name: "slua_wait",
    description:
      "Block until a push newer than a cursor has settled, then return its results and the output that followed. Use the cursor from a previous call, not a guess.",
    inputSchema: {
      type: "object",
      properties: {
        since: { type: "number", description: "Wait for a push newer than this cursor." },
        timeoutMs: { type: "number" },
      },
    },
    run: async (control, args) => {
      const since = (args.since as number | undefined) ?? (await control.status()).cursor

      return await control.wait({ since, timeoutMs: args.timeoutMs as number | undefined })
    },
  },
  {
    name: "slua_logs",
    description:
      "Runtime output the session has captured, after a cursor or from the last few minutes. Capped; the full stream is in .slua/logs.jsonl.",
    inputSchema: {
      type: "object",
      properties: {
        since: { type: "number", description: "Only output after this cursor." },
        sinceMs: { type: "number", description: "Only output from the last this many ms." },
        limit: { type: "number" },
      },
    },
    run: (control, args) =>
      control.logs({
        since: args.since as number | undefined,
        sinceMs: args.sinceMs as number | undefined,
        limit: args.limit as number | undefined,
      }),
  },
]

/** One JSON-RPC message per line, which is what MCP's stdio transport is. */
function reply(message: Record<string, unknown>): void {
  process.stdout.write(`${JSON.stringify(message)}\n`)
}

function result(id: unknown, value: unknown): void {
  reply({ jsonrpc: "2.0", id, result: value })
}

function failure(id: unknown, code: number, message: string): void {
  reply({ jsonrpc: "2.0", id, error: { code, message } })
}

/**
 * Serves MCP over stdio, backed by a running `connect`.
 *
 * Thin on purpose: the control socket already decided what an agent needs, so
 * this is a name, a schema and a call for each of them. Nothing here may write
 * to stdout except a protocol frame, which is why every human-facing message
 * in this path goes to stderr.
 */
export async function mcpCommand(global: GlobalFlags, reporter: Reporter): Promise<number> {
  const quiet: Reporter = { ...reporter, json: false, data: () => {}, line: () => {} }

  const attach = async (): Promise<ControlClient> => {
    const { client, control } = await openClient(global, quiet)

    if (!control) {
      client.close()

      throw new Error(START_SESSION)
    }

    return control
  }

  const call = async (name: string, args: Record<string, unknown>) => {
    const tool = TOOLS.find((entry) => entry.name === name)

    if (!tool) throw new Error(`unknown tool: ${name}`)

    // Attached per call rather than held: a session restarted under a
    // long-lived agent should not leave every later call talking to a socket
    // that closed hours ago.
    const control = await attach()

    try {
      return await tool.run(control, args)
    } finally {
      control.close()
    }
  }

  reporter.note(`slua mcp server for ${await projectRoot()}`)

  return await new Promise<number>((done) => {
    let buffer = ""

    process.stdin.setEncoding("utf8")

    process.stdin.on("data", (chunk: string) => {
      buffer += chunk

      for (;;) {
        const end = buffer.indexOf("\n")

        if (end < 0) break

        const line = buffer.slice(0, end)

        buffer = buffer.slice(end + 1)

        if (line.trim() !== "") void handle(line)
      }
    })

    process.stdin.on("close", () => done(0))
    process.stdin.on("end", () => done(0))

    const handle = async (line: string) => {
      let message: { id?: unknown; method?: string; params?: Record<string, unknown> }

      try {
        message = JSON.parse(line)
      } catch {
        failure(null, -32700, "Parse error")

        return
      }

      const { id, method, params = {} } = message

      // A notification has no id and takes no answer, `initialized` included.
      if (id === undefined || id === null) return

      switch (method) {
        case "initialize":
          result(id, {
            // Echoed back when the client names one, so a newer client is not
            // told its own version is unsupported by a server that is fine.
            protocolVersion: (params.protocolVersion as string | undefined) ?? DEFAULT_PROTOCOL,
            capabilities: { tools: {} },
            serverInfo: { name: "slua-viewer", version: cliVersion() },
          })

          return

        case "ping":
          result(id, {})

          return

        case "tools/list":
          // The runner is ours; a client only ever sees the declaration.
          result(id, {
            tools: TOOLS.map((tool) => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
            })),
          })

          return

        case "tools/call": {
          const name = String(params.name ?? "")

          try {
            const value = await call(name, (params.arguments as Record<string, unknown>) ?? {})

            result(id, { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] })
          } catch (error) {
            // A tool failure is a result, not a protocol error: the agent is
            // meant to read it and decide what to do.
            result(id, {
              isError: true,
              content: [
                { type: "text", text: error instanceof Error ? error.message : String(error) },
              ],
            })
          }

          return
        }

        default:
          failure(id, -32601, `Method not found: ${method}`)
      }
    }
  })
}
