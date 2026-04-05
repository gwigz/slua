import { describe, it, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import createPlugin from "../index"
import {
  transpile as transpileSimple,
  transpileFull as transpile,
  transpileOptimized,
  transpileWithDefine,
  initFull,
} from "./helpers"

const TYPES_PATH = resolve(import.meta.dir, "../../../../packages/types/index.d.ts")

const LANG_EXT_PATH = resolve(
  import.meta.dir,
  "../../../../node_modules/@typescript-to-lua/language-extensions/index.d.ts",
)

initFull(readFileSync(TYPES_PATH, "utf-8"), readFileSync(LANG_EXT_PATH, "utf-8"))

describe("ts-slua plugin", () => {
  it("beforeTransform errors on non-Luau target", () => {
    const diagnostics = createPlugin().beforeTransform!(
      {} as ts.Program,
      { luaTarget: tstl.LuaTarget.Lua53 } as tstl.CompilerOptions,
      {} as tstl.EmitHost,
    )

    expect(diagnostics).toHaveLength(1)
    expect((diagnostics as ts.Diagnostic[])[0].messageText).toContain("Luau")
  })

  it("beforeTransform passes with correct config", () => {
    const diagnostics = createPlugin().beforeTransform!(
      {} as ts.Program,
      {
        luaTarget: tstl.LuaTarget.Luau,
        luaLibImport: tstl.LuaLibImportKind.None,
      } as tstl.CompilerOptions,
      {} as tstl.EmitHost,
    )

    expect(diagnostics).toHaveLength(0)
  })
})

describe("transpilation output", () => {
  it("does not inject self into LLEvents callbacks", () => {
    const lua = transpile(`
      LLEvents.on("touch_start", function(events) {
        ll.Say(0, "touched")
      })
    `)

    expect(lua).toContain("LLEvents:on")
    expect(lua).not.toMatch(/function\(self/)
  })

  it("does not inject self into LLTimers callbacks", () => {
    const lua = transpile(`
      LLTimers.every(10, function(scheduled, interval) {
        ll.Say(0, "tick")
      })
    `)

    expect(lua).toContain("LLTimers:every")
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

describe("bitwise constant folding", () => {
  it("folds two-operand OR to a single number", () => {
    const lua = transpileOptimized("const x = (2 as number) | (4 as number)")

    expect(lua).toContain("6")
    expect(lua).not.toContain("bit32.bor")
  })

  it("folds three-operand OR chain", () => {
    const lua = transpileOptimized("const x = (1 as number) | (2 as number) | (4 as number)")

    expect(lua).toContain("7")
    expect(lua).not.toContain("bit32")
  })

  it("folds mixed operators", () => {
    const lua = transpileOptimized(
      "const x = ((0xFF as number) & (0x0F as number)) | (0x100 as number)",
    )

    expect(lua).toContain("271")
    expect(lua).not.toContain("bit32")
  })

  it("folds bitwise NOT of constant", () => {
    const lua = transpileOptimized("const x = ~(0 as number)")

    expect(lua).toContain("4294967295")
    expect(lua).not.toContain("bit32.bnot")
  })

  it("folds shift operators", () => {
    const lua = transpileOptimized("const x = (1 as number) << (8 as number)")

    expect(lua).toContain("256")
    expect(lua).not.toContain("bit32.lshift")
  })

  it("does not fold when operands are non-constant", () => {
    const lua = transpileOptimized("declare const a: number;\nconst x = a | (2 as number)")

    expect(lua).toContain("bit32.bor")
  })

  it("does not fold without optimize flag", () => {
    const lua = transpileSimple("const x = (2 as number) | (4 as number)")

    expect(lua).toContain("bit32.bor(2, 4)")
  })

  it("adds comment with original expression", () => {
    const lua = transpileOptimized("const x = (2 as number) | (4 as number)")

    expect(lua).toContain("--[[")
    expect(lua).toMatch(/6\s*--\[\[.*\|.*\]\]/)
  })

  it("folds identifiers with numeric literal types", () => {
    const lua = transpileOptimized(
      "declare const MASK_A: 256;\ndeclare const MASK_B: 1;\ndeclare const MASK_C: 2;\nconst x = MASK_A | MASK_B | MASK_C",
    )

    expect(lua).toContain("259")
    expect(lua).not.toContain("bit32")
  })

  it("does not fold identifiers typed as plain number", () => {
    const lua = transpileOptimized(
      "declare const MASK_A: number;\ndeclare const MASK_B: number;\nconst x = MASK_A | MASK_B",
    )

    expect(lua).toContain("bit32.bor")
  })
})

describe("JSON transforms", () => {
  it("translates JSON.stringify to lljson.encode", () => {
    const lua = transpileSimple("declare const obj: any;\nconst s = JSON.stringify(obj)")

    expect(lua).toContain("lljson.encode(obj)")
    expect(lua).not.toContain("JSON")
  })

  it("translates JSON.parse to lljson.decode", () => {
    const lua = transpileSimple("declare const s: string;\nconst obj = JSON.parse(s)")

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
    const lua = transpileSimple("declare const s: string;\nconst x = s.trim()")

    expect(lua).toContain("ll.StringTrim")
    expect(lua).toContain("STRING_TRIM")
  })

  it("translates trimStart to ll.StringTrim with STRING_TRIM_HEAD", () => {
    const lua = transpileSimple(
      "interface String { trimStart(): string; }\ndeclare const s: string;\nconst x = s.trimStart()",
    )

    expect(lua).toContain("ll.StringTrim")
    expect(lua).toContain("STRING_TRIM_HEAD")
  })

  it("translates trimEnd to ll.StringTrim with STRING_TRIM_TAIL", () => {
    const lua = transpileSimple(
      "interface String { trimEnd(): string; }\ndeclare const s: string;\nconst x = s.trimEnd()",
    )

    expect(lua).toContain("ll.StringTrim")
    expect(lua).toContain("STRING_TRIM_TAIL")
  })

  it("translates indexOf (1-arg) to string.find with - 1", () => {
    const lua = transpileSimple('declare const s: string;\nconst i = s.indexOf("x")')

    expect(lua).not.toContain("ll.SubStringIndex")
    expect(lua).toContain('string.find(s, "x", 1, true)')
    expect(lua).toContain("or 0) - 1")
  })

  it("translates indexOf with literal fromIndex to string.find with constant folding", () => {
    const lua = transpileSimple('declare const s: string;\nconst i = s.indexOf("x", 5)')

    expect(lua).not.toContain("ll.SubStringIndex")
    expect(lua).toContain('string.find(s, "x", 6, true)')
    expect(lua).toContain("(string.find(")
    expect(lua).toContain("or 0) - 1")
  })

  it("translates indexOf with expression fromIndex to string.find with + 1", () => {
    const lua = transpileSimple(
      'declare const s: string;\ndeclare const n: number;\nconst i = s.indexOf("x", n)',
    )

    expect(lua).toContain('string.find(s, "x", n + 1, true)')
    expect(lua).toContain("or 0) - 1")
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

  it("translates startsWith to string.find == 1", () => {
    const lua = transpileSimple(
      'interface String { startsWith(searchString: string): boolean }\ndeclare const s: string;\nconst b = s.startsWith("pre")',
    )

    expect(lua).toContain("string.find(s,")
    expect(lua).toContain("true")
    expect(lua).toContain("== 1")
  })

  it("does not transform startsWith with position argument", () => {
    const lua = transpileSimple(
      'interface String { startsWith(searchString: string, position?: number): boolean }\ndeclare const s: string;\nconst b = s.startsWith("pre", 3)',
    )

    expect(lua).not.toContain("string.find")
  })

  it("translates substring(start) to string.sub with constant folding", () => {
    const lua = transpileSimple("declare const s: string;\nconst x = s.substring(5)")

    expect(lua).toContain("string.sub(s, 6)")
  })

  it("translates substring(start, end) to string.sub with constant folding", () => {
    const lua = transpileSimple("declare const s: string;\nconst x = s.substring(1, 5)")

    expect(lua).toContain("string.sub(s, 2, 5)")
  })

  it("translates substring with expression arg to start + 1", () => {
    const lua = transpileSimple(
      "declare const s: string;\ndeclare const i: number;\nconst x = s.substring(i)",
    )

    expect(lua).toContain("string.sub(s, i + 1)")
  })

  it("translates replace to ll.ReplaceSubString with count 1", () => {
    const lua = transpileSimple('declare const s: string;\nconst r = s.replace("old", "new")')

    expect(lua).toContain('ll.ReplaceSubString(s, "old", "new", 1)')
  })

  it("translates replaceAll to ll.ReplaceSubString with count 0", () => {
    const lua = transpileSimple(
      'interface String { replaceAll(searchValue: string, replaceValue: string): string }\ndeclare const s: string;\nconst r = s.replaceAll("old", "new")',
    )

    expect(lua).toContain('ll.ReplaceSubString(s, "old", "new", 0)')
  })
})

describe("ll.* index-semantics", () => {
  it("adjusts literal index args (constant folding)", () => {
    const lua = transpile('const s = ll.GetSubString("hello", 0, 2)')

    expect(lua).toContain("ll.GetSubString")
    expect(lua).toContain('"hello", 1, 3')
  })

  it("adjusts expression index args with + 1", () => {
    const lua = transpile(
      'declare const i: number, j: number;\nconst s = ll.GetSubString("hello", i, j)',
    )

    expect(lua).toContain("i + 1")
    expect(lua).toContain("j + 1")
  })

  it("adjusts index return with nil-safe - 1", () => {
    const lua = transpile("declare const a: list, b: list;\nconst idx = ll.ListFindList(a, b)")

    expect(lua).toContain("ll.ListFindList(a, b)")
    expect(lua).toContain("____tmp and")
    expect(lua).toContain("____tmp - 1")
  })

  it("does not adjust non-index function args", () => {
    const lua = transpile('ll.Say(0, "hello")')

    expect(lua).toContain('ll.Say(0, "hello")')
    expect(lua).not.toContain("0 + 1")
    expect(lua).not.toContain("____tmp")
  })

  it("adjusts both args and return (mixed)", () => {
    const lua = transpile(
      "declare const a: list, b: list;\nconst idx = ll.ListFindStrided(a, b, 0, 10, 2)",
    )

    // Start (0->1) and End (10->11) are index args; Stride (2) is not
    expect(lua).toContain("ll.ListFindStrided")
    expect(lua).toMatch(/1,\s*\n\s*11,\s*\n\s*2/)
    // Return is index-return
    expect(lua).toContain("____tmp and")
    expect(lua).toContain("____tmp - 1")
  })
})

describe("DetectedEvent.index", () => {
  it("emits obj.index - 1 to convert from 1-based SLua to 0-based TS", () => {
    const lua = transpile(`
      declare const evt: DetectedEvent
      const idx = evt.index
    `)

    expect(lua).toContain("evt.index - 1")
  })

  it("composes correctly with @indexArg (no double offset)", () => {
    const lua = transpile(`
      declare const evt: DetectedEvent
      const name = ll.DetectedName(evt.index)
    `)

    // The -1 and +1 cancel out; optimized to raw property access
    expect(lua).toContain("ll.DetectedName(evt.index)")
    expect(lua).not.toContain("+ 1")
    expect(lua).not.toContain("- 1")
  })

  it("does not affect other DetectedEvent properties", () => {
    const lua = transpile(`
      declare const evt: DetectedEvent
      const v = evt.valid
    `)

    expect(lua).not.toContain("- 1")
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

describe("array concat self-assignment", () => {
  describe("positive cases", () => {
    it("translates arr = arr.concat(b) to table.extend", () => {
      const lua = transpileSimple(
        "declare let arr: number[];\ndeclare const b: number[];\narr = arr.concat(b)",
      )

      expect(lua).toContain("table.extend(arr, b)")
    })

    it("translates arr = arr.concat(b, c) to nested table.extend", () => {
      const lua = transpileSimple(
        "declare let arr: number[];\ndeclare const b: number[], c: number[];\narr = arr.concat(b, c)",
      )

      expect(lua).toContain("table.extend(")
      expect(lua).toContain("table.extend(arr, b)")
      expect(lua).toMatch(/table\.extend\(\s*table\.extend\(arr, b\),\s*c\s*\)/)
    })

    it("translates arr = [...arr, ...b] to table.extend", () => {
      const lua = transpileSimple(
        "declare let arr: number[];\ndeclare const b: number[];\narr = [...arr, ...b]",
      )

      expect(lua).toContain("table.extend(arr, b)")
    })

    it("translates arr = [...arr, ...b, ...c] to nested table.extend", () => {
      const lua = transpileSimple(
        "declare let arr: number[];\ndeclare const b: number[], c: number[];\narr = [...arr, ...b, ...c]",
      )

      expect(lua).toContain("table.extend(arr, b)")
      expect(lua).toMatch(/table\.extend\(\s*table\.extend\(arr, b\),\s*c\s*\)/)
    })
  })

  describe("negative cases", () => {
    it("does not transform when concat arg is not array-typed", () => {
      const lua = transpileSimple(
        "declare let arr: number[];\ndeclare const val: number;\narr = arr.concat(val)",
      )

      expect(lua).not.toContain("table.extend")
    })

    it("does not transform when LHS differs from receiver", () => {
      const lua = transpileSimple(
        "declare let arr: number[];\ndeclare const other: number[];\narr = other.concat(arr)",
      )

      expect(lua).not.toContain("table.extend")
    })

    it("does not transform property access LHS", () => {
      const lua = transpileSimple(
        "declare const obj: { arr: number[] };\ndeclare const b: number[];\nobj.arr = obj.arr.concat(b)",
      )

      expect(lua).not.toContain("table.extend")
    })

    it("does not transform zero concat arguments", () => {
      const lua = transpileSimple("declare let arr: number[];\narr = arr.concat()")

      expect(lua).not.toContain("table.extend")
    })

    it("does not transform spread where first element is not LHS", () => {
      const lua = transpileSimple(
        "declare let arr: number[];\ndeclare const b: number[];\narr = [...b, ...arr]",
      )

      expect(lua).not.toContain("table.extend")
    })

    it("does not transform spread with non-spread elements", () => {
      const lua = transpileSimple("declare let arr: number[];\narr = [...arr, 1]")

      expect(lua).not.toContain("table.extend")
    })

    it("does not transform self-only spread", () => {
      const lua = transpileSimple("declare let arr: number[];\narr = [...arr]")

      expect(lua).not.toContain("table.extend")
    })

    it("does not transform non-statement context", () => {
      const lua = transpileSimple(
        "declare const arr: number[];\ndeclare const b: number[];\nconst result = arr.concat(b)",
      )

      expect(lua).not.toContain("table.extend")
    })
  })
})

describe("optimize: filter", () => {
  it("transforms arr.filter(cb) to inline ipairs loop", () => {
    const lua = transpileOptimized(
      "declare const arr: number[];\nconst result = arr.filter(x => x > 0)",
    )

    expect(lua).toContain("ipairs(arr)")
    expect(lua).not.toContain("__TS__ArrayFilter")
  })

  it("composes with table.find inside filter callback", () => {
    const lua = transpileOptimized(
      "interface Array<T> { includes(searchElement: T): boolean; }\ndeclare const arr: number[];\ndeclare const other: number[];\nconst result = arr.filter(x => other.includes(x))",
    )

    expect(lua).toContain("ipairs(arr)")
    expect(lua).toContain("table.find")
    expect(lua).not.toContain("__TS__ArrayFilter")
  })

  it("does not transform without optimize flag", () => {
    const lua = transpileSimple(
      "declare const arr: number[];\nconst result = arr.filter(x => x > 0)",
    )

    expect(lua).not.toContain("ipairs")
  })

  it("does not transform non-array filter", () => {
    const lua = transpileOptimized(
      "interface Foo { filter(cb: (x: number) => boolean): Foo }\ndeclare const foo: Foo;\nconst result = foo.filter(x => x > 0)",
    )

    expect(lua).not.toContain("ipairs")
  })

  it("does not transform filter with thisArg", () => {
    const lua = transpileOptimized(
      "declare const arr: number[];\nconst result = arr.filter(x => x > 0, {})",
    )

    expect(lua).not.toContain("ipairs")
  })

  it("does not inline when file has multiple filter calls", () => {
    const lua = transpileOptimized(
      "declare const arr: number[];\nconst a = arr.filter(x => x > 0);\nconst b = arr.filter(x => x < 10)",
    )

    expect(lua).not.toContain("ipairs")
    expect(lua).toContain("__TS__ArrayFilter")
  })

  it("still inlines single filter even when other files have multiple", () => {
    // Each transpileOptimized call is a separate file, so a single filter should still inline
    const lua = transpileOptimized(
      "declare const arr: number[];\nconst result = arr.filter(x => x > 0)",
    )

    expect(lua).toContain("ipairs(arr)")
    expect(lua).not.toContain("__TS__ArrayFilter")
  })
})

describe("optimize: compoundAssignment", () => {
  it("rewrites x++ to x += 1", () => {
    const lua = transpileOptimized("declare let x: number;\nx++")

    expect(lua).toContain("x += 1")
    expect(lua).not.toMatch(/x = x \+ 1/)
  })

  it("rewrites x-- to x -= 1", () => {
    const lua = transpileOptimized("declare let x: number;\nx--")

    expect(lua).toContain("x -= 1")
    expect(lua).not.toMatch(/x = x - 1/)
  })

  it("rewrites x += n to compound assignment", () => {
    const lua = transpileOptimized("declare let x: number, n: number;\nx += n")

    expect(lua).toContain("x += n")
    expect(lua).not.toMatch(/x = x \+ n/)
  })

  it("does not rewrite without optimize flag", () => {
    const lua = transpileSimple("declare let x: number;\nx++")

    expect(lua).toContain("x = x + 1")
  })

  it("does not rewrite table index assignments", () => {
    const lua = transpileOptimized("declare const obj: { count: number };\nobj.count++")

    expect(lua).toContain("obj.count = obj.count + 1")
  })

  it("does not rewrite multi-operator RHS", () => {
    const lua = transpileOptimized("declare let x: number, y: number;\nx = x + y + 1")

    expect(lua).not.toContain("+=")
  })
})

describe("optimize: floorMultiply", () => {
  it("translates Math.floor((a / b) * c) to a * c // b", () => {
    const lua = transpileOptimized(
      "declare const used: number, limit: number;\nconst pct = Math.floor((used / limit) * 100)",
    )

    expect(lua).toContain("used * 100 // limit")
    expect(lua).not.toContain("math.floor")
  })

  it("translates Math.floor(c * (a / b)) to c * a // b", () => {
    const lua = transpileOptimized(
      "declare const a: number, b: number;\nconst x = Math.floor(100 * (a / b))",
    )

    expect(lua).toContain("a * 100 // b")
    expect(lua).not.toContain("math.floor")
  })

  it("does not optimize without floorMultiply flag", () => {
    const lua = transpileSimple(
      "declare const used: number, limit: number;\nconst pct = Math.floor((used / limit) * 100)",
    )

    expect(lua).toContain("math.floor")
    expect(lua).not.toContain("//")
  })

  it("still optimizes plain Math.floor(a / b) without flag", () => {
    const lua = transpileSimple("declare const a: number, b: number;\nconst x = Math.floor(a / b)")

    expect(lua).toContain("a // b")
    expect(lua).not.toContain("math.floor")
  })

  it("does not transform when arg is not multiply-of-division", () => {
    const lua = transpileOptimized(
      "declare const a: number, b: number;\nconst x = Math.floor(a * b)",
    )

    expect(lua).toContain("math.floor")
    expect(lua).not.toContain("//")
  })
})

describe("optimize: indexOf", () => {
  it("translates s.indexOf(x) >= 0 to bare string.find", () => {
    const lua = transpileOptimized('declare const s: string;\nconst b = s.indexOf("x") >= 0')

    expect(lua).toContain('string.find(s, "x", 1, true)')
    expect(lua).not.toContain("or 0")
    expect(lua).not.toContain("- 1")
  })

  it("translates s.indexOf(x) !== -1 to bare string.find", () => {
    const lua = transpileOptimized('declare const s: string;\nconst b = s.indexOf("x") !== -1')

    expect(lua).toContain('string.find(s, "x", 1, true)')
    expect(lua).not.toContain("or 0")
    expect(lua).not.toContain("- 1")
  })

  it("translates s.indexOf(x) === -1 to not string.find", () => {
    const lua = transpileOptimized('declare const s: string;\nconst b = s.indexOf("x") === -1')

    expect(lua).toContain('not string.find(s, "x", 1, true)')
  })

  it("translates s.indexOf(x) < 0 to not string.find", () => {
    const lua = transpileOptimized('declare const s: string;\nconst b = s.indexOf("x") < 0')

    expect(lua).toContain('not string.find(s, "x", 1, true)')
  })

  it("translates arr.indexOf(x) >= 0 to bare table.find", () => {
    const lua = transpileOptimized(
      "interface Array<T> { indexOf(searchElement: T, fromIndex?: number): number; }\ndeclare const arr: number[];\nconst b = arr.indexOf(3) >= 0",
    )

    expect(lua).toContain("table.find(arr, 3)")
    expect(lua).not.toContain("or 0")
  })

  it("translates arr.indexOf(x) === -1 to not table.find", () => {
    const lua = transpileOptimized(
      "interface Array<T> { indexOf(searchElement: T, fromIndex?: number): number; }\ndeclare const arr: number[];\nconst b = arr.indexOf(3) === -1",
    )

    expect(lua).toContain("not table.find(arr, 3)")
  })

  it("does not optimize without indexOf flag", () => {
    const lua = transpileSimple('declare const s: string;\nconst b = s.indexOf("x") >= 0')

    expect(lua).toContain("or 0) - 1")
  })

  it("bare indexOf without comparison still produces (find or 0) - 1", () => {
    const lua = transpileOptimized('declare const s: string;\nconst i = s.indexOf("x")')

    expect(lua).toContain("or 0) - 1")
  })
})

describe("optimize: shortenTemps", () => {
  it("shortens destructured return temp names", () => {
    const lua = transpileOptimized(
      "declare function fn(): { a: number, b: number };\nconst { a, b } = fn()",
    )

    expect(lua).toContain("_r0")
    expect(lua).not.toContain("____fn_result")
  })

  it("assigns distinct short names for multiple destructured calls", () => {
    const lua = transpileOptimized(
      "declare function fn(): { a: number, b: number };\ndeclare function gn(): { c: number, d: number };\nconst { a, b } = fn();\nconst { c, d } = gn()",
    )

    expect(lua).toContain("_r0")
    expect(lua).toContain("_r1")
    expect(lua).not.toContain("____fn_result")
    expect(lua).not.toContain("____gn_result")
  })

  it("does not shorten without shortenTemps flag", () => {
    const lua = transpileSimple(
      "declare function fn(): { a: number, b: number };\nconst { a, b } = fn()",
    )

    expect(lua).toContain("____fn_result")
    expect(lua).not.toContain("_r0")
  })

  it("does not affect non-destructured code", () => {
    const lua = transpileOptimized("declare function fn(): number;\nconst x = fn()")

    expect(lua).not.toContain("_r0")
  })

  it("collapses consecutive field accesses into multi-assignment", () => {
    const lua = transpileOptimized(
      "declare function fn(): { a: number, b: number };\nfunction test() { const { a, b } = fn(); return a + b }",
    )

    expect(lua).toContain("local a, b = _r0.a, _r0.b")
  })

  it("collapses three or more fields", () => {
    const lua = transpileOptimized(
      "declare function fn(): { a: number, b: number, c: string };\nfunction test() { const { a, b, c } = fn(); return a }",
    )

    expect(lua).toContain("local a, b, c = _r0.a, _r0.b, _r0.c")
  })

  it("does not collapse single field access", () => {
    const lua = transpileOptimized(
      "declare function fn(): { a: number, b: number };\nfunction test() { const { a } = fn(); return a }",
    )

    expect(lua).toContain("local a = _r0.a")
    expect(lua).not.toMatch(/local a,/)
  })
})

describe("optimize: inlineLocals", () => {
  it("merges forward-declared local with its assignment", () => {
    const lua = transpileOptimized("function test() {\n  let x: number\n  x = 5\n  return x\n}")

    expect(lua).toContain("local x = 5")
    expect(lua).not.toMatch(/^\s*local x\s*$/m)
  })

  it("merges multiple forward-declared locals", () => {
    const lua = transpileOptimized(
      "function test() {\n  let x: number\n  let y: string\n  x = 5\n  y = 'hello'\n  return x\n}",
    )

    expect(lua).toContain("local x = 5")
    expect(lua).toContain('local y = "hello"')
  })

  it("does not inline when variable is referenced before assignment", () => {
    const lua = transpileOptimized(
      "function test() {\n  let x: number\n  const y = x\n  x = 5\n  return y\n}",
    )

    expect(lua).toMatch(/^\s*local x\s*$/m)
  })

  it("does not inline without inlineLocals flag", () => {
    const lua = transpileSimple("function test() {\n  let x: number\n  x = 5\n  return x\n}")

    expect(lua).toMatch(/^\s*local x\s*$/m)
    expect(lua).not.toContain("local x = 5")
  })
})

describe("optimize: numericConcat", () => {
  it("strips tostring from number-typed variables in template literals", () => {
    const lua = transpileOptimized("declare const count: number;\nconst msg = `items: ${count}`")

    expect(lua).toContain(".. count")
    expect(lua).not.toContain("tostring(count)")
  })

  it("strips tostring from table length in template literals", () => {
    const lua = transpileOptimized(
      "declare const arr: number[];\nconst msg = `length: ${arr.length}`",
    )

    expect(lua).toContain(".. #arr")
    expect(lua).not.toContain("tostring(#arr)")
  })

  it("strips tostring from arithmetic expressions in template literals", () => {
    const lua = transpileOptimized(
      "declare const a: number, b: number;\nconst msg = `sum: ${a + b}`",
    )

    expect(lua).not.toContain("tostring")
  })

  it("keeps tostring for boolean-typed interpolations", () => {
    const lua = transpileOptimized("declare const flag: boolean;\nconst msg = `active: ${flag}`")

    expect(lua).toContain("tostring(flag)")
  })

  it("keeps tostring for any-typed interpolations", () => {
    const lua = transpileOptimized("declare const val: any;\nconst msg = `value: ${val}`")

    expect(lua).toContain("tostring(val)")
  })

  it("preserves string interpolations without tostring", () => {
    // Use `label` instead of `name` to avoid conflict with global Window.name
    const lua = transpileOptimized("declare const label: string;\nconst msg = `hello ${label}`")

    expect(lua).not.toContain("tostring")
  })

  it("handles mixed types in template literals", () => {
    const lua = transpileOptimized(
      "declare const label: string;\ndeclare const count: number;\ndeclare const flag: boolean;\nconst msg = `${label}: ${count} (${flag})`",
    )

    expect(lua).not.toContain("tostring(label)")
    expect(lua).not.toContain("tostring(count)")
    expect(lua).toContain("tostring(flag)")
  })

  it("does not strip tostring without numericConcat flag", () => {
    const lua = transpileSimple("declare const count: number;\nconst msg = `items: ${count}`")

    expect(lua).toContain("tostring(count)")
  })
})

describe("optimize: defaultParams", () => {
  it("collapses string default to or-expression", () => {
    const lua = transpileOptimized('function test(x = "") { return x }')

    expect(lua).toContain('x = x or ""')
    expect(lua).not.toContain("if x == nil then")
  })

  it("collapses non-empty string default", () => {
    const lua = transpileOptimized('function test(x = "hello") { return x }')

    expect(lua).toContain('x = x or "hello"')
    expect(lua).not.toContain("if x == nil then")
  })

  it("collapses number default", () => {
    const lua = transpileOptimized("function test(x = 42) { return x }")

    expect(lua).toContain("x = x or 42")
    expect(lua).not.toContain("if x == nil then")
  })

  it("collapses zero default", () => {
    const lua = transpileOptimized("function test(x = 0) { return x }")

    expect(lua).toContain("x = x or 0")
    expect(lua).not.toContain("if x == nil then")
  })

  it("does not collapse false default", () => {
    const lua = transpileOptimized("function test(x = false) { return x }")

    expect(lua).toContain("if x == nil then")
    expect(lua).not.toContain("x = x or")
  })

  it("does not collapse without defaultParams flag", () => {
    const lua = transpileSimple('function test(x = "") { return x }')

    expect(lua).toContain("if x == nil then")
    expect(lua).not.toContain("x = x or")
  })
})

describe("passthrough arrow closures", () => {
  it("collapses () => fn() to fn when callee has zero params", () => {
    const lua = transpileSimple(
      "declare function fn(): void\ndeclare function cb(f: () => void): void\ncb(() => fn())",
    )

    expect(lua).toContain("cb(fn)")
    expect(lua).not.toContain("function()")
  })

  it("collapses block body () => { fn() }", () => {
    const lua = transpileSimple(
      "declare function fn(): void\ndeclare function cb(f: () => void): void\ncb(() => { fn() })",
    )

    expect(lua).toContain("cb(fn)")
  })

  it("collapses block body with return", () => {
    const lua = transpileSimple(
      "declare function fn(): void\ndeclare function cb(f: () => void): void\ncb(() => { return fn() })",
    )

    expect(lua).toContain("cb(fn)")
  })

  it("keeps wrapper when callee has parameters", () => {
    const lua = transpileSimple(
      "declare function fn(x?: number): void\ndeclare function cb(f: () => void): void\ncb(() => fn())",
    )

    expect(lua).not.toMatch(/cb\(fn\)/)
    expect(lua).toContain("function()")
  })

  it("keeps wrapper when arrow has parameters", () => {
    const lua = transpileSimple(
      "declare function fn(): void\ndeclare function cb(f: (x: number) => void): void\ncb((_x) => fn())",
    )

    expect(lua).not.toMatch(/cb\(fn\)/)
  })

  it("keeps wrapper when call passes arguments", () => {
    const lua = transpileSimple(
      "declare function fn(x: number): void\ndeclare function cb(f: () => void): void\ndeclare const val: number\ncb(() => fn(val))",
    )

    expect(lua).toContain("function()")
  })

  it("keeps wrapper for property access calls", () => {
    const lua = transpileSimple(
      "declare const obj: { method(): void }\ndeclare function cb(f: () => void): void\ncb(() => obj.method())",
    )

    expect(lua).toContain("function()")
  })
})

describe("define", () => {
  it("replaces boolean define with literal", () => {
    const lua = transpileWithDefine("declare const FEATURE_X: boolean\nconst x = FEATURE_X", {
      FEATURE_X: true,
    })

    expect(lua).toContain("x = true")
    expect(lua).not.toContain("FEATURE_X")
  })

  it("replaces numeric define with literal", () => {
    const lua = transpileWithDefine("declare const VERSION: number\nconst v = VERSION", {
      VERSION: 42,
    })

    expect(lua).toContain("v = 42")
    expect(lua).not.toContain("VERSION")
  })

  it("replaces string define with literal", () => {
    const lua = transpileWithDefine("declare const MODE: string\nconst m = MODE", {
      MODE: "production",
    })

    expect(lua).toContain('"production"')
    expect(lua).not.toContain("MODE")
  })

  it("does not replace property access names", () => {
    const lua = transpileWithDefine(
      "declare const obj: { FEATURE_X: boolean }\nconst x = obj.FEATURE_X",
      { FEATURE_X: true },
    )

    expect(lua).toContain("obj.FEATURE_X")
  })

  it("does not replace declaration names", () => {
    const lua = transpileWithDefine("const FEATURE_X = 123", { FEATURE_X: true })

    expect(lua).toContain("FEATURE_X")
    expect(lua).toContain("123")
  })

  it("leaves undefined identifiers untouched", () => {
    const lua = transpileWithDefine("declare const OTHER: boolean\nconst x = OTHER", {
      FEATURE_X: true,
    })

    expect(lua).toContain("OTHER")
  })
})

describe("@define JSDoc tag", () => {
  it("strips function when flag is false", () => {
    const lua = transpileWithDefine(`/** @define FEATURE_X */\nfunction helper() { return 1 }`, {
      FEATURE_X: false,
    })

    expect(lua).not.toContain("helper")
  })

  it("keeps function when flag is true", () => {
    const lua = transpileWithDefine(`/** @define FEATURE_X */\nfunction helper() { return 1 }`, {
      FEATURE_X: true,
    })

    expect(lua).toContain("helper")
  })

  it("strips variable when flag is false", () => {
    const lua = transpileWithDefine(`/** @define FEATURE_X */\nconst MAGIC = 42`, {
      FEATURE_X: false,
    })

    expect(lua).not.toContain("MAGIC")
    expect(lua).not.toContain("42")
  })

  it("keeps variable when flag is true", () => {
    const lua = transpileWithDefine(`/** @define FEATURE_X */\nconst MAGIC = 42`, {
      FEATURE_X: true,
    })

    expect(lua).toContain("42")
  })

  it("keeps declaration when flag is not in define map", () => {
    const lua = transpileWithDefine(`/** @define UNKNOWN */\nfunction helper() { return 1 }`, {
      FEATURE_X: true,
    })

    expect(lua).toContain("helper")
  })

  it("strips @define tag from Lua output", () => {
    const lua = transpileWithDefine(`/** @define FEATURE_X */\nfunction helper() { return 1 }`, {
      FEATURE_X: true,
    })

    expect(lua).not.toContain("@define")
  })

  it("strips multi-line @define JSDoc completely", () => {
    const lua = transpileWithDefine(
      `/**
 * @define FEATURE_X
 * compile time gate for YAML parsing
 */
function helper() { return 1 }`,
      { FEATURE_X: true },
    )

    expect(lua).not.toContain("@define")
    expect(lua).not.toContain("compile time")
    expect(lua).toContain("helper")
  })
})

describe("dead code elimination", () => {
  it("keeps then-branch when condition is true", () => {
    const lua = transpileWithDefine(
      `declare const FEATURE: boolean
if (FEATURE) {
  const x = 1
}`,
      { FEATURE: true },
    )

    expect(lua).toContain("x = 1")
    expect(lua).not.toContain("if")
  })

  it("eliminates entire block when condition is false and no else", () => {
    const lua = transpileWithDefine(
      `declare const FEATURE: boolean
if (FEATURE) {
  const x = 1
}`,
      { FEATURE: false },
    )

    expect(lua).not.toContain("x =")
    expect(lua).not.toContain("if")
  })

  it("keeps else-branch when condition is false", () => {
    const lua = transpileWithDefine(
      `declare const FEATURE: boolean
if (FEATURE) {
  const x = 1
} else {
  const y = 2
}`,
      { FEATURE: false },
    )

    expect(lua).not.toContain("x = 1")
    expect(lua).toContain("y = 2")
    expect(lua).not.toContain("if")
  })

  it("handles negation: !FLAG", () => {
    const lua = transpileWithDefine(
      `declare const FEATURE: boolean
if (!FEATURE) {
  const x = 1
}`,
      { FEATURE: true },
    )

    expect(lua).not.toContain("x =")
    expect(lua).not.toContain("if")
  })

  it("handles strict equality: FLAG === true", () => {
    const lua = transpileWithDefine(
      `declare const FEATURE: boolean
if (FEATURE === true) {
  const x = 1
}`,
      { FEATURE: true },
    )

    expect(lua).toContain("x = 1")
    expect(lua).not.toContain("if")
  })

  it("handles strict inequality: FLAG !== false", () => {
    const lua = transpileWithDefine(
      `declare const FEATURE: boolean
if (FEATURE !== false) {
  const x = 1
}`,
      { FEATURE: true },
    )

    expect(lua).toContain("x = 1")
    expect(lua).not.toContain("if")
  })

  it("handles else-if chains", () => {
    const lua = transpileWithDefine(
      `declare const A: boolean
declare const B: boolean
if (A) {
  const x = 1
} else if (B) {
  const y = 2
} else {
  const z = 3
}`,
      { A: false, B: true },
    )

    expect(lua).not.toContain("x = 1")
    expect(lua).toContain("y = 2")
    expect(lua).not.toContain("z = 3")
  })

  it("falls through else-if chain to else", () => {
    const lua = transpileWithDefine(
      `declare const A: boolean
declare const B: boolean
if (A) {
  const x = 1
} else if (B) {
  const y = 2
} else {
  const z = 3
}`,
      { A: false, B: false },
    )

    expect(lua).not.toContain("x = 1")
    expect(lua).not.toContain("y = 2")
    expect(lua).toContain("z = 3")
  })

  it("does not wrap kept then-branch in do...end", () => {
    const lua = transpileWithDefine(
      `declare const FEATURE: boolean
if (FEATURE) {
  const x = 1
}`,
      { FEATURE: true },
    )

    expect(lua).toContain("x = 1")
    expect(lua).not.toContain("do")
    expect(lua).not.toContain("end")
  })

  it("does not wrap kept else-branch in do...end", () => {
    const lua = transpileWithDefine(
      `declare const FEATURE: boolean
if (FEATURE) {
  const x = 1
} else {
  const y = 2
}`,
      { FEATURE: false },
    )

    expect(lua).toContain("y = 2")
    expect(lua).not.toContain("do")
    expect(lua).not.toContain("end")
  })

  it("delegates unresolvable conditions to normal transpiler", () => {
    const lua = transpileWithDefine(
      `declare const runtime: boolean
if (runtime) {
  const x = 1
}`,
      { FEATURE: true },
    )

    expect(lua).toContain("if runtime then")
  })
})
