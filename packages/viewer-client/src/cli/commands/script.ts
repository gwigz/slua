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

export async function resetCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "reset" }>,
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
      response: await client.resetScript({ primId: found.primId, itemId: found.itemId }),
    }
  })

  reporter.data({
    ok: response?.success === true,
    objectId: target.object.objectId,
    primId: target.primId,
    itemId: target.itemId,
    item: target.item.name,
    message: response?.message,
  })

  if (!response?.success) {
    reporter.error(`reset failed: ${response?.message ?? "unknown error"}`)

    return 1
  }

  reporter.note(`reset ${displayName(target.item)}`)

  return 0
}

export async function setRunningCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "set-running" }>,
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
      response: await client.setScriptRunning({
        primId: found.primId,
        itemId: found.itemId,
        running: command.running,
      }),
    }
  })

  reporter.data({
    ok: response?.success === true,
    objectId: target.object.objectId,
    primId: target.primId,
    itemId: target.itemId,
    item: target.item.name,
    running: command.running,
    message: response?.message,
  })

  if (!response?.success) {
    reporter.error(`set-running failed: ${response?.message ?? "unknown error"}`)

    return 1
  }

  reporter.note(`${command.running ? "started" : "stopped"} ${displayName(target.item)}`)

  return 0
}
