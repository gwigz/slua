import type { ViewerClient } from "../../client.js"
import type { Command } from "../args.js"
import type { Reporter } from "../output.js"

export async function syntaxCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "syntax" }>,
  reporter: Reporter,
): Promise<number> {
  const { id } = await client.syntaxId()

  if (command.kind) {
    const info = await client.syntax(command.kind)

    reporter.data({ id, kind: command.kind, defs: info?.defs, success: info?.success })
    reporter.line(JSON.stringify(info?.defs ?? null, null, 2))

    return info?.success === false ? 1 : 0
  }

  // Without a kind, list what the viewer has cached rather than dumping everything.
  try {
    const cache = await client.syntaxCache()

    reporter.data({ ok: true, id, files: cache?.files ?? [] })
    reporter.line(`syntax id  ${id}`)

    for (const file of cache?.files ?? []) {
      reporter.line(`  ${file}`)
    }

    return 0
  } catch (error) {
    // Swallowing this printed an empty list, which reads as "nothing cached".
    const message = error instanceof Error ? error.message : String(error)

    reporter.data({ ok: false, id, files: [], error: message })
    reporter.error(`could not list the syntax cache: ${message}`)

    return 1
  }
}
