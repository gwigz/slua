import { describe, it, expect } from "bun:test"
import { readFileSync } from "fs"
import { resolve } from "path"
import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import plugin from "../index"
import { transpile as transpileSimple } from "./helpers"

const TYPES_PATH = resolve(import.meta.dir, "../../../../packages/types/index.d.ts")
const LANG_EXT_PATH = resolve(
  import.meta.dir,
  "../../../../node_modules/@typescript-to-lua/language-extensions/index.d.ts",
)

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

describe("floor division", () => {
  it("translates Math.floor(a / b) to floor division operator", () => {
    const lua = transpileSimple("declare const a: number, b: number;\nconst x = Math.floor(a / b)")

    expect(lua).toContain("a // b")
    expect(lua).not.toContain("math.floor")
  })

  it("handles literal operands", () => {
    const lua = transpileSimple("const x = Math.floor(10 / 3)")

    expect(lua).toContain("10 // 3")
  })

  it("does not transform Math.floor with non-division argument", () => {
    const lua = transpileSimple("declare const a: number;\nconst x = Math.floor(a)")

    expect(lua).not.toContain("//")
    expect(lua).toContain("math.floor(a)")
  })

  it("does not transform Math.floor with complex non-division expression", () => {
    const lua = transpileSimple("declare const a: number, b: number;\nconst x = Math.floor(a + b)")

    expect(lua).not.toContain("//")
    expect(lua).toContain("math.floor")
  })
})

