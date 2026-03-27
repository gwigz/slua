import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test"
import { setup, teardown, emit, tick, setCoroutineYieldValue } from "../testing"
import {
  spawn,
  waitFor,
  sleep,
  requestAgentData,
  requestDisplayName,
  requestSimulatorData,
  requestInventoryData,
  readNotecardLine,
  readNotecard,
  findNotecardTextCount,
  kvRead,
  kvCreate,
  kvUpdate,
  kvDelete,
  kvSize,
  dialog,
  textBox,
  httpRequest,
  requestPermissions,
  transferMoney,
  sensor,
} from "."

const g = globalThis as any

beforeEach(() => setup())
afterEach(() => teardown())

// ---------------------------------------------------------------------------
// Core runtime
// ---------------------------------------------------------------------------

describe("spawn", () => {
  it("creates a coroutine and resumes it", () => {
    const createSpy = spyOn(g.coroutine, "create")
    const resumeSpy = spyOn(g.coroutine, "resume")

    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const fn = () => {}

    spawn(fn)

    expect(createSpy).toHaveBeenCalledWith(fn)
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })

  it("returns the coroutine thread", () => {
    const result = spawn(() => {})
    expect(result).toBeDefined()
  })
})

describe("waitFor", () => {
  it("registers a handler for the given event", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue(["arg1", "arg2"])
    waitFor("listen")

    expect(g.LLEvents.handlers("listen").length).toBeGreaterThanOrEqual(1)
  })

  it("handler filters by predicate when provided", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([1, "name", "id", "text"])
    waitFor("listen", (ch: number) => ch === 42)

    // Simulate non-matching event
    emit("listen", 1, "name", "id", "wrong")
    expect(resumeSpy).not.toHaveBeenCalled()

    // Simulate matching event
    emit("listen", 42, "name", "id", "right")
    expect(resumeSpy).toHaveBeenCalled()
  })

  it("removes handler after match", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue(["data"])
    waitFor("dataserver")

    emit("dataserver", "req-1", "data-1")
    expect(resumeSpy).toHaveBeenCalledTimes(1)

    // Second emit should not trigger again since handler was removed
    emit("dataserver", "req-2", "data-2")
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })
})

describe("sleep", () => {
  it("registers a timer and yields", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    const yieldSpy = spyOn(g.coroutine, "yield")
    const resumeSpy = spyOn(g.coroutine, "resume")

    sleep(5)

    expect(yieldSpy).toHaveBeenCalled()

    // Fire pending timers
    tick()
    expect(resumeSpy).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Dataserver wrappers
// ---------------------------------------------------------------------------

describe("requestAgentData", () => {
  it("registers dataserver handler and yields", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("Agent Name")
    const result = requestAgentData("avatar-id", 3)

    expect(result).toBe("Agent Name")
    expect(g.LLEvents.handlers("dataserver").length).toBeGreaterThanOrEqual(1)
  })

  it("handler filters by request ID", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    // Override ll.RequestAgentData to return a known ID
    g.ll.RequestAgentData = () => "req-123"

    setCoroutineYieldValue("data")
    requestAgentData("avatar-id", 3)

    // Non-matching request ID
    emit("dataserver", "req-999", "wrong data")
    expect(resumeSpy).not.toHaveBeenCalled()

    // Matching request ID
    emit("dataserver", "req-123", "Agent Name")
    expect(resumeSpy).toHaveBeenCalledWith(co, "Agent Name")
  })

  it("removes handler after matching", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.ll.RequestAgentData = () => "req-123"

    setCoroutineYieldValue("data")
    requestAgentData("avatar-id", 3)

    emit("dataserver", "req-123", "first")
    emit("dataserver", "req-123", "second")
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })
})

describe("requestDisplayName", () => {
  it("yields and returns display name", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("Display Name")
    const result = requestDisplayName("avatar-id")

    expect(result).toBe("Display Name")
  })
})

describe("requestSimulatorData", () => {
  it("yields and returns simulator data", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("sim data")
    const result = requestSimulatorData("Region Name", 5)

    expect(result).toBe("sim data")
  })
})

