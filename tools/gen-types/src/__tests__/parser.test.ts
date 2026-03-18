import { describe, it, expect } from "bun:test"
import { readFileSync } from "fs"
import { resolve } from "path"
import { parseSluaDefinitions, parseLslDefinitions } from "../parser.js"

const REFS_DIR = resolve(import.meta.dir, "../../../../refs/lsl-definitions")

describe("parseSLuaDefinitions", () => {
  const yamlContent = readFileSync(resolve(REFS_DIR, "slua_definitions.yaml"), "utf-8")
  const defs = parseSluaDefinitions(yamlContent)

  it("parses the version", () => {
    expect(defs.version).toBe("1.0.0")
  })

  it("parses baseClasses with correct count", () => {
    expect(defs.baseClasses).toHaveLength(4)
  })

  it("has quaternion as the first base class", () => {
    expect(defs.baseClasses[0].name).toBe("quaternion")
  })

  it("has vector as the third base class", () => {
    expect(defs.baseClasses[2].name).toBe("vector")
  })

  it("vector has properties x, y, z", () => {
    const vector = defs.baseClasses.find((c) => c.name === "vector")!
    const propNames = vector.properties.map((p) => p.name)

    expect(propNames).toContain("x")
    expect(propNames).toContain("y")
    expect(propNames).toContain("z")
  })

  it("has globalFunctions", () => {
    expect(defs.globalFunctions.length).toBeGreaterThan(0)
  })

  it("has modules", () => {
    expect(defs.modules.length).toBeGreaterThan(0)
  })

  it("has a vector module with create function and zero constant", () => {
    const vectorModule = defs.modules.find((m) => m.name === "vector")

    expect(vectorModule).toBeDefined()

    const createFn = vectorModule!.functions?.find((f) => f.name === "create")

    expect(createFn).toBeDefined()

    const zeroConst = vectorModule!.constants?.find((c) => c.name === "zero")

    expect(zeroConst).toBeDefined()
  })

  it("has typeAliases", () => {
    expect(defs.typeAliases.length).toBeGreaterThan(0)
  })

  it("has builtinTypes", () => {
    expect(Object.keys(defs.builtinTypes).length).toBeGreaterThan(0)
  })
})

describe("parseLSLDefinitions", () => {
  const yamlContent = readFileSync(resolve(REFS_DIR, "lsl_definitions.yaml"), "utf-8")
  const defs = parseLslDefinitions(yamlContent)

  it("parses constants", () => {
    expect(Object.keys(defs.constants).length).toBeGreaterThan(0)
  })

  it("parses functions", () => {
    expect(Object.keys(defs.functions).length).toBeGreaterThan(0)
  })

  it("has llSay function", () => {
    expect(defs.functions["llSay"]).toBeDefined()
  })

  it("llSay has arguments", () => {
    const llSay = defs.functions["llSay"]

    expect(llSay.arguments).toBeDefined()
    expect(llSay.arguments!.length).toBeGreaterThan(0)
  })

  it("parses events", () => {
    expect(Object.keys(defs.events).length).toBeGreaterThan(0)
  })
})
