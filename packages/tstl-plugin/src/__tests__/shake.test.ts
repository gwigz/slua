import { describe, it, expect } from "bun:test"
import { resolve } from "node:path"
import { readFileSync } from "node:fs"
import { shakeModules } from "../shake"
import { stripDeadExports } from "../shake-strip"

const FIXTURES = resolve(import.meta.dir, "fixtures")

describe("stripDeadExports", () => {
  it("removes unexported functions that are not reachable", () => {
    const source = `
export function keep(a: number) { return a }
export function remove(b: number) { return b }
function internal() { return keep(1) }
`
    const result = stripDeadExports(source, new Set(["keep"]))
    expect(result).toContain("keep")
    // internal references keep, but keep does NOT reference internal,
    // so internal is unreachable from surviving exports and gets stripped
    expect(result).not.toContain("internal")
    expect(result).not.toContain("remove")
  })

  it("keeps internal functions referenced by surviving exports", () => {
    const source = `
function helper() { return 1 }
function unusedHelper() { return 2 }
export function used() { return helper() }
export function unused() { return unusedHelper() }
`
    const result = stripDeadExports(source, new Set(["used"]))
    expect(result).toContain("helper")
    expect(result).toContain("used")
    expect(result).not.toContain("unusedHelper")
    expect(result).not.toContain("function unused")
  })

  it("preserves import statements when their bindings are referenced by survivors", () => {
    const source = `
import { something } from "./other"
export function keep() { return something() }
export function remove() { return 1 }
`
    const result = stripDeadExports(source, new Set(["keep"]))
    expect(result).toContain("import")
    expect(result).toContain("keep")
    expect(result).not.toContain("function remove")
  })

  it("drops imports whose bindings are no longer referenced after stripping", () => {
    const source = `
import { used } from "./live"
import { dead } from "./gone"
import type { DeadType } from "./gone-type"
export function keep() { return used() }
export function remove(): DeadType { return dead() as DeadType }
`
    const result = stripDeadExports(source, new Set(["keep"]))
    expect(result).toContain('from "./live"')
    expect(result).not.toContain('from "./gone"')
    expect(result).not.toContain('from "./gone-type"')
    expect(result).not.toContain("function remove")
  })

  it("preserves side-effect-only imports", () => {
    const source = `
import "./side-effect"
export function keep() { return 1 }
`
    const result = stripDeadExports(source, new Set(["keep"]))
    expect(result).toContain('import "./side-effect"')
  })

  it("narrows multi-name re-exports to surviving names", () => {
    const source = `
export { alive, dead } from "./target"
export { aliveToo } from "./other"
`
    const result = stripDeadExports(source, new Set(["alive", "aliveToo"]))
    expect(result).toContain("alive")
    expect(result).toContain("aliveToo")
    expect(result).not.toContain("dead")
  })

  it("drops a re-export entirely when none of its names survive", () => {
    const source = `
export { a, b } from "./gone"
export { c } from "./live"
`
    const result = stripDeadExports(source, new Set(["c"]))
    expect(result).not.toContain('"./gone"')
    expect(result).toContain('"./live"')
  })

  it("preserves type-only specifiers when narrowing a mixed clause", () => {
    // Rollup feeds shake type-stripped sources, so type names never appear in
    // the reachability set — they must be preserved unconditionally.
    const source = `
export { alive, dead, type Alive, type Dead } from "./target"
`
    const result = stripDeadExports(source, new Set(["alive"]))
    expect(result).toContain("alive")
    expect(result).toContain("Alive")
    expect(result).toContain("Dead")
    expect(result).not.toMatch(/\bdead\b(?! from)/)
  })

  it("preserves type-only export declarations entirely", () => {
    const source = `
export type { A, B } from "./types"
export { keep } from "./live"
`
    const result = stripDeadExports(source, new Set(["keep"]))
    expect(result).toContain("type")
    expect(result).toContain("A")
    expect(result).toContain("B")
  })
})

describe("shakeModules", () => {
  it("detects surviving exports when only add is imported", async () => {
    const result = await shakeModules({
      entry: [resolve(FIXTURES, "shake-entry-add.ts")],
      tsconfig: resolve(FIXTURES, "tsconfig.shake.json"),
    })

    const mathFile = [...result.survivingExports.keys()].find((f) => f.includes("modules/math"))
    expect(mathFile).toBeDefined()

    const surviving = result.survivingExports.get(mathFile!)!
    expect(surviving.has("add")).toBe(true)
    expect(surviving.has("multiply")).toBe(false)
    expect(surviving.has("subtract")).toBe(false)
  })

  it("detects surviving exports when multiply is imported", async () => {
    const result = await shakeModules({
      entry: [resolve(FIXTURES, "shake-entry-multiply.ts")],
      tsconfig: resolve(FIXTURES, "tsconfig.shake.json"),
    })

    const mathFile = [...result.survivingExports.keys()].find((f) => f.includes("modules/math"))
    expect(mathFile).toBeDefined()

    const surviving = result.survivingExports.get(mathFile!)!
    expect(surviving.has("multiply")).toBe(true)
    expect(surviving.has("add")).toBe(false)
    expect(surviving.has("subtract")).toBe(false)
  })

  it("keeps all exports when all are imported", async () => {
    const result = await shakeModules({
      entry: [resolve(FIXTURES, "shake-entry-all.ts")],
      tsconfig: resolve(FIXTURES, "tsconfig.shake.json"),
    })

    const mathFile = [...result.survivingExports.keys()].find((f) => f.includes("modules/math"))
    expect(mathFile).toBeDefined()

    const surviving = result.survivingExports.get(mathFile!)!
    expect(surviving.has("add")).toBe(true)
    expect(surviving.has("multiply")).toBe(true)
    expect(surviving.has("subtract")).toBe(true)
  })
})

describe("shakeModules exact-match paths", () => {
  it("resolves a non-wildcard path entry through the rollup resolver", async () => {
    const result = await shakeModules({
      entry: [resolve(FIXTURES, "shake-entry-exact.ts")],
      tsconfig: resolve(FIXTURES, "tsconfig.shake-exact.json"),
    })

    const helpersFile = [...result.survivingExports.keys()].find((f) =>
      f.includes("internal/helpers"),
    )
    expect(helpersFile).toBeDefined()

    const surviving = result.survivingExports.get(helpersFile!)!
    expect(surviving.has("double")).toBe(true)
    expect(surviving.has("triple")).toBe(false)
  })
})

describe("end-to-end: shakeModules + stripDeadExports", () => {
  it("strips unused functions from module source", async () => {
    const result = await shakeModules({
      entry: [resolve(FIXTURES, "shake-entry-add.ts")],
      tsconfig: resolve(FIXTURES, "tsconfig.shake.json"),
    })

    // Get the math module file and its surviving exports
    const mathFile = [...result.survivingExports.keys()].find((f) => f.includes("modules/math"))!
    const surviving = result.survivingExports.get(mathFile)!

    // Read original source and strip dead exports
    const originalSource = readFileSync(mathFile, "utf-8")
    const stripped = stripDeadExports(originalSource, surviving)

    // add should survive
    expect(stripped).toContain("function add")
    // multiply and subtract should be removed
    expect(stripped).not.toContain("function multiply")
    expect(stripped).not.toContain("function subtract")
    // The import of double (used only by multiply) should still be there
    // (imports are always preserved, harmless for TSTL)
  })
})
