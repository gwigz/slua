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
  fetch,
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

  it("with timeout, resumes with [true, args] on match", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([true, ["req-1", "data-1"]])
    waitFor("dataserver", undefined, 10)

    emit("dataserver", "req-1", "data-1")
    expect(resumeSpy).toHaveBeenCalledWith(co, true, ["req-1", "data-1"])
  })

  it("with timeout, resumes with [false, 'timeout'] on timeout", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([false, "timeout"])
    waitFor("dataserver", undefined, 10)

    tick()
    expect(resumeSpy).toHaveBeenCalledWith(co, false, "timeout")
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

    setCoroutineYieldValue([true, "Agent Name"])

    const result = requestAgentData("avatar-id" as unknown as UUID, 3, 10) as any

    expect(result).toEqual([true, "Agent Name"])
    expect(g.LLEvents.handlers("dataserver").length).toBeGreaterThanOrEqual(1)
  })

  it("handler filters by request ID", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    // Override ll.RequestAgentData to return a known ID
    g.ll.RequestAgentData = () => "req-123"

    setCoroutineYieldValue([true, "data"])
    requestAgentData("avatar-id" as unknown as UUID, 3, 10)

    // Non-matching request ID
    emit("dataserver", "req-999", "wrong data")
    expect(resumeSpy).not.toHaveBeenCalled()

    // Matching request ID
    emit("dataserver", "req-123", "Agent Name")
    expect(resumeSpy).toHaveBeenCalledWith(co, true, "Agent Name")
  })

  it("removes handler after matching", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.ll.RequestAgentData = () => "req-123"

    setCoroutineYieldValue([true, "data"])
    requestAgentData("avatar-id" as unknown as UUID, 3, 10)

    emit("dataserver", "req-123", "first")
    emit("dataserver", "req-123", "second")
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })

  it("resumes with [false, 'timeout'] on timeout", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([false, "timeout"])
    requestAgentData("avatar-id" as unknown as UUID, 3, 10)

    tick()
    expect(resumeSpy).toHaveBeenCalledWith(co, false, "timeout")
  })
})

describe("requestDisplayName", () => {
  it("yields and returns display name", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "Display Name"])
    const result = requestDisplayName("avatar-id" as unknown as UUID, 10) as any

    expect(result).toEqual([true, "Display Name"])
  })
})

describe("requestSimulatorData", () => {
  it("yields and returns simulator data", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "sim data"])
    const result = requestSimulatorData("Region Name", 5, 10) as any

    expect(result).toEqual([true, "sim data"])
  })
})

describe("requestInventoryData", () => {
  it("yields and returns inventory data", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "inv data"])
    const result = requestInventoryData("item-name", 10) as any

    expect(result).toEqual([true, "inv data"])
  })
})

describe("readNotecardLine", () => {
  it("yields and returns notecard line", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "line content"])
    const result = readNotecardLine("notecard.txt", 3, 10) as any

    expect(result).toEqual([true, "line content"])
  })
})

describe("readNotecard", () => {
  it("reads lines until EOF", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    let callCount = 0
    const lines = ["line 1", "line 2", "line 3"]

    spyOn(g.coroutine, "yield").mockImplementation(() => {
      if (callCount < lines.length) {
        return [true, lines[callCount++]]
      }
      return [true, EOF]
    })

    const result = readNotecard("notecard.txt", 10) as any
    expect(result).toEqual([true, ["line 1", "line 2", "line 3"]])
  })

  it("returns empty array for empty notecard", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    spyOn(g.coroutine, "yield").mockReturnValue([true, EOF])

    const result = readNotecard("empty.txt", 10) as any
    expect(result).toEqual([true, []])
  })

  it("returns [false, 'timeout'] on timeout", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    spyOn(g.coroutine, "yield").mockReturnValue([false, "timeout"])

    const result = readNotecard("notecard.txt", 10) as any
    expect(result).toEqual([false, "timeout"])
  })
})

describe("findNotecardTextCount", () => {
  it("yields and returns count", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "5"])
    const result = findNotecardTextCount("notecard.txt", "pattern", [], 10) as any

    expect(result).toEqual([true, "5"])
  })
})

// ---------------------------------------------------------------------------
// KV store wrappers
// ---------------------------------------------------------------------------

