import { describe, expect, it } from "bun:test"
import { CliUsageError, parseCliArgs, helpText } from "./args"

describe("parseCliArgs", () => {
  it("parses an empty invocation", () => {
    const flags = parseCliArgs([])

    expect(flags.directory).toBeUndefined()
    expect(flags.template).toBeUndefined()
    expect(flags.extras).toBeUndefined()
    expect(flags.git).toBeUndefined()
    expect(flags.install).toBeUndefined()
    expect(flags.yes).toBe(false)
    expect(flags.help).toBe(false)
    expect(flags.version).toBe(false)
  })

  it("parses a positional directory", () => {
    expect(parseCliArgs(["my-project"]).directory).toBe("my-project")
  })

  it("rejects extra positionals", () => {
    expect(() => parseCliArgs(["a", "b"])).toThrow(CliUsageError)
  })

  it("rejects a blank directory", () => {
    expect(() => parseCliArgs(["  "])).toThrow(CliUsageError)
  })

  it("parses template long and short forms", () => {
    expect(parseCliArgs(["--template", "multi"]).template).toBe("multi")
    expect(parseCliArgs(["-t", "single"]).template).toBe("single")
  })

  it("rejects unknown templates", () => {
    expect(() => parseCliArgs(["-t", "mega"])).toThrow(CliUsageError)
  })

  it("parses comma-separated and repeated extras", () => {
    expect(parseCliArgs(["-e", "jsx,config"]).extras).toEqual(["jsx", "config"])
    expect(parseCliArgs(["-e", "jsx", "-e", "yield"]).extras).toEqual(["jsx", "yield"])
    expect(parseCliArgs(["--extras", "utilities"]).extras).toEqual(["utilities"])
  })

  it("dedupes repeated extras", () => {
    expect(parseCliArgs(["-e", "jsx,jsx"]).extras).toEqual(["jsx"])
  })

  it('treats --extras "none" as an explicit empty selection', () => {
    expect(parseCliArgs(["-e", "none"]).extras).toEqual([])
  })

  it("rejects empty extras values", () => {
    expect(() => parseCliArgs(["-e", ""])).toThrow(/empty value/)
    expect(() => parseCliArgs(["-e", ","])).toThrow(/empty value/)
  })

  it("rejects empty extras entries from stray commas", () => {
    expect(() => parseCliArgs(["-e", "jsx,"])).toThrow(/empty value/)
    expect(() => parseCliArgs(["-e", ",jsx"])).toThrow(/empty value/)
    expect(() => parseCliArgs(["-e", "jsx,,config"])).toThrow(/empty value/)
  })

  it('rejects "none" combined with other extras', () => {
    expect(() => parseCliArgs(["-e", "none,jsx"])).toThrow(CliUsageError)
  })

  it("rejects unknown extras", () => {
    expect(() => parseCliArgs(["-e", "blockchain"])).toThrow(CliUsageError)
  })

  it("parses git negation", () => {
    expect(parseCliArgs(["--git"]).git).toBe(true)
    expect(parseCliArgs(["--no-git"]).git).toBe(false)
    expect(parseCliArgs([]).git).toBeUndefined()
  })

  it("parses install negation", () => {
    expect(parseCliArgs(["--install"]).install).toBe(true)
    expect(parseCliArgs(["--no-install"]).install).toBe(false)
  })

  it("rejects conflicting negations", () => {
    expect(() => parseCliArgs(["--git", "--no-git"])).toThrow(CliUsageError)
    expect(() => parseCliArgs(["--install", "--no-install"])).toThrow(CliUsageError)
  })

  it("parses --yes, --help, and --version", () => {
    expect(parseCliArgs(["-y"]).yes).toBe(true)
    expect(parseCliArgs(["-h"]).help).toBe(true)
    expect(parseCliArgs(["-v"]).version).toBe(true)
  })

  it("wraps unknown flags in CliUsageError", () => {
    expect(() => parseCliArgs(["--frobnicate"])).toThrow(CliUsageError)
  })
})

describe("helpText", () => {
  it("mentions every flag", () => {
    const text = helpText()

    for (const flag of ["--template", "--extras", "--no-git", "--no-install", "--yes"]) {
      expect(text).toContain(flag)
    }
  })
})
