import { describe, it, expect } from "bun:test"
import { readFileSync } from "fs"
import { resolve } from "path"
import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import plugin from "../index"

const TYPES_PATH = resolve(import.meta.dir, "../../../../packages/types/index.d.ts")
const LANG_EXT_PATH = resolve(import.meta.dir, "../../../../node_modules/@typescript-to-lua/language-extensions/index.d.ts")

const sluaTypes = readFileSync(TYPES_PATH, "utf-8")
const langExt = readFileSync(LANG_EXT_PATH, "utf-8")

function transpile(code: string): string {
  const result = tstl.transpileVirtualProject(
    {
      "main.ts": code,
      "language-extensions.d.ts": langExt,
      "slua.d.ts": sluaTypes,
    },
    {
      luaTarget: tstl.LuaTarget.Luau,
      noImplicitSelf: true,
      noHeader: true,
      luaLibImport: tstl.LuaLibImportKind.Inline,
      noImplicitGlobalVariables: true,
      noLib: true,
      strict: true,
      luaPlugins: [{ plugin: plugin as tstl.Plugin }],
    },
  )
  return result.transpiledFiles.find((f) => f.outPath === "main.lua")?.lua ?? ""
}

describe("ts-slua plugin", () => {
  it("beforeTransform errors on non-Luau target", () => {
    const diagnostics = plugin.beforeTransform!(
      {} as ts.Program,
      { luaTarget: tstl.LuaTarget.Lua53 } as tstl.CompilerOptions,
      {} as tstl.EmitHost,
    )

    expect(diagnostics).toHaveLength(1)
    expect((diagnostics as ts.Diagnostic[])[0].messageText).toContain("Luau")
  })

  it("beforeTransform passes with correct config", () => {
    const diagnostics = plugin.beforeTransform!(
      {} as ts.Program,
      {
        luaTarget: tstl.LuaTarget.Luau,
        luaLibImport: tstl.LuaLibImportKind.None,
      } as tstl.CompilerOptions,
      {} as tstl.EmitHost,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it("beforeTransform warns on non-none luaLibImport", () => {
    const diagnostics = plugin.beforeTransform!(
      {} as ts.Program,
      {
        luaTarget: tstl.LuaTarget.Luau,
        luaLibImport: tstl.LuaLibImportKind.Require,
      } as tstl.CompilerOptions,
      {} as tstl.EmitHost,
    )

    expect(diagnostics).toHaveLength(1)
    expect((diagnostics as ts.Diagnostic[])[0].category).toBe(ts.DiagnosticCategory.Warning)
  })
})

describe("transpilation output", () => {
  it("does not inject self into LLEvents callbacks", () => {
    const lua = transpile(`
      LLEvents.on("touch_start", function(events) {
        ll.Say(0, "touched")
      })
    `)

    expect(lua).toContain("LLEvents.on")
    expect(lua).not.toContain("LLEvents:on")
    expect(lua).not.toMatch(/function\(self/)
  })

  it("does not inject self into LLTimers callbacks", () => {
    const lua = transpile(`
      LLTimers.every(10, function(scheduled, interval) {
        ll.Say(0, "tick")
      })
    `)

    expect(lua).toContain("LLTimers.every")
    expect(lua).not.toContain("LLTimers:every")
    expect(lua).not.toMatch(/function\(self/)
  })
})
