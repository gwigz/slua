/// <reference path="../../packages/types/index.d.ts" />

/** Imports -- compile to require() calls in Lua */
import { nearby, totalMagnitude } from "./arrays"
import { updated, keys } from "./objects"
import { describe, greet } from "./control-flow"
import { Greeter, Counter } from "./classes"
import { createRepeater, makeCounter } from "./functions"

/** Template literals -- compile to string concatenation */
const owner = ll.GetOwner()
ll.Say(0, `Owner: ${tostring(owner)}`)

/** Using imported values */
ll.Say(0, `Nearby positions: ${tostring(nearby.length)}`)
ll.Say(0, `Total magnitude: ${tostring(totalMagnitude)}`)
ll.Say(0, `Config keys: ${tostring(keys)}`)

/** Using imported functions */
ll.Say(0, describe("hello"))
ll.Say(0, describe(42))

/** Using imported classes */
const greeter = new Greeter(0, "Bot")
greeter.greet("World")

/** Enums -- compile to bidirectional Lua tables */
enum Channel {
  Public = 0,
  Debug = 42,
  Private = 100,
}

ll.Say(Channel.Public, `Updated config range: ${tostring(updated.range)}`)

/** Constructors -- compile to create() calls */
const pos = new Vector(128, 128, 20)
const rot = new Quaternion(0, 0, 0, 1)

/** Operator overloads -- a.add(b) compiles to a + b */
const scaled = pos.mul(2)
const moved = pos.add(new Vector(0, 0, 10))

/** Event handler tying it all together */
LLEvents.on("touch_start", (detected: DetectedEvent[]) => {
  const name = ll.DetectedName(detected[0].index)
  greet(name)

  const repeater = createRepeater(0, `Touched by ${name}`)
  repeater()
  repeater()

  Counter.increment()
  ll.SetText(`Touches: ${tostring(Counter.getCount())}`, new Vector(1, 1, 1), 1.0)
})

/** Timer -- periodic callback */
const stats = makeCounter()

LLTimers.every(10, () => {
  stats.next()
  ll.SetText(`Ticks: ${tostring(stats.value())}`, Vector.one, 1.0)
})
