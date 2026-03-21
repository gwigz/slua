import { describe, it, expect } from "bun:test"
import { resolve } from "path"

const OUTPUT_PATH = resolve(import.meta.dir, "../../../../packages/types/index.d.ts")

describe("generate", () => {
  it("generates valid .d.ts from real YAML files", () => {
    const output = Bun.file(OUTPUT_PATH).text()

    // Has header
    expect(output).resolves.toContain("Auto-generated")
    expect(output).resolves.toContain("@typescript-to-lua/language-extensions")

    // Has base types (PascalCase classes with constructors)
    expect(output).resolves.toContain("declare class Vector")
    expect(output).resolves.toContain("declare class Quaternion")
    expect(output).resolves.toContain("declare class UUID")
    expect(output).resolves.toContain("declare type vector = Vector")
    expect(output).resolves.toContain("declare type quaternion = Quaternion")
    expect(output).resolves.toContain("declare type uuid = UUID")

    // Has PascalCase namespaces merged with classes
    expect(output).resolves.toContain("declare namespace Vector")
    expect(output).resolves.toContain("function create(")

    // Has ll namespace
    expect(output).resolves.toContain("declare namespace ll")
    expect(output).resolves.toContain("function Say(")
    expect(output).resolves.toContain("function GetOwner(")

    // Has type aliases
    expect(output).resolves.toContain("type rotation = quaternion")

    // Has global functions
    expect(output).resolves.toContain("function touuid(")
    expect(output).resolves.toContain("function tovector(")

    // Has builtin functions
    expect(output).resolves.toContain("function print(")
    expect(output).resolves.toContain("function assert")
    expect(output).resolves.toContain("function pairs")

    // Has modules
    expect(output).resolves.toContain("declare namespace math")
    expect(output).resolves.toContain("declare namespace string")
    expect(output).resolves.toContain("declare namespace table")
    expect(output).resolves.toContain("declare namespace bit32")

    // Has constants
    expect(output).resolves.toContain("declare const AGENT:")

    // Has classes
    expect(output).resolves.toContain("declare interface LLEvents")
    expect(output).resolves.toContain("declare interface LLTimers")
  })
})
