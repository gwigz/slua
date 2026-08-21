import pc from "picocolors"
import {
  ensurePublished,
  parseObjectSelector,
  PUBLISH_HINT,
  type PublishOptions,
  type PublishWatcher,
  waitForAnyPublish,
} from "../../addressing.js"
import type { ViewerClient } from "../../client.js"
import type { ControlClient } from "../../control/client.js"
import type { RuntimeDebug } from "../../protocol/types.js"
import type { Command, GlobalFlags } from "../args.js"
import { openClient, projectRoot } from "../connect.js"
import type { Reporter } from "../output.js"
import { runSession } from "../session.js"
import { replayLogs, sinceParams } from "./control.js"
import {
  fromPayload,
  loadTargets,
  objectIds,
  type Targets,
  toRecord,
  wantedEvent,
  withUpdate,
  writeRecord,
} from "../runtime-view.js"

/** Subscribes one connection to the output the flags asked for. */
async function streamOnce(
  client: ViewerClient,
  command: Extract<Command, { name: "logs" }>,
  reporter: Reporter,
  targets: Targets,
  publish: PublishOptions,
): Promise<void> {
  // The viewer forwards every published object's output to every connection,
  // so naming one object only narrows the stream if we do it here. Unset until
  // the object resolves below.
  let ids: Set<string> | undefined

  const wanted = (params: RuntimeDebug): boolean => wantedEvent(params, command, ids, targets.items)

  // Registered before the round trips below, so output produced while the
  // viewer is publishing still reaches the stream.
  client.on("runtime.debug", (params) => {
    if (wanted(params)) writeRecord(reporter, toRecord("debug", params, targets.maps))
  })

  client.on("runtime.error", (params) => {
    if (wanted(params)) writeRecord(reporter, toRecord("error", params, targets.maps))
  })

  // The linkset can grow while the stream runs, and a script in a prim linked
  // after the listing would otherwise read as somebody else's output.
  client.on("object.update", (params) => {
    if (ids?.has(params.objectId)) ids = withUpdate(ids, params)
  })

  client.on("object.publish", (params) => {
    if (ids?.has(params.object.objectId)) ids = objectIds(params.object)
  })

  if (command.targets && client.connection.handshake?.features.unifiedDiagnostics !== true) {
    reporter.note(
      pc.yellow(
        "--targets needs a viewer that names the item its output came from; showing everything",
      ),
    )
  }

  let watcher: PublishWatcher | undefined

  try {
    // Runtime output is only forwarded for objects the viewer has published, so
    // asking for one up front is the difference between output and silence.
    if (command.object) {
      const object = await ensurePublished(client, parseObjectSelector(command.object), publish)

      ids = objectIds(object)

      reporter.note(pc.dim(`watching ${object.objectName} (${object.objectId})`))
    } else {
      // Subscribed before the listing that decides whether to wait, or a
      // publish landing between the two would be missed.
      watcher = publish.waitMs ? waitForAnyPublish(client, publish.waitMs) : undefined

      // Nothing awaits it when something is already published.
      watcher?.published.catch(() => {})

      // With nothing published there is nothing to forward, so either wait for
      // the viewer to publish or say why the stream will stay silent.
      if ((await client.objectList()).objects?.length) {
        watcher?.cancel()
      } else if (watcher) {
        publish.onWait?.("waiting for an object")

        const object = await watcher.published

        reporter.note(pc.dim(`watching ${object.objectName} (${object.objectId})`))
      } else {
        reporter.note(
          pc.yellow(
            `no published objects — runtime output is only forwarded for published objects, so ${PUBLISH_HINT}`,
          ),
        )
      }
    }
  } catch (error) {
    // The wait is the only thing here holding the event loop open. The session
    // closes the socket once this rethrows.
    watcher?.cancel()

    throw error
  }
}

export async function logsCommand(
  global: GlobalFlags,
  command: Extract<Command, { name: "logs" }>,
  reporter: Reporter,
  publish: PublishOptions = {},
): Promise<number> {
  const targets = await loadTargets()

  if (command.targets && targets.items.size === 0) {
    throw new Error("--targets needs a slua.json with targets that name an item")
  }

  // Nothing to stream from, but the session that died wrote down what it saw,
  // which is when someone asks what the script said.
  if (command.since && !command.follow) {
    const { client, control } = await openClient(global, reporter)

    if (!control) {
      client.close()

      return await replayLogs(await projectRoot(), command.since, reporter)
    }

    try {
      await replay(control, command, reporter)
    } finally {
      client.close()
    }

    return 0
  }

  // Printed once, on the first connection. A reconnect asking again would
  // reprint everything since the same cursor.
  let replayed = false
  let control: ControlClient | undefined

  await runSession({
    follow: command.follow,
    reporter,
    // Through a running session when there is one. It already holds the
    // connection, and it numbers the cursor `--since` refers to.
    connect: async () => {
      const opened = await openClient(global, reporter)

      control = opened.control

      return opened.client
    },
    onConnected: async (client) => {
      // Backlog first, so a `--since` that runs into a live stream reads in
      // order rather than interleaving the two.
      if (!replayed) {
        replayed = true

        await replay(control, command, reporter)
      }

      await streamOnce(client, command, reporter, targets, publish)
    },
  })

  return 0
}

/** Prints what the session already has, for a `--since` that asks for it. */
async function replay(
  control: ControlClient | undefined,
  command: Extract<Command, { name: "logs" }>,
  reporter: Reporter,
): Promise<void> {
  if (!command.since || !control) return

  const { logs, truncated, logPath } = await control.logs(sinceParams(command.since))

  for (const payload of logs) writeRecord(reporter, fromPayload(payload))

  if (truncated > 0) {
    reporter.note(
      pc.dim(`${truncated} older records left out; the whole stream is in ${logPath ?? "the log"}`),
    )
  }
}
