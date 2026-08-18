import { writeFile } from "node:fs/promises"
import { displayName, type PublishOptions, resolveItem, withStaleRetry } from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import type { Command } from "../args.js"
import type { Reporter } from "../output.js"

export async function pullCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "pull" }>,
  reporter: Reporter,
  publish: PublishOptions = {},
): Promise<number> {
  const { target, response } = await withStaleRetry(async () => {
    const found = await resolveItem(client, command.ref, publish)

    return {
      target: found,
      response: await client.objectContentGet({ primId: found.primId, itemId: found.itemId }),
    }
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
    objectId: target.object.objectId,
    primId: target.primId,
    itemId: target.itemId,
    item: target.item.name,
    out: command.out,
    content: command.out ? undefined : content,
  })

  return 0
}
