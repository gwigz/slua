import { describe, it, expect } from "bun:test"
import { generate } from "../index"
import { resolve } from "path"

const REFS_DIR = resolve(import.meta.dir, "../../../../refs/lsl-definitions")

describe("generate", () => {
  it("generates valid .d.ts from real YAML files", () => {
    const output = generate(
      resolve(REFS_DIR, "slua_definitions.yaml"),
      resolve(REFS_DIR, "lsl_definitions.yaml"),
    )

    // Has header
    expect(output).toContain("Auto-generated")
    expect(output).toContain("@typescript-to-lua/language-extensions")

    // Has base types (PascalCase classes with constructors)
    expect(output).toContain("declare class Vector")
    expect(output).toContain("declare class Quaternion")
    expect(output).toContain("declare class UUID")
    expect(output).toContain("declare type vector = Vector")
    expect(output).toContain("declare type quaternion = Quaternion")
    expect(output).toContain("declare type uuid = UUID")

    // Has PascalCase namespaces merged with classes
    expect(output).toContain("declare namespace Vector")
    expect(output).toContain("function create(")

    // Has ll namespace
    expect(output).toContain("declare namespace ll")
    expect(output).toContain("function Say(")
    expect(output).toContain("function GetOwner(")

    // Has type aliases
    expect(output).toContain("type rotation = quaternion")

    // Has global functions
    expect(output).toContain("function touuid(")
    expect(output).toContain("function tovector(")

    // Has builtin functions
    expect(output).toContain("function print(")
    expect(output).toContain("function assert")
    expect(output).toContain("function pairs")

    // Has modules
    expect(output).toContain("declare namespace math")
    expect(output).toContain("declare namespace string")
    expect(output).toContain("declare namespace table")
    expect(output).toContain("declare namespace bit32")

    // Has constants
    expect(output).toContain("declare const AGENT:")

    // Has classes
    expect(output).toContain("declare interface LLEvents")
    expect(output).toContain("declare interface LLTimers")
  }, 30_000) // ts-morph uses the full TypeScript compiler API (~10s for large inputs)
})
