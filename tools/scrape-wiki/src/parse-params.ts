import { readFileSync } from "fs"
import { resolve } from "path"
import { parse as parseYaml } from "yaml"
import type { TypedListArg, TypedListRule, TypedListParamSet } from "./types.js"

const KNOWN_TYPES = new Set(["string", "integer", "float", "vector", "rotation", "key"])

/**
 * Parse an inline "type name" parameter string (e.g. "integer flags", "vector position").
 * Handles "integer boolean" and "integer isActive" as boolean type.
 */
export function parseInlineParam(text: string): TypedListArg[] {
  const tokens = text.trim().split(/\s+/)
  if (tokens.length >= 2 && KNOWN_TYPES.has(tokens[0])) {
    const name = tokens.slice(1).join("_")
    if (tokens[0] === "integer" && (name === "boolean" || name === "isActive")) {
      return [{ type: "boolean", name: name === "boolean" ? "enabled" : name }]
    }
    return [{ type: tokens[0], name }]
  }
  return []
}

/**
 * Load integer constant values from lsl_definitions.yaml filtered by prefix.
 */
let _lslDefs: any | null = null

function getLslDefs() {
  if (!_lslDefs) {
    const yamlPath = resolve(import.meta.dir, "../../../refs/lsl-definitions/lsl_definitions.yaml")
    _lslDefs = parseYaml(readFileSync(yamlPath, "utf8"))
  }
  return _lslDefs
}

export function loadConstantValues(prefix: string): Record<string, number> {
  const lslDefs = getLslDefs()
  const constants: Record<string, number> = {}
  for (const [name, def] of Object.entries(lslDefs.constants ?? {})) {
    if (name.startsWith(prefix) && (def as any).value != null) {
      constants[name] = parseInt(String((def as any).value), 10)
    }
  }
  return constants
}

/**
 * Normalize a wiki "Description" cell into a single-line JSDoc-friendly comment.
 *
 * Cheerio's .text() strips block tags without inserting whitespace, so two
 * sentences split by a <br> come through as "name.If id is...". Collapse runs
 * of whitespace, then re-space sentence boundaries that got glued together.
 */
export function cleanDescription(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/([.!?,;:])([A-Z])/g, "$1 $2")
    .trim()
}

/**
 * Fetch a URL and return the HTML text, throwing on non-OK responses.
 */
export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  return res.text()
}

/**
 * Scrape a simple constant-list table (flag | value columns, no args).
 * Used for getter-only functions like llGetObjectDetails and llGetParcelDetails.
 */
export async function scrapeConstantList(opts: {
  url: string
  landmarks: string[]
  prefix: string
  name: string
  functions: string[]
  returns?: Record<string, TypedListArg[]>
  /** Zero-based index of the table column holding the flag description, if any. */
  descCol?: number
}): Promise<TypedListParamSet[]> {
  const { load } = await import("cheerio")
  const html = await fetchHtml(opts.url)
  const $ = load(html)

  let table: ReturnType<typeof $> | null = null
  $("table").each((_, t) => {
    const text = $(t).text()
    if (opts.landmarks.every((l) => text.includes(l))) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error(`Could not find table on ${opts.url}`)

  const params: TypedListRule[] = []

  ;(table as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 2) return

    const flag = cells.eq(0).text().trim()
    const value = parseInt(cells.eq(1).text().trim(), 10)

    if (!flag.startsWith(opts.prefix) || isNaN(value)) return

    const comment =
      opts.descCol != null && cells.length > opts.descCol
        ? cleanDescription(cells.eq(opts.descCol).text())
        : ""

    params.push({
      name: flag,
      value,
      args: [],
      returns: opts.returns?.[flag],
      ...(comment ? { comment } : {}),
    })
  })

  return [{ name: opts.name, functions: opts.functions, params }]
}

/**
 * Parse a raw comma-separated parameter text like "integer face, vector color, float alpha"
 * into typed args. Handles the same edge cases as parseUsageString.
 */
export function parseRawParams(text: string): TypedListArg[] {
  return parseUsageString(`[ DUMMY, ${text} ]`)
}

/**
 * Parse a bracket-style usage string like "[ PRIM_NAME, string name ]"
 * into a list of typed arguments (excluding the constant name itself).
 *
 * Handles edge cases from the wiki:
 * - Trailing commas: "[ PRIM_LINK_TARGET, integer link_target, ]"
 * - "integer boolean" -> treated as boolean type
 * - Missing commas: "integer glossiness integer environment" in PRIM_SPECULAR
 */
export function parseUsageString(usage: string): TypedListArg[] {
  let inner = usage.replace(/^\[?\s*/, "").replace(/\s*\]?\s*$/, "")

  const firstComma = inner.indexOf(",")
  if (firstComma === -1) return []
  inner = inner.slice(firstComma + 1).trim()

  inner = inner.replace(/,\s*$/, "")

  if (!inner) return []

  const parts = inner
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)

  const args: TypedListArg[] = []

  for (const part of parts) {
    const tokens = part.split(/\s+/)

    let i = 0
    while (i < tokens.length) {
      const token = tokens[i]

      if (KNOWN_TYPES.has(token)) {
        if (i + 1 < tokens.length) {
          const name = tokens[i + 1]

          if (token === "integer" && name === "boolean") {
            args.push({ type: "boolean", name: "enabled" })
            i += 2
          } else if (KNOWN_TYPES.has(name)) {
            args.push({ type: token, name: `arg${args.length}` })
            i += 1
          } else {
            args.push({ type: token, name })
            i += 2
          }
        } else {
          args.push({ type: token, name: `arg${args.length}` })
          i += 1
        }
      } else {
        i += 1
      }
    }
  }

  return args
}
