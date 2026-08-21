import { readFile } from "node:fs/promises"
import { join } from "node:path"
import pc from "picocolors"
import type { ControlClient } from "../../control/client.js"
import { LOG_FILE, stateDirectory } from "../../state.js"
import type { Command } from "../args.js"
import { displayPath, type Reporter } from "../output.js"
import { fromPayload, writeRecord } from "../runtime-view.js"

/** How far back `--since <duration>` reaches, or which cursor it starts after. */
export type Since = { cursor: number } | { ms: number }

export function sinceParams(since: Since | undefined): { since?: number; sinceMs?: number } {
  if (!since) return {}

  return "cursor" in since ? { since: since.cursor } : { sinceMs: since.ms }
}

export async function statusCommand(control: ControlClient, reporter: Reporter): Promise<number> {
  const status = await control.status()

  reporter.data(status)

  const viewer = status as unknown as {
    connected: boolean
    watching: boolean
    pushing: boolean
    cursor: number
    logPath?: string
    viewer?: { port?: number; name?: string }
  }

  reporter.line(
    `${viewer.connected ? pc.green("connected") : pc.yellow("disconnected")} to ${
      viewer.viewer?.name ?? "the viewer"
    } on ${viewer.viewer?.port ?? "?"}`,
  )

  reporter.line(
    `${status.watching ? "watching" : "not watching"}${status.pushing ? ", push in flight" : ""}, cursor ${viewer.cursor}`,
  )

  for (const target of status.targets) {
    const push = target.lastPush as { ok?: boolean; compiled?: boolean } | undefined
    const state = push
      ? push.compiled
        ? pc.green("compiled")
        : pc.red("failed")
      : pc.dim("not pushed yet")

    reporter.line(`  ${target.name} → ${target.item ?? "?"}  ${state}`)
  }

  if (viewer.logPath) reporter.line(pc.dim(`  logs in ${displayPath(viewer.logPath)}`))

  return 0
}

export async function waitCommand(
  control: ControlClient,
  command: Extract<Command, { name: "wait" }>,
  reporter: Reporter,
): Promise<number> {
  if (command.since && "ms" in command.since) {
    reporter.note(
      pc.yellow("wait takes a cursor, not a duration; waiting for the next push instead"),
    )
  }

  // Without a cursor, "wait" means the next push, not every push this session
  // has ever run, so the current cursor is where it starts from.
  const since =
    command.since && "cursor" in command.since
      ? command.since.cursor
      : (await control.status()).cursor

  const result = await control.wait({ since, timeoutMs: command.timeoutMs })

  reporter.data(result)

  if (!result.settled) {
    reporter.note(pc.yellow("nothing settled before the timeout"))
  }

  for (const payload of result.logs) writeRecord(reporter, fromPayload(payload))

  if (result.truncated > 0) {
    reporter.note(
      pc.dim(
        `${result.truncated} more records; the full stream is in ${
          result.logPath ? displayPath(result.logPath) : "the session log"
        }`,
      ),
    )
  }

  const failed = result.targets.filter((target) => target.ok === false)

  for (const target of failed) {
    reporter.error(`${target.target}: ${target.compiled === false ? "compile failed" : "failed"}`)
  }

  return result.settled && failed.length === 0 ? 0 : 1
}

/**
 * Reads back what a session recorded, after it has gone.
 *
 * The sink is the only place output survives the session that captured it, and
 * a session that died is exactly when someone wants to know what the script
 * said, so `--since` answers from the file when no socket does.
 */
export async function replayLogs(
  root: string,
  since: Since | undefined,
  reporter: Reporter,
): Promise<number> {
  const path = join(stateDirectory(root), LOG_FILE)

  let text: string

  try {
    text = await readFile(path, "utf8")
  } catch {
    throw new Error(
      `no session log in ${displayPath(path)}; --since reads what a "slua-viewer connect" session recorded`,
    )
  }

  const cutoff = since && "ms" in since ? Date.now() - since.ms : undefined
  const cursor = since && "cursor" in since ? since.cursor : undefined
  const records: Record<string, unknown>[] = []

  for (const line of text.split("\n")) {
    if (line.trim() === "") continue

    let entry: Record<string, unknown>

    try {
      entry = JSON.parse(line)
    } catch {
      // A line half-written when the session died is not worth the whole read.
      continue
    }

    if (entry.kind !== "runtime") continue
    if (cursor !== undefined && Number(entry.seq ?? 0) <= cursor) continue
    if (cutoff !== undefined && new Date(String(entry.time)).getTime() < cutoff) continue

    records.push(entry)
  }

  reporter.note(
    pc.dim(`replaying ${records.length} records from ${displayPath(path)}, no session running`),
  )

  for (const record of records) writeRecord(reporter, fromPayload(record))

  return 0
}
