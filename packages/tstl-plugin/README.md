# `@gwigz/slua-tstl-plugin`

[TypeScriptToLua](https://typescripttolua.github.io) plugin that enforces SLua constraints at compile time.

## What it does

- Handles adjusting `Vector`, `Quaternion`, and `UUID` casing
- Validates `luaTarget` is set to `Luau`
- Warns if `luaLibImport` is not `none` or `inline` (for now)

## Build

```bash
bun run build
```
