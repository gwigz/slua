import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rename, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { watchTargets, type WatchTarget, type Watcher } from "./watch"

const DEBOUNCE_MS = 40

/** Long enough for fs.watch to deliver and the window to close after it. */
const SETTLE_MS = 250

/** Long enough for a freshly installed fs.watch to be armed. */
const ARM_MS = 100

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms))

const open: Watcher[] = []
const made: string[] = []

afterEach(async () => {
  for (const watcher of open.splice(0)) watcher.close()

  for (const dir of made.splice(0)) await rm(dir, { recursive: true, force: true })
})

async function project(): Promise<{ dir: string; target: WatchTarget }> {
  const dir = await mkdtemp(join(tmpdir(), "slua-watch-"))

  made.push(dir)

  const file = join(dir, "main.slua")

  await writeFile(file, "-- one\n", "utf8")

  return { dir, target: { name: "main", file } }
}

/**
 * Starts a watcher and waits for it to be armed.
 *
 * A write that lands in the moment between `watch()` returning and the OS
 * actually reporting on the directory is simply not seen, which is a test
 * harness problem rather than a watcher one: real edits come long after the
 * session started.
 */
async function start<T extends WatchTarget>(
  targets: readonly T[],
  onChange: (changed: T[]) => Promise<void>,
  options: Parameters<typeof watchTargets<T>>[2],
): Promise<Watcher> {
  const watcher = watchTargets(targets, onChange, options)

  open.push(watcher)

  await sleep(ARM_MS)

  return watcher
}

function collector() {
  const batches: string[][] = []

  return {
    batches,
    onChange: async (changed: WatchTarget[]) => {
      batches.push(changed.map((target) => target.name))
    },
  }
}

/**
 * Waits for something to have happened, rather than for a fixed time.
 *
 * fs.watch delivery is not prompt under load, and a test that sleeps for a
 * guess fails on a busy machine rather than on a broken watcher.
 */
async function until(check: () => boolean, timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs

  while (!check() && Date.now() < deadline) await sleep(10)
}

