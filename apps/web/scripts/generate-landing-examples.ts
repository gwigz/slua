/**
 * Build-time script that transpiles TypeScript landing page examples through
 * the real TSTL pipeline. Outputs a generated module consumed by the Code
 * Gallery server component.
 *
 * Uses the same CompilerHost pattern as packages/tstl-plugin/src/__tests__/helpers.ts.
 */

import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import { getPlugins } from "typescript-to-lua/dist/transpilation/plugins"
import { getProgramTranspileResult } from "typescript-to-lua/dist/transpilation/transpile"
import createPlugin from "@gwigz/slua-tstl-plugin"
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { formatLua } from "../src/playground/worker/format-lua"

const _require = createRequire(import.meta.url)
const root = path.resolve(import.meta.dirname, "..")
const outDir = path.resolve(root, "src/components/landing/generated")

// Paths

const tsLibDir = path.dirname(_require.resolve("typescript/lib/lib.d.ts"))

const sluaTypes = fs
  .readFileSync(path.resolve(root, "../../packages/types/index.d.ts"), "utf-8")
  .replace(/\/\/\/\s*<reference\s+types="[^"]*"\s*\/>\s*\n?/g, "")

const langExtTypes = fs.readFileSync(
  _require.resolve("@typescript-to-lua/language-extensions/index.d.ts"),
  "utf-8",
)

const modulesDir = path.resolve(root, "../../packages/modules/src")

// Source file cache

const sourceFileCache = new Map<string, ts.SourceFile>()

function getCachedSourceFile(fileName: string, content: string): ts.SourceFile {
  let sf = sourceFileCache.get(fileName)

  if (!sf) {
    sf = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, false)
    sourceFileCache.set(fileName, sf)
  }

  return sf
}

// CompilerHost

function createHost(files: Record<string, string>): ts.CompilerHost {
  return {
    fileExists: (fileName) => fileName in files || ts.sys.fileExists(fileName),
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => "",
    getDefaultLibFileName: ts.getDefaultLibFileName,
    readFile: (fileName) => (fileName in files ? files[fileName] : ts.sys.readFile(fileName)),
    getNewLine: () => "\n",
    useCaseSensitiveFileNames: () => false,
    writeFile() {},
    getSourceFile(fileName) {
      if (fileName in files) {
        if (fileName === "main.ts") {
          return ts.createSourceFile(fileName, files[fileName], ts.ScriptTarget.Latest, false)
        }

        return getCachedSourceFile(fileName, files[fileName])
      }

      // lib.*.d.ts
      if (fileName.startsWith("lib.")) {
        const cached = sourceFileCache.get(fileName)

        if (cached) {
          return cached
        }

        const content = ts.sys.readFile(path.join(tsLibDir, fileName))

        if (content === undefined) {
          return undefined
        }

        const sf = ts.createSourceFile(
          path.join(tsLibDir, fileName),
          content,
          ts.ScriptTarget.Latest,
          false,
        )

        sourceFileCache.set(fileName, sf)

        return sf
      }

      // @gwigz/slua-modules/* source files (on-disk paths from resolveModuleNameLiterals)
      if (fileName.startsWith(modulesDir)) {
        const cached = sourceFileCache.get(fileName)

        if (cached) {
          return cached
        }

        const content = ts.sys.readFile(fileName)

        if (content === undefined) {
          return undefined
        }

        return getCachedSourceFile(fileName, content)
      }

      // language-extensions
      if (fileName.includes("language-extensions")) {
        const cached = sourceFileCache.get(fileName)

        if (cached) {
          return cached
        }

        const dtsName = fileName.replace(/(\.d)?(\.ts)$/, ".d.ts")
        const content = ts.sys.readFile(ts.sys.resolvePath(dtsName))

        if (content === undefined) {
          return undefined
        }

        return getCachedSourceFile(fileName, content)
      }
    },
    resolveModuleNameLiterals(moduleLiterals, containingFile, _redirectedReference, options) {
      return moduleLiterals.map((literal) => {
        const name = literal.text

        if (name.startsWith("@gwigz/slua-modules/")) {
          const subpath = name.replace("@gwigz/slua-modules/", "")
          const resolved = path.join(modulesDir, subpath, "index.ts")

          return {
            resolvedModule: {
              resolvedFileName: resolved,
              extension: ts.Extension.Ts,
              isExternalLibraryImport: false,
            },
          }
        }

        const result = ts.resolveModuleName(name, containingFile, options, ts.sys)

        return { resolvedModule: result.resolvedModule }
      })
    },
  }
}

