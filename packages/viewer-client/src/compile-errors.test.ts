import { describe, expect, it } from "bun:test"
import { diagnosticsFrom, parseCompileError, parseCompileErrors } from "./compile-errors"

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

describe("diagnosticsFrom", () => {
  it("takes the viewer's own parse when it sent one", () => {
    const diagnostic = { row: 3, column: 0, level: "ERROR", message: "Unknown global" }

    expect(
      diagnosticsFrom({ diagnostics: [diagnostic], errors: ["a.luau:9: stale"] }, "luau"),
    ).toEqual([diagnostic])
  })

  it("parses the raw lines from a viewer without unifiedDiagnostics", () => {
    expect(diagnosticsFrom({ errors: ["a.luau:2: second"] }, "luau")).toEqual([
      { row: 2, column: 0, level: "ERROR", message: "second" },
    ])
  })

  it("returns an empty list when the response carries neither", () => {
    expect(diagnosticsFrom({}, "luau")).toEqual([])
    expect(diagnosticsFrom(undefined, "luau")).toEqual([])
  })

  it("keeps an empty diagnostics array rather than falling back to errors", () => {
    expect(diagnosticsFrom({ diagnostics: [], errors: ["a.luau:1: first"] }, "luau")).toEqual([])
  })
})

describe("diagnosticsFrom on a viewer that sends rubbish", () => {
  it("keeps the row but replaces a message of uninitialised memory", () => {
    // Verbatim from YATPV Dev 26.3.0.0, answering a save whose Lua would not
    // parse. The row is right, the message is 58 NUL bytes.
    const response = {
      diagnostics: [{ row: 3, column: 0, level: "ERROR", message: "\u0000".repeat(58) }],
    }

    expect(diagnosticsFrom(response, "luau")).toEqual([
      {
        row: 3,
        column: 0,
        level: "ERROR",
        message: "the viewer reported an error here but sent no message with it",
      },
    ])
  })

  it("replaces a message that arrived empty in the first place", () => {
    const response = {
      diagnostics: [{ row: 4, column: 0, level: "ERROR", message: "" }],
    }

    expect(diagnosticsFrom(response, "luau")[0]!.message).toBe(
      "the viewer reported an error here but sent no message with it",
    )
  })

  it("strips a colour escape whole rather than leaving its bracket behind", () => {
    const response = {
      diagnostics: [
        { row: 2, column: 0, level: "ERROR", message: "\u001b[31mExpected identifier\u001b[0m" },
      ],
    }

    expect(diagnosticsFrom(response, "luau")[0]!.message).toBe("Expected identifier")
  })

  it("strips control characters out of a message that still says something", () => {
    const response = {
      diagnostics: [
        { row: 2, column: 0, level: "ERROR", message: "Expected identifier\u0000\u0007" },
      ],
    }

    expect(diagnosticsFrom(response, "luau")[0]!.message).toBe("Expected identifier")
  })

  it("leaves an ordinary message exactly as it was", () => {
    const response = {
      diagnostics: [{ row: 2, column: 0, level: "ERROR", message: "Unknown global 'foo'" }],
    }

    expect(diagnosticsFrom(response, "luau")[0]!.message).toBe("Unknown global 'foo'")
  })
})
