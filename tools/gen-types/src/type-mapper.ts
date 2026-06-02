/**
 * Luau-to-TypeScript type mapper.
 *
 * Converts Luau type annotation strings into their TypeScript equivalents.
 * This is a self-contained string transformation utility with no external
 * dependencies.
 */

const PRIMITIVES: Record<string, string> = {
  number: "number",
  string: "string",
  boolean: "boolean",
  nil: "undefined",
  any: "any",
  never: "never",
  thread: "LuaThread",
  buffer: "buffer",
}

const PASSTHROUGH_TYPES = new Set([
  "Vector",
  "Quaternion",
  "UUID",
  "DetectedEvent",
  "LLEvents",
  "LLTimers",
  "LLEventName",
  "ExperienceDetails",
  "DamageDetails",
  "PhysicsMaterial",
])

const LUAU_TYPE_ALIASES: Record<string, string> = {
  vector: "Vector",
  quaternion: "Quaternion",
  uuid: "UUID",
  rotation: "Quaternion",
}

// Luau "magic" type functions have no TypeScript equivalent, so map them to a concrete type.
const MAGIC_TYPE_FUNCTIONS: Record<string, (args: string[]) => string> = {
  setmetatable: (args) => mapType(args[0] ?? "any"),
  getmetatable: () => "Record<string, any> | undefined",
}

/**
 * Check if a string has balanced parentheses and braces.
 */
function isBalanced(input: string) {
  let depth = 0

  for (const ch of input) {
    if (ch === "(" || ch === "{") depth++
    else if (ch === ")" || ch === "}") depth--

    if (depth < 0) return false
  }

  return depth === 0
}

/**
 * Find the first colon at the top level (not inside parens/braces).
 * Returns -1 if not found.
 */
function findTopLevelColon(input: string) {
  let depth = 0

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]

    if (ch === "(" || ch === "{") depth++
    else if (ch === ")" || ch === "}") depth--
    else if (depth === 0 && ch === ":") return i
  }

  return -1
}

/**
 * Split a string on a delimiter, but only at the top level -- i.e. not inside
 * nested parentheses `()`, braces `{}`, or string literals `""`.
 */
export function splitTopLevel(input: string, delimiter: string) {
  const parts: string[] = []
  let current = ""
  let depth = 0
  let inString = false

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]

    // Handle string literals
    if (ch === '"' && !inString) {
      inString = true
      current += ch
      continue
    }
    if (ch === '"' && inString) {
      inString = false
      current += ch
      continue
    }
    if (inString) {
      current += ch
      continue
    }

    if (ch === "(" || ch === "{") {
      depth++
      current += ch
    } else if (ch === ")" || ch === "}") {
      depth--
      current += ch
    } else if (depth === 0 && input.slice(i, i + delimiter.length) === delimiter) {
      parts.push(current)
      current = ""
      i += delimiter.length - 1
    } else {
      current += ch
    }
  }

  parts.push(current)

  return parts
}

/**
 * Map a Luau function parameter list to TypeScript.
 *
 * Splits on commas (respecting nested parens/braces), then maps each
 * `name: type` pair. Handles the variadic `...any` form specially.
 */
function mapFunctionParams(params: string): string {
  const trimmed = params.trim()

  if (trimmed === "") {
    return ""
  }

  const parts = splitTopLevel(trimmed, ",").map((p) => p.trim())

  let argCounter = 0

  return parts
    .map((part) => {
      // Variadic: ...any
      if (part.startsWith("...")) {
        const varType = part.slice(3).trim()

        return `...args: ${mapType(varType)}[]`
      }

      // Find the first colon at the top level (not inside braces/parens)
      const colonIdx = findTopLevelColon(part)

      if (colonIdx !== -1) {
        const name = part.slice(0, colonIdx).trim()
        const type = part.slice(colonIdx + 1).trim()

        // Make sure the name is actually an identifier (not part of a type like {[K]: V})
        if (/^\w+$/.test(name)) {
          return `${name}: ${mapType(type)}`
        }
      }

      // Bare type with no name -- auto-generate a parameter name
      const mapped = mapType(part)
      const argName = `arg${argCounter++}`
      return `${argName}: ${mapped}`
    })
    .join(", ")
}

