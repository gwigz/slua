# `@gwigz/slua-types`

Auto-generated TypeScript declarations for SLua and LSL APIs.

Provides full type coverage for:

- **Base types** - `Vector`, `Quaternion`, `UUID`, `DetectedEvent` with operator overloads
- **Constructors** - `new Vector(x, y, z)` compiles to `vector.create(x, y, z)`
- **Modules** - `vector`, `quaternion`, `math`, `string`, `table`, `bit32`, `buffer`, `coroutine`, `uuid`
- **LSL functions** - 750+ `ll.*` functions with full parameter and return types
- **LSL constants** - `AGENT`, `ACTIVE`, `PI`, etc.
- **Events** - `LLEvents.on("touch_start", ...)` with typed event name unions
- **Globals** - `print`, `tostring`, `tonumber`, `assert`, `touuid`, `tovector`, etc.

## Usage

Reference directly in your TypeScript file:

```typescript
/// <reference path="path/to/index.d.ts" />
```

Or include via `tsconfig.json`:

```json
{
  "include": ["node_modules/@gwigz/slua-types/index.d.ts"]
}
```

## Regenerating

Types are generated from `refs/lsl-definitions/*.yaml` by the `gen-types` tool:

```bash
bun run generate
```

## Documentation

Full API reference and usage examples are available at [slua.gwigz.link/docs/slua](https://slua.gwigz.link/docs/slua).
