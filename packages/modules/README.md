# @gwigz/slua-modules

Shared runtime modules for [SLua](https://github.com/gwigz/slua) projects.

## Installation

```sh
npm install @gwigz/slua-modules
# or
bun add @gwigz/slua-modules
```

### TSTL configuration

TSTL's `luaBundle` resolver cannot resolve TypeScript source from `node_modules` directly. Add `paths` and `baseUrl` to your tsconfig (or build options) so TSTL can find the module source:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@gwigz/slua-modules/*": ["node_modules/@gwigz/slua-modules/src/*/index.ts"],
    },
  },
}
```

> [!NOTE]
> If this places the resolved file outside your `rootDir`, widen `rootDir` to a common ancestor directory (e.g. the monorepo root).

## Modules

### `@gwigz/slua-modules/config`

Typed notecard config with two parser backends. Values are applied to the config object **in-place**, so the same reference stays valid across reloads.

#### Formats

Both parsers are gated by compile-time flags (`CONFIG_YAML_PARSER`, `CONFIG_LLJSON_PARSER`). When a flag is `false`, the parser code is stripped from the Lua output, see [`@gwigz/slua-tstl-plugin` `define`](../tstl-plugin/README.md).

##### `YAML`

This is the default parser, only supports fla `key: value` lines, with automatic type coercion:

```yaml
# Comment
PRIVATE_CHANNEL: -1731704569
WELCOME_MESSAGE: Hello\nWorld
ADMIN_KEYS: key1, key2, key3
```

- **Numbers** are converted via `tonumber()`
- **Arrays** are split on `,` and trimmed
- **Strings** have `\n` replaced with newlines
- Unknown keys (not in the config object) are ignored

##### `LLJSON.sldecode`

Full JSON via `lljson.sldecode`, with native support for vectors, rotations, and UUIDs. Provide appropriate defaults (e.g. `Vector.zero`, `Quaternion.identity`, `NULL_KEY`).

#### Usage

```ts
import { loadConfig, onConfigChanged } from "@gwigz/slua-modules/config"

const config = {
  PRIVATE_CHANNEL: -1731704569,
  WELCOME_MESSAGE: "Welcome",
  ADMIN_KEYS: ["00000000-0000-0000-0000-000000000000"],
}

loadConfig("settings.yml", { config }, () => {
  // config is mutated in-place, use it directly
  ll.Say(config.PRIVATE_CHANNEL, config.WELCOME_MESSAGE)

  onConfigChanged("settings.yml", { config }, () => {
    // config has been reset and re-parsed from the updated notecard
    ll.Say(config.PRIVATE_CHANNEL, "Config reloaded")
  })
})
```

Using lljson (requires `CONFIG_LLJSON_PARSER: true` in the TSTL plugin `define` options):

```ts
const config = {
  SPAWN_POS: Vector.zero,
  SPAWN_ROT: Quaternion.identity,
  OWNER: NULL_KEY,
  RADIUS: 10,
}

loadConfig("config.json", { config, type: "lljson" }, () => {
  ll.SetPos(config.SPAWN_POS)
})
```

#### API

##### `loadConfig(notecard, options, callback)`

```ts
function loadConfig<T>(notecard: string, options: ConfigOptions<T>, callback: () => void): void
```

Reads the named notecard and applies parsed values to `options.config` in-place, then calls the callback.

##### `onConfigChanged(notecard, options, callback)`

```ts
function onConfigChanged<T>(notecard: string, options: ConfigOptions<T>, callback: () => void): void
```

Watches for inventory changes and re-reads the notecard when it changes. On each change, values are reset to a snapshot taken at registration time before re-parsing. Only call once per notecard (creates one `LLEvents` listener).

##### `ConfigOptions<T>`

```ts
interface ConfigOptions<T extends Record<string, ConfigValue>> {
  config: T
  type?: "yml" | "lljson" // default: "yml"
}
```

##### `ConfigValue`

```ts
type ConfigValue = string | number | string[]
```

---

### `@gwigz/slua-modules/testing`

Framework-agnostic mock utilities for testing SLua modules. Provides working mock implementations of `ll`, `LLEvents`, `LLTimers`, and SLua constants so modules can be unit-tested in Bun, Vitest, or Jest.

#### Usage

```ts
import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { setup, teardown, notecard, emit } from "@gwigz/slua-modules/testing"
import { loadConfig } from "@gwigz/slua-modules/config"

beforeEach(() => setup())
afterEach(() => teardown())

it("loads config from notecard", () => {
  notecard("settings.yml", ["CHANNEL: -123", "MESSAGE: Hello"])

  const config = { CHANNEL: 0, MESSAGE: "" }

  loadConfig("settings.yml", { config }, () => {
    expect(config.CHANNEL).toBe(-123)
    expect(config.MESSAGE).toBe("Hello")
  })
})
```

#### API

##### `setup()`

Installs all SLua mock globals (`ll`, `LLEvents`, `LLTimers`, `NAK`, `EOF`, `CHANGED_INVENTORY`, `NULL_KEY`, `DEBUG_CHANNEL`, `tonumber`) into `globalThis`. Call in `beforeEach`.

##### `teardown()`

Removes all mocks and resets internal state (notecards, event handlers, timers). Call in `afterEach`.

##### `notecard(name: string, content: string | string[])`

Registers notecard content. Accepts a multi-line string (split on `\n`) or an array of lines. Updates the mock inventory key so `onConfigChanged` detects the change.

##### `emit(event: string, ...args: any[])`

Triggers an event on the mock `LLEvents`, calling all registered handlers.