/**
 * Check if a field string looks like a valid struct field:
 * - Named field: `name: type` or `name?: type` (implicit optional)
 * - Indexer field: `[K]: V`
 */
function isStructField(field: string) {
  const colonIdx = field.indexOf(":")
  if (colonIdx <= 0) return false

  const name = field.slice(0, colonIdx).trim()

  // Named field: simple identifier, possibly with trailing ?
  if (/^\w+\??$/.test(name)) return true

  // Indexer field: [type]
  if (/^\[\w+\]$/.test(name)) return true

  return false
}

/**
 * Check if a brace-enclosed type is a named struct (Luau table literal with
 * named fields) rather than an array or Record type.
 *
 * A named struct looks like `{ key: type, key2: type?, ... }` where
 * each field has a `name: type` format separated by commas.
 * May also include indexer fields like `[number]: V`.
 * This is distinguished from `{[K]: V}` (pure table/Record) and `{T}` (array).
 */
function isNamedStruct(inner: string) {
  // Split on top-level commas
  const fields = splitTopLevel(inner, ",")
    .map((f) => f.trim())
    .filter((f) => f !== "")

  if (fields.length < 2) {
    // Single field: must be a named field (not an indexer, as that's a Record)
    if (fields.length === 1) {
      const field = fields[0]
      const colonIdx = field.indexOf(":")

      if (colonIdx > 0) {
        const name = field.slice(0, colonIdx).trim()
        if (/^\w+$/.test(name)) {
          return true
        }
      }
    }

    return false
  }

  // Multiple fields: must have at least one named field (not just indexers)
  let hasNamedField = false

  for (const field of fields) {
    if (!isStructField(field)) {
      return false
    }

    const colonIdx = field.indexOf(":")
    const name = field.slice(0, colonIdx).trim()

    if (/^\w+\??$/.test(name)) {
      hasNamedField = true
    }
  }

  return hasNamedField
}

/**
 * Map a Luau named struct type `{ key: type, key2: type? }` to TypeScript
 * object type `{ key: type; key2?: type }`.
 * Also handles indexer fields like `[number]: V`.
 */
function mapNamedStruct(inner: string): string {
  const fields = splitTopLevel(inner, ",")
    .map((f) => f.trim())
    .filter((f) => f !== "")

  const tsFields = fields.map((field) => {
    const colonIdx = field.indexOf(":")
    const rawName = field.slice(0, colonIdx).trim()
    const rawType = field.slice(colonIdx + 1).trim()

    // Indexer field: [K]: V -> [index: K]: V
    const indexerMatch = rawName.match(/^\[(\w+)\]$/)

    if (indexerMatch) {
      const keyType = mapType(indexerMatch[1].trim())
      const valType = mapType(rawType)
      return `[index: ${keyType}]: ${valType}`
    }

    // Check if the type ends with ? (optional field in Luau)
    let name = rawName
    let type = rawType
    let optional = false

    if (type.endsWith("?") && !type.includes("|") && !type.includes("(")) {
      optional = true
      type = type.slice(0, -1).trim()
    }

    const mappedType = mapType(type)

    if (optional) {
      return `${name}?: ${mappedType}`
    }
    return `${name}: ${mappedType}`
  })

  return `{ ${tsFields.join("; ")} }`
}

/**
 * Check if a type string contains Luau variadic type pack references like
 * `A...`, `R...`, `R1...`, etc.
 */
function containsVariadicPack(type: string) {
  return /[A-Z]\w*\.\.\./.test(type)
}

/**
 * Convert a Luau type annotation string to its TypeScript equivalent.
 */
