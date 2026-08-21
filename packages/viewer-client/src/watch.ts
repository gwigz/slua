import { createHash } from "node:crypto"
import { type FSWatcher, readFileSync, watch } from "node:fs"
import { readFile } from "node:fs/promises"
import { dirname } from "node:path"

/**
 * How long a target has to be quiet before it is pushed.
 *
 * Every push restarts the script and costs a simulator asset upload, so the
 * job here is not to notice a change quickly, it is to decide when a burst of
 * changes has finished. Too short and six small edits become six restarts, too
 * long and someone waits at a terminal wondering whether it noticed. Restarts
 * are the more expensive mistake, so this errs long.
 */
export const DEBOUNCE_MS = 3_000

/** The floor between two pushes of the same item, whatever the debounce says. */
export const MIN_INTERVAL_MS = 3_000

/** The parts of a target the watcher needs. `Target` satisfies it. */
export interface WatchTarget {
  name: string
  /** Absolute path to the built output. */
  file: string
}

export interface WatchOptions<T extends WatchTarget = WatchTarget> {
  /**
   * Whether to watch at all.
   *
   * Off still leaves `trigger`, and with it the queue that keeps two saves
   * from racing against one prim, so a session driven entirely by explicit
   * pushes goes through exactly the same path as a watched one.
   */
  enabled?: boolean
  debounceMs?: number
  /**
   * Which end of the quiet window to fire on.
   *
   * Trailing collapses a burst into one push and is the right default. Leading
   * gives instant feedback but pushes whatever half-finished state the first
   * write happened to contain. The two together would mean two pushes and two
   * restarts per burst, which is what this whole module exists to prevent, so
   * it is deliberately not offered.
   */
  edge?: "trailing" | "leading"
  minIntervalMs?: number
  /** Told when a change is held back, so silence never reads as a miss. */
  onDefer?: (targets: T[], waitMs: number) => void
  onError?: (error: Error) => void
}

export interface Watcher {
  /** Pushes now, skipping the debounce. An explicit ask, so no guard applies. */
  trigger(names?: readonly string[]): Promise<void>
  close(): void
}

/** The content of a file, or undefined if it cannot be read right now. */
async function digestOf(file: string): Promise<string | undefined> {
  try {
    return createHash("sha1")
      .update(await readFile(file))
      .digest("hex")
  } catch {
    // Mid-write, or gone: let the push report it rather than guessing here.
    return undefined
  }
}

/** The same, at startup, where a race with the first change matters more. */
function digestNow(file: string): string | undefined {
  try {
    return createHash("sha1").update(readFileSync(file)).digest("hex")
  } catch {
    return undefined
  }
}

/**
 * Watches built outputs and calls back once a change has settled.
 *
 * Deliberately not a compiler: scaffolds already ship a watch build, tstl's
 * incremental watch beats anything here, and watching the output works for a
 * hand-written `.lsl` with no build step at all.
 */
