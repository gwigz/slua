/// <reference path="../../packages/types/index.d.ts" />

/** for...of -- iterate arrays cleanly */
const names = ["Alice", "Bob", "Charlie"]

for (const name of names) {
  ll.Say(0, `Hello ${name}!`)
}

/** Nullish coalescing -- default values for null/undefined */
const userChannel: number | undefined = undefined
const activeChannel = userChannel ?? 42

/** Ternary expressions */
const status = activeChannel > 0 ? "custom" : "public"

/** Type narrowing with typeof */
function describe(value: string | number): string {
  if (typeof value === "string") {
    return `text: ${value}`
  }
  return `number: ${tostring(value)}`
}

/** Type narrowing with truthiness */
function greet(name: string | undefined): void {
  if (name) {
    ll.Say(0, `Hi ${name}!`)
  } else {
    ll.Say(0, "Hi stranger!")
  }
}

/** Switch statements */
function channelName(ch: number): string {
  switch (ch) {
    case 0:
      return "public"
    case DEBUG_CHANNEL: // built-in LSL constant (0x7FFFFFFF)
      return "debug"
    default:
      return `channel ${tostring(ch)}`
  }
}

export { describe, greet, channelName }
