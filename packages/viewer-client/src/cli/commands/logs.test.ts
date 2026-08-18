import { describe, expect, it } from "bun:test"
import { SourceMap } from "../../sourcemap"
import { mapRow, rowIn, runtimeLines, runtimeText } from "./logs"

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
    // The viewer currently sends the detail as a separate debug message, so
    // this would otherwise print as an object name and nothing else.
    expect(runtimeText({ ...event, error: "", line: 0 }, "error")).toMatch(/without text/)
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