describe("requestInventoryData", () => {
  it("yields and returns inventory data", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("inv data")
    const result = requestInventoryData("item-name")

    expect(result).toBe("inv data")
  })
})

describe("readNotecardLine", () => {
  it("yields and returns notecard line", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("line content")
    const result = readNotecardLine("notecard.txt", 3)

    expect(result).toBe("line content")
  })
})

describe("readNotecard", () => {
  it("reads lines until EOF", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    let callCount = 0
    const lines = ["line 1", "line 2", "line 3"]

    spyOn(g.coroutine, "yield").mockImplementation(() => {
      if (callCount < lines.length) {
        return lines[callCount++]
      }
      return EOF
    })

    const result = readNotecard("notecard.txt")
    expect(result).toEqual(["line 1", "line 2", "line 3"])
  })

  it("returns empty array for empty notecard", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    spyOn(g.coroutine, "yield").mockReturnValue(EOF)

    const result = readNotecard("empty.txt")
    expect(result).toEqual([])
  })
})

describe("findNotecardTextCount", () => {
  it("yields and returns count", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("5")
    const result = findNotecardTextCount("notecard.txt", "pattern", [])

    expect(result).toBe("5")
  })
})

// ---------------------------------------------------------------------------
// KV store wrappers
// ---------------------------------------------------------------------------

describe("kvRead", () => {
  it("parses successful response", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("1,hello world")
    const result = kvRead("mykey")

    expect(result).toEqual({ ok: true, value: "hello world" })
  })

  it("parses failed response", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("0,key not found")
    const result = kvRead("missing")

    expect(result).toEqual({ ok: false, value: "key not found" })
  })

  it("handles values containing commas", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("1,value,with,commas")
    const result = kvRead("mykey")

    expect(result).toEqual({ ok: true, value: "value,with,commas" })
  })
})

describe("kvCreate", () => {
  it("returns true on success", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("1,")
    expect(kvCreate("key", "value")).toBe(true)
  })

  it("returns false on failure", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("0,key already exists")
    expect(kvCreate("key", "value")).toBe(false)
  })
})

describe("kvUpdate", () => {
  it("returns true on success", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("1,")
    expect(kvUpdate("key", "value")).toBe(true)
  })

  it("passes checked=0 and original=empty to ll.UpdateKeyValue", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    const calls: any[][] = []
    g.ll.UpdateKeyValue = (...args: any[]) => {
      calls.push(args)
      return "req-kv"
    }

    setCoroutineYieldValue("1,")
    kvUpdate("key", "new-value")

    expect(calls[0]).toEqual(["key", "new-value", 0, ""])
  })
})

describe("kvDelete", () => {
  it("returns true on success", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("1,")
    expect(kvDelete("key")).toBe(true)
  })

  it("returns false on failure", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("0,key not found")
    expect(kvDelete("key")).toBe(false)
  })
})

describe("kvSize", () => {
  it("parses used and total from response", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue("1024,65536")
    const result = kvSize()

    expect(result).toEqual({ used: 1024, total: 65536 })
  })
})

// ---------------------------------------------------------------------------
// Dialog & TextBox
// ---------------------------------------------------------------------------

describe("dialog", () => {
  it("opens listen on the given channel", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    let listenChannel: number | undefined

    g.ll.Listen = (ch: number) => {
      listenChannel = ch
      return 42
    }

    setCoroutineYieldValue("Yes")
    dialog(-99001, "avatar-id", "Choose:", ["Yes", "No"])

    expect(listenChannel).toBe(-99001)
  })

  it("cleans up listener after response", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")
    let removedHandle: number | undefined

    g.ll.Listen = () => 42
    g.ll.ListenRemove = (h: number) => {
      removedHandle = h
    }

    setCoroutineYieldValue("Yes")
    dialog(-99001, "avatar-id", "Choose:", ["Yes", "No"])

    emit("listen", -99001, "Avatar", "avatar-id", "Yes")

    expect(removedHandle).toBe(42)
    expect(resumeSpy).toHaveBeenCalledWith(co, "Yes")
  })

  it("ignores listen events on wrong channel", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.ll.Listen = () => 42

    setCoroutineYieldValue("Yes")
    dialog(-99001, "avatar-id", "Choose:", ["Yes", "No"])

    emit("listen", -99002, "Avatar", "avatar-id", "Wrong")
    expect(resumeSpy).not.toHaveBeenCalled()
  })
})

