import { describe, expect, it } from "bun:test"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { parseObjectRef } from "../../addressing"
import type { ViewerClient } from "../../client"
import { RpcError } from "../../protocol/errors"
import type { ObjectInventoryItem, PublishedObject } from "../../protocol/types"
import type { Config } from "../../targets"
import type { Reporter } from "../output"
import { collectTargets, pushCommand, resolveVm } from "./push"

const luauItem: ObjectInventoryItem = { itemId: "x", name: "Main", type: "script", subtype: 1 }
const lslItem: ObjectInventoryItem = { itemId: "x", name: "Main", type: "script", subtype: 0 }

describe("resolveVm", () => {
  it("prefers an explicit --vm over everything", () => {
    expect(resolveVm("mono", "dist/main.slua", luauItem)).toBe("mono")
  })

  it("infers luau from the extensions TSTL emits", () => {
    expect(resolveVm(undefined, "dist/main.slua", lslItem)).toBe("luau")
    expect(resolveVm(undefined, "dist/main.luau", lslItem)).toBe("luau")
  })

  it("infers mono from an lsl file", () => {
    expect(resolveVm(undefined, "src/main.lsl", luauItem)).toBe("mono")
  })

  it("falls back to the item's own vm for an unknown extension", () => {
    expect(resolveVm(undefined, "notes.txt", luauItem)).toBe("luau")
    expect(resolveVm(undefined, "notes.txt", { ...lslItem, vm: "mono" })).toBe("mono")
  })

  it("leaves the vm unset when nothing indicates one, so the viewer decides", () => {
    expect(resolveVm(undefined, "notes.txt", lslItem)).toBeUndefined()
  })
})

describe("resolveVm for LSL", () => {
  const doorItem: ObjectInventoryItem = { itemId: "x", name: "Door", type: "script", subtype: 0 }

  it("compiles a .lsl file as mono, the default LSL vm", () => {
    expect(resolveVm(undefined, "src/door.lsl", doorItem)).toBe("mono")
  })

  it("still honours an explicit lsl2 request", () => {
    expect(resolveVm("lsl2", "src/door.lsl", doorItem)).toBe("lsl2")
  })

  it("lets LSL-on-Luau be requested for an .lsl file", () => {
    // The viewer maps "luau" on a non-native script to its lsl-luau path.
    expect(resolveVm("luau", "src/door.lsl", doorItem)).toBe("luau")
  })
})

describe("collectTargets", () => {
  const config: Config = { root: "/elsewhere", targets: {} }

  it("resolves a command line path against the cwd, not the config root", async () => {
    // slua.json may sit several directories up; a path typed in a terminal is
    // relative to that terminal.
    const [target] = await collectTargets(
      { name: "push", file: "dist/main.slua", ref: parseObjectRef("Rezzer/Main"), all: false },
      config,
    )

    expect(target.file).toBe(resolve(process.cwd(), "dist/main.slua"))
  })

  it("resolves a config path against the config root", async () => {
    const [target] = await collectTargets(
      { name: "push", target: "main", all: false },
      {
        root: "/elsewhere",
        targets: {
          main: { file: "dist/main.slua", object: { kind: "name", value: "Rezzer" }, item: "Main" },
        },
      },
    )

    expect(target.file).toBe(join("/elsewhere", "dist", "main.slua"))
  })
})

function collectingReporter(): Reporter & { payload?: unknown; errors: string[] } {
  const errors: string[] = []

  return {
    json: true,
    errors,
    data(payload) {
      this.payload = payload
    },
    line() {},
    raw() {},
    note() {},
    error(text) {
      errors.push(text)
    },
  }
}

const published: PublishedObject = {
  objectId: "aaaaaaaa-0000-0000-0000-000000000001",
  objectName: "Second",
  inventory: [
    {
      itemId: "b".repeat(8) + "-0000-0000-0000-000000000002",
      name: "Main",
      type: "script",
      subtype: 1,
      running: true,
    },
  ],
}

