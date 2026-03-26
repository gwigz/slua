/**
 * Generates the ll namespace API reference page for Fumadocs.
 *
 * Uses ts-morph to parse packages/types/index.d.ts, extracts all functions
 * from the `declare namespace ll { ... }` block, and outputs an MDX page with:
 * - Alphabetically grouped sections (A, B, C, ...)
 * - Each function with its JSDoc description and typed signature(s)
 * - Search-friendly text: ll.FunctionName, llFunctionName, FunctionName
 * - Deprecated functions shown with a callout and reason
 * - Links to the official LSL reference for each function
 *
 * Usage: bun tools/gen-api-docs/generate-ll.ts
 */

import { writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Project, type FunctionDeclaration } from "ts-morph"

const __dirname = dirname(fileURLToPath(import.meta.url))

const ROOT = resolve(__dirname, "../..")
const TYPES_FILE = resolve(ROOT, "packages/types/index.d.ts")
const OUTPUT_FILE = resolve(ROOT, "apps/web/content/docs/slua/api/ll.mdx")

const LSL_REF_BASE = "https://create.secondlife.com/script/lsl-reference/functions/ll"

interface LLFunction {
  name: string
  signature: string
  jsdoc: string
  deprecated: string | null
}

function escapeMdx(s: string): string {
  return s.replace(/</g, "\\<").replace(/>/g, "\\>").replace(/\{/g, "\\{").replace(/\}/g, "\\}")
}

function buildSignature(fn: FunctionDeclaration): string {
  const name = fn.getName()!
  const typeParams = fn.getTypeParameters()
  const typeParamStr =
    typeParams.length > 0 ? `<${typeParams.map((tp) => tp.getText()).join(", ")}>` : ""

  const params = fn.getParameters().map((p) => {
    const paramName = p.getName()
    const optional = p.isOptional() ? "?" : ""
    const type = p.getTypeNode()?.getText() ?? "unknown"

    return `${paramName}${optional}: ${type}`
  })

  const returnType = fn.getReturnTypeNode()?.getText() ?? "void"
  return `function ${name}${typeParamStr}(${params.join(", ")}): ${returnType}`
}

function extractJsDoc(fn: FunctionDeclaration): { description: string; deprecated: string | null } {
  const jsDocs = fn.getJsDocs()
  if (jsDocs.length === 0) return { description: "", deprecated: null }

  let description = ""
  let deprecated: string | null = null

  for (const doc of jsDocs) {
    // Extract @deprecated tag
    for (const tag of doc.getTags()) {
      if (tag.getTagName() === "deprecated") {
        const comment = tag.getCommentText()?.trim()
        deprecated = comment || "This function is deprecated."
      }
    }

    // Extract description (non-tag text)
    const comment = doc.getCommentText()?.trim()
    if (comment) {
      description = escapeMdx(comment)
    }
  }

  return { description, deprecated }
}

function groupByLetter(fns: LLFunction[]): Map<string, LLFunction[]> {
  const groups = new Map<string, LLFunction[]>()

  for (const fn of fns) {
    const letter = fn.name[0].toUpperCase()

    if (!groups.has(letter)) {
      groups.set(letter, [])
    }

    groups.get(letter)!.push(fn)
  }

  return new Map([...groups.entries()].toSorted(([a], [b]) => a.localeCompare(b)))
}

function lslRefUrl(name: string): string {
  return `${LSL_REF_BASE}${name.toLowerCase()}`
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
  lines.push(`<Callout type="info">`)
  lines.push(
    `  Function descriptions and signatures are sourced from the [lsl-definitions](https://github.com/secondlife/lsl-definitions) repository by Linden Lab and its contributors.`,
  )
  lines.push(`</Callout>`)
  lines.push(``)

  for (const [letter, fns] of grouped) {
    lines.push(`## ${letter}`)
    lines.push(``)

    for (const fn of fns) {
      if (fn.deprecated) {
        lines.push(`### ~~${fn.name}~~`)
      } else {
        lines.push(`### ${fn.name}`)
      }

      lines.push(``)

      // Search keywords: ll.Name for SLua style, llName links to LSL reference
      lines.push(`\`ll.${fn.name}\` · [\`ll${fn.name}\`](${lslRefUrl(fn.name)})`)
      lines.push(``)

      // Deprecated callout
      if (fn.deprecated) {
        lines.push(`<Callout type="warn" title="Deprecated">`)
        lines.push(escapeMdx(fn.deprecated))
        lines.push(`</Callout>`)
        lines.push(``)
      }

      // Description
      if (fn.jsdoc) {
        lines.push(fn.jsdoc)
        lines.push(``)
      }

      // Signature
      lines.push("```ts")
      lines.push(fn.signature)
      lines.push("```")
      lines.push(``)
    }
  }

  return lines.join("\n")
}

// Main
const project = new Project({ compilerOptions: { strict: true } })
const sourceFile = project.addSourceFileAtPath(TYPES_FILE)

// Find `declare namespace ll { ... }`
const llNamespace = sourceFile
  .getModules()
  .find((m) => m.getName() === "ll" && m.hasNamespaceKeyword())

if (!llNamespace) {
  throw new Error("Could not find 'declare namespace ll' in types file")
}

const exportedFunctions = llNamespace.getFunctions().filter((fn) => fn.isExported())

const functions: LLFunction[] = exportedFunctions.map((fn) => {
  const name = fn.getName()!
  const signature = buildSignature(fn)
  const { description, deprecated } = extractJsDoc(fn)

  return { name, signature, jsdoc: description, deprecated }
})

const deprecatedCount = functions.filter((fn) => fn.deprecated).length

console.log(
  `Parsed ${functions.length} unique functions (${deprecatedCount} deprecated) from ll namespace`,
)

const mdx = generateMdx(functions)

writeFileSync(OUTPUT_FILE, mdx)

console.log(`Generated ${OUTPUT_FILE}`)
