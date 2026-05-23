import { describe, it, expect } from "bun:test"
import { execSync } from "node:child_process"
import { writeFileSync, unlinkSync } from "node:fs"
import { resolve } from "node:path"

const CONFIG = resolve(import.meta.dir, ".oxlintrc.json")
const TMP = resolve(import.meta.dir, "__test_fixture.ts")
const TA_TMP = resolve(import.meta.dir, "__test_fixture_ta.ts")
const TA_TSCONFIG = resolve(import.meta.dir, "__test_tsconfig.json")

interface Diagnostic {
  message: string
  code: string
  severity: string
}

function lint(code: string): Diagnostic[] {
  writeFileSync(TMP, code)

  try {
    const out = execSync(`npx oxlint --config ${CONFIG} --format json ${TMP}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    })

    return JSON.parse(out).diagnostics
  } catch (err: unknown) {
    // oxlint exits non-zero when it finds errors
    const stdout = (err as { stdout?: string }).stdout ?? ""
    return JSON.parse(stdout).diagnostics
  } finally {
    try {
      unlinkSync(TMP)
    } catch {}
  }
}

// strict-boolean-expressions is type-aware, so it needs `--type-aware`
// (and the `oxlint-tsgolint` binary) plus a tsconfig covering the fixture.
// cwd must be the package dir so oxlint resolves the locally-linked
// `oxlint-tsgolint` (bun nests it rather than hoisting it to the root).
function lintTypeAware(code: string): Diagnostic[] {
  writeFileSync(TA_TMP, code)
  writeFileSync(
    TA_TSCONFIG,
    JSON.stringify({
      compilerOptions: {
        strict: true,
        target: "ESNext",
        moduleResolution: "bundler",
        skipLibCheck: true,
      },
      include: ["__test_fixture_ta.ts"],
    }),
  )

  try {
    const out = execSync(
      `npx oxlint --type-aware --config ${CONFIG} --tsconfig ${TA_TSCONFIG} --format json ${TA_TMP}`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], cwd: import.meta.dir },
    )

    return JSON.parse(out).diagnostics
  } catch (err: unknown) {
    const stdout = (err as { stdout?: string }).stdout ?? ""
    return JSON.parse(stdout).diagnostics
  } finally {
    for (const f of [TA_TMP, TA_TSCONFIG]) {
      try {
        unlinkSync(f)
      } catch {}
    }
  }
}

function errors(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.filter((d) => d.severity === "error")
}

function hasRule(diagnostics: Diagnostic[], rule: string): boolean {
  return diagnostics.some((d) => d.code === rule)
}

function hasMessage(diagnostics: Diagnostic[], substring: string): boolean {
  return diagnostics.some((d) => d.message.includes(substring))
}

// -- no-restricted-globals --

describe("no-restricted-globals", () => {
  const globals = [
    ["Map", "new Map()"],
    ["Set", "new Set()"],
    ["WeakMap", "new WeakMap()"],
    ["WeakSet", "new WeakSet()"],
    ["Promise", "new Promise(() => {})"],
    ["fetch", 'fetch("url")'],
    ["document", "document.body"],
    ["window", "window.location"],
    ["XMLHttpRequest", "new XMLHttpRequest()"],
    ["setTimeout", "setTimeout(() => {}, 0)"],
    ["setInterval", "setInterval(() => {}, 0)"],
    ["clearTimeout", "clearTimeout(0)"],
    ["clearInterval", "clearInterval(0)"],
    ["require", 'require("x")'],
    ["process", "process.exit()"],
    ["Buffer", "Buffer.from([])"],
    ["__dirname", "console.log(__dirname)"],
    ["__filename", "console.log(__filename)"],
  ] as const

  for (const [name, code] of globals) {
    it(`flags ${name}`, () => {
      const diags = errors(lint(code))
      expect(hasRule(diags, "eslint(no-restricted-globals)")).toBe(true)
      expect(hasMessage(diags, name)).toBe(true)
    })
  }
})

// -- oxc/no-async-await --

describe("no-async-await", () => {
  it("flags async function", () => {
    const diags = errors(lint("async function f() {}"))
    expect(hasRule(diags, "oxc(no-async-await)")).toBe(true)
  })

  it("flags async arrow", () => {
    const diags = errors(lint("const f = async () => {}"))
    expect(hasRule(diags, "oxc(no-async-await)")).toBe(true)
  })
})

// -- eslint-js/no-restricted-syntax --

describe("no-restricted-syntax", () => {
  it("flags delete", () => {
    const diags = errors(lint("const o: any = {}; delete o.x"))
    expect(hasRule(diags, "eslint-js(no-restricted-syntax)")).toBe(true)
    expect(hasMessage(diags, "delete")).toBe(true)
  })

  it("flags .splice()", () => {
    const diags = errors(lint("const a = [1]; a.splice(0, 1)"))
    expect(hasRule(diags, "eslint-js(no-restricted-syntax)")).toBe(true)
    expect(hasMessage(diags, "splice")).toBe(true)
  })

  it("flags Object.entries()", () => {
    const diags = errors(lint("Object.entries({})"))
    expect(hasRule(diags, "eslint-js(no-restricted-syntax)")).toBe(true)
    expect(hasMessage(diags, "Object.keys()")).toBe(true)
  })

  it("flags .length = 0", () => {
    const diags = errors(lint("const a = [1]; a.length = 0"))
    expect(hasRule(diags, "eslint-js(no-restricted-syntax)")).toBe(true)
    expect(hasMessage(diags, "Reassign")).toBe(true)
  })

  it("flags function*", () => {
    const diags = errors(lint("function* g() { yield 1 }"))
    expect(hasRule(diags, "eslint-js(no-restricted-syntax)")).toBe(true)
    expect(hasMessage(diags, "Generators")).toBe(true)
  })

  it("flags yield", () => {
    const diags = errors(lint("function* g() { yield 1 }"))
    expect(hasMessage(diags, "@gwigz/slua-modules/yield")).toBe(true)
  })

  it("flags new Promise()", () => {
    const diags = errors(lint("new Promise(() => {})"))
    expect(hasRule(diags, "eslint-js(no-restricted-syntax)")).toBe(true)
    expect(hasMessage(diags, "@gwigz/slua-modules/yield")).toBe(true)
  })
})

// -- typescript/strict-boolean-expressions (type-aware) --
// 0 and "" are falsy in JS but truthy in Lua, so bare numbers/strings in a
// condition transpile to a different meaning. Force explicit comparisons.

describe("strict-boolean-expressions", () => {
  const RULE = "typescript-eslint(strict-boolean-expressions)"

  it("flags a bare number in a conditional", () => {
    const diags = errors(lintTypeAware("const n: number = 1; if (n) {}"))
    expect(hasRule(diags, RULE)).toBe(true)
  })

  it("flags a bare string in a conditional", () => {
    const diags = errors(lintTypeAware('const s: string = ""; if (s) {}'))
    expect(hasRule(diags, RULE)).toBe(true)
  })

  it("does not flag explicit comparisons", () => {
    const diags = errors(
      lintTypeAware(`
function scan(text: string) {
  return text.includes("ERROR") && text.indexOf("name=") !== -1
}
if (scan("x")) {
}
`),
    )
    expect(hasRule(diags, RULE)).toBe(false)
  })
})

// -- clean code should pass --

describe("clean code", () => {
  it("does not flag valid SLua patterns", () => {
    const diags = errors(
      lint(`
const obj: Record<string, number> = { a: 1 }
obj.a = undefined!
const _filtered = [1, 2, 3].filter((x) => x > 1)
for (const key of Object.keys(obj)) {
  const _v = obj[key]
}
`),
    )
    expect(diags).toHaveLength(0)
  })
})
