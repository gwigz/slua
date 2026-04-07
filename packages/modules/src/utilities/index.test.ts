import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { setup, teardown, tick } from "../testing"
import { debounce, throttle, cooldown } from "."

beforeEach(() => setup())
afterEach(() => teardown())

// ---------------------------------------------------------------------------
// debounce
// ---------------------------------------------------------------------------

describe("debounce", () => {
  it("fires after the delay with the latest args", () => {
    const calls: string[] = []
    const [fn] = debounce((msg: string) => calls.push(msg), 2) as any

    fn("a")
    fn("b")
    fn("c")

    expect(calls).toEqual([])

    tick()

    expect(calls).toEqual(["c"])
  })

  it("resets the timer on each call", () => {
    const calls: number[] = []
    const [fn] = debounce((n: number) => calls.push(n), 1) as any

    fn(1)
    fn(2)

    tick()

    // only the latest call should have fired
    expect(calls).toEqual([2])
  })

  it("cancel prevents pending execution", () => {
    const calls: string[] = []
    const [fn, cancel] = debounce((msg: string) => calls.push(msg), 2) as any

    fn("a")
    cancel()
    tick()

    expect(calls).toEqual([])
  })

  it("can be reused after cancel", () => {
    const calls: string[] = []
    const [fn, cancel] = debounce((msg: string) => calls.push(msg), 2) as any

    fn("a")
    cancel()
    tick()

    fn("b")
    tick()

    expect(calls).toEqual(["b"])
  })

  it("forwards all arguments", () => {
    const calls: [string, number][] = []
    const [fn] = debounce((a: string, b: number) => calls.push([a, b]), 1) as any

    fn("hello", 42)
    tick()

    expect(calls).toEqual([["hello", 42]])
  })
})

// ---------------------------------------------------------------------------
// throttle
// ---------------------------------------------------------------------------

describe("throttle", () => {
  it("fires immediately on the first call (leading edge)", () => {
    const calls: string[] = []
    const [fn] = throttle((msg: string) => calls.push(msg), 2) as any

    fn("a")

    expect(calls).toEqual(["a"])
  })

  it("suppresses calls during the window", () => {
    const calls: string[] = []
    const [fn] = throttle((msg: string) => calls.push(msg), 2) as any

    fn("a")
    fn("b")
    fn("c")

    expect(calls).toEqual(["a"])
  })

  it("fires the trailing call when the timer expires", () => {
    const calls: string[] = []
    const [fn] = throttle((msg: string) => calls.push(msg), 2) as any

    fn("a")
    fn("b")
    fn("c")

    tick()

    expect(calls).toEqual(["a", "c"])
  })

  it("restarts the window after a trailing call", () => {
    const calls: string[] = []
    const [fn] = throttle((msg: string) => calls.push(msg), 2) as any

    fn("a")
    fn("b")

    tick() // fires trailing "b", restarts window

    expect(calls).toEqual(["a", "b"])

    // during new window, calls should be suppressed
    fn("c")
    expect(calls).toEqual(["a", "b"])

    tick() // fires trailing "c"
    expect(calls).toEqual(["a", "b", "c"])
  })

  it("resets to idle when no trailing call is pending", () => {
    const calls: string[] = []
    const [fn] = throttle((msg: string) => calls.push(msg), 2) as any

    fn("a")
    tick() // no trailing args, resets to idle

    fn("b") // should fire immediately (leading)
    expect(calls).toEqual(["a", "b"])
  })

  it("cancel clears pending timer and discards trailing args", () => {
    const calls: string[] = []
    const [fn, cancel] = throttle((msg: string) => calls.push(msg), 2) as any

    fn("a")
    fn("b")

    cancel()
    tick()

    expect(calls).toEqual(["a"])
  })

  it("can be reused after cancel", () => {
    const calls: string[] = []
    const [fn, cancel] = throttle((msg: string) => calls.push(msg), 2) as any

    fn("a")
    cancel()

    fn("b") // should fire immediately (leading)
    expect(calls).toEqual(["a", "b"])
  })

  it("forwards all arguments", () => {
    const calls: [string, number][] = []
    const [fn] = throttle((a: string, b: number) => calls.push([a, b]), 1) as any

    fn("hello", 42)

    expect(calls).toEqual([["hello", 42]])
  })
})

// ---------------------------------------------------------------------------
// cooldown
// ---------------------------------------------------------------------------

describe("cooldown", () => {
  it("fires immediately on the first call", () => {
    const calls: string[] = []
    const [fn] = cooldown((msg: string) => calls.push(msg), 2) as any

    fn("a")

    expect(calls).toEqual(["a"])
  })

  it("drops calls during the cooldown window", () => {
    const calls: string[] = []
    const [fn] = cooldown((msg: string) => calls.push(msg), 2) as any

    fn("a")
    fn("b")
    fn("c")

    expect(calls).toEqual(["a"])
  })

  it("does not fire dropped calls when the window expires", () => {
    const calls: string[] = []
    const [fn] = cooldown((msg: string) => calls.push(msg), 2) as any

    fn("a")
    fn("b")

    tick()

    expect(calls).toEqual(["a"])
  })

  it("resets the gate after the window expires", () => {
    const calls: string[] = []
    const [fn] = cooldown((msg: string) => calls.push(msg), 2) as any

    fn("a")
    tick() // window expires

    fn("b") // should fire (gate reset)
    expect(calls).toEqual(["a", "b"])
  })

  it("cancel resets the gate early", () => {
    const calls: string[] = []
    const [fn, cancel] = cooldown((msg: string) => calls.push(msg), 2) as any

    fn("a")
    cancel()

    fn("b") // should fire (gate was reset by cancel)
    expect(calls).toEqual(["a", "b"])
  })

  it("forwards all arguments", () => {
    const calls: [string, number][] = []
    const [fn] = cooldown((a: string, b: number) => calls.push([a, b]), 1) as any

    fn("hello", 42)

    expect(calls).toEqual([["hello", 42]])
  })
})