export function watchTargets<T extends WatchTarget>(
  targets: readonly T[],
  onChange: (changed: T[]) => Promise<void>,
  options: WatchOptions<T> = {},
): Watcher {
  const debounceMs = options.debounceMs ?? DEBOUNCE_MS
  const minIntervalMs = options.minIntervalMs ?? MIN_INTERVAL_MS
  const leading = options.edge === "leading"

  /** Targets waiting to be pushed. A map, so a burst collapses to one entry. */
  const ready = new Map<string, T>()
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  /** When the leading edge stops swallowing changes for a target. */
  const suppressed = new Map<string, number>()
  const pushedAt = new Map<string, number>()

  /**
   * The content each target had when we last acted on it.
   *
   * Seeded from disk before the first watch is installed, so an event naming
   * something else in the directory cannot be mistaken for a change to a
   * target that has not actually moved.
   */
  const digests = new Map<string, string>()

  for (const target of targets) {
    const digest = digestNow(target.file)

    if (digest !== undefined) digests.set(target.name, digest)
  }

  const watchers: FSWatcher[] = []

  let chain: Promise<void> = Promise.resolve()
  let retry: ReturnType<typeof setTimeout> | undefined
  let closed = false

  /**
   * Runs `fn` after whatever is already running.
   *
   * Two saves in flight against one prim is how the viewer's "item not found
   * in prim inventory" staleness gets worse, and an upload cannot be
   * cancelled, so work queues behind the one in flight rather than racing it.
   */
  const serialise = <R>(fn: () => Promise<R>): Promise<R> => {
    const run = chain.then(fn, fn)

    chain = run.then(
      () => {},
      () => {},
    )

    return run
  }

  const remember = async (target: T) => {
    const digest = await digestOf(target.file)

    if (digest === undefined) digests.delete(target.name)
    else digests.set(target.name, digest)
  }

  const run = async (batch: T[]) => {
    try {
      await onChange(batch)
    } catch (error) {
      // A failed push must not take the watcher down with it; the next save
      // is the user's next chance to fix it.
      options.onError?.(error instanceof Error ? error : new Error(String(error)))
    } finally {
      // Measured from when the push finished, not when it started: the
      // interval exists to space out script restarts, and the upload is most
      // of the time between them.
      const now = Date.now()

      for (const target of batch) pushedAt.set(target.name, now)
    }
  }

  const flush = () =>
    serialise(async () => {
      if (closed || ready.size === 0) return

      const now = Date.now()
      const batch: T[] = []
      const deferred: T[] = []

      let wait = 0

      // Snapshotted, since the loop deletes from `ready` as it goes and a
      // change landing while it awaits must not be visited twice.
      const waiting = [...ready]

      for (const [name, target] of waiting) {
        const last = pushedAt.get(name)

        if (last !== undefined && now - last < minIntervalMs) {
          // Left in `ready`, so the retry below picks it up with whatever the
          // file says by then rather than what it said now.
          deferred.push(target)
          wait = Math.max(wait, minIntervalMs - (now - last))

          continue
        }

        ready.delete(name)

        const digest = await digestOf(target.file)

        // The cheapest guard of the lot, and it catches the no-op rebuild that
        // would otherwise restart a running script for nothing.
        if (digest !== undefined && digest === digests.get(name)) continue

        if (digest !== undefined) digests.set(name, digest)

        batch.push(target)
      }

      if (deferred.length > 0) {
        options.onDefer?.(deferred, wait)

        clearTimeout(retry)

        retry = setTimeout(() => {
          retry = undefined

          void flush()
        }, wait)
      }

      if (batch.length === 0) return

      await run(batch)

      // Changes that landed while that push was in flight, as one follow-up
      // rather than one per write. Only after a push actually happened, or a
      // batch that was entirely deferred would spin here until its retry.
      if (ready.size > 0 && !closed) void flush()
    })

  const mark = (target: T) => {
    if (closed) return

    if (leading) {
      const now = Date.now()

      if (now < (suppressed.get(target.name) ?? 0)) return

      suppressed.set(target.name, now + debounceMs)
      ready.set(target.name, target)

      void flush()

      return
    }

    // Each change pushes the window out, so only the quiet after a burst fires.
    clearTimeout(timers.get(target.name))

    timers.set(
      target.name,
      setTimeout(() => {
        timers.delete(target.name)
        ready.set(target.name, target)

        void flush()
      }, debounceMs),
    )
  }

  const byDirectory = new Map<string, T[]>()

  for (const target of targets) {
    const directory = dirname(target.file)

    byDirectory.set(directory, [...(byDirectory.get(directory) ?? []), target])
  }

  for (const [directory, watched] of (options.enabled ?? true) ? byDirectory : []) {
    try {
      // The directory rather than each file: an editor, or a build, that
      // writes a temporary file and renames it over the old one leaves a watch
      // on the path itself reporting nothing ever again.
      //
      // Every target in the directory is marked, whatever the event names,
      // because macOS coalesces a staging write and the rename that follows it
      // into a single event naming only the staging file. The digest check at
      // flush time is what decides whether anything moved, so marking a target
      // that did not costs one file read and nothing else.
      const watcher = watch(directory, () => {
        for (const target of watched) mark(target)
      })

      watcher.on("error", (error) => options.onError?.(error))
      watchers.push(watcher)
    } catch (error) {
      // A build that has not run yet has no output directory to watch.
      options.onError?.(
        new Error(
          `cannot watch ${directory}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      )
    }
  }

  return {
    trigger(names) {
      const wanted =
        names && names.length > 0
          ? targets.filter((target) => names.includes(target.name))
          : targets

      return serialise(async () => {
        for (const target of wanted) {
          ready.delete(target.name)

          // Recorded now, so the write that prompted this does not also come
          // back through the watcher as a change worth pushing.
          await remember(target)
        }

        await run([...wanted])
      })
    },

    close() {
      closed = true

      clearTimeout(retry)

      for (const timer of timers.values()) clearTimeout(timer)

      timers.clear()
      ready.clear()

      for (const watcher of watchers) watcher.close()
    },
  }
}
