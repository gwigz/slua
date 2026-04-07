import { describe, it, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { transpileFull as transpile, initFull } from "./helpers"

const TYPES_PATH = resolve(import.meta.dir, "../../../../packages/types/index.d.ts")

const LANG_EXT_PATH = resolve(
  import.meta.dir,
  "../../../../node_modules/@typescript-to-lua/language-extensions/index.d.ts",
)

initFull(readFileSync(TYPES_PATH, "utf-8"), readFileSync(LANG_EXT_PATH, "utf-8"))

describe("builder chain transform", () => {
  it("single method chain", () => {
    const lua = transpile(`
      $setPrimParams(LINK_THIS)
        .color(0, new Vector(1, 0, 0), 1)
    `)

    expect(lua).toContain("ll.SetLinkPrimitiveParamsFast")
    expect(lua).toContain("PRIM_COLOR")
  })

  it("multi-method chain emits constants in order", () => {
    const lua = transpile(`
      $setPrimParams(LINK_THIS)
        .color(0, new Vector(1, 0, 0), 1)
        .glow(0, 0.5)
    `)

    expect(lua).toContain("ll.SetLinkPrimitiveParamsFast")
    expect(lua).toContain("PRIM_COLOR")
    expect(lua).toContain("PRIM_GLOW")
    // PRIM_COLOR should come before PRIM_GLOW
    expect(lua.indexOf("PRIM_COLOR")).toBeLessThan(lua.indexOf("PRIM_GLOW"))
  })

  it(".link() callback flattens with PRIM_LINK_TARGET", () => {
    const lua = transpile(`
      $setPrimParams(LINK_THIS)
        .color(0, new Vector(1, 0, 0), 1)
        .link(2, link => link
          .glow(0, 0.5)
        )
    `)

    expect(lua).toContain("PRIM_COLOR")
    expect(lua).toContain("PRIM_LINK_TARGET")
    expect(lua).toContain("PRIM_GLOW")
    // Order: COLOR, LINK_TARGET, GLOW
    expect(lua.indexOf("PRIM_COLOR")).toBeLessThan(lua.indexOf("PRIM_LINK_TARGET"))
    expect(lua.indexOf("PRIM_LINK_TARGET")).toBeLessThan(lua.indexOf("PRIM_GLOW"))
  })

  it(".typeBox() sub-dispatch emits PRIM_TYPE + PRIM_TYPE_BOX", () => {
    const lua = transpile(`
      $setPrimParams(LINK_THIS)
        .typeBox(0, new Vector(0, 1, 0), 0, new Vector(0, 0, 0), new Vector(1, 1, 0), new Vector(0, 0, 0))
    `)

    expect(lua).toContain("PRIM_TYPE")
    expect(lua).toContain("PRIM_TYPE_BOX")
    expect(lua.indexOf("PRIM_TYPE,")).toBeLessThan(lua.indexOf("PRIM_TYPE_BOX"))
  })

  it("setCameraParams with no pre-list args", () => {
    const lua = transpile(`
      $setCameraParams()
        .distance(5)
        .active(true)
    `)

    expect(lua).toContain("ll.SetCameraParams")
    expect(lua).toContain("CAMERA_DISTANCE")
    expect(lua).toContain("CAMERA_ACTIVE")
  })

  it("particle system builder", () => {
    const lua = transpile(`
      $particleSystem()
        .partFlags(0)
        .srcPattern(1)
    `)

    expect(lua).toContain("ll.ParticleSystem")
    expect(lua).toContain("PSYS_PART_FLAGS")
    expect(lua).toContain("PSYS_SRC_PATTERN")
  })

  it("httpRequest with pre and post-list args (legacy fluent)", () => {
    // httpRequest fluent builder was replaced by options object,
    // but the underlying ll.HTTPRequest call still works via raw API
    const lua = transpile(`
      ll.HTTPRequest("https://example.com", [HTTP_METHOD, "POST"], "body")
    `)

    expect(lua).toContain("ll.HTTPRequest")
    expect(lua).toContain("HTTP_METHOD")
  })

  it("empty chain emits call with empty list", () => {
    const lua = transpile(`
      $particleSystem()
    `)

    // Should still emit the ll call with an empty table
    expect(lua).toContain("ll.ParticleSystem")
  })
})

describe("options-object transform", () => {
  it("basic options object", () => {
    const lua = transpile(`
      declare const start: Vector, end_: Vector
      const result = $castRay(start, end_, { rejectTypes: 1, maxHits: 4 })
    `)

    expect(lua).toContain("ll.CastRay")
    expect(lua).toContain("RC_REJECT_TYPES")
    expect(lua).toContain("RC_MAX_HITS")
    expect(lua).toContain("local result = ll.CastRay")
  })

  it("single property", () => {
    const lua = transpile(`
      declare const start: Vector, end_: Vector
      const result = $castRay(start, end_, { maxHits: 2 })
    `)

    expect(lua).toContain("ll.CastRay")
    expect(lua).toContain("RC_MAX_HITS")
    expect(lua).not.toContain("RC_REJECT_TYPES")
  })

  it("empty options", () => {
    const lua = transpile(`
      declare const start: Vector, end_: Vector
      const result = $castRay(start, end_, {})
    `)

    expect(lua).toContain("ll.CastRay")
  })

  it("httpRequest with options object", () => {
    const lua = transpile(`
      const id = $httpRequest("https://example.com", {
        method: "POST",
        mimetype: "application/json",
        body: "payload",
      })
    `)

    expect(lua).toContain("ll.HTTPRequest")
    expect(lua).toContain("HTTP_METHOD")
    expect(lua).toContain('"POST"')
    expect(lua).toContain("HTTP_MIMETYPE")
    expect(lua).toContain('"payload"')
    expect(lua).toContain("local id = ll.HTTPRequest")
  })

  it("httpRequest defaults body to empty string", () => {
    const lua = transpile(`
      const id = $httpRequest("https://example.com", {})
    `)

    expect(lua).toContain("ll.HTTPRequest")
    expect(lua).toContain('""')
  })

  it("dataFlags with constant", () => {
    const lua = transpile(`
      declare const start: Vector, end_: Vector
      const result = $castRay(start, end_, { dataFlags: RC_GET_NORMAL })
    `)

    expect(lua).toContain("RC_DATA_FLAGS")
    expect(lua).toContain("RC_GET_NORMAL")
  })
})
