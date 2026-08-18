import { describe, expect, it } from "bun:test"
import {
  descriptionMatches,
  displayName,
  eachPrim,
  ensurePublished,
  findItem,
  isUuid,
  type ObjectSelector,
  parseObjectRef,
  parseObjectSelector,
  resolveItem,
  withStaleRetry,
} from "./addressing"
import type { ViewerClient } from "./client"
import { RpcError } from "./protocol/errors"
import type { ObjectInventoryItem, PublishedObject } from "./protocol/types"

const ROOT_ID = "aaaaaaaa-0000-0000-0000-000000000001"
const CHILD_ID = "bbbbbbbb-0000-0000-0000-000000000002"
const MAIN_ID = "cccccccc-0000-0000-0000-000000000003"
const CHILD_ITEM_ID = "dddddddd-0000-0000-0000-000000000004"

const script = (itemId: string, name: string, subtype = 1): ObjectInventoryItem => ({
  itemId,
  name,
  type: "script",
  subtype,
  running: true,
})

const object: PublishedObject = {
  objectId: ROOT_ID,
  objectName: "Test Object",
  inventory: [
    script(MAIN_ID, "Main"),
    { itemId: "e".repeat(8) + "-0000-0000-0000-000000000005", name: "Notes", type: "notecard" },
  ],
  linkedObjects: [
    {
      linkId: CHILD_ID,
      linkNumber: 2,
      linkName: "Panel",
      inventory: [script(CHILD_ITEM_ID, "Child")],
    },
  ],
}

const byId = (value: string): ObjectSelector => ({ kind: "id", value })
const byName = (value: string): ObjectSelector => ({ kind: "name", value })

describe("isUuid", () => {
  it("accepts a canonical uuid and rejects a name", () => {
    expect(isUuid(ROOT_ID)).toBe(true)
    expect(isUuid("Test Object")).toBe(false)
  })
})

describe("descriptionMatches", () => {
  it("matches a key sitting alongside other text", () => {
    expect(descriptionMatches("slua:main", "slua:main")).toBe(true)
    expect(descriptionMatches("rezzer slua:main v2", "slua:main")).toBe(true)
  })

  it("does not let a key match a longer one it prefixes", () => {
    // `link main` and `link main-menu` would otherwise share a prim.
    expect(descriptionMatches("slua:main-menu", "slua:main")).toBe(false)
    expect(descriptionMatches("slua:mainframe stuff", "slua:main")).toBe(false)
  })

  it("still matches a key containing spaces", () => {
    expect(descriptionMatches("prefix my key suffix", "my key")).toBe(true)
    expect(descriptionMatches("prefix my keys suffix", "my key")).toBe(false)
  })

  it("never matches an empty key", () => {
    expect(descriptionMatches("anything", "")).toBe(false)
  })
})

describe("parseObjectRef", () => {
  it("parses object and item", () => {
    expect(parseObjectRef("Test Object/Main")).toEqual({
      object: byName("Test Object"),
      item: "Main",
    })
  })

  it("parses a linked prim segment", () => {
    expect(parseObjectRef("Obj/Panel/Child")).toEqual({
      object: byName("Obj"),
      link: "Panel",
      item: "Child",
    })
  })

  it("rejects a ref with no item", () => {
    expect(() => parseObjectRef("Obj")).toThrow()
  })
})

describe("displayName", () => {
  it("adds the synthetic extension the viewer shows, which is not part of the name", () => {
    expect(displayName(script(MAIN_ID, "Main", 1))).toBe("Main.luau")
    expect(displayName(script(MAIN_ID, "Main", 0))).toBe("Main.lsl")
  })

  it("leaves notecards alone", () => {
    expect(displayName({ itemId: MAIN_ID, name: "Notes", type: "notecard" })).toBe("Notes")
  })
})

describe("eachPrim", () => {
  it("addresses root items by objectId and child items by linkId", () => {
    expect(eachPrim(object).map((prim) => prim.primId)).toEqual([ROOT_ID, CHILD_ID])
  })
})

