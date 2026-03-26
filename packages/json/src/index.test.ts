/**
 * Tests ported from slua/tests/conformance/lljson.lua (slencode/sldecode sections)
 * and slua/tests/conformance/lljson_typedjson.lua where applicable.
 */
import { describe, it, expect } from "bun:test"
import { slencode, sldecode, Vector, Quaternion, UUID, createCodec } from "."

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function vector(x: number, y: number, z: number) {
  return new Vector(x, y, z)
}

function quaternion(x: number, y: number, z: number, w: number) {
  return new Quaternion(x, y, z, w)
}

function uuid(value: string) {
  return new UUID(value)
}

/** Deep-equal for our SL types (Vector, Quaternion, UUID). */
function slEqual(a: unknown, b: unknown) {
  if (a instanceof Vector && b instanceof Vector) {
    return Object.is(a.x, b.x) && Object.is(a.y, b.y) && Object.is(a.z, b.z)
  }

  if (a instanceof Quaternion && b instanceof Quaternion) {
    return Object.is(a.x, b.x) && Object.is(a.y, b.y) && Object.is(a.z, b.z) && Object.is(a.w, b.w)
  }

  if (a instanceof UUID && b instanceof UUID) {
    return a.value === b.value
  }

  return Object.is(a, b)
}

/** Buffer from raw bytes. */
function makeBuffer(...bytes: number[]) {
  const buf = new Uint8Array(bytes.length)

  for (let i = 0; i < bytes.length; i++) {
    buf[i] = bytes[i]
  }

  return buf
}

// ---------------------------------------------------------------------------
// Basic tagged encoding of values
// ---------------------------------------------------------------------------

describe("slencode", () => {
  it("encodes vectors", () => {
    expect(slencode(vector(1, 2, 3))).toBe('"!v<1,2,3>"')
  })

  it("encodes quaternions", () => {
    expect(slencode(quaternion(1, 2, 3, 4))).toBe('"!q<1,2,3,4>"')
  })

  it("encodes UUIDs", () => {
    expect(slencode(uuid("12345678-1234-1234-1234-123456789abc"))).toBe(
      '"!u12345678-1234-1234-1234-123456789abc"',
    )
  })

  it("escapes strings starting with !", () => {
    expect(slencode("!dangerous")).toBe('"!!dangerous"')
    expect(slencode("!")).toBe('"!!"')
  })

  it("leaves normal strings unchanged", () => {
    expect(slencode("normal")).toBe('"normal"')
  })

  it("encodes numbers", () => {
    expect(slencode(42)).toBe("42")
  })

  it("encodes booleans", () => {
    expect(slencode(true)).toBe("true")
    expect(slencode(false)).toBe("false")
  })

  // NaN encodes as tagged float for round-trip
  it("encodes NaN as tagged float", () => {
    expect(slencode(NaN)).toBe('"!fNaN"')
  })

  it("encodes Infinity as 1e9999", () => {
    expect(slencode(Infinity)).toBe("1e9999")
    expect(slencode(-Infinity)).toBe("-1e9999")
  })

  // slencode top-level undefined → "!n" (Lua nil)
  it("encodes undefined as !n", () => {
    expect(slencode(undefined)).toBe('"!n"')
  })

  // null → JSON null (lljson.null)
  it("encodes null as JSON null", () => {
    expect(slencode(null)).toBe("null")
  })

  // slencode emits "!n" for undefined holes in arrays
  it("encodes undefined array elements as !n", () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(slencode([1, undefined, 3])).toBe('[1,"!n",3]')
  })

  it("encodes null array elements as JSON null", () => {
    expect(slencode([1, null, 3])).toBe("[1,null,3]")
  })

  it("encodes arrays", () => {
    expect(slencode([1, 2, 3])).toBe("[1,2,3]")
  })

  it("encodes empty arrays", () => {
    expect(slencode([])).toBe("[]")
  })

  it("encodes objects", () => {
    expect(slencode({ foo: "bar" })).toBe('{"foo":"bar"}')
  })

  it("encodes empty objects", () => {
    expect(slencode({})).toBe("{}")
  })

  // Tagged buffers: !d with base64 data
  it("encodes buffers as !d + base64", () => {
    const buf = makeBuffer(0x01, 0x00, 0xff, 0x00)

    expect(slencode(buf)).toBe('"!dAQD/AA=="')
  })

  it("encodes empty buffers", () => {
    expect(slencode(new Uint8Array(0))).toBe('"!d"')
  })

  // Complex nested structure
  it("encodes complex nested structures", () => {
    const data = {
      vec: vector(1, 2, 3),
      quat: quaternion(0, 0, 0, 1),
      id: uuid("00000000-0000-0000-0000-000000000001"),
      str: "hello",
      bang_str: "!escaped",
      nested: { inner_vec: vector(4, 5, 6) },
    }

    const json = slencode(data)
    const decoded = sldecode<typeof data>(json)

    expect(slEqual(decoded.vec, data.vec)).toBe(true)
    expect(slEqual(decoded.quat, data.quat)).toBe(true)
    expect(slEqual(decoded.id, data.id)).toBe(true)
    expect(decoded.str).toBe(data.str)
    expect(decoded.bang_str).toBe(data.bang_str)
    expect(slEqual(decoded.nested.inner_vec, data.nested.inner_vec)).toBe(true)
  })

  // Vectors with special float values
  it("encodes vectors with special float values", () => {
    expect(slencode(vector(Infinity, -Infinity, NaN))).toBe('"!v<inf,-inf,nan>"')
  })
})

