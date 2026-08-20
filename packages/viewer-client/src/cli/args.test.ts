import { describe, expect, it } from "bun:test"
import { CliUsageError, helpText, parseCliArgs } from "./args"

describe("parseCliArgs", () => {
  it("defaults to help with no arguments", () => {
    expect(parseCliArgs([]).command).toEqual({ name: "help" })
  })

  it("defaults to the viewer's port", () => {
    expect(parseCliArgs(["objects"]).global.port).toBe(9020)
  })

  it("accepts a port override", () => {
    expect(parseCliArgs(["objects", "--port", "9021"]).global.port).toBe(9021)
  })

  it("rejects a non-numeric port", () => {
    expect(() => parseCliArgs(["objects", "--port", "nope"])).toThrow(CliUsageError)
  })

  it("rejects an unknown command", () => {
    expect(() => parseCliArgs(["frobnicate"])).toThrow(CliUsageError)
  })

  it("rejects an unknown flag", () => {
    expect(() => parseCliArgs(["objects", "--wat"])).toThrow(CliUsageError)
  })

  it("parses a positional target ref", () => {
    expect(parseCliArgs(["pull", "Obj/Main"]).command).toEqual({
      name: "pull",
      ref: { object: { kind: "name", value: "Obj" }, item: "Main" },
      out: undefined,
    })
  })

  it("parses the flag form of a target", () => {
    expect(parseCliArgs(["pull", "--object", "Obj", "--item", "Main"]).command).toMatchObject({
      name: "pull",
      ref: { object: { kind: "name", value: "Obj" }, item: "Main" },
    })
  })

  it("takes the positional as the output path when the target came from flags", () => {
    expect(parseCliArgs(["pull", "--object", "Obj", "--item", "Main", "out.luau"]).command).toEqual(
      {
        name: "pull",
        ref: { object: { kind: "name", value: "Obj" }, link: undefined, item: "Main" },
        out: "out.luau",
      },
    )
  })

  it("carries the link flag into the ref", () => {
    expect(
      parseCliArgs(["reset", "--object", "O", "--item", "I", "--link", "L"]).command,
    ).toMatchObject({ ref: { object: { kind: "name", value: "O" }, link: "L", item: "I" } })
  })

  it("requires a target", () => {
    expect(() => parseCliArgs(["reset"])).toThrow(CliUsageError)
  })

  it("parses push with a file and a target", () => {
    expect(parseCliArgs(["push", "dist/main.slua", "Obj/Main"]).command).toEqual({
      name: "push",
      file: "dist/main.slua",
      ref: { object: { kind: "name", value: "Obj" }, item: "Main" },
      vm: undefined,
      target: undefined,
      all: false,
      saveBack: undefined,
    })
  })

  it("allows push with only a file, leaving the target to config or a header", () => {
    expect(parseCliArgs(["push", "dist/main.slua"]).command).toMatchObject({
      name: "push",
      file: "dist/main.slua",
      ref: undefined,
    })
  })

  it("allows push with only a named target", () => {
    expect(parseCliArgs(["push", "--target", "main"]).command).toMatchObject({
      name: "push",
      target: "main",
      file: undefined,
    })
  })

  it("allows push --all", () => {
    expect(parseCliArgs(["push", "--all"]).command).toMatchObject({ name: "push", all: true })
  })

  it("requires a file, a target or --all for push", () => {
    expect(() => parseCliArgs(["push"])).toThrow(CliUsageError)
  })

  it("rejects a file alongside --all", () => {
    // Otherwise the one file quietly becomes what every target deploys.
    expect(() => parseCliArgs(["push", "a.slua", "--all"])).toThrow(CliUsageError)
    expect(() => parseCliArgs(["push", "--all", "--file", "a.slua"])).toThrow(CliUsageError)
  })

  it("rejects --object without --item", () => {
    expect(() => parseCliArgs(["push", "a.slua", "--object", "Obj"])).toThrow(CliUsageError)
  })

  it("parses link", () => {
    expect(parseCliArgs(["link", "main", "--key", "slua:proj"]).command).toMatchObject({
      name: "link",
      target: "main",
      key: "slua:proj",
    })
  })

  it("requires a name for link", () => {
    expect(() => parseCliArgs(["link"])).toThrow(CliUsageError)
  })

  it("validates the vm", () => {
    expect(parseCliArgs(["push", "a.slua", "O/I", "--vm", "luau"]).command).toMatchObject({
      vm: "luau",
    })
    expect(() => parseCliArgs(["push", "a.slua", "O/I", "--vm", "wasm"])).toThrow(CliUsageError)
  })

  it("parses set-running state", () => {
    expect(parseCliArgs(["set-running", "off", "O/I"]).command).toMatchObject({ running: false })
    expect(parseCliArgs(["set-running", "on", "O/I"]).command).toMatchObject({ running: true })
  })

  it("rejects a set-running state that is neither on nor off", () => {
    expect(() => parseCliArgs(["set-running", "maybe", "O/I"])).toThrow(CliUsageError)
  })

  it("parses logs, which needs no target", () => {
    expect(parseCliArgs(["logs", "--object", "O", "-f"]).command).toEqual({
      name: "logs",
      object: "O",
      follow: true,
      targets: false,
    })
  })

  it("parses the logs target filter", () => {
    expect(parseCliArgs(["logs", "--targets"]).command).toEqual({
      name: "logs",
      object: undefined,
      follow: false,
      targets: true,
    })
  })

  it("validates the syntax kind", () => {
    expect(parseCliArgs(["syntax", "defs.lua"]).command).toEqual({
      name: "syntax",
      kind: "defs.lua",
    })
    expect(() => parseCliArgs(["syntax", "defs.wat"])).toThrow(CliUsageError)
  })

  it("treats --wait as global, since publishing is what every command waits on", () => {
    expect(parseCliArgs(["objects"]).global.waitMs).toBeUndefined()
    expect(parseCliArgs(["push", "a.slua", "--wait"]).global.waitMs).toBeGreaterThan(0)
  })

  it("treats --json as global", () => {
    expect(parseCliArgs(["objects", "--json"]).global.json).toBe(true)
  })

  it("lets --help win over a command", () => {
    expect(parseCliArgs(["push", "--help"]).command).toEqual({ name: "help" })
  })

  it("handles --version before anything else", () => {
    expect(parseCliArgs(["--version"]).command).toEqual({ name: "version" })
  })
})

describe("helpText", () => {
  it("documents every command and flag", () => {
    const help = helpText()

    for (const token of [
      "objects",
      "pull",
      "push",
      "reset",
      "set-running",
      "logs",
      "syntax",
      "--object",
      "--item",
      "--link",
      "--vm",
      "--target",
      "--all",
      "--save-back",
      "--file",
      "--key",
      "--follow",
      "--wait",
      "--port",
      "--timeout",
      "--json",
      "--help",
      "--version",
    ]) {
      expect(help).toContain(token)
    }
  })
})
