/// <reference path="../../packages/types/index.d.ts" />

/** Object destructuring -- pull properties into variables */
const config = { channel: 42, range: 10.0, name: "Scanner" }
const { channel, range, name } = config

/** Object spread -- clone and extend */
const updated = { ...config, range: 20.0 }

/** Object.keys / Object.values / Object.entries */
const keys = Object.keys(config)
const values = Object.values(config)

for (const [key, value] of Object.entries(config)) {
  ll.Say(0, `${key} = ${tostring(value)}`)
}

/** Computed property names */
const field = "color"
const dynamic = { [field]: new Vector(1, 0, 0) }

/** Optional chaining -- safe property access */
const settings: { debug?: { verbose?: boolean } } = {}
const verbose = settings.debug?.verbose

/** Nested destructuring with defaults */
const { channel: ch = 0, name: label = "Unknown" } = config

export { updated, keys, values, dynamic, verbose, ch, label }
