# @gwigz/slua-modules

Shared runtime modules for [SLua](https://github.com/gwigz/slua) projects.

## Installation

```sh
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

A flat YAML-style notecard config parser. Reads key-value pairs from an in-world notecard and applies them to a typed defaults object, with automatic type coercion based on the default values.

#### Notecard format

```yaml
# Comment
PRIVATE_CHANNEL: -1731704569
WELCOME_MESSAGE: Hello\nWorld
ADMIN_KEYS: key1, key2, key3
```

- **Numbers** defined in config default are converted via `tonumber()`
- **Arrays** are split on `,` and trimmed, and treated as strings
- **Strings** have `\n` replaced with newlines
- Unknown config keys (not in the defaults object) are ignored

#### Usage

```ts
const NOTECARD_NAME = "settings.yml"

import { loadConfig, onConfigChanged } from "@gwigz/slua-modules/config"

const config = {
  PRIVATE_CHANNEL: -1731704569,
  WELCOME_MESSAGE: "Welcome",
  ADMIN_KEYS: ["00000000-0000-0000-0000-000000000000"],
}

loadConfig(NOTECARD_NAME, config, () => {
  // config values are now loaded from the notecard
  console.log(config)

  onConfigChanged(NOTECARD_NAME, config, () => {
    // called when the notecard is updated in-world
    console.log(config)
  })
})
```

#### API

##### `loadConfig(notecard: string, config: ConfigObject, callback: () => void)`

Reads the named notecard and applies parsed values to the config object, then calls the callback.

##### `onConfigChanged(notecard: string, config: ConfigObject, callback: () => void)`

Watches for inventory changes and re-reads the notecard when it changes. Only call once per notecard (creates one `LLEvents` listener).

##### `ConfigObject`

```ts
type ConfigObject = Record<string, string | number | string[]>
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
  notecard("settings.yml", "CHANNEL: -123\nMESSAGE: Hello")

  const config = { CHANNEL: 0, MESSAGE: "" }

  loadConfig("settings.yml", config, () => {
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
