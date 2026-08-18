import { describe, expect, it } from "bun:test"
import { mkdtemp, mkdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { parseObjectRef } from "../../addressing"
import type { ViewerClient } from "../../client"
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
  const lslItem: ObjectInventoryItem = { itemId: "x", name: "Door", type: "script", subtype: 0 }

  it("compiles a .lsl file as mono, the default LSL vm", () => {
    expect(resolveVm(undefined, "src/door.lsl", lslItem)).toBe("mono")
  })

  it("still honours an explicit lsl2 request", () => {
    expect(resolveVm("lsl2", "src/door.lsl", lslItem)).toBe("lsl2")
  })

  it("lets LSL-on-Luau be requested for an .lsl file", () => {
    // The viewer maps "luau" on a non-native script to its lsl-luau path.
    expect(resolveVm("luau", "src/door.lsl", lslItem)).toBe("luau")
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
    // The first target names an object that is not published, so it throws;
    // the second must still be pushed and the --json document must list both.
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
    }

    expect(code).toBe(1)
    expect(saved).toEqual(["-- second\n"])
    expect((reporter.payload as { targets: { target: string; ok: boolean }[] }).targets).toEqual([
      expect.objectContaining({ target: "first", ok: false }),
      expect.objectContaining({ target: "second", ok: true }),
    ])
  })
})