// ---------------------------------------------------------------------------
// Tight encoding mode ({tight: true})
// ---------------------------------------------------------------------------

describe("slencode tight mode", () => {
  it("tight vectors: no angle brackets", () => {
    expect(slencode(vector(1, 2, 3), { tight: true })).toBe('"!v1,2,3"')
  })

  it("tight vectors: zeros omitted", () => {
    expect(slencode(vector(0, 0, 1), { tight: true })).toBe('"!v,,1"')
    expect(slencode(vector(0, 0, 0), { tight: true })).toBe('"!v"')
    expect(slencode(vector(1, 0, 0), { tight: true })).toBe('"!v1,,"')
    expect(slencode(vector(0, 2, 0), { tight: true })).toBe('"!v,2,"')
  })

  it("tight quaternions: zeros omitted", () => {
    expect(slencode(quaternion(0, 0, 0, 1), { tight: true })).toBe('"!q"')
    expect(slencode(quaternion(1, 0, 0, 0), { tight: true })).toBe('"!q1,,,"')
    expect(slencode(quaternion(0, 0, 0, 0), { tight: true })).toBe('"!q,,,"')
  })

  it("tight UUIDs: base64 encoded (22 chars)", () => {
    const json = slencode(uuid("12345678-1234-1234-1234-123456789abc"), { tight: true })

    // "!u" + 22 chars of base64, wrapped in quotes
    expect(json.length).toBe(26) // 2 quotes + !u + 22 base64
    expect(json.startsWith('"!u')).toBe(true)
  })

  it("tight null UUID: just !u with no payload", () => {
    expect(slencode(uuid("00000000-0000-0000-0000-000000000000"), { tight: true })).toBe('"!u"')
  })

  it("round-trips with tight encoding", () => {
    const vec = vector(1.5, 0, -2.5)
    const rt = sldecode<Vector>(slencode(vec, { tight: true }))

    expect(slEqual(rt, vec)).toBe(true)

    const quat = quaternion(0, 0, 0, 1)
    const quatRt = sldecode<Quaternion>(slencode(quat, { tight: true }))

    expect(slEqual(quatRt, quat)).toBe(true)

    const id = uuid("12345678-1234-1234-1234-123456789abc")
    const idRt = sldecode<UUID>(slencode(id, { tight: true }))

    expect(slEqual(idRt, id)).toBe(true)
  })

  it("round-trips complex structures", () => {
    const data = {
      pos: vector(0, 0, 10),
      rot: quaternion(0, 0, 0, 1),
      id: uuid("00000000-0000-0000-0000-000000000001"),
    }

    const json = slencode(data, { tight: true })
    const decoded = sldecode<typeof data>(json)

    expect(slEqual(decoded.pos, data.pos)).toBe(true)
    expect(slEqual(decoded.rot, data.rot)).toBe(true)
    expect(slEqual(decoded.id, data.id)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Tagged decoding of values
// ---------------------------------------------------------------------------

describe("sldecode", () => {
  it("decodes tagged vectors", () => {
    expect(slEqual(sldecode('"!v<1,2,3>"'), vector(1, 2, 3))).toBe(true)
  })

  it("decodes tagged quaternions", () => {
    expect(slEqual(sldecode('"!q<1,2,3,4>"'), quaternion(1, 2, 3, 4))).toBe(true)
  })

  it("decodes tagged UUIDs", () => {
    expect(
      slEqual(
        sldecode('"!u12345678-1234-1234-1234-123456789abc"'),
        uuid("12345678-1234-1234-1234-123456789abc"),
      ),
    ).toBe(true)
  })

  // Invalid tagged UUIDs must error
  it("errors on invalid UUID length", () => {
    expect(() => sldecode('"!uOops"')).toThrow()
    expect(() => sldecode('"!u1234"')).toThrow()
  })

  // Uppercase accepted, canonicalized to lowercase
  it("accepts uppercase UUIDs", () => {
    const result = sldecode<UUID>('"!u00000000-0000-0000-0000-00000000000A"')
    expect(result).toBeInstanceOf(UUID)
    expect(result.value).toBe("00000000-0000-0000-0000-00000000000a")
  })

  it("decodes escaped ! strings", () => {
    expect(sldecode<string>('"!!dangerous"')).toBe("!dangerous")
    expect(sldecode<string>('"!!"')).toBe("!")
  })

  it("passes through non-tagged strings", () => {
    expect(sldecode<string>('"normal"')).toBe("normal")
  })

  // Round-trip tests for values
  it("round-trips vectors", () => {
    // oxlint-disable-next-line oxc/approx-constant
    const v = vector(1.5, -2.25, 3.14159)

    expect(slEqual(sldecode(slencode(v)), v)).toBe(true)
  })

  it("round-trips quaternions", () => {
    const q = quaternion(0.1, 0.2, 0.3, 0.9)

    expect(slEqual(sldecode(slencode(q)), q)).toBe(true)
  })

  it("round-trips UUIDs", () => {
    const id = uuid("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")

    expect(slEqual(sldecode(slencode(id)), id)).toBe(true)
  })

  // Decoding tight formats
  it("decodes tight vectors", () => {
    expect(slEqual(sldecode('"!v1,2,3"'), vector(1, 2, 3))).toBe(true)
    expect(slEqual(sldecode('"!v,,1"'), vector(0, 0, 1))).toBe(true)
    expect(slEqual(sldecode('"!v,,"'), vector(0, 0, 0))).toBe(true)
    expect(slEqual(sldecode('"!v"'), vector(0, 0, 0))).toBe(true)
  })

  it("decodes tight quaternions", () => {
    expect(slEqual(sldecode('"!q,,,1"'), quaternion(0, 0, 0, 1))).toBe(true)
    expect(slEqual(sldecode('"!q"'), quaternion(0, 0, 0, 1))).toBe(true)
    expect(slEqual(sldecode('"!q,,,"'), quaternion(0, 0, 0, 0))).toBe(true)
  })

  // Normal format still works after tight
  it("decodes normal format alongside tight", () => {
    expect(slEqual(sldecode('"!v<1,2,3>"'), vector(1, 2, 3))).toBe(true)
    expect(slEqual(sldecode('"!q<0,0,0,1>"'), quaternion(0, 0, 0, 1))).toBe(true)
  })

  // Tight null UUID decodes correctly
  it("decodes tight null UUID", () => {
    expect(slEqual(sldecode('"!u"'), uuid("00000000-0000-0000-0000-000000000000"))).toBe(true)
  })

  // Vectors with special float values
  it("decodes vectors with special float values", () => {
    const v = sldecode<Vector>('"!v<inf,-inf,nan>"')

    expect(v).toBeInstanceOf(Vector)
    expect(v.x).toBe(Infinity)
    expect(v.y).toBe(-Infinity)
    expect(Number.isNaN(v.z)).toBe(true)
  })

  // Error on malformed tags
  it("errors on unknown tag", () => {
    expect(() => sldecode('"!x<invalid>"')).toThrow()
  })

  it("errors on malformed vector (missing component)", () => {
    expect(() => sldecode('"!v<1,2>"')).toThrow()
  })

  it("errors on malformed quaternion (missing component)", () => {
    expect(() => sldecode('"!q<1,2,3>"')).toThrow()
  })

  // NaN round-trip
  it("round-trips NaN", () => {
    const rt = sldecode<number>(slencode(NaN))

    expect(Number.isNaN(rt)).toBe(true)
  })

  // sldecode "!n" produces undefined
  it("decodes !n as undefined in arrays", () => {
    const t = sldecode<unknown[]>('[1,"!n",3]')

    expect(t[0]).toBe(1)
    expect(t[1]).toBeUndefined()
    expect(t[2]).toBe(3)
  })

  it("decodes !n as undefined at top level", () => {
    expect(sldecode('"!n"')).toBeUndefined()
  })

  // null still decodes as null
  it("decodes JSON null as null", () => {
    const t = sldecode<unknown[]>("[1,null,3]")

    expect(t[0]).toBe(1)
    expect(t[1]).toBeNull()
    expect(t[2]).toBe(3)
  })

  // Round-trip buffer
  it("decodes buffers", () => {
    const buf = sldecode<Uint8Array>('"!dAQD/AA=="')

    expect(buf).toBeInstanceOf(Uint8Array)
    expect(buf.length).toBe(4)
    expect(buf[0]).toBe(0x01)
    expect(buf[2]).toBe(0xff)
  })

  it("decodes empty buffers", () => {
    const buf = sldecode<Uint8Array>('"!d"')

    expect(buf).toBeInstanceOf(Uint8Array)
    expect(buf.length).toBe(0)
  })

  // Tagged floats
  it("decodes tagged floats", () => {
    expect(sldecode('"!f3.14"')).toBeCloseTo(3.14)

    const nan = sldecode<number>('"!fNaN"')

    expect(Number.isNaN(nan)).toBe(true)
  })

  // Tagged booleans (used as keys in slencode)
  it("decodes tagged booleans", () => {
    expect(sldecode<boolean>('"!b1"')).toBe(true)
    expect(sldecode<boolean>('"!b0"')).toBe(false)
  })

  it("errors on malformed tagged boolean", () => {
    expect(() => sldecode('"!b2"')).toThrow()
    expect(() => sldecode('"!bx"')).toThrow()
  })

  // Whitespace around components is OK
  it("allows whitespace around vector components", () => {
    expect(slEqual(sldecode('"!v< 1 , 2 , 3 >"'), vector(1, 2, 3))).toBe(true)
  })

  it("allows whitespace around quaternion components", () => {
    expect(slEqual(sldecode('"!q< 1 , 2 , 3 , 4 >"'), quaternion(1, 2, 3, 4))).toBe(true)
  })

  it("allows whitespace around tagged float", () => {
    expect(sldecode('"!f3.14 "')).toBeCloseTo(3.14)
    expect(sldecode('"!f 3.14"')).toBeCloseTo(3.14)
  })
})

// ---------------------------------------------------------------------------
// Tagged key decoding
// ---------------------------------------------------------------------------

describe("sldecode tagged keys", () => {
  it("decodes !f float keys", () => {
    const decoded = sldecode<Record<string, string>>('{"!f3.14":"value"}')

    expect(decoded["3.14"]).toBe("value")
  })

  it("decodes !f integer keys", () => {
    const decoded = sldecode<Record<string, string>>('{"!f1":"first","!f100":"hundredth"}')

    expect(decoded["1"]).toBe("first")
    expect(decoded["100"]).toBe("hundredth")
  })

  it("decodes !u UUID keys", () => {
    const decoded = sldecode<Record<string, string>>(
      '{"!u12345678-1234-1234-1234-123456789abc":"hello"}',
    )

    expect(decoded["12345678-1234-1234-1234-123456789abc"]).toBe("hello")
  })

  it("decodes !! escaped keys", () => {
    const decoded = sldecode<Record<string, string>>('{"!!bang":"value"}')

    expect(decoded["!bang"]).toBe("value")
  })

  it("decodes !b boolean keys", () => {
    const decoded = sldecode<Record<string, string>>('{"!b1":"yes","!b0":"no"}')

    expect(decoded["true"]).toBe("yes")
    expect(decoded["false"]).toBe("no")
  })

  it("decodes !f1e9999 as Infinity key", () => {
    const decoded = sldecode<Record<string, string>>('{"!f1e9999":"value"}')

    expect(decoded["Infinity"]).toBe("value")
  })

  it("leaves untagged keys as-is", () => {
    const decoded = sldecode<Record<string, number>>('{"a":1,"b":2}')

    expect(decoded.a).toBe(1)
    expect(decoded.b).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Round-trip encode → decode
// ---------------------------------------------------------------------------

describe("slencode/sldecode round-trip", () => {
  it("round-trips arrays of vectors", () => {
    const vecs = [vector(1, 0, 0), vector(0, 1, 0), vector(0, 0, 1)]
    const decoded = sldecode<Vector[]>(slencode(vecs))

    expect(decoded.length).toBe(3)

    for (let i = 0; i < 3; i++) {
      expect(slEqual(decoded[i], vecs[i])).toBe(true)
    }
  })

  it("round-trips mixed nested data", () => {
    const data = {
      position: vector(10.5, 20.25, 30),
      rotation: quaternion(0, 0, 0, 1),
      owner: uuid("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
      name: "Test Object",
      tags: ["a", "b", "!special"],
      enabled: true,
      count: 42,
      payload: null,
    }

    const json = slencode(data)
    const decoded = sldecode<typeof data>(json)

    expect(slEqual(decoded.position, data.position)).toBe(true)
    expect(slEqual(decoded.rotation, data.rotation)).toBe(true)
    expect(slEqual(decoded.owner, data.owner)).toBe(true)
    expect(decoded.name).toBe(data.name)
    expect(decoded.tags).toEqual(["a", "b", "!special"])
    expect(decoded.enabled).toBe(true)
    expect(decoded.count).toBe(42)
    expect(decoded.payload).toBeNull()
  })

  it("round-trips buffers", () => {
    const buf = makeBuffer(0x01, 0x00, 0xff, 0x00)
    const decoded = sldecode<Uint8Array>(slencode(buf))

    expect(decoded).toBeInstanceOf(Uint8Array)
    expect(decoded.length).toBe(4)
    expect(decoded[0]).toBe(0x01)
    expect(decoded[2]).toBe(0xff)
  })

  it("round-trips empty buffer", () => {
    const buf = new Uint8Array(0)
    const decoded = sldecode<Uint8Array>(slencode(buf))

    expect(decoded).toBeInstanceOf(Uint8Array)
    expect(decoded.length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Type classes
// ---------------------------------------------------------------------------

describe("Vector", () => {
  it("has zero and one statics", () => {
    expect(slEqual(Vector.zero, vector(0, 0, 0))).toBe(true)
    expect(slEqual(Vector.one, vector(1, 1, 1))).toBe(true)
  })

  it("has toString matching SLua format", () => {
    expect(vector(1, 2.5, 3.142857).toString()).toBe("<1,2.5,3.142857>")
  })
})

describe("Quaternion", () => {
  it("has identity static", () => {
    expect(slEqual(Quaternion.identity, quaternion(0, 0, 0, 1))).toBe(true)
  })
})

describe("UUID", () => {
  it("lowercases value", () => {
    expect(uuid("AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE").value).toBe(
      "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    )
  })

  it("has nil static", () => {
    expect(UUID.nil.value).toBe("00000000-0000-0000-0000-000000000000")
  })
})

// ---------------------------------------------------------------------------
// createCodec – BYO types
// ---------------------------------------------------------------------------

describe("createCodec", () => {
  // Plain-object BYO types
  interface MyVec {
    _type: "vec"
    x: number
    y: number
    z: number
  }

  interface MyQuat {
    _type: "quat"
    x: number
    y: number
    z: number
    w: number
  }

  interface MyUUID {
    _type: "uuid"
    id: string
  }

  const codec = createCodec({
    vector: {
      create: (x, y, z): MyVec => ({ _type: "vec", x, y, z }),
      test: (v): v is MyVec => typeof v === "object" && v !== null && (v as MyVec)._type === "vec",
    },
    quaternion: {
      create: (x, y, z, w): MyQuat => ({ _type: "quat", x, y, z, w }),
      test: (q): q is MyQuat =>
        typeof q === "object" && q !== null && (q as MyQuat)._type === "quat",
    },
    uuid: {
      create: (value): MyUUID => ({ _type: "uuid", id: value.toLowerCase() }),
      test: (u): u is MyUUID =>
        typeof u === "object" && u !== null && (u as MyUUID)._type === "uuid",
      value: (u: MyUUID) => u.id,
    },
  })

  it("decodes vectors into custom type", () => {
    const v = codec.sldecode<MyVec>('"!v<1,2,3>"')

    expect(v._type).toBe("vec")
    expect(v.x).toBe(1)
    expect(v.y).toBe(2)
    expect(v.z).toBe(3)
  })

  it("decodes quaternions into custom type", () => {
    const q = codec.sldecode<MyQuat>('"!q<0,0,0,1>"')

    expect(q._type).toBe("quat")
    expect(q.x).toBe(0)
    expect(q.y).toBe(0)
    expect(q.z).toBe(0)
    expect(q.w).toBe(1)
  })

  it("decodes UUIDs into custom type", () => {
    const u = codec.sldecode<MyUUID>('"!u12345678-1234-1234-1234-123456789abc"')

    expect(u._type).toBe("uuid")
    expect(u.id).toBe("12345678-1234-1234-1234-123456789abc")
  })

  it("encodes custom vectors", () => {
    const v: MyVec = { _type: "vec", x: 1, y: 2, z: 3 }

    expect(codec.slencode(v)).toBe('"!v<1,2,3>"')
  })

  it("encodes custom quaternions", () => {
    const q: MyQuat = { _type: "quat", x: 0, y: 0, z: 0, w: 1 }

    expect(codec.slencode(q)).toBe('"!q<0,0,0,1>"')
  })

  it("encodes custom UUIDs", () => {
    const u: MyUUID = { _type: "uuid", id: "12345678-1234-1234-1234-123456789abc" }

    expect(codec.slencode(u)).toBe('"!u12345678-1234-1234-1234-123456789abc"')
  })

  it("round-trips custom types", () => {
    const data = {
      pos: { _type: "vec" as const, x: 1.5, y: 0, z: -2.5 },
      rot: { _type: "quat" as const, x: 0, y: 0, z: 0, w: 1 },
      id: { _type: "uuid" as const, id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" },
    }

    const json = codec.slencode(data)
    const decoded = codec.sldecode<typeof data>(json)

    expect(decoded.pos._type).toBe("vec")
    expect(decoded.pos.x).toBe(1.5)
    expect(decoded.pos.y).toBe(0)
    expect(decoded.pos.z).toBe(-2.5)

    expect(decoded.rot._type).toBe("quat")
    expect(decoded.rot.w).toBe(1)

    expect(decoded.id._type).toBe("uuid")
    expect(decoded.id.id).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
  })

  it("round-trips tight encoding with custom types", () => {
    const v: MyVec = { _type: "vec", x: 1, y: 0, z: 3 }
    const json = codec.slencode(v, { tight: true })
    const decoded = codec.sldecode<MyVec>(json)

    expect(decoded._type).toBe("vec")
    expect(decoded.x).toBe(1)
    expect(decoded.y).toBe(0)
    expect(decoded.z).toBe(3)
  })

  it("tight UUID encoding with custom types", () => {
    const u: MyUUID = { _type: "uuid", id: "00000000-0000-0000-0000-000000000000" }

    expect(codec.slencode(u, { tight: true })).toBe('"!u"')

    const u2: MyUUID = { _type: "uuid", id: "12345678-1234-1234-1234-123456789abc" }
    const tight = codec.slencode(u2, { tight: true })
    const decoded = codec.sldecode<MyUUID>(tight)

    expect(decoded._type).toBe("uuid")
    expect(decoded.id).toBe("12345678-1234-1234-1234-123456789abc")
  })

  it("no-arg createCodec behaves like defaults", () => {
    const defaultCodec = createCodec()

    const v = defaultCodec.sldecode<Vector>('"!v<1,2,3>"')

    expect(v).toBeInstanceOf(Vector)
    expect(v.x).toBe(1)

    const encoded = defaultCodec.slencode(new Vector(1, 2, 3))

    expect(encoded).toBe('"!v<1,2,3>"')
  })

  it("partial codec options fill in defaults for unspecified types", () => {
    const vectorOnlyCodec = createCodec({
      vector: {
        create: (x, y, z): MyVec => ({ _type: "vec", x, y, z }),
        test: (v): v is MyVec =>
          typeof v === "object" && v !== null && (v as MyVec)._type === "vec",
      },
    })

    // Custom vector
    const v = vectorOnlyCodec.sldecode<MyVec>('"!v<1,2,3>"')
    expect(v._type).toBe("vec")

    // Default quaternion
    const q = vectorOnlyCodec.sldecode<Quaternion>('"!q<0,0,0,1>"')
    expect(q).toBeInstanceOf(Quaternion)

    // Default UUID
    const u = vectorOnlyCodec.sldecode<UUID>('"!u12345678-1234-1234-1234-123456789abc"')
    expect(u).toBeInstanceOf(UUID)
  })
})