export function mapType(luauType: string): string {
  const input = luauType.trim()

  if (input === "") {
    return "any"
  }

  if (input === "()" || input === "void") {
    return "void"
  }

  if (/^[A-Z]\w*\.\.\.$/.test(input)) {
    return "any[]"
  }

  if (input.startsWith("...")) {
    const varType = input.slice(3).trim()

    // If the variadic type is itself a pack reference, simplify
    if (containsVariadicPack(varType)) {
      return `...args: any[]`
    }

    return `...args: ${mapType(varType)}[]`
  }

  if (input.endsWith("?") && !input.includes("|")) {
    const base = input.slice(0, -1).trim()

    // Validate that the base is balanced (all parens/braces closed)
    if (isBalanced(base)) {
      const mapped = mapType(base)

      // Parenthesize function types so `| undefined` applies to the whole type
      if (mapped.includes("=>")) {
        return `(${mapped}) | undefined`
      }

      return `${mapped} | undefined`
    }
  }

  if (input in PRIMITIVES) {
    return PRIMITIVES[input]
  }

  if (input in LUAU_TYPE_ALIASES) {
    return LUAU_TYPE_ALIASES[input]
  }

  const magicMatch = input.match(/^([a-z]\w*)<(.+)>$/)
  if (magicMatch && magicMatch[1] in MAGIC_TYPE_FUNCTIONS) {
    const args = splitTopLevel(magicMatch[2], ",").map((a) => a.trim())

    return MAGIC_TYPE_FUNCTIONS[magicMatch[1]](args)
  }

  if (PASSTHROUGH_TYPES.has(input)) {
    return input
  }

  if (input.startsWith('"') && input.endsWith('"')) {
    return input
  }

  // Must come before the function-type check: `A | (B) -> C` has a top-level
  // `->` that would otherwise match as a function type.
  const unionParts = splitTopLevel(input, " | ")

  if (unionParts.length > 1) {
    return unionParts
      .map((part) => {
        const mapped = mapType(part.trim())

        // Function types in unions must be parenthesized in TypeScript
        if (mapped.includes("=>")) {
          return `(${mapped})`
        }

        return mapped
      })
      .join(" | ")
  }

  const arrowIdx = findTopLevelArrow(input)

  if (arrowIdx !== -1) {
    // Extract param section (should be in parens) and return type
    const paramSection = input.slice(0, arrowIdx).trim()
    const returnSection = input.slice(arrowIdx + 2).trim()

    // If the function type contains variadic packs, simplify the whole thing
    if (containsVariadicPack(input)) {
      return `(...args: any[]) => any`
    }

    // Strip outer parens from param section
    let paramsInner = paramSection

    if (paramsInner.startsWith("(") && paramsInner.endsWith(")")) {
      paramsInner = paramsInner.slice(1, -1).trim()
    }

    const mappedParams = mapFunctionParams(paramsInner)
    const mappedReturn = mapReturnType(returnSection)

    // Add `this: void` so TSTL never inserts a spurious `self` argument
    // when these function types are used as callback parameters.
    const params = mappedParams ? `this: void, ${mappedParams}` : "this: void"

    return `(${params}) => ${mappedReturn}`
  }

  if (input.startsWith("{") && input.endsWith("}")) {
    const inner = input.slice(1, -1).trim()

    // Table type: {[K]: V}
    const tableMatch = inner.match(/^\[([^\]]+)\]\s*:\s*(.+)$/)

    if (tableMatch) {
      const keyType = mapType(tableMatch[1].trim())
      const valType = mapType(tableMatch[2].trim())

      return `Record<${keyType}, ${valType}>`
    }

    // Luau shorthand table type: {[K], V} (comma instead of colon)
    const shorthandTableMatch = inner.match(/^\[([^\]]+)\]\s*,\s*(.+)$/)

    if (shorthandTableMatch) {
      const keyType = mapType(shorthandTableMatch[1].trim())
      const valType = mapType(shorthandTableMatch[2].trim())

      return `Record<${keyType}, ${valType}>`
    }

    // Named struct: { key: type, key2: type? }
    if (isNamedStruct(inner)) {
      return mapNamedStruct(inner)
    }

    // Union array: {A | B | C}
    const innerUnionParts = splitTopLevel(inner, " | ")
    if (innerUnionParts.length > 1) {
      const mapped = innerUnionParts.map((p) => mapType(p.trim())).join(" | ")

      return `(${mapped})[]`
    }

    // Simple array: {T}
    return `${mapType(inner)}[]`
  }

  if (input.startsWith("(") && input.endsWith(")")) {
    const inner = input.slice(1, -1).trim()

    // Check if it's a single type (no top-level commas)
    const commaParts = splitTopLevel(inner, ",").map((p) => p.trim())

    if (commaParts.length === 1) {
      return mapType(inner)
    }

    // Multi-element tuple in a type position -- map each element
    // This shouldn't normally appear except in return position (handled by mapReturnType)
    const mapped = commaParts.map((p) => mapType(p.trim()))

    return `LuaMultiReturn<[${mapped.join(", ")}]>`
  }

  return input
}

