# `@gwigz/slua-*`

TypeScript-to-SLua transpiler for Second Life scripting. Write type-safe code in TypeScript, compile to clean [SLua](https://wiki.secondlife.com/wiki/SLua) (Luau) with minimal to zero runtime overhead.

Built on [TypeScriptToLua](https://typescripttolua.github.io) with auto-generated type definitions from the official SLua/LSL YAML definitions.

## Packages

| Package                                           | Description                                                  |
| ------------------------------------------------- | ------------------------------------------------------------ |
| [`@gwigz/slua-types`](packages/types)             | Auto-generated TypeScript declarations for all SLua/LSL APIs |
| [`@gwigz/slua-tstl-plugin`](packages/tstl-plugin) | TSTL plugin enforcing SLua constraints                       |

## Quick Start

> [!NOTE]
> These packages are not live yet.

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

### Bitwise Operators

TypeScript bitwise operators are automatically translated to `bit32` library calls by the plugin:

| TypeScript | Lua output            |
| ---------- | --------------------- |
| `a & b`    | `bit32.band(a, b)`    |
| `a \| b`   | `bit32.bor(a, b)`     |
| `a ^ b`    | `bit32.bxor(a, b)`    |
| `a << b`   | `bit32.lshift(a, b)`  |
| `a >> b`   | `bit32.arshift(a, b)` |
| `a >>> b`  | `bit32.rshift(a, b)`  |
| `~a`       | `bit32.bnot(a)`       |

Compound assignments (`&=`, `|=`, etc.) work too. Comparisons against zero are optimized to `bit32.btest`:

```typescript
if ((flags & CHANGED_OWNER) !== 0) {
  // ...
}
```

```lua
if bit32.btest(flags, CHANGED_OWNER) then
  -- ...
end
```

### Comments

Due to a [TypeScript limitation](https://github.com/TypeScriptToLua/TypeScriptToLua/issues/713), only JSDoc-style comments (`/** */`) are preserved in the output -- regular comments (`//`, `/* */`) are stripped before TSTL ever sees them:

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

## Contributing

```bash
bun install
bun run generate   # regenerate types from YAML definitions
bun run build      # build the TSTL plugin
bun test           # run all tests
```

### Scripts

- `bun run generate` - regenerate `packages/types/index.d.ts` from YAML definitions
- `bun run build` - build the TSTL plugin
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
│   └── gen-types/      # type generation tool (YAML → .d.ts)
├── examples/
│   └── hello-world/    # example SLua project
└── refs/
    └── lsl-definitions/  # upstream YAML definitions (submodule)
```
