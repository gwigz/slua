/**
 * TypeScript implementation of SLua's `lljson.slencode`/`sldecode` tagged JSON
 * format. Allows Node.js code to exchange typed data (vectors, quaternions,
 * UUIDs, buffers) with SLua scripts.
 *
 * @example
 * ```ts
 * import { sldecode, slencode, Vector, Quaternion } from "@gwigz/slua-json"
 *
 * // Decode tagged JSON from an SLua script
 * const data = sldecode<{ pos: Vector; rot: Quaternion }>(
 *   '{"pos":"!v<1,2,3>","rot":"!q<0,0,0,1>"}'
 * )
 *
 * data.pos.x // 1
 *
 * // Encode data for an SLua script
 * slencode({ pos: new Vector(1, 2, 3) }) // '{"pos":"!v<1,2,3>"}'
 * ```
 *
 * @module
 */

// ---------------------------------------------------------------------------
// SL Types
// ---------------------------------------------------------------------------

/** Three-component vector matching SLua's `vector` type. */
export class Vector {
  static readonly zero = new Vector(0, 0, 0)
  static readonly one = new Vector(1, 1, 1)

  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {}

  toString() {
    return `<${formatComponent(this.x)},${formatComponent(this.y)},${formatComponent(this.z)}>`
  }
}

/** Four-component quaternion matching SLua's `quaternion` type. */
export class Quaternion {
  static readonly identity = new Quaternion(0, 0, 0, 1)

  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly w: number,
  ) {}

  toString() {
    return `<${formatComponent(this.x)},${formatComponent(this.y)},${formatComponent(this.z)},${formatComponent(this.w)}>`
  }
}

/**
 * UUID wrapper matching SLua's `uuid` type.
 *
 * Needed so {@link slencode} can distinguish a UUID from a plain string.
 */
export class UUID {
  static readonly nil = new UUID("00000000-0000-0000-0000-000000000000")

  readonly value: string

  constructor(value: string) {
    this.value = value.toLowerCase()
  }

