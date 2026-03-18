# `@gwigz/slua-tstl-plugin`

[TypeScriptToLua](https://typescripttolua.github.io) plugin to provide better DX with SLua types.

## What it does

- Handles adjusting `Vector`, `Quaternion`, and `UUID` casing
- Translates bitwise operators to `bit32` library calls (see below)
- Translates `Math.floor(a / b)` to the native `//` floor division operator (see below)
- Validates `luaTarget` is set to `Luau`
- Warns if `luaLibImport` is not `none` or `inline` (for now)

## Bitwise operators

TypeScript bitwise operators are automatically translated to `bit32` library calls, since SLua does not support native Lua bitwise operators.

### Binary operators

| TypeScript | Lua output            |
| ---------- | --------------------- |
| `a & b`    | `bit32.band(a, b)`    |
| `a \| b`   | `bit32.bor(a, b)`     |
| `a ^ b`    | `bit32.bxor(a, b)`    |
| `a << b`   | `bit32.lshift(a, b)`  |
| `a >> b`   | `bit32.arshift(a, b)` |
| `a >>> b`  | `bit32.rshift(a, b)`  |
| `~a`       | `bit32.bnot(a)`       |

Compound assignments (`&=`, `|=`, `^=`, `<<=`, `>>=`, `>>>=`) are also supported and desugar to the same `bit32` calls.

### `btest` optimization

Comparisons of a bitwise AND against zero are automatically optimized to `bit32.btest`:

| TypeScript      | Lua output              |
| --------------- | ----------------------- |
| `(a & b) !== 0` | `bit32.btest(a, b)`     |
| `(a & b) === 0` | `not bit32.btest(a, b)` |

This works with `!=`, `==`, and with the zero on either side (`0 !== (a & b)`).

## Floor division

`Math.floor(a / b)` is translated to the native Luau floor division operator `//`:

| TypeScript          | Lua output |
| ------------------- | ---------- |
| `Math.floor(a / b)` | `a // b`   |

This only applies when the argument is directly a `/` expression. `Math.floor(x)` with a non-division argument is left as-is.

> [!WARNING]
> JavaScript integer truncation idioms `~~x` and `x | 0` do **not** map cleanly to Luau. `~~x` emits `bit32.bnot(bit32.bnot(x))` and `x | 0` emits `bit32.bor(x, 0)`, neither of which preserves correct semantics for negative numbers (the `bit32` library operates on unsigned 32-bit integers). Use `math.floor(x)` for floor truncation instead.

## Build

```bash
bun run build
```
