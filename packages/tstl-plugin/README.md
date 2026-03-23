# `@gwigz/slua-tstl-plugin`

[TypeScriptToLua](https://typescripttolua.github.io) plugin to provide better DX with SLua types.

## Usage

Add the plugin to `tstl.luaPlugins` in your `tsconfig.json`:

```jsonc
{
  "tstl": {
    "luaTarget": "Luau",
    "luaPlugins": [{ "name": "@gwigz/slua-tstl-plugin" }],
  },
}
```

To enable output optimizations, pass `optimize: true` for all flags, or pick individual ones:

```jsonc
{
  "tstl": {
    "luaPlugins": [
      // all optimizations
      { "name": "@gwigz/slua-tstl-plugin", "optimize": true },
    ],
  },
}
```

```jsonc
{
  "tstl": {
    "luaPlugins": [
      // pick individual optimizations
      {
        "name": "@gwigz/slua-tstl-plugin",
        "optimize": {
          "compoundAssignment": true,
          "shortenTemps": true,
          "inlineLocals": true,
        },
      },
    ],
  },
}
```

## What it does

- Translates TypeScript patterns to native Luau/LSL equivalents (see below)
- Automatically adjusts `ll.*` index arguments and return values from 0-based to 1-based
- Optimizes self-reassignment array concat/spread to in-place `table.extend`
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

| TypeScript             | Lua output                                       |
| ---------------------- | ------------------------------------------------ |
| `str.toUpperCase()`    | `ll.ToUpper(str)`                                |
| `str.toLowerCase()`    | `ll.ToLower(str)`                                |
| `str.trim()`           | `ll.StringTrim(str, STRING_TRIM)`                |
| `str.trimStart()`      | `ll.StringTrim(str, STRING_TRIM_HEAD)`           |
| `str.trimEnd()`        | `ll.StringTrim(str, STRING_TRIM_TAIL)`           |
| `str.indexOf(x)`       | `(string.find(str, x, 1, true) or 0) - 1`        |
| `str.indexOf(x, from)` | `(string.find(str, x, from + 1, true) or 0) - 1` |
| `str.includes(x)`      | `string.find(str, x, 1, true) ~= nil`            |
| `str.startsWith(x)`    | `string.find(str, x, 1, true) == 1`              |
| `str.split(sep)`       | `string.split(str, sep)`                         |
| `str.repeat(n)`        | `string.rep(str, n)`                             |
| `str.substring(start)` | `string.sub(str, start + 1)`                     |
| `str.substring(s, e)`  | `string.sub(str, s + 1, e)`                      |
| `str.replace(a, b)`    | `ll.ReplaceSubString(str, a, b, 1)`              |
| `str.replaceAll(a, b)` | `ll.ReplaceSubString(str, a, b, 0)`              |

> [!NOTE]
> `str.indexOf(x, fromIndex)` adjusts the `fromIndex` to 1-based (constant-folded for literals). `str.startsWith(x, position)` with a second argument falls through to TSTL's default handling. Similarly, `str.split()` with no separator is not transformed.

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

### `ll.*` index adjustment

SLua's `ll.*` functions use 1-based indexing (Lua convention), but TypeScript uses 0-based. The plugin automatically adjusts index arguments and return values based on `@indexArg` and `@indexReturn` JSDoc tags in the type definitions:

| TypeScript                       | Lua output                                                   |
| -------------------------------- | ------------------------------------------------------------ |
| `ll.GetSubString("hello", 0, 2)` | `ll.GetSubString("hello", 1, 3)`                             |
| `ll.GetSubString("hello", i, j)` | `ll.GetSubString("hello", i + 1, j + 1)`                     |
| `ll.ListFindList(a, b)`          | `____tmp = ll.ListFindList(a, b); ____tmp and (____tmp - 1)` |

- **`@indexArg`** parameters get `+ 1` (constant-folded for literals)
- **`@indexReturn`** wraps the result in a nil-safe `____tmp and (____tmp - 1)` expression
- Functions without these tags (e.g. `ll.Say`) are left unchanged

### Array concat self-assignment

When an array is reassigned to itself with additional elements appended, the plugin emits `table.extend` (SLua's in-place append) instead of TSTL's `__TS__ArrayConcat` which allocates a new table:

| TypeScript                   | Lua output                              |
| ---------------------------- | --------------------------------------- |
| `arr = arr.concat(b)`        | `table.extend(arr, b)`                  |
| `arr = arr.concat(b, c)`     | `table.extend(table.extend(arr, b), c)` |
| `arr = [...arr, ...b]`       | `table.extend(arr, b)`                  |
| `arr = [...arr, ...b, ...c]` | `table.extend(table.extend(arr, b), c)` |

This optimization only applies when:

- The expression is a statement (not `const result = arr.concat(b)`)
- The LHS is a simple identifier matching the receiver/first spread
- All concat arguments / spread expressions are array-typed

### Floor division

`Math.floor(a / b)` is translated to the native Luau floor division operator `//`:

| TypeScript          | Lua output |
| ------------------- | ---------- |
| `Math.floor(a / b)` | `a // b`   |

This only applies when the argument is directly a `/` expression. `Math.floor(x)` with a non-division argument is left as-is.

> [!WARNING]
> JavaScript integer truncation idioms `~~x` and `x | 0` do **not** map cleanly to Luau. `~~x` emits `bit32.bnot(bit32.bnot(x))` and `x | 0` emits `bit32.bor(x, 0)`, neither of which preserves correct semantics for negative numbers (the `bit32` library operates on unsigned 32-bit integers). Use `math.floor(x)` for floor truncation instead.

## Optimizations

Pass `optimize: true` to enable all optimizations, or pass an object to pick individual flags. All flags default to `false` when not specified.

### `filter`

Inlines `arr.filter(cb)` as an `ipairs` loop instead of pulling in `__TS__ArrayFilter`.

Automatically disabled for files with more than one `.filter()` call, where the shared helper is results in a smaller script.

```typescript
const result = arr.filter((x) => x > 0)
```

```lua
local function ____opt_fn_0(x)
    return x > 0
end
local ____opt_0 = {}
for _, ____opt_v_0 in ipairs(arr) do
    if ____opt_fn_0(____opt_v_0) then
        ____opt_0[#____opt_0 + 1] = ____opt_v_0
    end
end
local result = ____opt_0
```

### `compoundAssignment`

Rewrites self-reassignment arithmetic to Luau compound assignment operators.

| TypeScript   | Lua output |
| ------------ | ---------- |
| `x = x + n`  | `x += n`   |
| `x = x - 1`  | `x -= 1`   |
| `x = x .. s` | `x ..= s`  |

Only currently only applies to simple identifiers.

### `floorMultiply`

Reorders `Math.floor((a / b) * c)` to use the floor division operator, avoiding a `math.floor` call.

| TypeScript                         | Lua output            |
| ---------------------------------- | --------------------- |
| `Math.floor((used / limit) * 100)` | `used * 100 // limit` |

Plain `Math.floor(a / b)` is **always** optimized to `a // b` regardless of this flag.

### `indexOf`

Emits bare `string.find` / `table.find` for `indexOf` _presence checks_ instead of the full `(find or 0) - 1` pattern.

| TypeScript              | Lua output                       |
| ----------------------- | -------------------------------- |
| `s.indexOf(x) >= 0`     | `string.find(s, x, 1, true)`     |
| `s.indexOf(x) !== -1`   | `string.find(s, x, 1, true)`     |
| `s.indexOf(x) === -1`   | `not string.find(s, x, 1, true)` |
| `arr.indexOf(x) >= 0`   | `table.find(arr, x)`             |
| `arr.indexOf(x) === -1` | `not table.find(arr, x)`         |

Bare `indexOf` calls without a comparison will still emit `(find or 0) - 1` to retain 0-index style responses.

### `shortenTemps`

Shortens TSTL's destructuring temp names and collapses consecutive field accesses into multi-assignment.

```typescript
const { a, b } = fn()
```

Default output:

```lua
local ____fn_result_0 = fn()
local a = ____fn_result_0.a
local b = ____fn_result_0.b
```

Optimized output:

```lua
local _r0 = fn()
local a, b = _r0.a, _r0.b
```

### `inlineLocals`

Merges forward-declared `local x` with its first `x = value` assignment when there are no references to `x` in between.

Default output:

```lua
local x
x = 5
```

Optimized output:

```lua
local x = 5
```

### `numericConcat`

Strips `tostring()` from number-typed (and string-typed) template literal interpolations, since Luau's `..` operator handles numeric concatenation natively.

```typescript
// count is number
const msg = `items: ${count}`
```

Default output:

```lua
local msg = "items: " .. tostring(count)
```

Optimized output:

```lua
local msg = "items: " .. count
```

Non-numeric types (booleans, `any`, etc.) still get wrapped in `tostring()`.

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
