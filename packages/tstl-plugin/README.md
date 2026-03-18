# `@gwigz/slua-tstl-plugin`

[TypeScriptToLua](https://typescripttolua.github.io) plugin to provide better DX with SLua types.

Currently this provides minimal features, and may be extended later.

## What it does

- Handles adjusting `Vector`, `Quaternion`, and `UUID` casing
- Validates `luaTarget` is set to `Luau`
- Warns if `luaLibImport` is not `none` or `inline` (for now)

## Build

```bash
bun run build
```