describe("watchTargets", () => {
  it("collapses a burst of writes into one push", async () => {
    const { target } = await project()
    const { batches, onChange } = collector()

    await start([target], onChange, { debounceMs: DEBOUNCE_MS, minIntervalMs: 0 })

    for (const line of ["two", "three", "four"]) {
      await writeFile(target.file, `-- ${line}\n`, "utf8")
      await sleep(5)
    }

    await until(() => batches.length > 0)
    await sleep(SETTLE_MS)

    expect(batches).toEqual([["main"]])
  })

  it("fires on the first write with a leading edge, and not again in the window", async () => {
    const { target } = await project()
    const { batches, onChange } = collector()

    await start([target], onChange, {
      debounceMs: DEBOUNCE_MS,
      minIntervalMs: 0,
      edge: "leading",
    })

    for (const line of ["two", "three"]) {
      await writeFile(target.file, `-- ${line}\n`, "utf8")
      await sleep(5)
    }

    await until(() => batches.length > 0)
    await sleep(SETTLE_MS)

    // Leading and trailing together would be two pushes and two restarts here.
    expect(batches).toEqual([["main"]])
  })

  it("collapses writes that land during a push into one follow-up", async () => {
    const { target } = await project()
    const batches: string[][] = []

    let release: () => void = () => {}
    const held = new Promise<void>((done) => {
      release = done
    })

    let calls = 0

    await start(
      [target],
      async (changed) => {
        batches.push(changed.map((entry) => entry.name))

        // Only the first push is held open, standing in for the upload.
        if (calls++ === 0) await held
      },
      { debounceMs: DEBOUNCE_MS, minIntervalMs: 0 },
    )

    await writeFile(target.file, "-- two\n", "utf8")
    await until(() => batches.length > 0)

    expect(batches).toEqual([["main"]])

    for (const line of ["three", "four", "five"]) {
      await writeFile(target.file, `-- ${line}\n`, "utf8")
      await sleep(5)
    }

    await sleep(SETTLE_MS)

    // Still nothing new: an upload cannot be cancelled, so the pending push
    // waits for it rather than stacking behind it three deep.
    expect(batches).toEqual([["main"]])

    release()

    await until(() => batches.length > 1)

    expect(batches).toEqual([["main"], ["main"]])
  })

  it("ignores a rewrite that leaves the content unchanged", async () => {
    const { target } = await project()
    const { batches, onChange } = collector()

    await start([target], onChange, { debounceMs: DEBOUNCE_MS, minIntervalMs: 0 })

    await writeFile(target.file, "-- two\n", "utf8")
    await until(() => batches.length > 0)

    expect(batches).toEqual([["main"]])

    // The no-op rebuild: same bytes, and restarting a running script for it
    // would be the watcher's own fault.
    await writeFile(target.file, "-- two\n", "utf8")
    await sleep(SETTLE_MS)

    expect(batches).toEqual([["main"]])
  })

  it("defers a second push of the same item, and says so", async () => {
    const { target } = await project()
    const { batches, onChange } = collector()
    const deferrals: number[] = []

    await start([target], onChange, {
      debounceMs: DEBOUNCE_MS,
      // Comfortably longer than the settle below, so the deferral is still in
      // force when it is checked rather than having quietly elapsed.
      minIntervalMs: 1_000,
      onDefer: (_targets, waitMs) => deferrals.push(waitMs),
    })

    await writeFile(target.file, "-- two\n", "utf8")
    await until(() => batches.length > 0)

    expect(batches).toEqual([["main"]])

    await writeFile(target.file, "-- three\n", "utf8")
    await until(() => deferrals.length > 0)

    // Held back rather than dropped, and reported, or it looks like a miss.
    expect(batches).toEqual([["main"]])

    await until(() => batches.length > 1)

    expect(batches).toEqual([["main"], ["main"]])
  })

  it("notices a file replaced by a rename rather than written in place", async () => {
    const { dir, target } = await project()
    const { batches, onChange } = collector()

    await start([target], onChange, { debounceMs: DEBOUNCE_MS, minIntervalMs: 0 })

    // What an editor with atomic saves does, and what a watch on the path
    // itself stops reporting after.
    const staging = join(dir, "main.slua.tmp")

    await writeFile(staging, "-- renamed\n", "utf8")
    await rename(staging, target.file)
    await until(() => batches.length > 0)

    expect(batches).toEqual([["main"]])
  })

  it("pushes on trigger without waiting for a window", async () => {
    const { target } = await project()
    const { batches, onChange } = collector()
    const watcher = await start([target], onChange, {
      debounceMs: 60_000,
      minIntervalMs: 60_000,
    })

    await watcher.trigger()

    // An explicit push is a decision, not an inference, so no guard applies.
    expect(batches).toEqual([["main"]])

    await watcher.trigger(["main"])

    expect(batches).toEqual([["main"], ["main"]])
  })

  it("keeps watching after a push fails", async () => {
    const { target } = await project()
    const errors: string[] = []

    let calls = 0

    await start(
      [target],
      async () => {
        if (calls++ === 0) throw new Error("viewer said no")
      },
      {
        debounceMs: DEBOUNCE_MS,
        minIntervalMs: 0,
        onError: (error) => errors.push(error.message),
      },
    )

    await writeFile(target.file, "-- two\n", "utf8")
    await until(() => errors.length > 0)

    await writeFile(target.file, "-- three\n", "utf8")
    await until(() => calls > 1)

    expect(errors).toEqual(["viewer said no"])
    expect(calls).toBe(2)
  })

  it("reports a directory it cannot watch rather than throwing", async () => {
    const errors: string[] = []

    open.push(
      watchTargets(
        [{ name: "main", file: join(tmpdir(), "slua-missing-dir", "main.slua") }],
        async () => {},
        {
          onError: (error) => errors.push(error.message),
        },
      ),
    )

    expect(errors).toEqual([expect.stringContaining("cannot watch")])
  })
})
