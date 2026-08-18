import { describe, expect, it } from "bun:test"
import { parseCompileError, parseCompileErrors } from "./compile-errors"

describe("parseCompileError", () => {
  it("parses a Luau error, which is already 1-based and has no column", () => {
    expect(
      parseCompileError("[string \"main\"]:12: Expected identifier, got 'end'", "luau"),
    ).toEqual({
      row: 12,
      column: 0,
      level: "ERROR",
      message: "Expected identifier, got 'end'",
    })
  })

  it("shifts LSL rows and columns up, since the compiler reports them 0-based", () => {
    expect(parseCompileError("(4, 8) : ERROR : Syntax error", "lsl")).toEqual({
      row: 5,
      column: 9,
      level: "ERROR",
      message: "Syntax error",
      format: "lsl",
    })
  })

  it("keeps the LSL severity, which is not always ERROR", () => {
    expect(parseCompileError("(0, 0) : WARNING : unused variable", "lsl").level).toBe("WARNING")
  })

  it("falls back to row 0 when a Luau line does not match", () => {
    expect(parseCompileError("something went wrong", "luau")).toEqual({
      row: 0,
      column: 0,
      level: "ERROR",
      message: "something went wrong",
    })
  })

  it("falls back to row 0 when an LSL line does not match", () => {
    expect(parseCompileError("catastrophe", "lsl")).toEqual({
      row: 0,
      column: 0,
      level: "ERROR",
      message: "catastrophe",
      format: "lsl",
    })
  })
})

describe("parseCompileErrors", () => {
  it("returns an empty list when the viewer sent no errors", () => {
    expect(parseCompileErrors(undefined, "luau")).toEqual([])
  })

  it("maps every line", () => {
    const parsed = parseCompileErrors(["a.luau:1: first", "a.luau:2: second"], "luau")

    expect(parsed.map((error) => error.row)).toEqual([1, 2])
  })
})
