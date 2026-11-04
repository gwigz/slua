import { describe, test, expect } from "bun:test"

import { checkCompiles } from "./check-compiles"

describe("ruleset dict types", () => {
  test("VALID: dicts and lists on ruleset functions", () => {
    const { success, output } = checkCompiles(`
      ll.HTTPRequest("https://example.com", { method: "POST", accept: ["application/json"], customHeader: { "X-Token": "abc" } }, "");
      ll.HTTPRequest("https://example.com", [HTTP_METHOD, "POST"], "");
      ll.SetCameraParams({ active: true, distance: 3, focusOffset: new Vector(0, 0, 1) });
      ll.ParticleSystem({ burstCount: 5, emissive: true, texture: "texture-uuid" });
      ll.SetKeyframedMotion([], { mode: KFM_LOOP, translation: true });
      ll.CreateCharacter({ desiredSpeed: 2, stayWithinParcel: true });
    `)

    if (!success) {
      console.log(output)
    }

    expect(success).toBe(true)
  })

  test("INVALID: unknown dict key (should fail)", () => {
    const { success } = checkCompiles(`ll.SetCameraParams({ actve: true });`)

    expect(success).toBe(false)
  })

  test("INVALID: wrong dict value type (should fail)", () => {
    const { success } = checkCompiles(`ll.HTTPRequest("https://example.com", { method: 1 }, "");`)

    expect(success).toBe(false)
  })
})

describe("llprim.ParamSetter types", () => {
  test("VALID: typed chain keeps the setter type", () => {
    const { success, output } = checkCompiles(`
      const setter: PrimParamSetterType = llprim.ParamSetter.new()
        .pos(new Vector(1, 2, 3))
        .color(ALL_SIDES, new Vector(1, 0, 0), 1)
        .gltfBaseColor(0, "", "", "", "", new Vector(1, 1, 1), "", "", "", "")
        .targetLink(2);
      setter.apply(LINK_THIS);
    `)

    if (!success) {
      console.log(output)
    }

    expect(success).toBe(true)
  })

  test("INVALID: wrong method argument type (should fail)", () => {
    const { success } = checkCompiles(`llprim.ParamSetter.new().pos(1);`)

    expect(success).toBe(false)
  })

  test("INVALID: unknown method (should fail)", () => {
    const { success } = checkCompiles(`llprim.ParamSetter.new().position(new Vector(1, 2, 3));`)

    expect(success).toBe(false)
  })
})