describe("kvRead", () => {
  it("parses successful response", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "1,hello world"])
    const result = kvRead("mykey", 10) as any

    expect(result).toEqual([true, { ok: true, value: "hello world" }])
  })

  it("parses failed response", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "0,key not found"])
    const result = kvRead("missing", 10) as any

    expect(result).toEqual([true, { ok: false, value: "key not found" }])
  })

  it("handles values containing commas", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "1,value,with,commas"])
    const result = kvRead("mykey", 10) as any

    expect(result).toEqual([true, { ok: true, value: "value,with,commas" }])
  })

  it("returns [false, 'timeout'] on timeout", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([false, "timeout"])
    const result = kvRead("mykey", 10) as any

    expect(result).toEqual([false, "timeout"])
  })
})

describe("kvCreate", () => {
  it("returns [true, true] on success", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "1,"])
    expect(kvCreate("key", "value", 10) as any).toEqual([true, true])
  })

  it("returns [true, false] on failure", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "0,key already exists"])
    expect(kvCreate("key", "value", 10) as any).toEqual([true, false])
  })
})

describe("kvUpdate", () => {
  it("returns [true, true] on success", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "1,"])
    expect(kvUpdate("key", "value", 10) as any).toEqual([true, true])
  })

  it("passes checked=false and original=empty to ll.UpdateKeyValue", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    const calls: any[][] = []
    g.ll.UpdateKeyValue = (...args: any[]) => {
      calls.push(args)
      return "req-kv"
    }

    setCoroutineYieldValue([true, "1,"])
    kvUpdate("key", "new-value", 10)

    expect(calls[0]).toEqual(["key", "new-value", false, ""])
  })
})

describe("kvDelete", () => {
  it("returns [true, true] on success", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "1,"])
    expect(kvDelete("key", 10) as any).toEqual([true, true])
  })

  it("returns [true, false] on failure", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "0,key not found"])
    expect(kvDelete("key", 10) as any).toEqual([true, false])
  })
})

describe("kvSize", () => {
  it("parses used and total from response", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, "1024,65536"])
    const result = kvSize(10) as any

    expect(result).toEqual([true, { used: 1024, total: 65536 }])
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

    setCoroutineYieldValue([true, "Yes"])
    dialog(-99001, "avatar-id" as unknown as UUID, "Choose:", ["Yes", "No"], 30)

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

    setCoroutineYieldValue([true, "Yes"])
    dialog(-99001, "avatar-id" as unknown as UUID, "Choose:", ["Yes", "No"], 30)

    emit("listen", -99001, "Avatar", "avatar-id", "Yes")

    expect(removedHandle).toBe(42)
    expect(resumeSpy).toHaveBeenCalledWith(co, true, "Yes")
  })

  it("ignores listen events on wrong channel", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.ll.Listen = () => 42

    setCoroutineYieldValue([true, "Yes"])
    dialog(-99001, "avatar-id" as unknown as UUID, "Choose:", ["Yes", "No"], 30)

    emit("listen", -99002, "Avatar", "avatar-id", "Wrong")
    expect(resumeSpy).not.toHaveBeenCalled()
  })

  it("resumes with [false, 'timeout'] on timeout", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.ll.Listen = () => 42
    g.ll.ListenRemove = () => {}

    setCoroutineYieldValue([false, "timeout"])
    dialog(-99001, "avatar-id" as unknown as UUID, "Choose:", ["Yes", "No"], 30)

    tick()
    expect(resumeSpy).toHaveBeenCalledWith(co, false, "timeout")
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

    setCoroutineYieldValue([true, "User input"])
    const result = textBox(-99001, "avatar-id" as unknown as UUID, "Enter text:", 30) as any

    expect(listenChannel).toBe(-99001)
    expect(result).toEqual([true, "User input"])
  })
})

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

describe("fetch", () => {
  it("yields and returns response object", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })
    g.$httpRequest = () => "req-http"

    setCoroutineYieldValue([true, { status: 200, metadata: [], body: "OK" }])
    const result = fetch("https://example.com", { timeout: 30 }) as any

    expect(result).toEqual([true, { status: 200, metadata: [], body: "OK" }])
  })

  it("handler filters by request ID", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.$httpRequest = () => "req-http"

    setCoroutineYieldValue([true, { status: 200, metadata: [], body: "OK" }])
    fetch("https://example.com", { timeout: 30 })

    // Non-matching request
    emit("http_response", "req-other", 404, [], "Not found")
    expect(resumeSpy).not.toHaveBeenCalled()

    // Matching request
    emit("http_response", "req-http", 200, [], "OK")
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })

  it("resumes with [false, 'timeout'] on timeout", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.$httpRequest = () => "req-http"

    setCoroutineYieldValue([false, "timeout"])
    fetch("https://example.com", { timeout: 30 })

    tick()
    expect(resumeSpy).toHaveBeenCalledWith(co, false, "timeout")
  })
})

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

