import { spawn } from "node:child_process"
import { stat } from "node:fs/promises"
import pc from "picocolors"
import {
  ensurePublished,
  formatObjectSelector,
  PUBLISH_HINT,
  type PublishOptions,
  withoutWait,
} from "../../addressing.js"
import { ViewerClient } from "../../client.js"
import {
  SessionAlreadyRunningError,
  startControlServer,
  type ControlServer,
} from "../../control/server.js"
import { ConnectionClosedError } from "../../protocol/errors.js"
import { controlPath } from "../../control/socket.js"
import { SAVE_TIMEOUT_MS } from "../../protocol/peer.js"
import type { RuntimeDebug, RuntimeError } from "../../protocol/types.js"
import { openState, type SessionState } from "../../state.js"
import { loadSourceMapFor } from "../../sourcemap.js"
import { loadConfig, type Target } from "../../targets.js"
import { watchTargets, type Watcher } from "../../watch.js"
import type { Command, GlobalFlags } from "../args.js"
import { displayPath, type Reporter } from "../output.js"
import {
  cursor,
  loadTargets,
  nextCursor,
  recordPayload,
  toRecord,
  writeRecord,
} from "../runtime-view.js"
import { runSession } from "../session.js"
import { collectTargets, pushTarget } from "./push.js"

/**
 * Runs the build in a child process, prefixed, so this is one terminal.
 *
 * The compiler stays the scaffold's business. tstl's incremental watch beats
 * anything here, and the multi template's build script means there is no
 * single invocation to assume. This only carries the output.
 */
function runBuild(exec: string, reporter: Reporter): () => void {
  reporter.note(pc.dim(`build ${exec}`))

  // Its own process group, so stopping the session stops the whole build
  // pipeline rather than orphaning whatever the shell started.
  const child = spawn(exec, { shell: true, detached: true, stdio: ["ignore", "pipe", "pipe"] })

  const forward = (chunk: Buffer) => {
    for (const line of chunk.toString().split("\n")) {
      if (line.trim() !== "") reporter.note(`${pc.dim("build")} ${line}`)
    }
  }

  child.stdout?.on("data", forward)
  child.stderr?.on("data", forward)

  child.on("error", (error) => reporter.error(`build failed to start: ${error.message}`))

  child.on("exit", (code) => {
    if (code !== 0 && code !== null) reporter.note(pc.yellow(`build exited with ${code}`))
  })

  return () => {
    if (child.pid === undefined || child.exitCode !== null) return

    try {
      // Negative pid is the group, which is the point of detaching it.
      process.kill(-child.pid)
    } catch {
      // Already gone, which is the outcome we wanted.
    }
  }
}

/**
 * Publishes the objects the targets deploy to.
 *
 * Runtime output only reaches us for published objects, so a session that
 * skipped this would connect, watch, push and sit in silence. One object
 * failing is reported rather than fatal, since it may not be rezzed yet and
 * the next push asks again.
 */
async function publishTargets(
  client: ViewerClient,
  targets: readonly Target[],
  reporter: Reporter,
  publish: PublishOptions,
): Promise<void> {
  const seen = new Set<string>()

  let first = true

  for (const target of targets) {
    const key = formatObjectSelector(target.ref.object)

    if (seen.has(key)) continue

    seen.add(key)

    try {
      // Only the first object waits on the publish button. Waiting five
      // minutes per target would make a mistyped selector look like a hang.
      const object = await ensurePublished(
        client,
        target.ref.object,
        first ? publish : withoutWait(publish),
      )

      first = false

      reporter.note(pc.dim(`watching ${object.objectName} (${object.objectId})`))
    } catch (error) {
      reporter.note(
        pc.yellow(
          `${target.name}: ${error instanceof Error ? error.message : String(error)}; pushing will try again`,
        ),
      )
    }
  }
}

/** Viewer notifications an attached client is entitled to see. */
const BROADCAST = [
  "runtime.debug",
  "runtime.error",
  "object.publish",
  "object.unpublish",
  "object.update",
  "script.compiled",
  "script.unsubscribe",
  "language.syntax.change",
] as const

/** How many records one `control.logs` or `control.wait` answer may carry. */
const MAX_RECORDS = 200

/** How many records the session keeps in memory for those answers. */
const BUFFER_RECORDS = 2_000

const DEFAULT_WAIT_MS = 30_000

/** How long an explicit push waits for a build that has not run yet. */
const BUILD_WAIT_MS = 10_000

/** Said to a control client when the viewer is the thing that went away. */
const NO_VIEWER =
  "the session lost its viewer connection and is reconnecting; is the viewer running?"

/**
 * How long `control.wait` keeps listening after the push it was waiting for.
 *
 * A save settles the moment the viewer answers, but the script it restarted
 * speaks a beat later, and results with no output in them leave an agent
 * polling for the rest.
 */