describe("pushCommand with --all", () => {
  it("keeps going after a target fails, and still reports every one", async () => {
    // The first target names an object that is not published, so it throws.
    // The second must still be pushed and the --json document list both.
    const dir = await mkdtemp(join(tmpdir(), "slua-push-"))

    await mkdir(join(dir, "dist"))
    await writeFile(join(dir, "dist", "first.slua"), "-- first\n", "utf8")
    await writeFile(join(dir, "dist", "second.slua"), "-- second\n", "utf8")
    await writeFile(
      join(dir, "slua.json"),
      JSON.stringify({
        targets: {
          first: { file: "dist/first.slua", object: "name:Missing", item: "Main" },
          second: { file: "dist/second.slua", object: "name:Second", item: "Main" },
        },
      }),
      "utf8",
    )

    const saved: string[] = []

    const client = {
      objectList: async () => ({ objects: [published] }),
      objectContentSave: async (params: { content: string }) => {
        saved.push(params.content)

        return { success: true, compiled: true }
      },
    } as unknown as ViewerClient

    const reporter = collectingReporter()
    const cwd = process.cwd()

    process.chdir(dir)

    let code: number

    try {
      code = await pushCommand(client, { name: "push", all: true }, reporter)
    } finally {
      process.chdir(cwd)

      await rm(dir, { recursive: true, force: true })
    }

    expect(code).toBe(1)
    expect(saved).toEqual(["-- second\n"])
    expect((reporter.payload as { targets: { target: string; ok: boolean }[] }).targets).toEqual([
      expect.objectContaining({ target: "first", ok: false }),
      expect.objectContaining({ target: "second", ok: true }),
    ])
  })
})

describe("pushCommand with --wait", () => {
  it("does not sit on the publish wait while retrying a stale save", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slua-push-"))

    await mkdir(join(dir, "dist"))
    await writeFile(join(dir, "dist", "second.slua"), "-- second\n", "utf8")
    await writeFile(
      join(dir, "slua.json"),
      JSON.stringify({
        targets: { second: { file: "dist/second.slua", object: "name:Second", item: "Main" } },
      }),
      "utf8",
    )

    // The listing goes briefly empty after the rejected save, which a retry
    // that kept --wait would sit out rather than read again.
    const listings = [[published], [], [published]]
    const notes: string[] = []

    let lists = 0
    let saves = 0

    const client = {
      objectList: async () => ({ objects: listings[Math.min(lists++, listings.length - 1)] }),
      objectContentSave: async () => {
        if (saves++ === 0) {
          throw new RpcError({
            code: -32602,
            message: "Invalid params: Item not found in prim inventory",
          })
        }

        return { success: true, compiled: true }
      },
    } as unknown as ViewerClient

    const reporter = collectingReporter()
    const cwd = process.cwd()

    process.chdir(dir)

    let code: number

    try {
      code = await pushCommand(client, { name: "push", all: true }, reporter, {
        waitMs: 1_000,
        onWait: (message) => notes.push(message),
      })
    } finally {
      process.chdir(cwd)

      await rm(dir, { recursive: true, force: true })
    }

    expect(code).toBe(0)
    expect(saves).toBe(2)
    expect(notes).toEqual([])
  })
})

describe("pushCommand on a failed compile", () => {
  it("reports the diagnostics the viewer parsed for us", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slua-push-"))

    await mkdir(join(dir, "dist"))
    await writeFile(join(dir, "dist", "second.slua"), "local x = 1\nfoo()\n", "utf8")
    await writeFile(
      join(dir, "slua.json"),
      JSON.stringify({
        targets: { second: { file: "dist/second.slua", object: "name:Second", item: "Main" } },
      }),
      "utf8",
    )

    const client = {
      objectList: async () => ({ objects: [published] }),
      objectContentSave: async () => ({
        success: true,
        compiled: false,
        diagnostics: [{ row: 2, column: 0, level: "ERROR", message: "Unknown global 'foo'" }],
      }),
    } as unknown as ViewerClient

    const reporter = collectingReporter()
    const cwd = process.cwd()

    process.chdir(dir)

    let code: number

    try {
      code = await pushCommand(client, { name: "push", target: "second" }, reporter)
    } finally {
      process.chdir(cwd)

      await rm(dir, { recursive: true, force: true })
    }

    expect(code).toBe(1)
    expect(reporter.errors).toEqual([expect.stringContaining("second.slua:2: Unknown global")])
    expect((reporter.payload as { errors: { row: number }[] }).errors).toEqual([
      expect.objectContaining({ row: 2, message: "Unknown global 'foo'" }),
    ])
  })
})

