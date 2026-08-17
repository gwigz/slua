import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { chatMessages, emit, setup, teardown, tick } from "./index"

const g = globalThis as any

describe("setup/teardown globals", () => {
  it("installs and removes the math globals", () => {
    setup()

    expect(g.Vector).toBeDefined()
    expect(g.Quaternion).toBeDefined()
    expect(g.UUID).toBeDefined()
    expect(g.vector).toBe(g.Vector)
    expect(g.quaternion).toBe(g.Quaternion)
    expect(g.uuid).toBe(g.UUID)

    teardown()

    expect(g.Vector).toBeUndefined()
    expect(g.vector).toBeUndefined()
  })

  it("restores pre-existing globals on teardown", () => {
    g.Vector = "sentinel"

    setup()
    expect(g.Vector).not.toBe("sentinel")

    teardown()
    expect(g.Vector).toBe("sentinel")

    delete g.Vector
  })
})

describe("with mocks installed", () => {
  beforeEach(setup)
  afterEach(teardown)

  describe("Vector", () => {
    it("constructs and does basic math", () => {
      const a = new g.Vector(1, 2, 3)
      const b = g.Vector.create(4, 5, 6)

      expect(a.x).toBe(1)
      expect(g.Vector.dot(a, b)).toBe(32)
      expect(g.Vector.magnitude(new g.Vector(3, 4, 0))).toBe(5)
      expect(a.add(b).toString()).toBe("<5, 7, 9>")
      expect(g.Vector.cross(new g.Vector(1, 0, 0), new g.Vector(0, 1, 0)).z).toBe(1)
      expect(g.Vector.lerp(g.Vector.zero, g.Vector.one, 0.5).x).toBe(0.5)
    })

    it("defaults z to 0 and normalizes zero to NaN", () => {
      expect(new g.Vector(1, 2).z).toBe(0)

      const normalized = g.Vector.normalize(g.Vector.zero)

      expect(Number.isNaN(normalized.x)).toBe(true)
    })
  })

  describe("Quaternion", () => {
    it("uses the s field and provides identity", () => {
      const identity = g.Quaternion.identity

      expect(identity.s).toBe(1)
      expect(identity.x).toBe(0)
      expect(g.Quaternion.magnitude(identity)).toBe(1)
    })

    it("conjugates and normalizes", () => {
      const conjugated = g.Quaternion.conjugate(new g.Quaternion(1, 2, 3, 4))

      expect(conjugated.x).toBe(-1)
      expect(conjugated.s).toBe(4)

      const normalizedZero = g.Quaternion.normalize(new g.Quaternion(0, 0, 0, 0))

      expect(normalizedZero.s).toBe(1)
    })

    it("rotates unit axes", () => {
      const fwd = g.Quaternion.tofwd(g.Quaternion.identity)

      expect(fwd.x).toBeCloseTo(1)
      expect(fwd.y).toBeCloseTo(0)
      expect(fwd.z).toBeCloseTo(0)

      // 90 degrees around Z: forward <1,0,0> becomes left <0,1,0>
      const halfSqrt2 = Math.SQRT1_2
      const rotated = g.Quaternion.tofwd(new g.Quaternion(0, 0, halfSqrt2, halfSqrt2))

      expect(rotated.x).toBeCloseTo(0)
      expect(rotated.y).toBeCloseTo(1)
    })
  })

  describe("UUID", () => {
    it("defaults to NULL_KEY and reports istruthy", () => {
      expect(new g.UUID().toString()).toBe(g.NULL_KEY)
      expect(new g.UUID().istruthy).toBe(false)
      expect(g.UUID.create("12345678-1234-1234-1234-123456789abc").istruthy).toBe(true)
    })

    it("exposes 16 raw bytes", () => {
      expect(new g.UUID().bytes.length).toBe(16)
    })
  })

  describe("chat capture", () => {
    it("records chat with channels and targets", () => {
      g.ll.Say(0, "hello")
      g.ll.OwnerSay("psst")
      g.ll.RegionSayTo("some-key", 5, "direct")

      expect(chatMessages()).toEqual([
        { func: "Say", channel: 0, text: "hello" },
        { func: "OwnerSay", channel: 0, text: "psst" },
        { func: "RegionSayTo", channel: 5, text: "direct", target: "some-key" },
      ])
    })

    it("clears the log between tests", () => {
      expect(chatMessages()).toHaveLength(0)

      g.ll.Whisper(1, "quiet")

      expect(chatMessages()).toHaveLength(1)
    })
  })

  describe("ll overrides", () => {
    it("does not leak overrides across setup cycles", () => {
      g.ll.RequestAgentData = () => "overridden"

      expect(g.ll.RequestAgentData()).toBe("overridden")

      teardown()
      setup()

      expect(g.ll.RequestAgentData()).not.toBe("overridden")
    })

    it("still no-ops unknown functions", () => {
      expect(() => g.ll.SomethingUnmocked()).not.toThrow()
      expect(g.ll.SomethingUnmocked()).toBeUndefined()
    })
  })

  describe("events and timers", () => {
    it("emit fires handlers and tick fires timers", () => {
      const calls: string[] = []

      g.LLEvents.on("touch_start", () => calls.push("touched"))
      g.LLTimers.once(5, () => calls.push("timer"))

      emit("touch_start", [])
      tick()

      expect(calls).toEqual(["touched", "timer"])
    })
  })
})
