/// <reference path="../../packages/types/index.d.ts" />

/** Default parameters */
function sayOnChannel(message: string, channel: number = 0): void {
  ll.Say(channel, message)
}

/** Rest parameters -- variable argument count */
function sayAll(channel: number, ...messages: string[]): void {
  for (const msg of messages) {
    ll.Say(channel, msg)
  }
}

/** Higher-order functions -- functions as arguments (uuid is the SLua type for agent/object keys) */
function withOwnerCheck(action: (owner: uuid) => void): void {
  const owner = ll.GetOwner()

  action(owner)
}

withOwnerCheck((owner) => {
  ll.Say(0, `Owner: ${tostring(owner)}`)
})

/** Functions returning functions (closures) */
function createRepeater(channel: number, message: string): () => void {
  let count = 0

  return () => {
    count += 1

    ll.Say(channel, `[${tostring(count)}] ${message}`)
  }
}

/** Arrow functions vs function declarations -- both compile to Lua functions */
const double = (n: number): number => n * 2

function triple(n: number): number {
  return n * 3
}

ll.Say(0, `double(21) = ${tostring(double(21))}`)
ll.Say(0, `triple(14) = ${tostring(triple(14))}`)

/** Closures capture variables */
function makeCounter(start: number = 0): { next: () => number; value: () => number } {
  let current = start

  return {
    next: () => {
      current += 1
      return current
    },
    value: () => current,
  }
}

const counter = makeCounter(10)

counter.next()
counter.next()

ll.Say(0, tostring(counter.value()))

export { sayOnChannel, sayAll, createRepeater, makeCounter }