describe("findItem", () => {
  it("finds a root item by name", () => {
    const found = findItem(object, { object: byId(ROOT_ID), item: "Main" })

    expect(found.primId).toBe(ROOT_ID)
    expect(found.itemId).toBe(MAIN_ID)
  })

  it("accepts the display name with its extension", () => {
    expect(findItem(object, { object: byId(ROOT_ID), item: "Main.luau" }).itemId).toBe(MAIN_ID)
  })

  it("finds an item by uuid", () => {
    expect(findItem(object, { object: byId(ROOT_ID), item: MAIN_ID }).itemId).toBe(MAIN_ID)
  })

  it("uses the linkId as primId for a child prim item", () => {
    const found = findItem(object, { object: byId(ROOT_ID), link: "Panel", item: "Child" })

    expect(found.primId).toBe(CHILD_ID)
    expect(found.itemId).toBe(CHILD_ITEM_ID)
  })

  it("searches child prims when no link is given", () => {
    expect(findItem(object, { object: byId(ROOT_ID), item: "Child" }).primId).toBe(CHILD_ID)
  })

  it("reports a missing item", () => {
    expect(() => findItem(object, { object: byId(ROOT_ID), item: "Nope" })).toThrow(
      /no item "Nope"/,
    )
  })

  it("reports a missing linked prim", () => {
    expect(() => findItem(object, { object: byId(ROOT_ID), link: "Nope", item: "Child" })).toThrow(
      /no linked prim/,
    )
  })
})

describe("ensurePublished", () => {
  it("returns an already-published object without asking the viewer", async () => {
    let requested = false

    const client = {
      objectList: async () => ({ objects: [object] }),
      objectRequest: async () => {
        requested = true

        return {}
      },
      on: () => () => {},
    } as unknown as ViewerClient

    expect((await ensurePublished(client, byName("Test Object"))).objectId).toBe(ROOT_ID)
    expect(requested).toBe(false)
  })

  it("uses the object a newer viewer returns inline", async () => {
    const client = {
      objectList: async () => ({ objects: [] }),
      objectRequest: async () => ({ object }),
      on: () => () => {},
    } as unknown as ViewerClient

    expect((await ensurePublished(client, byId(ROOT_ID))).objectName).toBe("Test Object")
  })

  it("stops waiting for object.publish once the inline answer arrives", async () => {
    // Otherwise the pending timeout keeps the process alive after the command.
    let unsubscribed = false

    const client = {
      objectList: async () => ({ objects: [] }),
      objectRequest: async () => ({ object }),
      on: () => () => {
        unsubscribed = true
      },
    } as unknown as ViewerClient

    await ensurePublished(client, byId(ROOT_ID))

    expect(unsubscribed).toBe(true)
  })

  it("stops waiting when the viewer refuses", async () => {
    let unsubscribed = false

    const client = {
      objectList: async () => ({ objects: [] }),
      objectRequest: async () => ({ success: false, message: "nope" }),
      on: () => () => {
        unsubscribed = true
      },
    } as unknown as ViewerClient

    await ensurePublished(client, byId(ROOT_ID)).catch(() => {})

    expect(unsubscribed).toBe(true)
  })

  it("falls back to the object.publish notification an older viewer sends", async () => {
    let publish: ((message: unknown) => void) | undefined

    const client = {
      objectList: async () => ({ objects: [] }),
      objectRequest: async () => {
        // The viewer acknowledges, then publishes asynchronously.
        setTimeout(() => publish?.({ object }), 1)

        return { success: true }
      },
      on: (_event: string, handler: (message: unknown) => void) => {
        publish = handler

        return () => {}
      },
    } as unknown as ViewerClient

    expect((await ensurePublished(client, byId(ROOT_ID))).objectId).toBe(ROOT_ID)
  })

  it("explains how an unpublished object gets published", async () => {
    const client = {
      objectList: async () => ({ objects: [] }),
      on: () => () => {},
    } as unknown as ViewerClient

    await expect(ensurePublished(client, byName("Unknown"))).rejects.toThrow(/Explore in IDE/)
  })

  it("surfaces a refusal from the viewer", async () => {
    const client = {
      objectList: async () => ({ objects: [] }),
      objectRequest: async () => ({ success: false, message: "permission denied" }),
      on: () => () => {},
    } as unknown as ViewerClient

    await expect(ensurePublished(client, byId(ROOT_ID))).rejects.toThrow(/permission denied/)
  })
})

