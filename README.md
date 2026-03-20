# `@gwigz/slua-*`

TypeScript-to-SLua transpiler for Second Life scripting. Write type-safe code in TypeScript, compile to clean [SLua](https://wiki.secondlife.com/wiki/SLua) (Luau) with minimal to zero runtime overhead.

Built on [TypeScriptToLua](https://typescripttolua.github.io) with auto-generated type definitions from the official SLua/LSL YAML definitions.

## Packages

| Package                                           | Description                                                  |
| ------------------------------------------------- | ------------------------------------------------------------ |
| [`@gwigz/slua-types`](packages/types)             | Auto-generated TypeScript declarations for all SLua/LSL APIs |
| [`@gwigz/slua-tstl-plugin`](packages/tstl-plugin) | TSTL plugin enforcing SLua constraints                       |

## Quick Start

Install the packages:

```bash
npm install --save-dev typescript typescript-to-lua @gwigz/slua-types @gwigz/slua-tstl-plugin
# or
bun add --dev typescript typescript-to-lua @gwigz/slua-types @gwigz/slua-tstl-plugin
```

Create a `tsconfig.json` in your project:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "moduleDetection": "force",
    "types": ["@typescript-to-lua/language-extensions", "@gwigz/slua-types"]
  },
  "tstl": {
    "luaTarget": "Luau",
    "luaLibImport": "inline",
    "luaPlugins": [{ "name": "@gwigz/slua-tstl-plugin" }]
  }
}
```

See [TypeScriptToLua configuration](https://typescripttolua.github.io/docs/configuration) for more config options.

Write TypeScript:

```typescript
const owner = ll.GetOwner()

LLEvents.on("touch_start", (events) => {
  for (const event of events) {
    const key = event.getKey()

    if (key === owner) {
      ll.Say(0, `Hello secondlife:///app/agent/${key}/about!`)

      return
    }
  }
})
```

TypeScript will provide types and autocomplete for `LLEvents`, `ll.*`, etc.

Compile with i.e. `npx tstl` or `bunx tstl` to get Lua:

```lua
local owner = ll.GetOwner()

LLEvents:on("touch_start", function(events)
  for ____, event in ipairs(events) do
    local key = event:getKey()

    if key == owner then
      ll.Say(0, ("Hello secondlife:///app/agent/" .. tostring(key)) .. "/about!")

      return
    end
  end
end)
```

### Plugin Transforms

The TSTL plugin automatically translates TypeScript patterns to native Luau/LSL equivalents for JSON, base64, string methods, array methods, bitwise operators, and floor division. See the [full transform reference](packages/tstl-plugin#transforms) for details.

### Comments

Due to a [TSTL limitation](https://github.com/TypeScriptToLua/TypeScriptToLua/issues/815), only valid JSDoc-style comments (`/** */`) are preserved in the output. Regular comments (`//`, `/* */`) are stripped:

```typescript
/** This comment will appear in the Lua output */
const owner = ll.GetOwner()

// This comment will be stripped
const pos = new Vector(128, 128, 20)
```

```lua
--- This comment will appear in the Lua output
local owner = ll.GetOwner()
local pos = vector.create(128, 128, 20)
```

## Real-world usage

I use this toolchain for my own projects, it's how I find the rough edges:

- [`examples/sim-wide-relay`](examples/sim-wide-relay) -- Region-wide chat relay, deployed at my favorite sim
- [`slua-derez-patcher`](https://github.com/gwigz/slua-derez-patcher) -- Skips the rez-edit-take-replace cycle; patches rezzables using `ll.DerezObject`

## Scripts

- `bun run generate` - regenerate `packages/types/index.d.ts` from YAML definitions
- `bun run build` - build all workspaces that define a `build` script
- `bun run build:examples` - build all example workspaces only
- `bun test` - run all tests
- `bun run lint` - lint with [oxlint](https://oxc.rs/docs/guide/usage/linter)
- `bun run lint:fix` - lint and auto-fix
- `bun run fmt` - format with [oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- `bun run fmt:check` - check formatting without writing

## Project Structure

```
├── packages/
│   ├── types/          # auto-generated .d.ts declarations
│   └── tstl-plugin/    # TSTL plugin for SLua constraints
├── tools/
│   └── gen-types/      # type generation tool (YAML -> .d.ts)
├── examples/
│   ├── getting-started/   # minimal example
│   ├── kitchen-sink/      # feature showcase
│   ├── sim-wide-relay/    # multi-script relay system
│   └── weather-fetcher/   # HTTP request example
└── refs/
    └── lsl-definitions/  # upstream YAML definitions (submodule)
```