/**
 * Map a Luau return type to TypeScript.
 *
 * Luau functions can return tuples like `(boolean, string)` which need to be
 * converted to `LuaMultiReturn<[boolean, string]>`. Single return types are
 * just mapped normally.
 *
 * Also handles:
 * - Variadic returns `...any` -> `any`
 * - Tuple returns with optional suffix `(K, V)?` -> `LuaMultiReturn<[K, V]> | undefined`
 * - Variadic pack returns `R...` -> `any`
 */
export function mapReturnType(luauType: string): string {
  const input = luauType.trim()

  // Void
  if (input === "()" || input === "void" || input === "") {
    return "void"
  }

  // Variadic returns: "...any", "...string", etc. -> the element type
  // (In TypeScript, we can't have variadic returns, so simplify)
  if (input.startsWith("...")) {
    const varType = input.slice(3).trim()
    const mapped = mapType(varType)

    // Strip trailing [] if present (mapType adds it for some types)
    return mapped.endsWith("[]") ? mapped : `${mapped}[]`
  }

  // Variadic type pack reference as return: "R..." -> "any"
  if (/^[A-Z]\w*\.\.\.$/.test(input)) {
    return "any"
  }

  // If it contains variadic packs anywhere, simplify
  if (containsVariadicPack(input)) {
    return "any"
  }

  // Parenthesized return type -- could be a tuple or just grouping
  if (input.startsWith("(") && input.endsWith(")")) {
    const inner = input.slice(1, -1).trim()
    const parts = splitTopLevel(inner, ",").map((p) => p.trim())

    if (parts.length === 1) {
      // Single element in parens -- just unwrap
      return mapReturnType(inner)
    }

    // Multi-element tuple return
    const mapped = parts.map((p) => {
      // Handle optional elements in tuple like "number?"
      return mapType(p)
    })

    return `LuaMultiReturn<[${mapped.join(", ")}]>`
  }

  // Optional tuple: "(A, B)?" -- strip the ? and wrap
  if (input.endsWith("?")) {
    const base = input.slice(0, -1).trim()

    if (base.startsWith("(") && base.endsWith(")")) {
      return `${mapReturnType(base)} | undefined`
    }
  }

  // For everything else, delegate to mapType
  return mapType(input)
}

/**
 * Find the index of the top-level "->" arrow in a type string, ignoring
 * arrows nested inside parentheses or braces.
 * Returns -1 if not found.
 */
function findTopLevelArrow(input: string) {
  let depth = 0
  let inString = false

  for (let i = 0; i < input.length - 1; i++) {
    const ch = input[i]

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) {
      continue
    }

    if (ch === "(" || ch === "{") {
      depth++
    } else if (ch === ")" || ch === "}") {
      depth--
    } else if (depth === 0 && ch === "-" && input[i + 1] === ">") {
      return i
    }
  }

  return -1
}
