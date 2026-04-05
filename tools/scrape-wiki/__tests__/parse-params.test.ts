import { describe, test, expect } from "bun:test"
import { parseUsageString } from "../src/parse-params.js"

describe("parseUsageString", () => {
  test("simple: [ PRIM_NAME, string name ]", () => {
    expect(parseUsageString("[ PRIM_NAME, string name ]")).toEqual([
      { type: "string", name: "name" },
    ])
  })

  test("multiple args: [ PRIM_COLOR, integer face, vector color, float alpha ]", () => {
    expect(parseUsageString("[ PRIM_COLOR, integer face, vector color, float alpha ]")).toEqual([
      { type: "integer", name: "face" },
      { type: "vector", name: "color" },
      { type: "float", name: "alpha" },
    ])
  })

  test("boolean: [ PRIM_PHYSICS, integer boolean ]", () => {
    expect(parseUsageString("[ PRIM_PHYSICS, integer boolean ]")).toEqual([
      { type: "boolean", name: "enabled" },
    ])
  })

  test("trailing comma: [ PRIM_LINK_TARGET, integer link_target, ]", () => {
    expect(parseUsageString("[ PRIM_LINK_TARGET, integer link_target, ]")).toEqual([
      { type: "integer", name: "link_target" },
    ])
  })

  test("missing commas: integer glossiness integer environment", () => {
    const result = parseUsageString(
      "[ PRIM_SPECULAR, integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color, integer glossiness integer environment ]",
    )
    expect(result).toContainEqual({ type: "integer", name: "glossiness" })
    expect(result).toContainEqual({ type: "integer", name: "environment" })
  })

  test("no args: [ PRIM_NAME ]", () => {
    expect(parseUsageString("[ PRIM_NAME ]")).toEqual([])
  })

  test("empty string", () => {
    expect(parseUsageString("")).toEqual([])
  })

  test("rotation type: [ FOO, rotation rot ]", () => {
    expect(parseUsageString("[ FOO, rotation rot ]")).toEqual([{ type: "rotation", name: "rot" }])
  })

  test("key type: [ FOO, key target ]", () => {
    expect(parseUsageString("[ FOO, key target ]")).toEqual([{ type: "key", name: "target" }])
  })
})
