import { displayName, resolveItem } from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import type { Command } from "../args.js"
import type { Reporter } from "../output.js"

export async function resetCommand(
  client: ViewerClient,
  command: Extract<Command, { name: "reset" }>,
  reporter: Reporter,
): Promise<number> {
  const target = await resolveItem(client, command.ref)
  const response = await client.resetScript({
    primId: target.primId,
    itemId: target.itemId,
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
): Promise<number> {
  const target = await resolveItem(client, command.ref)
  const response = await client.setScriptRunning({
    primId: target.primId,
    itemId: target.itemId,
    running: command.running,
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
