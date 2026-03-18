# `@gwigz/slua-tstl-plugin`

[TypeScriptToLua](https://typescripttolua.github.io) plugin to provide better DX with SLua types.

## What it does

- Translates TypeScript patterns to native Luau/LSL equivalents (see below)
- Handles adjusting `Vector`, `Quaternion`, and `UUID` casing
- Validates `luaTarget` is set to `Luau`
- Warns if `luaLibImport` is not `none` or `inline` (for now)

## Transforms

The plugin replaces TSTL lualib helpers with native Luau stdlib and LSL function calls for better performance and smaller output.

### JSON

| TypeScript            | Lua output           |
| --------------------- | -------------------- |
| `JSON.stringify(val)` | `lljson.encode(val)` |
| `JSON.parse(str)`     | `lljson.decode(str)` |

For SL-typed JSON (preserving vector/quaternion/uuid), use `lljson.slencode`/`lljson.sldecode` directly.

### Base64

| TypeScript  | Lua output             |
| ----------- | ---------------------- |
| `btoa(str)` | `llbase64.encode(str)` |
| `atob(str)` | `llbase64.decode(str)` |

### String methods

String methods are translated to LSL `ll.*` functions or Luau `string.*` stdlib calls:

| TypeScript          | Lua output                             |
| ------------------- | -------------------------------------- |
| `str.toUpperCase()` | `ll.ToUpper(str)`                      |
| `str.toLowerCase()` | `ll.ToLower(str)`                      |
| `str.trim()`        | `ll.StringTrim(str, STRING_TRIM)`      |
| `str.trimStart()`   | `ll.StringTrim(str, STRING_TRIM_HEAD)` |
| `str.trimEnd()`     | `ll.StringTrim(str, STRING_TRIM_TAIL)` |
| `str.indexOf(x)`    | `ll.SubStringIndex(str, x)`            |
| `str.includes(x)`   | `string.find(str, x, 1, true) ~= nil`  |
| `str.split(sep)`    | `string.split(str, sep)`               |
| `str.repeat(n)`     | `string.rep(str, n)`                   |

> [!NOTE]
> `str.indexOf(x, fromIndex)` with a second argument falls through to TSTL's default handling since `ll.SubStringIndex` has no `fromIndex` parameter. Similarly, `str.split()` with no separator is not transformed.

### Array methods

| TypeScript          | Lua output                        |
| ------------------- | --------------------------------- |
| `arr.includes(val)` | `table.find(arr, val) ~= nil`     |
| `arr.indexOf(val)`  | `(table.find(arr, val) or 0) - 1` |

> [!NOTE]
> `arr.indexOf(val, fromIndex)` with a second argument falls through to TSTL's default handling.

### Bitwise operators

TypeScript bitwise operators are automatically translated to `bit32` library calls, since SLua does not support native Lua bitwise operators.

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

#### `btest` optimization

Comparisons of a bitwise AND against zero are automatically optimized to `bit32.btest`:

| TypeScript      | Lua output              |
| --------------- | ----------------------- |
| `(a & b) !== 0` | `bit32.btest(a, b)`     |
| `(a & b) === 0` | `not bit32.btest(a, b)` |

This works with `!=`, `==`, and with the zero on either side (`0 !== (a & b)`).

### Floor division

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
