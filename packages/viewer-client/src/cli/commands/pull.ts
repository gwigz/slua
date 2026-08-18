import { writeFile } from "node:fs/promises"
import { displayName, resolveItem } from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import type { Command } from "../args.js"
import type { Reporter } from "../output.js"

export async function pullCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "pull" }>,
  reporter: Reporter,
): Promise<number> {
  const target = await resolveItem(client, command.ref)
  const response = await client.objectContentGet({
    prim_id: target.prim_id,
    item_id: target.item_id,
  })

  if (!response?.success) {
    reporter.error(`could not read ${displayName(target.item)}`)

    return 1
  }

  // The viewer base64-encodes content it cannot send as UTF-8 text.
  const content =
    response.encoding === "base64"
      ? Buffer.from(response.content, "base64").toString("utf8")
      : response.content

  if (command.out) {
    await writeFile(command.out, content, "utf8")
    reporter.note(`wrote ${command.out}`)
  } else if (!reporter.json) {
    process.stdout.write(content.endsWith("\n") ? content : `${content}\n`)
  }

  reporter.data({
    ok: true,
    object_id: target.object.object_id,
    prim_id: target.prim_id,
    item_id: target.item_id,
    item: target.item.name,
    out: command.out,
    content: command.out ? undefined : content,
  })

  return 0
}
