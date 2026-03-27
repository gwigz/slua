/**
 * Generates the global functions API reference page for Fumadocs.
 *
 * Uses ts-morph to parse packages/types/index.d.ts, extracts all top-level
 * declare function statements (excluding the ll namespace), and outputs an
 * MDX page with:
 * - Lua standard globals and SLua-specific globals grouped separately
 * - Each function with its JSDoc description and typed signature
 *
 * Usage: bun tools/gen-api-docs/generate-globals.ts
 */

import { writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Project, type FunctionDeclaration } from "ts-morph"

const __dirname = dirname(fileURLToPath(import.meta.url))

const ROOT = resolve(__dirname, "../..")
const TYPES_FILE = resolve(ROOT, "packages/types/index.d.ts")
const OUTPUT_FILE = resolve(ROOT, "apps/web/content/docs/slua/api/globals.mdx")

const SLUA_GLOBALS = new Set(["touuid", "tovector", "toquaternion", "torotation"])
const OMIT_GLOBALS = new Set<string>(["dangerouslyexecuterequiredmodule"])

function escapeMdx(s: string): string {
  return s
    .replace(/</g, "\\<")
    .replace(/>/g, "\\>")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
}

function buildSignature(fn: FunctionDeclaration): string {
  const name = fn.getName()!
  const typeParams = fn.getTypeParameters()

  const typeParamStr =
    typeParams.length > 0 ? `<${typeParams.map((tp) => tp.getText()).join(", ")}>` : ""

  const params = fn.getParameters().map((p) => {
    const paramName = p.getName()
    const optional = p.hasQuestionToken() ? "?" : ""
    const type = p.getTypeNode()?.getText() ?? "unknown"

    return `${paramName}${optional}: ${type}`
  })

  const returnType = fn.getReturnTypeNode()?.getText() ?? "void"

  return `function ${name}${typeParamStr}(${params.join(", ")}): ${returnType}`
}

function extractJsDoc(fn: FunctionDeclaration): string {
  const jsDocs = fn.getJsDocs()

  if (jsDocs.length === 0) return ""

  for (const doc of jsDocs) {
    const comment = doc.getCommentText()?.trim()
    if (comment) return escapeMdx(comment)
  }

  return ""
}

interface GlobalFunction {
  name: string
  signature: string
  jsdoc: string
}

function renderFunctions(fns: GlobalFunction[]): string[] {
  const lines: string[] = []

  for (const fn of fns) {
    lines.push(`### \`${fn.name}\``)
    lines.push(``)

    if (fn.jsdoc) {
      lines.push(fn.jsdoc)
      lines.push(``)
    }

    lines.push("```ts")
    lines.push(fn.signature)
    lines.push("```")
    lines.push(``)
  }

  return lines
}

function generateMdx(luaFns: GlobalFunction[], sluaFns: GlobalFunction[]): string {
  const lines: string[] = []

  lines.push(`---`)
  lines.push(`title: Global Functions`)
  lines.push(`description: Lua and SLua global functions`)
  lines.push(`---`)
  lines.push(``)
  lines.push(`## Lua Standard Globals`)
  lines.push(``)
  lines.push(`Standard Lua functions available in the SLua runtime:`)
  lines.push(``)
  lines.push(...renderFunctions(luaFns))
  lines.push(`## SLua-specific Globals`)
  lines.push(``)
  lines.push(...renderFunctions(sluaFns))

  return lines.join("\n")
}

// Main
const project = new Project({ compilerOptions: { strict: true } })
const sourceFile = project.addSourceFileAtPath(TYPES_FILE)

const allFunctions = sourceFile.getFunctions()

const luaFns: GlobalFunction[] = []
const sluaFns: GlobalFunction[] = []

for (const fn of allFunctions) {
  const name = fn.getName()

  if (!name || OMIT_GLOBALS.has(name)) {
    continue
  }

  const signature = buildSignature(fn)
  const jsdoc = extractJsDoc(fn)
  const entry: GlobalFunction = { name, signature, jsdoc }

  if (SLUA_GLOBALS.has(name)) {
    sluaFns.push(entry)
  } else {
    luaFns.push(entry)
  }
}

// Sort alphabetically
luaFns.sort((a, b) => a.name.localeCompare(b.name))
sluaFns.sort((a, b) => a.name.localeCompare(b.name))

console.log(
  `Parsed ${luaFns.length} Lua standard globals and ${sluaFns.length} SLua-specific globals`,
)

const mdx = generateMdx(luaFns, sluaFns)

writeFileSync(OUTPUT_FILE, mdx)

console.log(`Generated ${OUTPUT_FILE}`)
