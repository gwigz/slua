/**
 * Case translation between the wire protocol and this package's API.
 *
 * The viewer speaks snake_case. Everything this package exports is camelCase,
 * and the conversion happens once at the JSON-RPC boundary rather than at each
 * call site, so no typed message has to carry both spellings.
 *
 * The transform is generic, so it also reaches keys inside payloads we do not
 * own: the `params` of an `editor.*` command, and whatever a command handler
 * returns. It therefore only touches keys shaped like protocol field names. A
 * key holding data, an inventory item called `Main` or an object called `Door
 * Control`, is left alone, and values are never touched.
 */

/** A wire field name: lowercase, underscore separated. */
const SNAKE_FIELD = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/

/** One of ours: lowerCamelCase, no separators. */
const CAMEL_FIELD = /^[a-z][a-zA-Z0-9]*$/

function camelKey(key: string): string {
  if (!SNAKE_FIELD.test(key)) return key

  // Letters only: `slot_2` has no camel spelling to go back from, so folding
  // it to `slot2` would make the pair asymmetric.
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())
}

function snakeKey(key: string): string {
  if (!CAMEL_FIELD.test(key)) return key

  return key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
}

function mapKeys(value: unknown, convert: (key: string) => string): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => mapKeys(entry, convert))
  }

  // `null` is typeof "object", and a class instance is not something we can
  // rebuild by copying its own enumerable keys, so both pass through.
  if (
    value === null ||
    typeof value !== "object" ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return value
  }

  const result: Record<string, unknown> = {}

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    result[convert(key)] = mapKeys(entry, convert)
  }

  return result
}

export function toCamel<T = unknown>(value: unknown): T {
  return mapKeys(value, camelKey) as T
}

export function toSnake<T = unknown>(value: unknown): T {
  return mapKeys(value, snakeKey) as T
}