const SETTLE_DRAIN_MS = 1_500

interface PushRun {
  /** This push's own place in the cursor sequence, taken before it started. */
  cursor: number
  at: string
  targets: Record<string, unknown>[]
}

interface Waiter {
  since: number
  settle: (run: PushRun | undefined) => void
}

/**
 * Consecutive identical lines, as one record with a count.
 *
 * A script looping on `llOwnerSay` outruns any reader, and a thousand copies
 * of one line say no more than one.
 */
function collapse(records: Record<string, unknown>[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []

  for (const record of records) {
    const previous = out.at(-1)

    if (
      previous &&
      previous.level === record.level &&
      previous.message === record.message &&
      previous.objectId === record.objectId
    ) {
      previous.repeat = ((previous.repeat as number | undefined) ?? 1) + 1

      continue
    }

    out.push({ ...record })
  }

  return out
}

/**
 * Waits for the build to catch up with the source, before an explicit push.
 *
 * The session does not own the compiler, so "push now" means "push what is on
 * disk now". A human typing `push` has watched their build run. An agent that
 * edits a file and asks for a push in the same breath has not, and would
 * deploy the build from before its own edit, then read the output as the new
 * one.
 *
 * The source map names the inputs, so a source newer than the output means a
 * build is still owed. One that never arrives, broken or absent, gives up here
 * rather than hanging the push.
 */
async function awaitBuild(targets: readonly Target[], reporter: Reporter): Promise<number> {
  const started = Date.now()
  const pending: { file: string; at: number }[] = []

  for (const target of targets) {
    const output = await stat(target.file).catch(() => undefined)

    if (!output) continue

    const map = await loadSourceMapFor(target.file)

    if (!map) continue

    let newest = 0

    for (const source of map.sources) {
      const input = await stat(source).catch(() => undefined)

      if (input) newest = Math.max(newest, input.mtimeMs)
    }

    if (newest > output.mtimeMs) pending.push({ file: target.file, at: output.mtimeMs })
  }

  if (pending.length === 0) return 0

  reporter.note(pc.dim("waiting for the build to catch up with the source"))

  while (Date.now() - started < BUILD_WAIT_MS) {
    await new Promise((sleep) => setTimeout(sleep, 100))

    const stale = []

    for (const entry of pending) {
      const output = await stat(entry.file).catch(() => undefined)

      if (!output || output.mtimeMs <= entry.at) stale.push(entry)
    }

    if (stale.length === 0) return Date.now() - started

    pending.length = 0
    pending.push(...stale)
  }

  reporter.note(pc.yellow("the build has not produced new output; pushing what is on disk"))

  return Date.now() - started
}

export async function connectCommand(
  global: GlobalFlags,
  command: Extract<Command, { name: "connect" }>,
  reporter: Reporter,
  publish: PublishOptions = {},
): Promise<number> {
  const config = await loadConfig()

  // A freshly scaffolded project has no slua.json until `link` writes one, and
  // `dev` is the first thing anyone runs, so a session with nothing to watch
  // still holds the connection and streams output.
  const targets = config
    ? await collectTargets(
        { name: "push", all: command.target === undefined, target: command.target, tail: 0 },
        config,
      )
    : []

  const root = config?.root ?? process.cwd()

  // Source maps, so runtime output arrives already mapped back to TypeScript.
  let view = await loadTargets()

  // A session with watching off still holds the connection and captures
  // output, which is what an agent driving its own pushes wants.
  const watching = command.watch ?? targets.length > 0

  let client: ViewerClient | undefined
  let watcher: Watcher | undefined
  let control: ControlServer | undefined
  let pushing = false
  let lastRun: PushRun | undefined

  /** Targets saved while the viewer was away, owed to the next connection. */
  const pending = new Set<string>()

  /** Recent output, for a client that attached after it was printed. */
  const buffer: Record<string, unknown>[] = []
  const outcomes = new Map<string, Record<string, unknown>>()
  const waiters = new Set<Waiter>()

  const remember = (payload: Record<string, unknown>) => {
    buffer.push(payload)

    // Bounded. The file sink holds the complete record; this is only what a
    // client can still ask for after the fact.
    if (buffer.length > BUFFER_RECORDS) buffer.splice(0, buffer.length - BUFFER_RECORDS)
  }

  /** Records after a cursor or a moment, collapsed and capped, never dropped. */
  const since = (from: number, limit = MAX_RECORDS, sinceMs?: number) => {
    const cutoff = sinceMs === undefined ? undefined : Date.now() - sinceMs

    const matching = collapse(
      buffer.filter((entry) => {
        if (cutoff !== undefined) return new Date(String(entry.time)).getTime() >= cutoff

        return (entry.seq as number) > from
      }),
    )
    const logs = matching.slice(-limit)

    return { logs, truncated: matching.length - logs.length }
  }

  // Opened before anything can be logged, so a session that dies in its first
  // second still leaves the reason behind.
  const state: SessionState = await openState(
    root,
    { port: global.port, root, socket: controlPath(root) },
    { onError: (error) => reporter.note(pc.yellow(`log sink: ${error.message}`)) },
  )

  reporter.note(pc.dim(`session state in ${displayPath(state.directory)}`))

  const push = async (changed: readonly Target[]) => {
    // Its own place in the sequence, taken before anything is saved, so
    // "settled since this cursor" can never match the run before it.
    const run: PushRun = { cursor: nextCursor(), at: new Date().toISOString(), targets: [] }

    pushing = true

    // Nothing settles on a run with no viewer behind it. The watcher has
    // already recorded the content as pushed, so these targets are held for
    // the reconnect, and a client waiting reads an empty run as a clean push.
    const reached = client !== undefined

    if (!reached) {
      for (const target of changed) pending.add(target.name)

      reporter.note(pc.yellow("not connected; the change will be pushed on reconnect"))
    }

    try {
      if (reached) await pushEach(changed, run)
    } finally {
      pushing = false

      if (reached) lastRun = run

      // Reloaded after every push: the build that prompted it rewrote the
      // source maps, and this run's output through the last build's maps
      // points at whatever used to be on those lines.
      view = await loadTargets()

      // Snapshotted, since settling removes the waiter from the set it is
      // being iterated out of.
      const waiting = reached ? [...waiters] : []

      for (const waiter of waiting) {
        if (run.cursor > waiter.since) {
          waiters.delete(waiter)
          waiter.settle(run)
        }
      }
    }
  }

  const pushEach = async (changed: readonly Target[], run: PushRun) => {
    if (!client) return

    for (const target of changed) {
      const result = await pushTarget(client, target, reporter, changed.length > 1, {
        // A watch event is not the moment to sit on the publish button for
        // five minutes. The session already asked for that at startup.
        ...withoutWait(publish),
      })

      state.append({ kind: "push", time: run.at, ...result.payload })
      outcomes.set(target.name, result.payload)
      run.targets.push(result.payload)

      // A save can succeed while the compile fails, and the source is stored
      // either way, so the item now holds code that never ran. Three edits
      // later nobody is reading the error, so say what is actually running.
      if (result.payload.compiled === false && result.payload.ok !== undefined) {
        reporter.note(
          pc.yellow(
            `${target.name}: the running script is unchanged, the item now holds source that did not compile`,
          ),
        )
      }
    }
  }

  const stopBuild = command.exec ? runBuild(command.exec, reporter) : undefined

  watcher = watchTargets(targets, push, {
    // Always built, watching or not. It owns the queue that keeps two saves
    // from racing against one prim, and `control.push` goes through it too.
    enabled: watching,
    debounceMs: command.debounceMs,
    edge: command.edge,
    onDefer: (deferred, waitMs) =>
      reporter.note(
        pc.dim(
          `holding ${deferred.map((target) => target.name).join(", ")} for ${Math.round(waitMs / 1000)}s, pushes are expensive`,
        ),
      ),
    onError: (error) => reporter.error(error.message),
  })

  if (watching) {
    reporter.note(
      pc.dim(
        `watching ${targets.map((target) => displayPath(target.file)).join(", ")} for changes`,
      ),
    )
  } else if (targets.length === 0) {
    reporter.note(
      pc.yellow(
        `nothing to watch yet. pair an object with "slua-viewer link <name>", then ${PUBLISH_HINT}`,
      ),
    )
  } else {
    reporter.note(pc.dim("watching off; holding the connection and streaming output"))
  }

  try {
    control = await startControlServer(root, {
      handshake: () => client?.connection.handshake,

      status: () => ({
        connected: client !== undefined,
        watching,
        pushing,
        cursor: cursor(),
        viewer: { port: global.port, name: client?.connection.handshake?.viewerName },
        logPath: state.logPath,
        targets: targets.map((target) => ({
          name: target.name,
          file: target.file,
          item: target.ref.item,
          lastPush: outcomes.get(target.name),
        })),
      }),

      logs: ({ since: from = 0, limit, sinceMs }) => ({
        cursor: cursor(),
        logPath: state.logPath,
        ...since(from, limit ?? MAX_RECORDS, sinceMs),
      }),

      push: async ({ targets: names }) => {
        // The cursor from before the push, so handing it straight to `wait`
        // cannot match the run before this one.
        const from = cursor()

        const wanted = names?.length
          ? targets.filter((target) => names.includes(target.name))
          : targets

        // Before the trigger rather than inside it, so the watcher records the
        // content the build produced and does not push it a second time.
        const waited = await awaitBuild(wanted, reporter)

        // Not awaited: `wait` is what blocks, and a client that wants the
        // results asks for them with the cursor this hands back.
        void watcher?.trigger(names)

        return {
          cursor: from,
          waited,
          targets: wanted.map((target) => target.name),
        }
      },

      wait: ({ since: from = 0, timeoutMs = DEFAULT_WAIT_MS }) =>
        new Promise((settled) => {
          const deadline = Date.now() + timeoutMs

          const answer = (run: PushRun | undefined) => ({
            settled: run !== undefined,
            cursor: cursor(),
            targets: run?.targets ?? [],
            logPath: state.logPath,
            ...since(from),
          })

          // The push has landed, but the script it restarted has not spoken
          // yet, so the answer waits out the same window a `push` does.
          const drain = (run: PushRun) =>
            setTimeout(
              () => settled(answer(run)),
              Math.max(0, Math.min(SETTLE_DRAIN_MS, deadline - Date.now())),
            )

          // A push newer than the caller's cursor has already settled, so
          // there is nothing to wait for beyond its output.
          if (lastRun && lastRun.cursor > from) {
            drain(lastRun)

            return
          }

          const waiter: Waiter = {
            since: from,
            settle: (run) => {
              clearTimeout(timer)

              // No run means the session is stopping, so there is nothing
              // left to drain for.
              if (run) drain(run)
              else settled(answer(undefined))
            },
          }

          const timer = setTimeout(() => {
            waiters.delete(waiter)

            // Reported as unsettled rather than as the previous run's results,
            // which would look authoritative and be wrong.
            settled(answer(undefined))
          }, timeoutMs)

          waiters.add(waiter)
        }),

      forward: async (method, params) => {
        if (!client) throw new Error(NO_VIEWER)

        try {
          // A save waits on an asset upload, which no default timeout covers.
          return await client.connection.peer.call(
            method,
            params,
            method === "object.content.save" ? SAVE_TIMEOUT_MS : undefined,
          )
        } catch (error) {
          // An error's type does not survive the hop to a control client: it
          // arrives as a plain RPC failure, so whatever the type would have
          // explained has to be in the message instead.
          if (error instanceof ConnectionClosedError) throw new Error(NO_VIEWER, { cause: error })

          throw error
        }
      },
    })

    reporter.note(pc.dim(`control socket at ${control.path}`))
  } catch (error) {
    // Two sessions on one project would push the same targets twice and
    // restart the same script twice, so this one is a stop rather than a
    // downgrade.
    if (error instanceof SessionAlreadyRunningError) throw error

    // A session without a socket is still a session: it watches, pushes and
    // logs. Only the calls an agent would make are missing, so say so and
    // carry on.
    reporter.note(
      pc.yellow(`control socket unavailable: ${error instanceof Error ? error.message : error}`),
    )
  }

  await runSession({
    // A session outlives a viewer restart by definition.
    follow: true,
    reporter,
    connect: () => ViewerClient.connect({ port: global.port, timeoutMs: global.timeoutMs }),
    onConnected: async (connected) => {
      client = connected

      // Subscribed before publishing, so output produced while the viewer is
      // still publishing reaches the stream.
      const record = (level: "debug" | "error", params: RuntimeDebug | RuntimeError) => {
        const entry = toRecord(level, params, view.maps)

        const payload = recordPayload(entry)

        writeRecord(reporter, entry)
        state.append({ kind: "runtime", ...payload })
        remember(payload)
      }

      connected.on("runtime.debug", (params) => record("debug", params))
      connected.on("runtime.error", (params) => record("error", params))

      // Passed through to every attached client, so a `logs` or a `--wait`
      // running against the session sees what the viewer sent.
      for (const event of BROADCAST) {
        connected.connection.peer.on(event, (params) => control?.broadcast(event, params))
      }

      connected.connection.onClose(() => {
        if (client === connected) client = undefined
      })

      // Re-published on every reconnect: a viewer that restarted has
      // forgotten everything the old connection published.
      await publishTargets(connected, targets, reporter, publish)

      // After publishing, since a push to an unpublished object is the error
      // publishing is there to avoid.
      if (pending.size > 0) {
        const owed = [...pending]

        pending.clear()

        reporter.note(pc.dim(`pushing ${owed.join(", ")}, saved while disconnected`))

        void watcher?.trigger(owed)
      }
    },
    onStop: async () => {
      // Awaited: a push in flight owns the connection this teardown is about
      // to close, and its result still has to reach the log.
      await watcher?.close()

      stopBuild?.()

      // Waiters first: a client blocked on `wait` should be told the session
      // is going rather than left holding a socket that just vanished.
      for (const waiter of waiters) waiter.settle(undefined)

      waiters.clear()

      await control?.close()

      // Flushed before the process is allowed to end: the SIGINT that stopped
      // the session is exactly when the last line matters most.
      await state.close()
    },
  })

  return 0
}