describe("ensurePublished with --wait", () => {
  it("waits for the viewer to publish a name match", async () => {
    let publish: ((message: unknown) => void) | undefined

    const client = {
      objectList: async () => ({ objects: [] }),
      on: (_event: string, handler: (message: unknown) => void) => {
        publish = handler

        return () => {}
      },
    } as unknown as ViewerClient

    const waiting = ensurePublished(client, byName("Test Object"), { waitMs: 1_000 })

    // The viewer publishes only once someone presses its button, which is the
    // whole reason the connection stays open.
    setTimeout(() => publish?.({ object }), 1)

    expect((await waiting).objectId).toBe(ROOT_ID)
  })

  it("ignores a publish for some other object", async () => {
    let publish: ((message: unknown) => void) | undefined

    const client = {
      objectList: async () => ({ objects: [] }),
      on: (_event: string, handler: (message: unknown) => void) => {
        publish = handler

        return () => {}
      },
    } as unknown as ViewerClient

    const waiting = ensurePublished(client, byName("Wanted"), { waitMs: 20 })

    setTimeout(() => publish?.({ object }), 1)

    await expect(waiting).rejects.toThrow(/did not publish/)
  })

  it("says what it is waiting for", async () => {
    const notes: string[] = []

    const client = {
      objectList: async () => ({ objects: [] }),
      on: () => () => {},
    } as unknown as ViewerClient

    await expect(
      ensurePublished(client, byName("Wanted"), {
        waitMs: 10,
        onWait: (message) => notes.push(message),
      }),
    ).rejects.toThrow()

    expect(notes).toEqual(["waiting for name:Wanted"])
  })
})

describe("resolveItem", () => {
  it("retries a listing that is briefly stale after a save", async () => {
    // The viewer drops the object, then the item, from object.list for a
    // moment after a content save; both settle within a couple of reads.
    const listings = [[], [{ ...object, inventory: [] }], [object]]

    let calls = 0

    const client = {
      objectList: async () => ({ objects: listings[Math.min(calls++, listings.length - 1)] }),
      on: () => () => {},
    } as unknown as ViewerClient

    const resolved = await resolveItem(client, { object: byName("Test Object"), item: "Main" })

    expect(resolved.itemId).toBe(MAIN_ID)
    expect(calls).toBe(3)
  })

  it("gives up on an item that never appears", async () => {
    const client = {
      objectList: async () => ({ objects: [object] }),
      on: () => () => {},
    } as unknown as ViewerClient

    await expect(
      resolveItem(client, { object: byName("Test Object"), item: "Nope" }),
    ).rejects.toThrow(/no item "Nope"/)
  })
})

// What the viewer answers for a beat after a save, though the item is there
// and its id has not changed.
const stale = () =>
  new RpcError({ code: -32602, message: "Invalid params: Item not found in prim inventory" })

describe("withStaleRetry", () => {
  it("retries the whole lookup and call, not just the call", async () => {
    let calls = 0

    const result = await withStaleRetry(async () => {
      if (++calls < 3) throw stale()

      return "saved"
    })

    expect(result).toBe("saved")
    expect(calls).toBe(3)
  })

  it("gives up rather than retrying forever", async () => {
    let calls = 0

    await expect(
      withStaleRetry(async () => {
        calls++

        throw stale()
      }),
    ).rejects.toThrow(/prim inventory/)

    expect(calls).toBe(4)
  })

  it("passes any other failure straight through", async () => {
    let calls = 0

    await expect(
      withStaleRetry(async () => {
        calls++

        throw new RpcError({ code: -32602, message: "Invalid params: bad vm" })
      }),
    ).rejects.toThrow(/bad vm/)

    expect(calls).toBe(1)
  })
})

describe("parseObjectSelector", () => {
  it("treats a bare uuid as an id", () => {
    expect(parseObjectSelector(ROOT_ID)).toEqual({ kind: "id", value: ROOT_ID })
  })

  it("treats any other bare value as a name", () => {
    expect(parseObjectSelector("Test Object")).toEqual({ kind: "name", value: "Test Object" })
  })

  it("understands explicit prefixes", () => {
    expect(parseObjectSelector("desc:slua:my-project")).toEqual({
      kind: "description",
      value: "slua:my-project",
    })
    expect(parseObjectSelector("name:4f2b")).toEqual({ kind: "name", value: "4f2b" })
    expect(parseObjectSelector(`id:${ROOT_ID}`)).toEqual({ kind: "id", value: ROOT_ID })
  })

  it("rejects a prefix with nothing after it", () => {
    expect(() => parseObjectSelector("desc:")).toThrow()
  })
})

describe("ensurePublished by description", () => {
  it("matches an object whose description carries the key", async () => {
    const tagged = { ...object, objectDescription: "my rezzer slua:my-project" }
    const client = {
      objectList: async () => ({ objects: [tagged] }),
      on: () => () => {},
    } as unknown as ViewerClient

    const found = await ensurePublished(client, { kind: "description", value: "slua:my-project" })

    expect(found.objectId).toBe(ROOT_ID)
  })

  it("cannot ask the viewer to publish a description match", async () => {
    const client = {
      objectList: async () => ({ objects: [] }),
      on: () => () => {},
    } as unknown as ViewerClient

    await expect(
      ensurePublished(client, { kind: "description", value: "slua:nope" }),
    ).rejects.toThrow(/Explore in IDE/)
  })
})
