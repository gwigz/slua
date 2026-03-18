/// <reference path="../../packages/types/index.d.ts" />

/** Array.map -- transform each element */
const positions = [new Vector(0, 0, 0), new Vector(1, 2, 3), new Vector(10, 20, 30)]

const doubled = positions.map((v) => v.mul(2))

/** Array.filter -- keep elements matching a predicate */
const nearby = positions.filter((v) => Vector.magnitude(v) < 50)

/** Array.find -- get the first match */
const origin = positions.find((v) => Vector.magnitude(v) === 0)

/** Array.reduce -- accumulate a result */
const totalMagnitude = positions.reduce((sum, v) => sum + Vector.magnitude(v), 0)

/** Array.includes -- check membership */
const channels = [0, 1, 42, 100]
const hasDebugChannel = channels.includes(42)

/** Array spread -- combine arrays */
const extra = [new Vector(5, 5, 5)]
const all = [...positions, ...extra]

/** for...of -- iterate without indices */
for (const pos of all) {
  ll.Say(0, tostring(pos))
}

/** Array destructuring */
const [first, second, ...rest] = positions

export { doubled, nearby, origin, totalMagnitude, hasDebugChannel, first }
