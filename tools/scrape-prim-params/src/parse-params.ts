export interface PrimParamArg {
  type: string
  name: string
}

export interface PrimParamRule {
  name: string
  value: number
  args: PrimParamArg[]
}

export interface PrimParamRules {
  params: PrimParamRule[]
  typeShapes: PrimParamRule[]
}

/**
 * Parse a bracket-style usage string like "[ PRIM_NAME, string name ]"
 * into a list of typed arguments (excluding the constant name itself).
 *
 * Also handles edge cases from the wiki:
 * - Trailing commas: "[ PRIM_LINK_TARGET, integer link_target, ]"
 * - "integer boolean" -> treated as boolean type
 * - Missing commas: "integer glossiness integer environment" in PRIM_SPECULAR
 */
export function parseUsageString(usage: string): PrimParamArg[] {
  // Strip outer brackets and trim
  let inner = usage.replace(/^\[?\s*/, "").replace(/\s*\]?\s*$/, "")

  // Remove the constant name (first comma-separated segment)
  const firstComma = inner.indexOf(",")
  if (firstComma === -1) return []
  inner = inner.slice(firstComma + 1).trim()

  // Remove trailing comma
  inner = inner.replace(/,\s*$/, "")

  if (!inner) return []

  // Split on commas
  const parts = inner
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)

  const knownTypes = new Set(["string", "integer", "float", "vector", "rotation", "key"])

  const args: PrimParamArg[] = []

  for (const part of parts) {
    // Each part should be "type name" e.g. "string name", "integer face"
    // But some parts have missing commas: "integer glossiness integer environment"
    const tokens = part.split(/\s+/)

    let i = 0
    while (i < tokens.length) {
      const token = tokens[i]

      if (knownTypes.has(token)) {
        // Look ahead for the name
        if (i + 1 < tokens.length) {
          const name = tokens[i + 1]

          // "integer boolean" -> boolean semantics
          if (token === "integer" && name === "boolean") {
            args.push({ type: "boolean", name: "enabled" })
            i += 2
          } else if (knownTypes.has(name)) {
            // Next token is also a type — this token has no name
            args.push({ type: token, name: `arg${args.length}` })
            i += 1
          } else {
            args.push({ type: token, name })
            i += 2
          }
        } else {
          // Bare type with no name
          args.push({ type: token, name: `arg${args.length}` })
          i += 1
        }
      } else {
        // Unknown token — skip
        i += 1
      }
    }
  }

  return args
}
