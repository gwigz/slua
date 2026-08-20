import { describe, expect, it } from "bun:test"
import { mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { loadSourceMapFor, resolveExistingSource, SourceMap } from "./sourcemap"

// Generated line 1 -> source line 1, generated line 2 -> source line 3,
// generated line 3 -> nothing (a blank line the formatter inserted).
const MAPPINGS = "AAAA;AAEA;"

const MAP = JSON.stringify({
  version: 3,
  file: "main.slua",
  sources: ["../src/main.ts"],
  mappings: MAPPINGS,
})

describe("SourceMap", () => {
  it("maps generated lines back to original lines", () => {
    const map = SourceMap.parse(MAP, "/project/dist")!

    expect(map.mapRow(1)).toEqual({ source: "/project/src/main.ts", line: 1 })
    expect(map.mapRow(2)).toEqual({ source: "/project/src/main.ts", line: 3 })
  })

  it("returns undefined for a generated line with no mapping", () => {
    const map = SourceMap.parse(MAP, "/project/dist")!

    expect(map.mapRow(3)).toBeUndefined()
    expect(map.mapRow(99)).toBeUndefined()
  })

  it("ignores a row of zero, which means the error had no line", () => {
    expect(SourceMap.parse(MAP, "/project/dist")!.mapRow(0)).toBeUndefined()
  })

  it("honours sourceRoot when resolving sources", () => {
    const map = SourceMap.parse(
      JSON.stringify({ version: 3, sources: ["main.ts"], sourceRoot: "../src", mappings: "AAAA;" }),
      "/project/dist",
    )!

    expect(map.mapRow(1)?.source).toBe("/project/src/main.ts")
  })

  it("returns undefined for input that is not a source map", () => {
    expect(SourceMap.parse("{ not json", "/tmp")).toBeUndefined()
    expect(SourceMap.parse(JSON.stringify({ version: 3 }), "/tmp")).toBeUndefined()
  })
})

describe("loadSourceMapFor", () => {
  it("reads the map TSTL writes beside the output", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slua-map-"))

    await writeFile(join(dir, "main.slua.map"), MAP, "utf8")

    const map = await loadSourceMapFor(join(dir, "main.slua"))

    expect(map?.mapRow(2)?.line).toBe(3)
  })

  it("degrades to undefined when there is no map", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slua-map-"))

    expect(await loadSourceMapFor(join(dir, "missing.slua"))).toBeUndefined()
  })
})

describe("resolveExistingSource", () => {
  it("uses the path as written when it exists", async () => {
    const dir = await mkdtemp(join(tmpdir(), "slua-src-"))

    await mkdir(join(dir, "src"), { recursive: true })
    await writeFile(join(dir, "src", "main.ts"), "", "utf8")

    expect(resolveExistingSource("../src/main.ts", join(dir, "dist"))).toBe(
      join(dir, "src", "main.ts"),
    )
  })

  it("recovers a bundled build's extra leading ..", async () => {
    // TSTL writes sources relative to where the entry file would have been
    // emitted, not where the bundle actually lands.
    const dir = await mkdtemp(join(tmpdir(), "slua-src-"))

    await mkdir(join(dir, "src"), { recursive: true })
    await writeFile(join(dir, "src", "main.ts"), "", "utf8")

    expect(resolveExistingSource("../../src/main.ts", join(dir, "dist"))).toBe(
      join(dir, "src", "main.ts"),
    )
  })

  it("falls back to the literal resolution when nothing exists", () => {
    expect(resolveExistingSource("../../src/gone.ts", "/nowhere/dist")).toBe("/src/gone.ts")
  })
})