describe("textBox", () => {
  it("opens listen on the given channel and returns input", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    let listenChannel: number | undefined

    g.ll.Listen = (ch: number) => {
      listenChannel = ch
      return 42
    }

    setCoroutineYieldValue("User input")
    const result = textBox(-99001, "avatar-id", "Enter text:")

    expect(listenChannel).toBe(-99001)
    expect(result).toBe("User input")
  })
})

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

describe("httpRequest", () => {
  it("yields and returns response object", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue({ status: 200, metadata: [], body: "OK" })
    const result = httpRequest("https://example.com", [], "")

    expect(result).toEqual({ status: 200, metadata: [], body: "OK" })
  })

  it("handler filters by request ID", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.ll.HTTPRequest = () => "req-http"

    setCoroutineYieldValue({ status: 200, metadata: [], body: "OK" })
    httpRequest("https://example.com", [], "")

    // Non-matching request
    emit("http_response", "req-other", 404, [], "Not found")
    expect(resumeSpy).not.toHaveBeenCalled()

    // Matching request
    emit("http_response", "req-http", 200, [], "OK")
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

describe("requestPermissions", () => {
  it("yields and returns permission flags", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue(0x2004)
    const result = requestPermissions("avatar-id", 0x2004)

    expect(result).toBe(0x2004)
  })

  it("handler resumes with flags and removes itself", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue(0x04)
    requestPermissions("avatar-id", 0x04)

    emit("run_time_permissions", 0x04)
    expect(resumeSpy).toHaveBeenCalledWith(co, 0x04)

    emit("run_time_permissions", 0x04)
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })
})

describe("transferMoney", () => {
  it("yields and returns result object", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue({ success: true, message: "Transfer complete" })
    const result = transferMoney("avatar-id", 100)

    expect(result).toEqual({ success: true, message: "Transfer complete" })
  })

  it("handler packs result with success based on successInt", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.ll.TransferLindenDollars = () => "req-tx"

    setCoroutineYieldValue({ success: false, message: "Insufficient funds" })
    transferMoney("avatar-id", 100)

    // Simulate transaction result with failure
    emit("transaction_result", "req-tx", 0, "Insufficient funds")
    expect(resumeSpy).toHaveBeenCalledWith(co, {
      success: false,
      message: "Insufficient funds",
    })
  })
})

// ---------------------------------------------------------------------------
// Sensor
// ---------------------------------------------------------------------------

describe("sensor", () => {
  it("returns detected objects on sensor event", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    const mockDetected = [{ index: 0, valid: true }] as any
    setCoroutineYieldValue(mockDetected)
    const result = sensor("", NULL_KEY, 1, 20.0, 3.14)

    expect(result).toEqual(mockDetected)
  })

  it("returns null on no_sensor", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue(undefined)
    const result = sensor("", NULL_KEY, 1, 20.0, 3.14)

    expect(result).toBeNull()
  })

  it("sensor handler removes both handlers", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([{ index: 0 }])
    sensor("", NULL_KEY, 1, 20.0, 3.14)

    const mockDetected = [{ index: 0, valid: true }] as any
    emit("sensor", mockDetected)
    expect(resumeSpy).toHaveBeenCalledTimes(1)

    // no_sensor after sensor should not trigger again
    emit("no_sensor")
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })

  it("no_sensor handler removes both handlers", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue(undefined)
    sensor("", NULL_KEY, 1, 20.0, 3.14)

    emit("no_sensor")
    expect(resumeSpy).toHaveBeenCalledTimes(1)

    // sensor after no_sensor should not trigger again
    emit("sensor", [{ index: 0 }])
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })
})