describe("bitwise operators", () => {
  it("translates & to bit32.band", () => {
    const lua = transpileSimple("const x = (1 as number) & (2 as number)")

    expect(lua).toContain("bit32.band(1, 2)")
  })

  it("translates | to bit32.bor", () => {
    const lua = transpileSimple("const x = (1 as number) | (2 as number)")

    expect(lua).toContain("bit32.bor(1, 2)")
  })

  it("translates ^ to bit32.bxor", () => {
    const lua = transpileSimple("const x = (1 as number) ^ (2 as number)")

    expect(lua).toContain("bit32.bxor(1, 2)")
  })

  it("translates << to bit32.lshift", () => {
    const lua = transpileSimple("const x = (1 as number) << (2 as number)")

    expect(lua).toContain("bit32.lshift(1, 2)")
  })

  it("translates >> to bit32.arshift", () => {
    const lua = transpileSimple("const x = (1 as number) >> (2 as number)")

    expect(lua).toContain("bit32.arshift(1, 2)")
  })

  it("translates >>> to bit32.rshift", () => {
    const lua = transpileSimple("const x = (1 as number) >>> (2 as number)")

    expect(lua).toContain("bit32.rshift(1, 2)")
  })

  it("translates ~ to bit32.bnot", () => {
    const lua = transpileSimple("const x = ~(1 as number)")

    expect(lua).toContain("bit32.bnot(1)")
  })

  describe("btest optimization", () => {
    it("translates (a & b) !== 0 to bit32.btest", () => {
      const lua = transpileSimple("declare const a: number, b: number;\nconst x = (a & b) !== 0")

      expect(lua).toContain("bit32.btest(a, b)")
      expect(lua).not.toContain("bit32.band")
    })

    it("translates (a & b) != 0 to bit32.btest", () => {
      const lua = transpileSimple("declare const a: number, b: number;\nconst x = (a & b) != 0")

      expect(lua).toContain("bit32.btest(a, b)")
    })

    it("translates (a & b) === 0 to not bit32.btest", () => {
      const lua = transpileSimple("declare const a: number, b: number;\nconst x = (a & b) === 0")

      expect(lua).toContain("not bit32.btest(a, b)")
    })

    it("translates (a & b) == 0 to not bit32.btest", () => {
      const lua = transpileSimple("declare const a: number, b: number;\nconst x = (a & b) == 0")

      expect(lua).toContain("not bit32.btest(a, b)")
    })

    it("translates 0 !== (a & b) to bit32.btest (flipped)", () => {
      const lua = transpileSimple("declare const a: number, b: number;\nconst x = 0 !== (a & b)")

      expect(lua).toContain("bit32.btest(a, b)")
    })
  })

  it("handles compound expressions: (a & b) | c", () => {
    const lua = transpileSimple(
      "declare const a: number, b: number, c: number;\nconst x = (a & b) | c",
    )

    expect(lua).toContain("bit32.bor(")
    expect(lua).toContain("bit32.band(a, b)")
    expect(lua).toMatch(/bit32\.bor\(\s*bit32\.band\(a, b\)/)
  })

  describe("compound bitwise assignments", () => {
    it("translates &= to bit32.band", () => {
      const lua = transpileSimple("declare let a: number; a &= 3")

      expect(lua).toContain("bit32.band(a, 3)")
    })

    it("translates |= to bit32.bor", () => {
      const lua = transpileSimple("declare let a: number; a |= 3")

      expect(lua).toContain("bit32.bor(a, 3)")
    })

    it("translates ^= to bit32.bxor", () => {
      const lua = transpileSimple("declare let a: number; a ^= 3")
      expect(lua).toContain("bit32.bxor(a, 3)")
    })

    it("translates <<= to bit32.lshift", () => {
      const lua = transpileSimple("declare let a: number; a <<= 3")

      expect(lua).toContain("bit32.lshift(a, 3)")
    })

    it("translates >>= to bit32.arshift", () => {
      const lua = transpileSimple("declare let a: number; a >>= 3")

      expect(lua).toContain("bit32.arshift(a, 3)")
    })

    it("translates >>>= to bit32.rshift", () => {
      const lua = transpileSimple("declare let a: number; a >>>= 3")

      expect(lua).toContain("bit32.rshift(a, 3)")
    })

    it("handles property access LHS", () => {
      const lua = transpileSimple("declare let obj: {prop: number}; obj.prop &= 3")
      expect(lua).toContain("bit32.band(")
      expect(lua).not.toMatch(/\s&\s/)
    })
  })

  it("does not affect non-bitwise binary operators", () => {
    const lua = transpileSimple("const x = 1 + 2")

    expect(lua).toContain("1 + 2")
    expect(lua).not.toContain("bit32")
  })

  it("does not affect non-bitwise unary operators", () => {
    const lua = transpileSimple("const x = -(1 as number)")

    expect(lua).toContain("-1")
    expect(lua).not.toContain("bit32")
  })
})

describe("JSON transforms", () => {
  it("translates JSON.stringify to lljson.encode", () => {
    const lua = transpileSimple("declare const obj: any;\nconst s = JSON.stringify(obj)")

    expect(lua).toContain("lljson.encode(obj)")
    expect(lua).not.toContain("JSON")
  })

  it("translates JSON.parse to lljson.decode", () => {
    const lua = transpileSimple('declare const s: string;\nconst obj = JSON.parse(s)')

    expect(lua).toContain("lljson.decode(s)")
    expect(lua).not.toContain("JSON")
  })
})

describe("base64 transforms", () => {
  it("translates btoa to llbase64.encode", () => {
    const lua = transpileSimple("declare const s: string;\nconst b = btoa(s)")

    expect(lua).toContain("llbase64.encode(s)")
    expect(lua).not.toContain("btoa")
  })

  it("translates atob to llbase64.decode", () => {
    const lua = transpileSimple("declare const b: string;\nconst s = atob(b)")

    expect(lua).toContain("llbase64.decode(b)")
    expect(lua).not.toContain("atob")
  })
})

describe("string ll.* transforms", () => {
  it("translates toUpperCase to ll.ToUpper", () => {
    const lua = transpileSimple('const s = "hello".toUpperCase()')

    expect(lua).toContain("ll.ToUpper")
  })

  it("translates toLowerCase to ll.ToLower", () => {
    const lua = transpileSimple('const s = "HELLO".toLowerCase()')

    expect(lua).toContain("ll.ToLower")
  })

  it("translates trim to ll.StringTrim with STRING_TRIM", () => {
    const lua = transpileSimple('declare const s: string;\nconst x = s.trim()')

    expect(lua).toContain("ll.StringTrim")
    expect(lua).toContain("STRING_TRIM")
  })

  it("translates trimStart to ll.StringTrim with STRING_TRIM_HEAD", () => {
    const lua = transpileSimple(
      'interface String { trimStart(): string; }\ndeclare const s: string;\nconst x = s.trimStart()',
    )

    expect(lua).toContain("ll.StringTrim")
    expect(lua).toContain("STRING_TRIM_HEAD")
  })

  it("translates trimEnd to ll.StringTrim with STRING_TRIM_TAIL", () => {
    const lua = transpileSimple(
      'interface String { trimEnd(): string; }\ndeclare const s: string;\nconst x = s.trimEnd()',
    )

    expect(lua).toContain("ll.StringTrim")
    expect(lua).toContain("STRING_TRIM_TAIL")
  })

  it("translates indexOf (1-arg) to ll.SubStringIndex", () => {
    const lua = transpileSimple('declare const s: string;\nconst i = s.indexOf("x")')

    expect(lua).toContain("ll.SubStringIndex")
  })

  it("does not transform indexOf with fromIndex argument", () => {
    const lua = transpileSimple('declare const s: string;\nconst i = s.indexOf("x", 5)')

    expect(lua).not.toContain("ll.SubStringIndex")
  })
})

describe("string Luau stdlib transforms", () => {
  it("translates includes to string.find", () => {
    const lua = transpileSimple(
      'interface String { includes(searchString: string): boolean }\ndeclare const s: string;\nconst b = s.includes("x")',
    )

    expect(lua).toContain("string.find(s,")
    expect(lua).toContain("true")
    expect(lua).toContain("~= nil")
  })

  it("translates split(sep) to string.split", () => {
    const lua = transpileSimple(
      'interface String { split(separator: string): string[] }\ndeclare const s: string;\nconst a = s.split(",")',
    )

    expect(lua).toContain("string.split(s,")
  })

  it("does not transform split() with no separator", () => {
    const lua = transpileSimple(
      "interface String { split(separator?: string): string[] }\ndeclare const s: string;\nconst a = s.split()",
    )

    expect(lua).not.toContain("string.split")
  })

  it("translates repeat to string.rep", () => {
    const lua = transpileSimple(
      "interface String { repeat(count: number): string }\ndeclare const s: string;\nconst r = s.repeat(3)",
    )

    expect(lua).toContain("string.rep(s, 3)")
  })
})

describe("array transforms", () => {
  it("translates includes to table.find ~= nil", () => {
    const lua = transpileSimple(
      "interface Array<T> { includes(searchElement: T): boolean; }\ndeclare const arr: number[];\nconst b = arr.includes(3)",
    )

    expect(lua).toContain("table.find(arr, 3)")
    expect(lua).toContain("~= nil")
  })

  it("translates indexOf (1-arg) to (table.find or 0) - 1", () => {
    const lua = transpileSimple(
      "interface Array<T> { indexOf(searchElement: T, fromIndex?: number): number; }\ndeclare const arr: number[];\nconst i = arr.indexOf(3)",
    )

    expect(lua).toContain("table.find(arr, 3)")
    expect(lua).toContain("- 1")
  })

  it("does not transform indexOf with fromIndex argument", () => {
    const lua = transpileSimple(
      "interface Array<T> { indexOf(searchElement: T, fromIndex?: number): number; }\ndeclare const arr: number[];\nconst i = arr.indexOf(3, 1)",
    )

    expect(lua).not.toContain("table.find")
  })
})
