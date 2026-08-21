import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { LOG_FILE, openState, readSession, stateDirectory } from "./state"

const made: string[] = []

afterEach(async () => {
  for (const dir of made.splice(0)) await rm(dir, { recursive: true, force: true })
})

async function root(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "slua-state-"))

  made.push(dir)

  return dir
}

describe("openState", () => {
  it("writes a session file and takes it away again on close", async () => {
    const dir = await root()
    const state = await openState(dir, { port: 9020, root: dir })

    expect(await readSession(dir)).toMatchObject({ pid: process.pid, port: 9020, root: dir })

    await state.close()

    // A session file that outlives its session points at a pid that may since
    // have become something else.
    expect(await readSession(dir)).toBeUndefined()
  })

  it("appends one JSON object per line, in order", async () => {
    const dir = await root()
    const state = await openState(dir, { port: 9020, root: dir })

    state.append({ kind: "runtime", seq: 1 })
    state.append({ kind: "push", target: "main" })

    await state.flush()

    const lines = (await readFile(join(stateDirectory(dir), LOG_FILE), "utf8"))
      .split("\n")
      .filter((line) => line !== "")

    expect(lines.map((line) => JSON.parse(line))).toEqual([
      { kind: "runtime", seq: 1 },
      { kind: "push", target: "main" },
    ])

    await state.close()
  })

  it("rotates at the size cap, keeping one previous file", async () => {
    const dir = await root()
    const state = await openState(dir, { port: 9020, root: dir }, { maxBytes: 200 })

    for (let index = 0; index < 20; index++) {
      state.append({ kind: "runtime", seq: index, message: "x".repeat(20) })
    }

    await state.flush()

    const logPath = join(stateDirectory(dir), LOG_FILE)
    const current = await readFile(logPath, "utf8")
    const previous = await readFile(`${logPath}.1`, "utf8")

    expect(current.length).toBeLessThanOrEqual(200)
    expect(previous.length).toBeGreaterThan(0)

    // Whatever survived is still readable line by line, which is the point of
    // the format.
    for (const entry of `${previous}${current}`.split("\n").filter((text) => text !== "")) {
      expect(() => JSON.parse(entry)).not.toThrow()
    }

    await state.close()
  })

  it("reports an unwritable sink once rather than per record", async () => {
    const dir = await root()
    const state = await openState(dir, { port: 9020, root: dir })
    const errors: string[] = []

    await state.close()

    // Something in the way of the log file, so every write fails.
    await rm(join(stateDirectory(dir), LOG_FILE), { force: true })

    const blocked = await openState(
      dir,
      { port: 9020, root: dir },
      { onError: (error) => errors.push(error.message) },
    )

    await rm(stateDirectory(dir), { recursive: true, force: true })
    await writeFile(stateDirectory(dir), "not a directory", "utf8")

    blocked.append({ kind: "runtime", seq: 1 })
    blocked.append({ kind: "runtime", seq: 2 })

    await blocked.flush()

    expect(errors.length).toBe(1)
  })
})
