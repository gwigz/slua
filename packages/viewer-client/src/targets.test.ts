import { describe, expect, it } from "bun:test"
import { mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  leadingComment,
  loadConfig,
  parseConfig,
  parseHeaderTags,
  readHeaderTagsFor,
  resolveTarget,
} from "./targets"

describe("leadingComment", () => {
  it("stops at the first line of code", () => {
    const header = leadingComment(
      `/**\n * @slua-item Main\n */\nll.OwnerSay("hi")\n// @slua-item No`,
    )

    expect(header).toContain("@slua-item Main")
    expect(header).not.toContain("@slua-item No")
  })

  it("reads line comments too", () => {
    expect(leadingComment("// @slua-item Main\nprint(1)")).toBe("// @slua-item Main")
  })

  it("reads Lua line comments, for hand-written scripts", () => {
    expect(leadingComment("-- @slua-item Main\nprint(1)")).toBe("-- @slua-item Main")
  })

  it("reads Lua block comments", () => {
    const header = leadingComment("--[[\n  @slua-item Main\n]]\nprint(1)\n-- @slua-item No")

    expect(header).toContain("@slua-item Main")
    expect(header).not.toContain("@slua-item No")
  })

  it("does not mistake a one-line Lua block comment for an open block", () => {
    expect(leadingComment("--[[ Generated ]]\nprint(1)")).toBe("--[[ Generated ]]")
  })

  it("is empty when the file opens with code", () => {
    expect(leadingComment('ll.OwnerSay("hi")')).toBe("")
  })
})

describe("parseHeaderTags", () => {
  it("reads a full target", () => {
    const tags = parseHeaderTags(`/**
 * @slua-target desc:slua:my-project/Main
 * @slua-vm luau
 * @slua-save-back
 */
export {}`)

    expect(tags).toEqual({
      object: { kind: "description", value: "slua:my-project" },
      link: undefined,
      item: "Main",
      vm: "luau",
      saveBack: true,
    })
  })

  it("reads a linked prim target", () => {
    expect(parseHeaderTags("/** @slua-target Rezzer/Panel/Main */").link).toBe("Panel")
  })

  it("accepts the pieces separately", () => {
    const tags = parseHeaderTags(`/**
 * @slua-object desc:slua:proj
 * @slua-item Main
 * @slua-link Panel
 */`)

    expect(tags.object).toEqual({ kind: "description", value: "slua:proj" })
    expect(tags.item).toBe("Main")
    expect(tags.link).toBe("Panel")
  })

  it("returns nothing for a file with no tags", () => {
    expect(parseHeaderTags("/** just a comment */\nexport {}")).toEqual({})
  })

  it("ignores tags that appear after code", () => {
    expect(parseHeaderTags('ll.OwnerSay("hi")\n// @slua-item Main')).toEqual({})
  })

  it("rejects an unknown tag", () => {
    expect(() => parseHeaderTags("/** @slua-frobnicate x */")).toThrow(/unknown tag/)
  })

  it("skips an unknown tag when lenient, for vendored code we did not write", () => {
    expect(
      parseHeaderTags("/** @slua-frobnicate x\n * @slua-item Main */", "vendor.ts", {
        lenient: true,
      }),
    ).toEqual({ item: "Main" })
  })

  it("rejects an invalid vm", () => {
    expect(() => parseHeaderTags("/** @slua-vm wasm */")).toThrow(/vm must be one of/)
  })
})

describe("parseConfig", () => {
  it("reads targets with a string selector", () => {
    const config = parseConfig(
      JSON.stringify({
        targets: { main: { file: "dist/main.slua", object: "desc:slua:p", item: "Main" } },
      }),
      "/project",
      "slua.json",
    )

    expect(config.targets.main.object).toEqual({ kind: "description", value: "slua:p" })
    expect(config.targets.main.item).toBe("Main")
  })

  it("reads the structured selector form", () => {
    const config = parseConfig(
      JSON.stringify({ targets: { main: { object: { description: "slua:p" } } } }),
      "/project",
      "slua.json",
    )

    expect(config.targets.main.object).toEqual({ kind: "description", value: "slua:p" })
  })

  it("rejects an object with no way to find it", () => {
    expect(() =>
      parseConfig(JSON.stringify({ targets: { main: { object: {} } } }), "/p", "slua.json"),
    ).toThrow(/needs one of id, name or description/)
  })

  it("reports where malformed json came from", () => {
    expect(() => parseConfig("{ nope", "/p", "/p/slua.json")).toThrow(/\/p\/slua\.json/)
  })
})

