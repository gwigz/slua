# `@gwigz/slua-json`

TypeScript implementation of SLua's `lljson.slencode`/`sldecode` tagged JSON format. Allows Node.js and browser code to exchange typed data (vectors, quaternions, UUIDs, buffers) with SLua scripts.

This is not for use with TSTL pipelines, use this for your projects that interact with SLua via HTTP, etc.

## Install

```bash
npm install @gwigz/slua-json
# or
bun add @gwigz/slua-json
```

## Usage

```ts
import { slencode, sldecode, Vector, Quaternion, UUID } from "@gwigz/slua-json"

// Decode tagged JSON from an SLua script
const data = sldecode<{ pos: Vector; rot: Quaternion }>('{"pos":"!v<1,2,3>","rot":"!q<0,0,0,1>"}')

data.pos.x // 1
data.rot.w // 1

// Encode data for an SLua script to consume via lljson.sldecode
const json = slencode({ pos: new Vector(1, 2, 3) })
// -> '{"pos":"!v<1,2,3>"}'

// Use tight mode for smaller payloads
slencode(new Vector(0, 0, 1), { tight: true })
// -> '"!v,,1"'
```

## Tag format

| Tag  | Type        | Normal                       | Tight                       |
| ---- | ----------- | ---------------------------- | --------------------------- |
| `!v` | Vector      | `!v<x,y,z>`                  | `!vx,y,z` (zeros omitted)   |
| `!q` | Quaternion  | `!q<x,y,z,w>`                | `!qx,y,z,w` (zeros omitted) |
| `!u` | UUID        | `!uXXXX-XXXX-...` (36 chars) | `!u` + base64 (22 chars)    |
| `!d` | Buffer      | `!d` + base64                | same                        |
| `!f` | Float       | `!f3.14`                     | same                        |
| `!b` | Boolean     | `!b1` / `!b0`                | same                        |
| `!n` | Nil         | `!n`                         | same                        |
| `!!` | Escaped `!` | `!!text`                     | same                        |

## JS ↔ Lua null mapping

| JavaScript  | Lua           | JSON wire |
| ----------- | ------------- | --------- |
| `null`      | `lljson.null` | `null`    |
| `undefined` | `nil`         | `"!n"`    |

## Second Life type classes

- **`Vector(x, y, z)`** three-component vector
- **`Quaternion(x, y, z, w)`** four-component quaternion
- **`UUID(value)`** UUID wrapper (lowercased, needed for `instanceof` detection during encode)

## Bring your own types

If you already have types for vectors, quaternions, or UUIDs (from another library or your own codebase), use `createCodec` to plug in your own constructors and detectors instead of converting between types:

```ts
import { createCodec } from "@gwigz/slua-json"
import { UUID, Vector3, Quaternion } from "@caspertech/node-metaverse"

const codec = createCodec({
  vector: {
    create: (x, y, z) => new Vector3(x, y, z),
    test: (vec) => vec instanceof Vector3,
  },
  quaternion: {
    create: (x, y, z, w) => new Quaternion(x, y, z, w),
    test: (quat) => quat instanceof Quaternion,
  },
  uuid: {
    create: (value) => new UUID(value),
    test: (uuid) => uuid instanceof UUID,
  },
})

// Decodes directly into node-metaverse types
const { pos } = codec.sldecode<{ pos: Vector3 }>('{"pos":"!v<1,2,3>"}')

// Encodes node-metaverse types without conversion
codec.slencode({ pos: new Vector3(1, 2, 3) })
// -> '{"pos":"!v<1,2,3>"}'
```

You can override any combination of `vector`, `quaternion`, and `uuid`. Unspecified types fall back to the built-in classes. `createCodec()` with no arguments behaves identically to the bare `slencode`/`sldecode` exports.

For UUID types where `String(value)` doesn't return the UUID string, provide a `value` function:

```ts
const codec = createCodec({
  uuid: {
    create: (value) => ({ __type: "uuid", id: value }),
    test: (uuid) => uuid?.__type === "uuid",
    value: (uuid) => uuid.id,
  },
})
```

## Documentation

Full API reference and usage examples are available at [slua.gwigz.link/docs/json](https://slua.gwigz.link/docs/json).
