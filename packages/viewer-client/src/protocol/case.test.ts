import { describe, expect, it } from "bun:test"
import { toCamel, toSnake } from "./case"

describe("toCamel", () => {
  it("converts keys through nested objects and arrays", () => {
    expect(
      toCamel({
        object_id: "4f2b",
        linked_objects: [{ link_id: "a", link_number: 2, inventory: [{ item_id: "b" }] }],
      }),
    ).toEqual({
      objectId: "4f2b",
      linkedObjects: [{ linkId: "a", linkNumber: 2, inventory: [{ itemId: "b" }] }],
    })
  })

  it("leaves values alone, however they are spelled", () => {
    // Only keys move. A description holding a key like `slua:my_project` has
    // to survive a round trip through the viewer untouched.
    expect(toCamel({ object_description: "slua:my_project" })).toEqual({
      objectDescription: "slua:my_project",
    })
  })

  it("leaves keys that are already camel or single word", () => {
    // Syntax dumps are keyed by LSL function names, which have no underscores.
    expect(toCamel({ llSay: { arguments: 2 }, running: true })).toEqual({
      llSay: { arguments: 2 },
      running: true,
    })
  })

  it("passes null and primitives straight through", () => {
    expect(toCamel(null)).toBeNull()
    expect(toCamel("a_b")).toBe("a_b")
    expect(toCamel({ a: null })).toEqual({ a: null })
  })
})

describe("toSnake", () => {
  it("is the inverse for protocol shapes", () => {
    const wire = { prim_id: "a", item_id: "b", can_save_back: true }

    expect(toSnake(toCamel(wire))).toEqual(wire)
  })

  it("rewrites camel keys it did not originate, which is the cost of a generic transform", () => {
    // Documented hazard: anything we send that is keyed by foreign camelCase
    // data, such as a command result, comes out re-spelled.
    expect(toSnake({ llSay: 1 })).toEqual({ ll_say: 1 })
  })
})