describe("requestPermissions", () => {
  it("yields and returns permission flags", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, 0x2004])
    const result = requestPermissions("avatar-id" as unknown as UUID, 0x2004, 10) as any

    expect(result).toEqual([true, 0x2004])
  })

  it("handler resumes with [true, flags] and removes itself", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([true, 0x04])
    requestPermissions("avatar-id" as unknown as UUID, 0x04, 10)

    emit("run_time_permissions", 0x04)
    expect(resumeSpy).toHaveBeenCalledWith(co, true, 0x04)

    emit("run_time_permissions", 0x04)
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })

  it("resumes with [false, 'timeout'] on timeout", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([false, "timeout"])
    requestPermissions("avatar-id" as unknown as UUID, 0x04, 10)

    tick()
    expect(resumeSpy).toHaveBeenCalledWith(co, false, "timeout")
  })
})

describe("transferMoney", () => {
  it("yields and returns result object", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    setCoroutineYieldValue([true, { success: true, message: "Transfer complete" }])
    const result = transferMoney("avatar-id" as unknown as UUID, 100, 10) as any

    expect(result).toEqual([true, { success: true, message: "Transfer complete" }])
  })

  it("handler packs result with success based on successInt", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.ll.TransferLindenDollars = () => "req-tx"

    setCoroutineYieldValue([true, { success: false, message: "Insufficient funds" }])
    transferMoney("avatar-id" as unknown as UUID, 100, 10)

    // Simulate transaction result with failure
    emit("transaction_result", "req-tx", false, "Insufficient funds")
    expect(resumeSpy).toHaveBeenCalledWith(co, true, {
      success: false,
      message: "Insufficient funds",
    })
  })

  it("resumes with [false, 'timeout'] on timeout", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    g.ll.TransferLindenDollars = () => "req-tx"

    setCoroutineYieldValue([false, "timeout"])
    transferMoney("avatar-id" as unknown as UUID, 100, 10)

    tick()
    expect(resumeSpy).toHaveBeenCalledWith(co, false, "timeout")
  })
})

// ---------------------------------------------------------------------------
// Sensor
// ---------------------------------------------------------------------------

describe("sensor", () => {
  it("returns detected objects on sensor event", () => {
    spyOn(g.coroutine, "running").mockReturnValue({ __mock: true })

    const mockDetected = [{ index: 0, valid: true }] as any

    setCoroutineYieldValue([true, mockDetected])

    const result = sensor("", NULL_KEY, 1, 20.0, 3.14, 10) as any

    expect(result).toEqual([true, mockDetected])
  })

  it("returns [true, null] on no_sensor", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([true, null])
    sensor("", NULL_KEY, 1, 20.0, 3.14, 10)

    emit("no_sensor")
    expect(resumeSpy).toHaveBeenCalledWith(co, true, null)
  })

  it("sensor handler removes both handlers", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([true, [{ index: 0 }]])
    sensor("", NULL_KEY, 1, 20.0, 3.14, 10)

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

    setCoroutineYieldValue([true, null])
    sensor("", NULL_KEY, 1, 20.0, 3.14, 10)

    emit("no_sensor")
    expect(resumeSpy).toHaveBeenCalledTimes(1)

    // sensor after no_sensor should not trigger again
    emit("sensor", [{ index: 0 }])
    expect(resumeSpy).toHaveBeenCalledTimes(1)
  })

  it("resumes with [false, 'timeout'] on timeout", () => {
    const co = { __mock: true }
    spyOn(g.coroutine, "running").mockReturnValue(co)
    const resumeSpy = spyOn(g.coroutine, "resume")

    setCoroutineYieldValue([false, "timeout"])
    sensor("", NULL_KEY, 1, 20.0, 3.14, 10)

    tick()
    expect(resumeSpy).toHaveBeenCalledWith(co, false, "timeout")
  })
})