// Transpile

const noopWrite: ts.WriteFileCallback = () => {}

interface ExampleDef {
  id: string
  label: string
  file: string
  bundle?: boolean
  define?: Record<string, boolean | number | string>
}

const EXAMPLES: ExampleDef[] = [
  { id: "events", label: "Events", file: "events.ts" },
  { id: "type-safety", label: "Type Safety", file: "type-safety.ts" },
  { id: "builders", label: "Builders", file: "builders.ts" },
  {
    id: "dialog",
    label: "Dialog",
    file: "dialog.ts",
    bundle: true,
    define: { YIELD_DIALOG: true },
  },
]

function transpileExample(def: ExampleDef): { ts: string; lua: string } {
  const tsCode = fs.readFileSync(path.resolve(root, "src/landing-examples", def.file), "utf-8")
  const plugin = createPlugin({ define: def.define })

  const options: tstl.CompilerOptions = {
    luaTarget: tstl.LuaTarget.Luau,
    noImplicitSelf: true,
    noHeader: true,
    luaLibImport: tstl.LuaLibImportKind.Inline,
    noImplicitGlobalVariables: true,
    lib: ["lib.esnext.d.ts"],
    strict: true,
    luaPlugins: [{ plugin: plugin as tstl.Plugin }],
  }

  const files: Record<string, string> = {
    "main.ts": tsCode,
    "slua.d.ts": sluaTypes,
    "language-extensions.d.ts": langExtTypes,
  }

  // Read module source files into virtual FS for import resolution
  const readModuleDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
      return
    }

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        readModuleDir(fullPath)
      } else if (entry.name.endsWith(".ts")) {
        files[fullPath] = fs.readFileSync(fullPath, "utf-8")
      }
    }
  }

  readModuleDir(modulesDir)

  const host = createHost(files)
  const program = ts.createProgram(Object.keys(files), options, host)
  const mainFile = program.getSourceFile("main.ts")!
  const { plugins } = getPlugins(program)

  const result = getProgramTranspileResult(ts.sys, noopWrite, {
    program,
    plugins,
    sourceFiles: [mainFile],
  })

  const rawLua = result.transpiledFiles[0]?.code ?? ""
  const lua = cleanLuaSpacing(formatLua(rawLua))

  return { ts: tsCode.trim(), lua }
}

/**
 * Transpile an example with module imports using tstl.transpileFiles() + luaBundle,
 * then flatten the bundle to inline all require() calls.
 */
function transpileBundledExample(def: ExampleDef): { ts: string; lua: string } {
  const tsPath = path.resolve(root, "src/landing-examples", def.file)
  const tsCode = fs.readFileSync(tsPath, "utf-8")

  let bundledCode = ""

  const writeFile: ts.WriteFileCallback = (_fileName, data) => {
    bundledCode = data
  }

  const result = tstl.transpileFiles(
    [tsPath],
    {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      moduleDetection: ts.ModuleDetectionKind.Force,
      skipLibCheck: true,
      lib: ["lib.esnext.d.ts"],
      types: ["@typescript-to-lua/language-extensions", "@gwigz/slua-types"],
      baseUrl: root,
      paths: { "@gwigz/slua-modules/*": ["../../packages/modules/src/*/index.ts"] },
      rootDir: path.resolve(root, "../.."),
      outDir: path.resolve(root, ".landing-tmp"),
      luaTarget: tstl.LuaTarget.Luau,
      luaLibImport: tstl.LuaLibImportKind.Inline,
      noHeader: true,
      noImplicitSelf: true,
      noImplicitGlobalVariables: true,
      luaBundle: "output.lua",
      luaBundleEntry: tsPath,
      luaPlugins: [{ name: "@gwigz/slua-tstl-plugin", optimize: true, define: def.define }],
    },
    writeFile,
  )

  for (const d of result.diagnostics) {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n")

    if (msg.includes("luaBundle")) {
      continue
    }

    if (d.category === ts.DiagnosticCategory.Error) {
      console.error(`  Error: ${msg}`)
    }
  }

  // Apply bundle flattening (same as @gwigz/tstl-bundle-flatten)
  const flattened = flattenBundle(bundledCode)

  // Strip unused top-level local functions from the flattened output
  const trimmed = stripUnusedFunctions(flattened)

  // Remove Lua doc comments and collapse excess blank lines
  const cleaned = trimmed.replace(/^---[^\n]*\n(--[^\n]*\n)*/gm, "").replace(/\n{3,}/g, "\n\n")

  const lua = formatLua(cleaned)
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return { ts: tsCode.trim(), lua }
}

