import { describe, expect, it } from "bun:test"
import { SourceMap } from "../../sourcemap"
import {
  fromObject,
  mapRow,
  mapsFor,
  namesTarget,
  objectIds,
  rowIn,
  runtimeLines,
  runtimeText,
  sourceName,
  tagFor,
  wantedEvent,
  withUpdate,
} from "./logs"

// Generated line 1 -> source line 1, generated line 2 -> source line 3.
const map = SourceMap.parse(
  JSON.stringify({ version: 3, sources: ["../src/main.ts"], mappings: "AAAA;AAEA;" }),
  "/project/dist",
)!

const event = { scriptId: "", objectId: "id", objectName: "Object", message: "" }

describe("runtimeText", () => {
  it("prefers the message the viewer sent", () => {
    expect(runtimeText({ ...event, message: "hello" }, "debug")).toBe("hello")
  })

  it("falls back to the error field", () => {
    expect(runtimeText({ ...event, error: "boom", line: 0 }, "error")).toBe("boom")
  })

  it("says so when an error event carries no text at all", () => {
    // An older viewer sends the detail as a separate debug message, so this
    // would otherwise print as an object name and nothing else.
    expect(runtimeText({ ...event, error: "", line: 0 }, "error")).toMatch(/without text/)
  })

  it("names the column too, once the viewer reports one", () => {
    expect(runtimeText({ ...event, message: "boom", error: "", line: 4, column: 7 }, "error")).toBe(
      "boom (line 4, column 7)",
    )
  })

  it("keeps a column the text cannot carry, next to a line it already names", () => {
    expect(
      runtimeText(
        { ...event, message: "lua_script:4: boom", error: "", line: 4, column: 7 },
        "error",
      ),
    ).toBe("lua_script:4: boom (column 7)")
  })

  it("keeps a line number the text does not already carry", () => {
    expect(runtimeText({ ...event, message: "boom", error: "", line: 4 }, "error")).toBe(
      "boom (line 4)",
    )
    expect(
      runtimeText({ ...event, message: "lua_script:4: boom", error: "", line: 4 }, "error"),
    ).toBe("lua_script:4: boom")
  })
})

describe("mapRow", () => {
  it("maps a generated row back through every target that covers it", () => {
    expect(mapRow(2, [{ name: "main", map }])).toEqual([
      { target: "main", source: "/project/src/main.ts", line: 3 },
    ])
  })

  it("returns nothing for a row no map covers, or no row at all", () => {
    expect(mapRow(9, [{ name: "main", map }])).toEqual([])
    expect(mapRow(0, [{ name: "main", map }])).toEqual([])
  })
})

describe("rowIn", () => {
  it("reads the row from an error line and from a traceback frame", () => {
    expect(rowIn("lua_script:4: attempt to index nil with 'field'")).toBe(4)
    expect(rowIn("lua_script:4")).toBe(4)
    expect(rowIn('[string "Main"]:12: bad')).toBe(12)
  })

  it("ignores ordinary output that merely contains a colon and digits", () => {
    expect(rowIn("http:80 responded")).toBe(0)
    expect(rowIn("channel 5: hello")).toBe(0)
    expect(rowIn("plain output")).toBe(0)
  })
})

describe("runtimeLines", () => {
  // What the viewer actually sends: the error and its traceback arrive as one
  // multi-line debug message, not as separate events or a stack array.
  const crash = {
    scriptId: "",
    objectId: "id",
    objectName: "Object",
    message: "lua_script:2: attempt to index nil with 'field'\nlua_script:2\n",
  }

  it("splits the message and maps it once per distinct row", () => {
    const { lines, mapped } = runtimeLines(crash, "debug", [{ name: "main", map }])

    expect(lines).toEqual(["lua_script:2: attempt to index nil with 'field'", "lua_script:2"])
    expect(mapped).toEqual([{ target: "main", source: "/project/src/main.ts", line: 3 }])
  })

  it("falls back to the event's line when the text carries no position", () => {
    const { mapped } = runtimeLines(
      { ...crash, message: "something went wrong", error: "", line: 2 },
      "error",
      [{ name: "main", map }],
    )

    expect(mapped).toEqual([{ target: "main", source: "/project/src/main.ts", line: 3 }])
  })
})

describe("mapsFor", () => {
  const maps = [
    { name: "main", item: "Main", map },
    { name: "door", item: "Door", map },
  ]

  it("narrows to the target deploying the item the event names", () => {
    expect(mapsFor({ ...event, item: { rootId: "id", name: "Door" } }, maps)).toEqual([maps[1]!])
  })

  it("ignores case, since the viewer reports the item's own spelling", () => {
    expect(mapsFor({ ...event, item: { rootId: "id", name: "door" } }, maps)).toEqual([maps[1]!])
  })

  it("keeps every map when no target claims the item, or none is named", () => {
    expect(mapsFor({ ...event, item: { rootId: "id", name: "Other" } }, maps)).toEqual(maps)
    expect(mapsFor(event, maps)).toEqual(maps)
  })
})