/** What a chatty client's script says while the save is in flight. */
interface Say {
  (message: string, objectId?: string): void
  /** The same, as the `runtime.error` a script that threw produces. */
  fail(error: string, line?: number, stack?: string[]): void
}

/** A client that talks back while the save is still in flight, as the viewer does. */
function chattyClient(say: (emit: Say) => void) {
  const listeners: Record<string, ((params: Record<string, unknown>) => void)[]> = {
    "runtime.debug": [],
    "runtime.error": [],
  }

  const base = (objectId: string) => ({
    scriptId: "",
    objectId,
    objectName: "Second",
    item: { rootId: objectId, name: "Main" },
  })

  const emit = ((message: string, objectId = published.objectId) => {
    for (const listener of listeners["runtime.debug"]!) {
      listener({ ...base(objectId), message })
    }
  }) as Say

  emit.fail = (error, line = 0, stack = []) => {
    for (const listener of listeners["runtime.error"]!) {
      listener({
        ...base(published.objectId),
        message: `${published.objectName}/Main: ${error}`,
        error,
        line,
        stack,
      })
    }
  }

  return {
    objectList: async () => ({ objects: [published] }),
    objectContentSave: async () => {
      // The script restarts as the save lands, so its startup output is on the
      // wire before this call returns.
      say(emit)

      return { success: true, compiled: true }
    },
    on: (event: string, handler: (params: Record<string, unknown>) => void) => {
      listeners[event]?.push(handler)

      return () => {}
    },
    connection: { onClose: () => () => {} },
  } as unknown as ViewerClient
}

/** A one-target project, since a drain needs a resolved target to scope to. */
async function project(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "slua-push-"))

  await mkdir(join(dir, "dist"))
  await writeFile(join(dir, "dist", "second.slua"), "-- second\n", "utf8")
  await writeFile(
    join(dir, "slua.json"),
    JSON.stringify({
      targets: { second: { file: "dist/second.slua", object: "name:Second", item: "Main" } },
    }),
    "utf8",
  )

  return dir
}

async function drained(say: (emit: Say) => void, tail: number): Promise<Record<string, unknown>> {
  const dir = await project()
  const reporter = collectingReporter()
  const cwd = process.cwd()

  process.chdir(dir)

  try {
    await pushCommand(
      chattyClient(say),
      { name: "push", target: "second", all: false, tail },
      reporter,
    )
  } finally {
    process.chdir(cwd)

    await rm(dir, { recursive: true, force: true })
  }

  return reporter.payload as Record<string, unknown>
}

describe("pushCommand with a drain window", () => {
  it("keeps the output the save itself produced", async () => {
    const payload = await drained((emit) => emit("hello from state_entry"), 50)

    // Collected into the one document --json promises, not printed alongside it.
    expect(payload.logs).toEqual([expect.objectContaining({ message: "hello from state_entry" })])
    expect(payload.cursor).toEqual(expect.any(Number))
  })

  it("ignores output from an object the push never touched", async () => {
    const payload = await drained((emit) => emit("not ours", "somebody-else"), 50)

    expect(payload.logs).toEqual([])
  })

  it("keeps a runtime error, with the line and traceback it named", async () => {
    const payload = await drained(
      (emit) => emit.fail("attempt to call a nil value", 12, ["Main:12", "Main:3"]),
      50,
    )

    expect(payload.logs).toEqual([
      expect.objectContaining({
        level: "error",
        error: "attempt to call a nil value",
        line: 12,
        stack: ["Main:12", "Main:3"],
      }),
    ])
  })

  it("skips the window entirely with --no-tail", async () => {
    const payload = await drained((emit) => emit("ignored"), 0)

    expect(payload).not.toHaveProperty("logs")
  })
})
