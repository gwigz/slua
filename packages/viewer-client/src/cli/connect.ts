import pc from "picocolors"
import { PUBLISH_ACTION, type PublishOptions } from "../addressing.js"
import { ViewerClient } from "../client.js"
import type { GlobalFlags } from "./args.js"
import type { Reporter } from "./output.js"

/**
 * Runs `fn` against a connected viewer, then disconnects.
 *
 * Every one-shot command connects, does its thing and drops the session, so
 * nothing is left holding the viewer's single editor slot.
 */
export async function withClient<T>(
  global: GlobalFlags,
  fn: (client: ViewerClient) => Promise<T>,
): Promise<T> {
  const client = await ViewerClient.connect({
    port: global.port,
    timeoutMs: global.timeoutMs,
  })

  try {
    return await fn(client)
  } finally {
    try {
      client.close()
    } catch {
      // Disconnecting is best effort; whatever `fn` threw is the real news.
    }
  }
}

/**
 * Turns the global flags into the policy commands resolve their targets with.
 *
 * `--wait` is the answer to the viewer publishing only when an editor client
 * is already connected: the command connects, says what it is waiting for, and
 * holds the socket open until the button is pressed.
 */
export function publishOptions(global: GlobalFlags, reporter: Reporter): PublishOptions {
  return {
    waitMs: global.waitMs,
    onWait: (message) => reporter.note(pc.dim(`${message} — ${PUBLISH_ACTION}`)),
  }
}
