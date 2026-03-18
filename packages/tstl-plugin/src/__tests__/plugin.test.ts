import { describe, it, expect } from "bun:test"
import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import plugin from "../index"

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