/**
 * Collapse blank lines between consecutive `local` declarations,
 * and ensure a blank line separates a `local` group from the next statement.
 */
function cleanLuaSpacing(code: string): string {
  return code
    .replace(/^((\s*)local\b[^\n]*)\n\n(?=\2local\b)/gm, "$1\n")
    .replace(/^((\s*)local\b[^\n]*)\n(?=\2(?!local\b|$)\S)/gm, "$1\n\n")
    .trim()
}

/** Flatten a TSTL luaBundle, inlining all modules and removing the require system. */
function flattenBundle(code: string): string {
  const runtimeStart = code.indexOf("\nlocal ____modules = {}\n")
  if (runtimeStart < 0) return code

  const header = code.substring(0, runtimeStart + 1)
  const moduleRegex = /\["([^"]+)"\] = function\([^)]*\)\s*\n([\s\S]*?)\n end,/g
  const bodies: string[] = []
  let match

  while ((match = moduleRegex.exec(code)) !== null) {
    let body = match[2]

    body = body.replace(/function ____exports\.(\w+)\s*\(/g, "local function $1(")
    body = body.replace(/____exports\.(\w+)\s*=/g, "local $1 =")
    body = body.replace(/____exports\./g, "")
    body = body.replace(/local ____exports = \{\}\n/, "")
    body = body.replace(/(?:^|\n)return (?:____exports|\{[^}]*\})$/, "")
    body = body.replace(/^local ____\w+ = require\("[^"]+"\)\n/gm, "")

    body = body.replace(/^local (\w+) = ____\w+\.(\w+)\n/gm, (_m, localName, exportName) =>
      localName === exportName ? "" : `local ${localName} = ${exportName}\n`,
    )

    // Remove no-op assignments like `local spawn = spawn`
    body = body.replace(/^local (\w+) = \1\n/gm, "")

    bodies.push(body.trim())
  }

  return header + bodies.join("\n\n") + "\n"
}

/**
 * Remove top-level `local function` declarations that are never referenced
 * elsewhere in the code. Iterates until no more can be removed (handles
 * chains where removing one function makes another unused).
 */
function stripUnusedFunctions(code: string): string {
  const fnBlockRegex = /(?:^---[^\n]*\n(?:--[^\n]*\n)*\n?)?^local function (\w+)\([\s\S]*?^end\n?/gm

  let result = code
  let changed = true

  while (changed) {
    changed = false
    const blocks: { name: string; start: number; end: number }[] = []

    let match
    fnBlockRegex.lastIndex = 0

    while ((match = fnBlockRegex.exec(result)) !== null) {
      blocks.push({ name: match[1], start: match.index, end: match.index + match[0].length })
    }

    for (let i = blocks.length - 1; i >= 0; i--) {
      const { name, start, end } = blocks[i]

      // Check if the function name appears outside its own definition block
      const before = result.substring(0, start)
      const after = result.substring(end)
      const outside = before + after

      // Match as a word boundary reference (not the definition itself)
      const refRegex = new RegExp(`\\b${name}\\b`)

      if (!refRegex.test(outside)) {
        result = before + after
        changed = true
      }
    }
  }

  // Clean up excess blank lines
  result = result.replace(/\n{3,}/g, "\n\n")

  return result
}

// Generate

const examples: Record<string, { id: string; label: string; ts: string; lua: string }> = {}

for (const def of EXAMPLES) {
  console.log(`Transpiling ${def.file}${def.bundle ? " (bundled)" : ""}...`)
  const { ts: tsCode, lua } = def.bundle ? transpileBundledExample(def) : transpileExample(def)
  examples[def.id] = { id: def.id, label: def.label, ts: tsCode, lua }
}

const output = [
  "// GENERATED FILE, do not edit. Run `bun scripts/generate-landing-examples.ts` to regenerate.",
  "",
  `export const examples = ${JSON.stringify(examples, null, 2)} as const`,
  "",
]

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, "examples.ts"), output.join("\n"))

console.log(`Generated ${path.join(outDir, "examples.ts")} (${EXAMPLES.length} examples)`)