  toString(): string {
    return this.value
  }
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface SlEncodeOptions {
  /**
   * Use compact encoding: vectors/quaternions drop angle brackets and
   * omit zero components, UUIDs are base64-encoded (22 chars vs 36).
   */
  tight?: boolean
}

// ---------------------------------------------------------------------------
// Codec
// ---------------------------------------------------------------------------

export interface CodecOptions {
  vector?: {
    create(x: number, y: number, z: number): any
    test(value: unknown): boolean
  }
  quaternion?: {
    create(x: number, y: number, z: number, w: number): any
    test(value: unknown): boolean
  }
  uuid?: {
    create(value: string): any
    test(value: unknown): boolean
    /** Extract UUID string. Defaults to `String(value)`. */
    value?: (u: any) => string
  }
}

export interface SlCodec {
  slencode(value: unknown, options?: SlEncodeOptions): string
  sldecode<T = unknown>(json: string): T
}

interface ResolvedCodec {
  vector: {
    create(x: number, y: number, z: number): any
    test(value: unknown): boolean
  }
  quaternion: {
    create(x: number, y: number, z: number, w: number): any
    test(value: unknown): boolean
  }
  uuid: {
    create(value: string): any
    test(value: unknown): boolean
    value(u: any): string
  }
}

function resolveCodec(options?: CodecOptions): ResolvedCodec {
  return {
    vector: options?.vector ?? {
      create: (x, y, z) => new Vector(x, y, z),
      test: (v) => v instanceof Vector,
    },
    quaternion: options?.quaternion ?? {
      create: (x, y, z, w) => new Quaternion(x, y, z, w),
      test: (q) => q instanceof Quaternion,
    },
    uuid: {
      create: options?.uuid?.create ?? ((v) => new UUID(v)),
      test: options?.uuid?.test ?? ((u) => u instanceof UUID),
      value: options?.uuid?.value ?? ((u) => String(u)),
    },
  }
}

/**
 * Create a codec with custom type constructors and detectors.
 *
 * @example
 * ```ts
 * import { createCodec } from "@gwigz/slua-json"
 * import { Vector3 } from "three"
 *
 * const codec = createCodec({
 *   vector: {
 *     create: (x, y, z) => new Vector3(x, y, z),
 *     test: (v) => v instanceof Vector3,
 *   },
 * })
 *
 * codec.sldecode('{"pos":"!v<1,2,3>"}') // { pos: Vector3 { x: 1, y: 2, z: 3 } }
 * ```
 */
export function createCodec(options?: CodecOptions): SlCodec {
  const codec = resolveCodec(options)

  return {
    slencode(value: unknown, encodeOptions?: SlEncodeOptions) {
      return stringifyValue(value, encodeOptions?.tight ?? false, codec)
    },
    sldecode<T = unknown>(json: string): T {
      return walkDecode(JSON.parse(json), codec) as T
    },
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const defaultCodec = resolveCodec()

/**
 * Encode a value as SL-tagged JSON, matching `lljson.slencode`.
 *
 * Type mapping:
 *
 * | JS value        | Tagged output        |
 * |-----------------|----------------------|
 * | `Vector`        | `"!v<x,y,z>"`        |
 * | `Quaternion`    | `"!q<x,y,z,w>"`      |
 * | `UUID`          | `"!uXXXX-..."`       |
 * | `Uint8Array`    | `"!d"` + base64      |
 * | `undefined`     | `"!n"` (Lua nil)     |
 * | `null`          | `null` (lljson.null) |
 * | `NaN`           | `"!fNaN"`            |
 * | string with `!` | `"!!..."`            |
 */
export function slencode(value: unknown, options?: SlEncodeOptions) {
  return stringifyValue(value, options?.tight ?? false, defaultCodec)
}

/**
 * Decode an SL-tagged JSON string, restoring native types.
 *
 * Tagged strings are parsed into {@link Vector}, {@link Quaternion},
 * {@link UUID}, or `Uint8Array`. Tagged object keys are decoded to
 * their string representations.
 *
 * @typeParam T - Expected return type.
 */
export function sldecode<T = unknown>(json: string): T {
  return walkDecode(JSON.parse(json), defaultCodec) as T
}

// ---------------------------------------------------------------------------
// Encode internals
// ---------------------------------------------------------------------------

/**
 * Format a vector/quaternion component using `%.6f` style with trailing
 * zero trimming, matching SLua's `luai_formatfloat` + `luai_trimfloat`.
 */
function formatComponent(v: number) {
  if (Number.isNaN(v)) return "nan"
  if (v === Infinity) return "inf"
  if (v === -Infinity) return "-inf"

  let s = v.toFixed(6)

  // Trim trailing zeros after decimal point
  const dot = s.indexOf(".")

  if (dot !== -1) {
    let end = s.length

    while (end > dot + 1 && s[end - 1] === "0") {
      end--
    }

    if (end === dot + 1) {
      end = dot // remove the dot too
    }

    s = s.slice(0, end)
  }

  return s
}

function stringifyValue(value: unknown, tight: boolean, codec: ResolvedCodec) {
  if (value === undefined) return '"!n"'
  if (value === null) return "null"

  switch (typeof value) {
    case "number":
      return stringifyNumber(value)
    case "boolean":
      return value ? "true" : "false"
    case "string":
      return stringifyString(value)
  }

  if (codec.vector.test(value)) return stringifyVector(value, tight)
  if (codec.quaternion.test(value)) return stringifyQuaternion(value, tight)
  if (codec.uuid.test(value)) return stringifyUUID(value, tight, codec)
  if (value instanceof Uint8Array) return stringifyBuffer(value)

  if (Array.isArray(value)) {
    const items: string[] = []

    for (let i = 0; i < value.length; i++) {
      items.push(stringifyValue(value[i], tight, codec))
    }

    return "[" + items.join(",") + "]"
  }

  if (typeof value === "object") {
    const entries: string[] = []

    for (const key of Object.keys(value as Record<string, unknown>)) {
      const val = (value as Record<string, unknown>)[key]
      entries.push(JSON.stringify(key) + ":" + stringifyValue(val, tight, codec))
    }

    return "{" + entries.join(",") + "}"
  }

  throw new Error(`slencode: unsupported type ${typeof value}`)
}

function stringifyNumber(num: number) {
  if (Number.isNaN(num)) return '"!fNaN"'
  if (num === Infinity) return "1e9999"
  if (num === -Infinity) return "-1e9999"

  return JSON.stringify(num)
}

/** Escape strings that start with `!` by doubling the `!`. */
function stringifyString(str: string) {
  if (str.startsWith("!")) {
    return JSON.stringify("!" + str)
  }

  return JSON.stringify(str)
}

function stringifyVector(v: any, tight: boolean) {
  if (tight) {
    if (v.x === 0 && v.y === 0 && v.z === 0) {
      return '"!v"'
    }

    const x = v.x === 0 ? "" : formatComponent(v.x)
    const y = v.y === 0 ? "" : formatComponent(v.y)
    const z = v.z === 0 ? "" : formatComponent(v.z)

    return JSON.stringify(`!v${x},${y},${z}`)
  }

  return JSON.stringify(
    `!v<${formatComponent(v.x)},${formatComponent(v.y)},${formatComponent(v.z)}>`,
  )
}

function stringifyQuaternion(q: any, tight: boolean) {
  if (tight) {
    if (q.x === 0 && q.y === 0 && q.z === 0 && q.w === 1) {
      return '"!q"'
    }

    const x = q.x === 0 ? "" : formatComponent(q.x)
    const y = q.y === 0 ? "" : formatComponent(q.y)
    const z = q.z === 0 ? "" : formatComponent(q.z)
    const w = q.w === 0 ? "" : formatComponent(q.w)

    return JSON.stringify(`!q${x},${y},${z},${w}`)
  }

  return JSON.stringify(
    `!q<${formatComponent(q.x)},${formatComponent(q.y)},${formatComponent(q.z)},${formatComponent(q.w)}>`,
  )
}

function stringifyUUID(uuid: any, tight: boolean, codec: ResolvedCodec) {
  const uuidValue = codec.uuid.value(uuid)

  if (tight) {
    if (uuidValue === "00000000-0000-0000-0000-000000000000") {
      return '"!u"'
    }

    const bytes = uuidToBytes(uuidValue)
    const b64 = bytesToBase64(bytes).slice(0, 22) // strip `==` padding

    return JSON.stringify(`!u${b64}`)
  }

  return JSON.stringify(`!u${uuidValue}`)
}

function stringifyBuffer(buf: Uint8Array) {
  return JSON.stringify(`!d${bytesToBase64(buf)}`)
}

// ---------------------------------------------------------------------------
// Decode internals
// ---------------------------------------------------------------------------

/** Recursively walk a parsed JSON value, converting tagged strings. */
function walkDecode(value: unknown, codec: ResolvedCodec) {
  if (typeof value === "string") return parseTaggedString(value, codec)
  if (value === null) return null

  if (Array.isArray(value)) {
    const result: unknown[] = []

    for (let i = 0; i < value.length; i++) {
      result.push(walkDecode(value[i], codec))
    }

    return result
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    const result: Record<string, unknown> = {}

    for (const key of Object.keys(obj)) {
      const decodedKey = typeof key === "string" ? decodeTaggedKey(key, codec) : key
      result[decodedKey] = walkDecode(obj[key], codec)
    }

    return result
  }

  return value
}

/**
 * Parse a tagged string value. Returns the decoded type, or the original
 * string if it's not tagged.
 */
function parseTaggedString(str: string, codec: ResolvedCodec) {
  if (str.length < 2 || str[0] !== "!") return str

  const tag = str[1]
  const payload = str.slice(2)

  switch (tag) {
    case "n":
      if (payload.length !== 0) {
        throw new Error(`malformed tagged nil: ${str}`)
      }

      return undefined

    case "!":
      // Escaped `!`, return string with leading `!` stripped
      return str.slice(1)

    case "v":
      return parseVector(payload, str, codec)

    case "q":
      return parseQuaternion(payload, str, codec)

    case "u":
      return parseUUID(payload, str, codec)

    case "f":
      return parseFloat(payload, str)

    case "b":
      if (payload === "1") {
        return true
      }

      if (payload === "0") {
        return false
      }

      throw new Error(`malformed tagged boolean: ${str}`)

    case "d":
      return parseBuffer(payload)

    default:
      throw new Error(`unknown tag '!${tag}' in: ${str}`)
  }
}

function parseVector(payload: string, original: string, codec: ResolvedCodec) {
  if (payload.length === 0) {
    return codec.vector.create(0, 0, 0)
  }

  let components: string[]

  if (payload[0] === "<") {
    // Normal format: <x,y,z>
    if (payload[payload.length - 1] !== ">") {
      throw new Error(`malformed tagged vector: ${original}`)
    }

    components = payload.slice(1, -1).split(",")
  } else {
    // Tight format: x,y,z
    components = payload.split(",")
  }

  if (components.length !== 3) throw new Error(`malformed tagged vector: ${original}`)

  return codec.vector.create(
    parseComponentNumber(components[0]),
    parseComponentNumber(components[1]),
    parseComponentNumber(components[2]),
  )
}

function parseQuaternion(payload: string, original: string, codec: ResolvedCodec) {
  if (payload.length === 0) {
    return codec.quaternion.create(0, 0, 0, 1)
  }

  let components: string[]

  if (payload[0] === "<") {
    if (payload[payload.length - 1] !== ">") {
      throw new Error(`malformed tagged quaternion: ${original}`)
    }

    components = payload.slice(1, -1).split(",")
  } else {
    components = payload.split(",")
  }

  if (components.length !== 4) {
    throw new Error(`malformed tagged quaternion: ${original}`)
  }

  return codec.quaternion.create(
    parseComponentNumber(components[0]),
    parseComponentNumber(components[1]),
    parseComponentNumber(components[2]),
    parseComponentNumber(components[3]),
  )
}

function parseUUID(payload: string, original: string, codec: ResolvedCodec) {
  if (payload.length === 0) return codec.uuid.create("00000000-0000-0000-0000-000000000000")
  if (payload.length === 36) return codec.uuid.create(payload)

  if (payload.length === 22) {
    // Tight base64 format, add padding and decode
    const bytes = base64ToBytes(payload + "==")

    if (bytes.length !== 16) {
      throw new Error(`malformed base64 UUID: ${original}`)
    }

    return codec.uuid.create(bytesToUUID(bytes))
  }

  throw new Error(`malformed tagged UUID: ${original}`)
}

function parseFloat(payload: string, original: string) {
  const trimmed = payload.trim()

  if (trimmed === "NaN") return NaN
  if (trimmed === "inf" || trimmed === "1e9999") return Infinity
  if (trimmed === "-inf" || trimmed === "-1e9999") return -Infinity

  const num = Number(trimmed)

  if (Number.isNaN(num)) {
    throw new Error(`malformed tagged float: ${original}`)
  }

  return num
}

function parseBuffer(payload: string) {
  if (payload.length === 0) {
    return new Uint8Array(0)
  }

  return base64ToBytes(payload)
}

/** Parse a vector/quaternion component, empty string means 0 */
function parseComponentNumber(s: string) {
  const trimmed = s.trim()

  if (trimmed === "") return 0
  if (trimmed === "nan") return NaN
  if (trimmed === "inf") return Infinity
  if (trimmed === "-inf") return -Infinity

  return Number(trimmed)
}

/**
 * Decode a tagged object key to a plain string key.
 *
 * - `!fN` → `String(N)` (float key → numeric string)
 * - `!b1`/`!b0` → `"true"`/`"false"`
 * - `!uXXX` → UUID string
 * - `!!xxx` → `"!xxx"` (unescaped)
 * - `!v<...>` / `!q<...>` → their string representation
 * - Untagged keys are returned as-is.
 */
function decodeTaggedKey(key: string, codec: ResolvedCodec) {
  if (key.length < 2 || key[0] !== "!") {
    return key
  }

  const tag = key[1]
  const payload = key.slice(2)

  switch (tag) {
    case "f": {
      const num = parseFloat(payload, key)
      return String(num)
    }

    case "b":
      return payload === "1" ? "true" : "false"
    case "u": {
      const u = parseUUID(payload, key, codec)
      return codec.uuid.value(u)
    }
    case "!":
      return key.slice(1)
    case "v": {
      const v = parseVector(payload, key, codec)
      return `<${formatComponent(v.x)},${formatComponent(v.y)},${formatComponent(v.z)}>`
    }
    case "q": {
      const q = parseQuaternion(payload, key, codec)
      return `<${formatComponent(q.x)},${formatComponent(q.y)},${formatComponent(q.z)},${formatComponent(q.w)}>`
    }
    case "d":
      return `[buffer:${payload}]`

    default:
      return key
  }
}

// ---------------------------------------------------------------------------
// Base64 helpers
// ---------------------------------------------------------------------------

function bytesToBase64(bytes: Uint8Array) {
  let binary = ""

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
}

function base64ToBytes(b64: string) {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

  return bytes
}

// ---------------------------------------------------------------------------
// UUID byte helpers
// ---------------------------------------------------------------------------

function uuidToBytes(uuid: string) {
  const hex = uuid.replace(/-/g, "")
  const bytes = new Uint8Array(16)

  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }

  return bytes
}

function bytesToUUID(bytes: Uint8Array) {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-")
}