describe("sourceName", () => {
  it("addresses the script the way the other commands do", () => {
    expect(sourceName({ ...event, item: { rootId: "id", name: "Main" } })).toBe("Object/Main")
  })

  it("falls back to the object alone, then to its id", () => {
    expect(sourceName(event)).toBe("Object")
    expect(sourceName({ ...event, objectName: "" })).toBe("id")
  })
})

describe("tagFor", () => {
  it("separates owner say from debug output", () => {
    expect(tagFor("debug", { ...event, channel: "owner_say" })).toContain("say")
    expect(tagFor("debug", { ...event, channel: "debug" })).toContain("debug")
    expect(tagFor("debug", event)).toContain("debug")
  })

  it("still calls an error an error, whichever channel carried it", () => {
    expect(tagFor("error", { ...event, channel: "owner_say" })).toContain("error")
  })
})

describe("objectIds", () => {
  const object = {
    objectId: "root",
    objectName: "Object",
    inventory: [],
    linkedObjects: [{ linkId: "child", linkNumber: 2, linkName: "Panel", inventory: [] }],
  }

  it("covers the root and every linked prim", () => {
    expect(objectIds(object)).toEqual(new Set(["root", "child"]))
  })

  it("grows with a prim linked after the listing", () => {
    const ids = withUpdate(objectIds(object), {
      objectId: "root",
      changes: {
        linkedObjects: {
          added: [{ linkId: "later", linkNumber: 3, linkName: "New", inventory: [] }],
        },
      },
    })

    expect(ids).toEqual(new Set(["root", "child", "later"]))
  })
})

describe("fromObject", () => {
  const ids = new Set(["root", "child"])

  it("matches the root a newer viewer reports", () => {
    expect(fromObject({ ...event, objectId: "root", primId: "child" }, ids)).toBe(true)
  })

  it("matches the speaking prim an older viewer reports alone", () => {
    expect(fromObject({ ...event, objectId: "child" }, ids)).toBe(true)
  })

  it("matches on the item reference when the ids do not", () => {
    expect(
      fromObject({ ...event, objectId: "other", item: { rootId: "root", name: "Main" } }, ids),
    ).toBe(true)
  })

  it("rejects another object's output", () => {
    expect(fromObject({ ...event, objectId: "elsewhere" }, ids)).toBe(false)
  })
})

describe("namesTarget", () => {
  const items = new Set(["main"])

  it("keeps output from an item a target deploys to, whatever its case", () => {
    expect(namesTarget({ ...event, item: { rootId: "id", name: "Main" } }, items)).toBe(true)
  })

  it("drops output from a script the config never mentions", () => {
    expect(namesTarget({ ...event, item: { rootId: "id", name: "Other" } }, items)).toBe(false)
  })

  it("keeps output a viewer sent without an item, which cannot be judged", () => {
    expect(namesTarget(event, items)).toBe(true)
  })
})

describe("wantedEvent", () => {
  const ids = new Set(["root", "child"])
  const items = new Set(["main"])

  it("keeps everything when no object and no target filter was asked for", () => {
    expect(wantedEvent({ ...event, objectId: "elsewhere" }, {}, undefined, items)).toBe(true)
  })

  it("holds output back until the named object resolves", () => {
    expect(
      wantedEvent({ ...event, objectId: "elsewhere" }, { object: "O" }, undefined, items),
    ).toBe(false)

    expect(wantedEvent({ ...event, objectId: "root" }, { object: "O" }, undefined, items)).toBe(
      false,
    )
  })

  it("filters on the object once it has resolved", () => {
    expect(wantedEvent({ ...event, objectId: "root" }, { object: "O" }, ids, items)).toBe(true)
    expect(wantedEvent({ ...event, objectId: "elsewhere" }, { object: "O" }, ids, items)).toBe(
      false,
    )
  })

  it("applies the target filter with no object named", () => {
    const command = { targets: true }

    expect(
      wantedEvent({ ...event, item: { rootId: "id", name: "Main" } }, command, undefined, items),
    ).toBe(true)

    expect(
      wantedEvent({ ...event, item: { rootId: "id", name: "Other" } }, command, undefined, items),
    ).toBe(false)
  })

  it("needs both filters to pass when both were asked for", () => {
    const command = { object: "O", targets: true }

    expect(
      wantedEvent(
        { ...event, objectId: "root", item: { rootId: "root", name: "Main" } },
        command,
        ids,
        items,
      ),
    ).toBe(true)

    expect(
      wantedEvent(
        { ...event, objectId: "root", item: { rootId: "root", name: "Other" } },
        command,
        ids,
        items,
      ),
    ).toBe(false)
  })
})
