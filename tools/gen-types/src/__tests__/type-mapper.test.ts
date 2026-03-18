import { describe, it, expect } from "bun:test"
import { mapType, mapReturnType } from "../type-mapper"

describe("mapType", () => {
  it("maps primitive types", () => {
    expect(mapType("number")).toBe("number")
    expect(mapType("string")).toBe("string")
    expect(mapType("boolean")).toBe("boolean")
    expect(mapType("nil")).toBe("undefined")
    expect(mapType("any")).toBe("any")
    expect(mapType("never")).toBe("never")
  })

  it("maps SLua custom types as-is", () => {
    expect(mapType("vector")).toBe("vector")
    expect(mapType("quaternion")).toBe("quaternion")
    expect(mapType("uuid")).toBe("uuid")
  })

  it("maps optional types", () => {
    expect(mapType("number?")).toBe("number | undefined")
    expect(mapType("uuid?")).toBe("uuid | undefined")
    expect(mapType("string?")).toBe("string | undefined")
  })

  it("maps complex optional types", () => {
    expect(mapType("{[any]: any}?")).toBe("Record<any, any> | undefined")
    expect(mapType("((a: V, b: V) -> boolean)?")).toBe("((a: V, b: V) => boolean) | undefined")
  })

  it("maps Luau array types {T}", () => {
    expect(mapType("{string}")).toBe("string[]")
    expect(mapType("{DetectedEvent}")).toBe("DetectedEvent[]")
    expect(mapType("{any}")).toBe("any[]")
  })

  it("maps Luau table types {[K]: V}", () => {
    expect(mapType("{[string]: number}")).toBe("Record<string, number>")
    expect(mapType("{[any]: any}")).toBe("Record<any, any>")
  })

  it("maps Luau shorthand table types {[K], V}", () => {
    expect(mapType("{[K], V}")).toBe("Record<K, V>")
  })

  it("maps named struct types", () => {
    const result = mapType(
      "{ year: number, month: number, day: number, hour: number?, min: number? }",
    )
    expect(result).toBe("{ year: number; month: number; day: number; hour?: number; min?: number }")
  })

  it("maps struct types with indexer fields", () => {
    const result = mapType("{ n: number, [number]: V }")
    expect(result).toBe("{ n: number; [index: number]: V }")
  })

  it("maps union types", () => {
    expect(mapType("string | number")).toBe("string | number")
    expect(mapType("number | vector | quaternion")).toBe("number | vector | quaternion")
  })

  it("maps Luau union array types", () => {
    expect(mapType("{string | number | vector | uuid | quaternion | boolean}")).toBe(
      "(string | number | vector | uuid | quaternion | boolean)[]",
    )
  })

  it("maps function types", () => {
    expect(mapType("(...any) -> ()")).toBe("(...args: any[]) => void")
    expect(mapType("(scheduled: number, interval: number) -> ()")).toBe(
      "(scheduled: number, interval: number) => void",
    )
  })

  it("maps function types with unnamed params", () => {
    const result = mapType("({V}, number) -> (number?, V)")
    expect(result).toContain("=>")
    expect(result).toContain("arg0: V[]")
    expect(result).toContain("arg1: number")
  })

  it("parenthesizes function types in unions", () => {
    const result = mapType("LuaThread | ((...any) -> ...any) | number")
    expect(result).toContain("LuaThread")
    expect(result).toContain("number")
    // The function type should be parenthesized in the union
    expect(result).not.toContain("->")
    expect(result).toContain("=>")
  })

  it("maps string | function type union with proper parens", () => {
    const result = mapType("string | { [string]: string } | (...string) -> string")
    expect(result).toContain("string")
    expect(result).toContain("Record<string, string>")
    expect(result).toContain("=>")
    // Should NOT contain Luau arrow
    expect(result).not.toContain("->")
  })

  it("maps void return as void", () => {
    expect(mapType("()")).toBe("void")
  })

  it("maps variadic types", () => {
    expect(mapType("...any")).toBe("...args: any[]")
  })

  it("maps variadic type packs to any[]", () => {
    expect(mapType("A...")).toBe("any[]")
    expect(mapType("R...")).toBe("any[]")
    expect(mapType("R1...")).toBe("any[]")
  })

  it("simplifies function types with variadic packs", () => {
    const result = mapType("(A...) -> R...")
    expect(result).toBe("(...args: any[]) => any")
  })

  it("maps string literal types", () => {
    expect(mapType('""')).toBe('""')
    expect(mapType('"running"')).toBe('"running"')
  })
})

describe("mapReturnType", () => {
  it("maps void return types", () => {
    expect(mapReturnType("()")).toBe("void")
    expect(mapReturnType("void")).toBe("void")
    expect(mapReturnType("")).toBe("void")
  })

  it("maps simple return types", () => {
    expect(mapReturnType("string")).toBe("string")
    expect(mapReturnType("number")).toBe("number")
  })

  it("maps tuple return types to LuaMultiReturn", () => {
    expect(mapReturnType("(boolean, string)")).toBe("LuaMultiReturn<[boolean, string]>")
    expect(mapReturnType("(number, number)")).toBe("LuaMultiReturn<[number, number]>")
  })

  it("maps tuple return with optional elements", () => {
    expect(mapReturnType("(boolean, string?)")).toBe(
      "LuaMultiReturn<[boolean, string | undefined]>",
    )
  })

  it("maps variadic return types", () => {
    const result = mapReturnType("...any")

    expect(result).toBe("any[]")
  })

  it("maps variadic return type packs", () => {
    expect(mapReturnType("R...")).toBe("any")
  })

  it("simplifies return types with variadic packs", () => {
    expect(mapReturnType("(boolean, R...)")).toBe("any")
  })

  it("maps parenthesized single return type", () => {
    expect(mapReturnType("(string)")).toBe("string")
  })
})
