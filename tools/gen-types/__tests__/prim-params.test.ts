import { describe, test, expect } from "bun:test"

import { checkCompiles } from "./check-compiles"

describe("ParsePrimParams type validation", () => {
  test("VALID: PRIM_NAME with string arg", () => {
    const { success, output } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, "hello"]);`,
    )

    if (!success) {
      console.log(output)
    }

    expect(success).toBe(true)
  })

  test("INVALID: PRIM_NAME with number arg (should fail)", () => {
    const { success } = checkCompiles(`ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, 42]);`)

    expect(success).toBe(false)
  })

  test("VALID: multiple params [PRIM_NAME, string, PRIM_PHYSICS, boolean]", () => {
    const { success, output } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, "test", PRIM_PHYSICS, true]);`,
    )

    if (!success) {
      console.log(output)
    }

    expect(success).toBe(true)
  })

  test("VALID: PRIM_TEXTURE with all 5 args", () => {
    const { success, output } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_TEXTURE, 0, "texture-uuid", new Vector(1, 1, 0), new Vector(0, 0, 0), 0.0]);`,
    )

    if (!success) {
      console.log(output)
    }

    expect(success).toBe(true)
  })

  test("INVALID: PRIM_TEXTURE with missing args", () => {
    const { success } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_TEXTURE, 0, "texture-uuid"]);`,
    )

    expect(success).toBe(false)
  })

  test("VALID: empty params []", () => {
    const { success, output } = checkCompiles(`ll.SetLinkPrimitiveParamsFast(0, []);`)

    if (!success) {
      console.log(output)
    }

    expect(success).toBe(true)
  })

  test("VALID: PRIM_NAME with string using as const", () => {
    const { success, output } = checkCompiles(
      `ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, "hello"] as const);`,
    )

    if (!success) {
      console.log(output)
    }

    expect(success).toBe(true)
  })

  test("INVALID: PRIM_NAME with number using as const (should fail)", () => {
    const { success } = checkCompiles(`ll.SetLinkPrimitiveParamsFast(0, [PRIM_NAME, 42] as const);`)

    expect(success).toBe(false)
  })
})
