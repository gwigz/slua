import pc from "picocolors"
import { ensurePublished, parseObjectSelector } from "../../addressing.js"
import { ViewerClient } from "../../client.js"
import type { RuntimeDebug, RuntimeError } from "../../protocol/types.js"
import type { Command, GlobalFlags } from "../args.js"
import type { Reporter } from "../output.js"

const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 30_000

function emit(reporter: Reporter, level: "debug" | "error", params: RuntimeDebug | RuntimeError) {
  if (reporter.json) {
    // A stream gets one JSON object per line, not one document.
    process.stdout.write(`${JSON.stringify({ level, ...params })}\n`)

    return
  }

  const name = params.objectName || params.objectId
  const tag = level === "error" ? pc.red("error") : pc.dim("debug")

  reporter.line(`${tag} ${pc.bold(name)}  ${params.message}`)

  const stack = (params as RuntimeError).stack ?? []

  for (const line of stack) {
    reporter.line(pc.dim(`      ${line}`))
  }
}

/** One connection's worth of streaming. Resolves when the connection drops. */
async function streamOnce(
  global: GlobalFlags,
  command: Extract<Command, { name: "logs" }>,
  reporter: Reporter,
): Promise<ViewerClient> {
  const client = await ViewerClient.connect({ port: global.port, timeoutMs: global.timeoutMs })

  // Runtime output is only forwarded for objects the viewer has published, so
  // asking for one up front is the difference between output and silence.
  if (command.object) {
    const object = await ensurePublished(client, parseObjectSelector(command.object))

    reporter.note(pc.dim(`watching ${object.objectName} (${object.objectId})`))
  } else {
    const { objects } = await client.objectList()

    if (!objects?.length) {
      reporter.note(
        pc.yellow(
          "no published objects — runtime output is only forwarded for published objects, so pass --object <uuid>",
        ),
      )
    }
  }

  client.on("runtime.debug", (params) => emit(reporter, "debug", params))
  client.on("runtime.error", (params) => emit(reporter, "error", params))

  return client
}

export async function logsCommand(
  global: GlobalFlags,
  command: Extract<Command, { name: "logs" }>,
  reporter: Reporter,
): Promise<number> {
  let attempt = 0
  let stopping = false
  let current: ViewerClient | undefined

  process.on("SIGINT", () => {
    stopping = true
    current?.close()
    process.exit(0)
  })

  while (!stopping) {
    try {
      current = await streamOnce(global, command, reporter)
      attempt = 0

      await new Promise<void>((resolveClosed) => {
        current!.connection.onClose(() => resolveClosed())
        current!.connection.peer.on("session.disconnect", () => resolveClosed())
      })
    } catch (error) {
      if (!command.follow) throw error

      reporter.note(pc.dim(`disconnected: ${error instanceof Error ? error.message : error}`))
    }

    if (!command.follow || stopping) break

    // Back off so a viewer that is closed or restarting isn't hammered.
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt++, RECONNECT_MAX_MS)

    reporter.note(pc.dim(`reconnecting in ${Math.round(delay / 1000)}s`))

    await new Promise((sleep) => setTimeout(sleep, delay))
  }

  current?.close()

  return 0
}
