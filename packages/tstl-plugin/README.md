# `@gwigz/slua-tstl-plugin`

[TypeScriptToLua](https://typescripttolua.github.io) plugin to provide better DX with SLua types.

## What it does

- Translates TypeScript patterns to native Luau/LSL equivalents (see below)
- Handles adjusting `Vector`, `Quaternion`, and `UUID` casing
- Validates `luaTarget` is set to `Luau`

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

| TypeScript             | Lua output                                |
| ---------------------- | ----------------------------------------- |
| `str.toUpperCase()`    | `ll.ToUpper(str)`                         |
| `str.toLowerCase()`    | `ll.ToLower(str)`                         |
| `str.trim()`           | `ll.StringTrim(str, STRING_TRIM)`         |
| `str.trimStart()`      | `ll.StringTrim(str, STRING_TRIM_HEAD)`    |
| `str.trimEnd()`        | `ll.StringTrim(str, STRING_TRIM_TAIL)`    |
| `str.indexOf(x)`       | `(string.find(str, x, 1, true) or 0) - 1` |
| `str.includes(x)`      | `string.find(str, x, 1, true) ~= nil`     |
| `str.startsWith(x)`    | `string.find(str, x, 1, true) == 1`       |
| `str.split(sep)`       | `string.split(str, sep)`                  |
| `str.repeat(n)`        | `string.rep(str, n)`                      |
| `str.substring(start)` | `string.sub(str, start + 1)`              |
| `str.substring(s, e)`  | `string.sub(str, s + 1, e)`               |

> [!NOTE]
> `str.indexOf(x, fromIndex)` and `str.startsWith(x, position)` with a second argument fall through to TSTL's default handling. Similarly, `str.split()` with no separator is not transformed.

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

## Keeping output small

Some TypeScript patterns pull in large TSTL runtime helpers. Here are recommendations for keeping output lean:

### Avoid `delete` on objects

The `delete` operator pulls in `__TS__Delete`, which depends on the entire Error class hierarchy (`Error`, `TypeError`, `RangeError`, etc.), `__TS__Class`, `__TS__ClassExtends`, `__TS__New`, and `__TS__ObjectGetOwnPropertyDescriptors`, roughly **150 lines** of runtime code.

Instead, type your records to allow `undefined` and assign `undefined` (which compiles to `nil`):

```typescript
// Bad
const cache: Record<string, Data> = {}
delete cache[key]

// Good, compiles to `cache[key] = nil`
const cache: Record<string, Data | undefined> = {}
cache[key] = undefined
```

To clear an entire record, use `let` and reassign instead of iterating with `delete`:

```typescript
// Bad
for (const key of Object.keys(cache)) {
  delete cache[key]
}

// Good
let cache: Record<string, Data | undefined> = {}
// ...
cache = {}
```

### Avoid `Array.splice()`

`splice()` pulls in `__TS__ArraySplice` and `__TS__CountVarargs`, roughly **75 lines**. Rebuild the array instead:

```typescript
// Bad
for (let i = items.length - 1; i >= 0; i--) {
  if (shouldRemove(items[i])) {
    items.splice(i, 1)
  }
}

// Good, compiles to simple table operations
let items: Item[] = []
const remaining: Item[] = []

for (const item of items) {
  if (!shouldRemove(item)) {
    remaining.push(item)
  }
}

items = remaining
```

### Prefer `for...in` over `Object.entries()`

`Object.entries()` pulls in `__TS__ObjectEntries`. Use `Object.keys()` with indexing, or `for...in` which compiles directly to `for key in pairs(obj)`:

```typescript
// Pulls in __TS__ObjectEntries
for (const [key, value] of Object.entries(obj)) { ... }

// Compiles to `for key in pairs(obj)`, no helpers
for (const key in obj) {
  const value = obj[key]
}
```

### Avoid `Map` and `Set`

TSTL's `Map` and `Set` polyfills add **~400 lines** of runtime. Use plain `Record<string, T>` and arrays instead:

```typescript
// Bad, ~400 lines of runtime
const lookup = new Map<string, UUID>()
const seen = new Set<string>()

// Good, plain Lua tables
const lookup: Record<string, UUID | undefined> = {}
const seen: Record<string, boolean> = {}
```

## Build

```bash
bun run build
```
