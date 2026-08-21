import pc from "picocolors"
import { PUBLISH_ACTION, type PublishOptions } from "../addressing.js"
import { ViewerClient } from "../client.js"
import { attachControl, type ControlClient } from "../control/client.js"
import { cliVersion, readSession } from "../state.js"
import { loadConfig } from "../targets.js"
import type { GlobalFlags } from "./args.js"
import { displayPath, type Reporter } from "./output.js"

/** The directory a session's state belongs to, which is where `slua.json` is. */
export async function projectRoot(): Promise<string> {
  return (await loadConfig())?.root ?? process.cwd()
}

export interface OpenedClient {
  client: ViewerClient
  /** Set when this went through a running `connect` rather than the viewer. */
  control?: ControlClient
}

/**
 * Connects, through a running session when there is one.
 *
 * A session already holds a viewer connection, has the objects published and
 * is numbering output, so going through it means a command shares all of that
 * rather than starting again beside it. With none running this is exactly the
 * direct connection it always was.
 */
export async function openClient(global: GlobalFlags, reporter: Reporter): Promise<OpenedClient> {
  const direct = async (): Promise<OpenedClient> => ({
    client: await ViewerClient.connect({ port: global.port, timeoutMs: global.timeoutMs }),
  })

  if (global.direct) return await direct()

  const root = await projectRoot()
  const session = await readSession(root)

  if (!session) return await direct()

  try {
    const control = await attachControl(root, { timeoutMs: global.timeoutMs })

    if (session.version !== cliVersion()) {
      // Reported rather than worked around: the two speak the same viewer
      // protocol, but the control namespace is ours and it can move.
      reporter.note(
        pc.yellow(
          `the session running in ${displayPath(root)} is ${session.version}, this CLI is ${cliVersion()}; restart it if something looks wrong`,
        ),
      )
    }

    reporter.note(pc.dim(`through the session in ${displayPath(root)}`))

    return { client: control, control }
  } catch {
    // A session file outlives the process that wrote it, so liveness is
    // decided by connecting, and failing to means there is nobody there.
    return await direct()
  }
}

/**
 * Runs `fn` against a connected viewer, then disconnects.
 *
 * Every one-shot command connects, does its thing and drops the session, so
 * nothing is left holding a connection it is not using.
 */
export async function withClient<T>(
  global: GlobalFlags,
  reporter: Reporter,
  fn: (client: ViewerClient) => Promise<T>,
): Promise<T> {
  const { client } = await openClient(global, reporter)

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

/** Runs `fn` against a running session, or says plainly that there is none. */
export async function withControl<T>(
  global: GlobalFlags,
  reporter: Reporter,
  fn: (control: ControlClient) => Promise<T>,
): Promise<T> {
  const { client, control } = await openClient(global, reporter)

  if (!control) {
    client.close()

    throw new Error(
      `no session is running for ${displayPath(await projectRoot())}; start one with "slua-viewer connect"`,
    )
  }

  try {
    return await fn(control)
  } finally {
    try {
      control.close()
    } catch {
      // Best effort, as above.
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
