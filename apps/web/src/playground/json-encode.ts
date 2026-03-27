import { Vector, Quaternion, UUID, slencode } from "@gwigz/slua-json"

export interface DetectionOptions {
  detectVectors: boolean
  detectQuaternions: boolean
  detectUuids: boolean
}

export interface EncodeOptions {
  tight: boolean
  prettyPrint: boolean
}

export interface EncodeResult {
  output: string
  error: string | null
}

const VECTOR_STRING_RE = /^<\s*(-?[\d.eE+-]+)\s*,\s*(-?[\d.eE+-]+)\s*,\s*(-?[\d.eE+-]+)\s*>$/

const QUATERNION_STRING_RE =
  /^<\s*(-?[\d.eE+-]+)\s*,\s*(-?[\d.eE+-]+)\s*,\s*(-?[\d.eE+-]+)\s*,\s*(-?[\d.eE+-]+)\s*>$/

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function detectAndReplace(value: unknown, options: DetectionOptions): unknown {
  if (typeof value === "string") {
    if (options.detectQuaternions) {
      const qm = QUATERNION_STRING_RE.exec(value)

      if (qm) {
        return new Quaternion(Number(qm[1]), Number(qm[2]), Number(qm[3]), Number(qm[4]))
      }
    }

    if (options.detectVectors) {
      const vm = VECTOR_STRING_RE.exec(value)
      if (vm) {
        return new Vector(Number(vm[1]), Number(vm[2]), Number(vm[3]))
      }
    }

    if (options.detectUuids && UUID_RE.test(value)) {
      return new UUID(value)
    }

    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) => detectAndReplace(item, options))
  }

  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)

    if (
      options.detectQuaternions &&
      keys.length === 4 &&
      "x" in obj &&
      "y" in obj &&
      "z" in obj &&
      "w" in obj
    ) {
      const { x, y, z, w } = obj

      if (
        typeof x === "number" &&
        typeof y === "number" &&
        typeof z === "number" &&
        typeof w === "number"
      ) {
        return new Quaternion(x, y, z, w)
      }
    }

    if (options.detectVectors && keys.length === 3 && "x" in obj && "y" in obj && "z" in obj) {
      const { x, y, z } = obj

      if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
        return new Vector(x, y, z)
      }
    }

    const result: Record<string, unknown> = {}

    for (const key of keys) {
      result[key] = detectAndReplace(obj[key], options)
    }

    return result
  }

  return value
}

export function jsonToSlencode(
  input: string,
  detection: DetectionOptions,
  encode: EncodeOptions,
): EncodeResult {
  try {
    if (!input.trim()) {
      return { output: "", error: "No input" }
    }

    let parsed: unknown

    try {
      parsed = JSON.parse(input)
    } catch (e) {
      return { output: "", error: `Invalid JSON: ${(e as Error).message}` }
    }

    const detected = detectAndReplace(parsed, detection)
    let result = slencode(detected, encode.tight ? { tight: true } : undefined)

    if (encode.prettyPrint) {
      try {
        result = JSON.stringify(JSON.parse(result), null, 2)
      } catch {
        // slencode output may contain special number literals; return raw
      }
    }

    return { output: result, error: null }
  } catch (e) {
    return { output: "", error: (e as Error).message }
  }
}
