import { writeFile } from "node:fs/promises"
import {
  displayName,
  type PublishOptions,
  resolveItem,
  withoutWait,
  withStaleRetry,
} from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import type { Command } from "../args.js"
import type { Reporter } from "../output.js"

export async function pullCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "pull" }>,
  reporter: Reporter,
  publish: PublishOptions = {},
): Promise<number> {
  // Only the first lookup waits on the publish button: a stale-listing retry is
  // for an inventory that settles in milliseconds, not for an absent object.
  const { target, response } = await withStaleRetry(async (attempt) => {
    const found = await resolveItem(
      client,
      command.ref,
      attempt === 0 ? publish : withoutWait(publish),
    )

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
