import { ViewerClient } from "../client.js"
import type { GlobalFlags } from "./args.js"

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
    client.close()
  }
}
