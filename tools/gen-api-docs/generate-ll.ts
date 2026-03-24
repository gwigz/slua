/**
 * Generates the ll namespace API reference page for Fumadocs.
 *
 * Reads packages/types/index.d.ts, extracts all functions from the
 * `declare namespace ll { ... }` block, and outputs an MDX page with:
 * - Alphabetically grouped sections (A, B, C, ...)
 * - Each function with its JSDoc description and typed signature(s)
 * - Overloaded functions grouped under one heading
 * - Search-friendly text: ll.FunctionName, llFunctionName, FunctionName
 * - Deprecated functions shown with a callout and reason
 *
 * Usage: bun tools/gen-api-docs/generate-ll.ts
 */

import { readFileSync, writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../..")
const TYPES_FILE = resolve(ROOT, "packages/types/index.d.ts")
const OUTPUT_FILE = resolve(ROOT, "apps/web/content/docs/api/ll.mdx")

interface LLOverload {
  signature: string
  jsdoc: string
  deprecated: string | null
}

interface LLFunction {
  name: string
  overloads: LLOverload[]
}

function extractLLNamespace(source: string): string {
  const start = source.indexOf("declare namespace ll {")
  if (start === -1) throw new Error("Could not find 'declare namespace ll' in types file")

  let depth = 0
  let i = source.indexOf("{", start)
  const blockStart = i + 1

  for (; i < source.length; i++) {
    if (source[i] === "{") depth++
    else if (source[i] === "}") {
      depth--
      if (depth === 0) return source.slice(blockStart, i)
    }
  }

  throw new Error("Unterminated namespace block")
}

function escapeMdx(s: string): string {
  return s.replace(/</g, "\\<").replace(/>/g, "\\>").replace(/\{/g, "\\{").replace(/\}/g, "\\}")
}

function parseFunctions(block: string): LLFunction[] {
  const byName = new Map<string, LLOverload[]>()
  const order: string[] = []

  // Match JSDoc + export function patterns
  const regex = /(?:\/\*\*([\s\S]*?)\*\/\s*)?export function (\w+)\(([\s\S]*?)\):\s*([^\n]+)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(block)) !== null) {
    const [, rawJsdoc, name, params, returnType] = match

    let jsdoc = ""
    let deprecated: string | null = null

    if (rawJsdoc) {
      const lines = rawJsdoc.split("\n").map((line) => line.replace(/^\s*\*\s?/, "").trim())

      // Extract @deprecated reason
      const deprecatedLine = lines.find((l) => l.startsWith("@deprecated"))
      if (deprecatedLine) {
        deprecated =
          deprecatedLine.replace(/^@deprecated\s*/, "").trim() || "This function is deprecated."
      }

      // Description: non-empty, non-tag lines
      jsdoc = escapeMdx(
        lines
          .filter((line) => !line.startsWith("@") && line.length > 0)
          .join(" ")
          .trim(),
      )
    }

    // Clean up params (normalize whitespace)
    const cleanParams = params
      .split("\n")
      .map((l) => l.trim())
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()

    const signature = `function ${name}(${cleanParams}): ${returnType.trim()}`

    if (!byName.has(name)) {
      byName.set(name, [])
      order.push(name)
    }
    byName.get(name)!.push({ signature, jsdoc, deprecated })
  }

  return order.map((name) => ({
    name,
    overloads: byName.get(name)!,
  }))
}

function groupByLetter(fns: LLFunction[]): Map<string, LLFunction[]> {
  const groups = new Map<string, LLFunction[]>()

  for (const fn of fns) {
    const letter = fn.name[0].toUpperCase()
    if (!groups.has(letter)) groups.set(letter, [])
    groups.get(letter)!.push(fn)
  }

  return new Map([...groups.entries()].toSorted(([a], [b]) => a.localeCompare(b)))
}

function generateMdx(functions: LLFunction[]): string {
  const grouped = groupByLetter(functions)
  const lines: string[] = []

  lines.push(`---`)
  lines.push(`title: Functions`)
  lines.push(`description: The complete LSL API — ${functions.length} functions`)
  lines.push(`---`)
  lines.push(``)
  lines.push(`The \`ll\` namespace contains all ${functions.length} LSL API functions.`)
  lines.push(``)

  for (const [letter, fns] of grouped) {
    lines.push(`## ${letter}`)
    lines.push(``)

    for (const fn of fns) {
      const deprecated = fn.overloads.find((o) => o.deprecated)?.deprecated

      // Heading with function name
      if (deprecated) {
        lines.push(`### ~~${fn.name}~~`)
      } else {
        lines.push(`### ${fn.name}`)
      }

      lines.push(``)

      // Search keywords: ll.PlaySound and llPlaySound
      lines.push(`\`ll.${fn.name}\` · \`ll${fn.name}\``)
      lines.push(``)

      // Deprecated callout
      if (deprecated) {
        lines.push(`<Callout type="warn" title="Deprecated">`)
        lines.push(escapeMdx(deprecated))
        lines.push(`</Callout>`)
        lines.push(``)
      }

      // Description
      const jsdoc = fn.overloads.find((o) => o.jsdoc)?.jsdoc
      if (jsdoc) {
        lines.push(jsdoc)
        lines.push(``)
      }

      // Signature(s) as code block
      lines.push("```ts")
      for (const overload of fn.overloads) {
        lines.push(overload.signature)
      }
      lines.push("```")
      lines.push(``)
    }
  }

  return lines.join("\n")
}

// Main
const source = readFileSync(TYPES_FILE, "utf-8")
const block = extractLLNamespace(source)
const functions = parseFunctions(block)

const deprecatedCount = functions.filter((fn) => fn.overloads.some((o) => o.deprecated)).length

console.log(
  `Parsed ${functions.length} unique functions (${deprecatedCount} deprecated) from ll namespace`,
)

const mdx = generateMdx(functions)

writeFileSync(OUTPUT_FILE, mdx)

console.log(`Generated ${OUTPUT_FILE}`)