describe("loadConfig", () => {
  it("walks up to find the nearest config", async () => {
    const root = await mkdtemp(join(tmpdir(), "slua-cfg-"))
    const nested = join(root, "a", "b")

    await mkdir(nested, { recursive: true })
    await writeFile(
      join(root, "slua.json"),
      JSON.stringify({ targets: { main: { item: "Main" } } }),
      "utf8",
    )

    const config = await loadConfig(nested)

    expect(config?.root).toBe(root)
    expect(config?.targets.main.item).toBe("Main")
  })

  it("returns undefined when there is no config", async () => {
    expect(await loadConfig(await mkdtemp(join(tmpdir(), "slua-cfg-")))).toBeUndefined()
  })
})

describe("resolveTarget", () => {
  const header = {
    object: { kind: "description", value: "slua:proj" } as const,
    item: "Main",
    vm: "luau" as const,
  }

  it("uses the header when nothing overrides it", () => {
    const target = resolveTarget({
      name: "main",
      header: { ...header, file: "dist/main.slua" },
      configRoot: "/project",
    })

    expect(target.file).toBe("/project/dist/main.slua")
    expect(target.ref.item).toBe("Main")
    expect(target.vm).toBe("luau")
  })

  it("lets config override the header, for per-environment retargeting", () => {
    const target = resolveTarget({
      name: "main",
      header: { ...header, file: "dist/main.slua" },
      config: { object: { kind: "id", value: "4f2b" } },
      configRoot: "/project",
    })

    expect(target.ref.object).toEqual({ kind: "id", value: "4f2b" })
    // Untouched fields still come from the header.
    expect(target.ref.item).toBe("Main")
  })

  it("lets the command line override config", () => {
    const target = resolveTarget({
      name: "main",
      header: { ...header, file: "dist/main.slua" },
      config: { item: "FromConfig" },
      cli: { item: "FromCli" },
      configRoot: "/project",
    })

    expect(target.ref.item).toBe("FromCli")
  })

  it("keeps an absolute file as given", () => {
    const target = resolveTarget({
      name: "main",
      header: { ...header, file: "/elsewhere/main.slua" },
      configRoot: "/project",
    })

    expect(target.file).toBe("/elsewhere/main.slua")
  })

  it("explains what is missing", () => {
    expect(() => resolveTarget({ name: "main", header })).toThrow(/no file to push/)
    expect(() => resolveTarget({ name: "main", header: { file: "a.slua", item: "M" } })).toThrow(
      /no object/,
    )
    expect(() =>
      resolveTarget({ name: "main", header: { file: "a.slua", object: header.object } }),
    ).toThrow(/no item/)
  })
})

describe("readHeaderTagsFor", () => {
  it("finds the header through the source map", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slua-hdr-"))

    await mkdir(join(dir, "src"), { recursive: true })
    await mkdir(join(dir, "dist"), { recursive: true })
    await writeFile(join(dir, "src", "helper.ts"), "export const a = 1\n", "utf8")
    await writeFile(
      join(dir, "src", "main.ts"),
      "/**\n * @slua-target desc:slua:proj/Main\n */\nexport {}\n",
      "utf8",
    )
    await writeFile(join(dir, "dist", "main.slua"), "print(1)\n", "utf8")
    await writeFile(
      join(dir, "dist", "main.slua.map"),
      JSON.stringify({
        version: 3,
        sources: ["../src/helper.ts", "../src/main.ts"],
        mappings: "AAAA",
      }),
      "utf8",
    )

    const tags = await readHeaderTagsFor(join(dir, "dist", "main.slua"))

    expect(tags?.item).toBe("Main")
    expect(tags?.object).toEqual({ kind: "description", value: "slua:proj" })
  })

  it("returns undefined when there is no map and no header", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slua-hdr-"))

    expect(await readHeaderTagsFor(join(dir, "missing.slua"))).toBeUndefined()
  })

  it("treats a hand-written script as its own source", async () => {
    // An .lsl file has no source map; the header is right there in the file.
    const dir = await mkdtemp(join(tmpdir(), "slua-hdr-"))
    const file = join(dir, "door.lsl")

    await writeFile(file, "// @slua-target Rezzer/Door\n\ndefault\n{\n}\n", "utf8")

    const tags = await readHeaderTagsFor(file)

    expect(tags?.item).toBe("Door")
    expect(tags?.object).toEqual({ kind: "name", value: "Rezzer" })
  })

  it("prefers the mapped entry over the built file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slua-hdr-"))

    await mkdir(join(dir, "src"), { recursive: true })
    await writeFile(join(dir, "src", "main.ts"), "// @slua-item FromSource\nexport {}\n", "utf8")
    await writeFile(join(dir, "main.slua"), "--[[ @slua-item FromBundle ]]\n", "utf8")
    await writeFile(
      join(dir, "main.slua.map"),
      JSON.stringify({ version: 3, sources: ["src/main.ts"], mappings: "AAAA" }),
      "utf8",
    )

    expect((await readHeaderTagsFor(join(dir, "main.slua")))?.item).toBe("FromSource")
  })
})
