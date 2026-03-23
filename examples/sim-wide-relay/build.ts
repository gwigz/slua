import ts, { type Diagnostic } from "typescript"
import * as tstl from "typescript-to-lua"
import { watch, readFileSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { resolve } from "node:path"

const WATCH = process.argv.includes("--watch")
const GENERATED_HEADER = "--[[ Generated with @gwigz/slua - https://github.com/gwigz/slua ]]"

const SCRIPTS = ["coordinator", "listener", "sender"]
const DIST_FILES = SCRIPTS.map((s) => `dist/${s}.slua`)

const BASE_OPTIONS: tstl.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  moduleDetection: ts.ModuleDetectionKind.Force,
  skipLibCheck: true,
  lib: ["lib.esnext.d.ts"],
  types: ["@typescript-to-lua/language-extensions", "@gwigz/slua-types"],
  rootDir: resolve("src"),
  outDir: resolve("dist"),
  luaTarget: tstl.LuaTarget.Luau,
  luaLibImport: tstl.LuaLibImportKind.Inline,
  noHeader: true,
  noImplicitSelf: true,
  noImplicitGlobalVariables: true,
  luaPlugins: [
    { name: "@gwigz/slua-tstl-plugin", optimize: true },
    { name: "@gwigz/tstl-bundle-flatten" },
  ],
}

/** Extracts the leading JSDoc block from a source file and converts it to a Lua multiline comment. */
function extractFileComment(sourcePath: string) {
  const source = readFileSync(resolve(sourcePath), "utf8")
  const match = source.match(/^\/\*\*\n([\s\S]*?)\s*\*\//)

  if (!match) {
    return ""
  }

  const body = match[1]
    .split("\n")
    .map((line) => line.replace(/^\s*\* ?/, ""))
    .join("\n")
    .trim()

  return `--[[\n${body}\n]]`
}

function reportDiagnostics(diagnostics: readonly Diagnostic[]) {
  let hasErrors = false

  for (const diagnostic of diagnostics) {
    const msg = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")

    // TSTL warns about luaBundle + inline but it's harmless
    if (msg.includes("luaBundle")) {
      continue
    }

    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      console.error("error:", msg)
      hasErrors = true
    } else if (diagnostic.category === ts.DiagnosticCategory.Warning) {
      console.warn("warning:", msg)
    }
  }

  return hasErrors
}

function build() {
  let hasErrors = false

  for (const script of SCRIPTS) {
    const files = [resolve(`src/${script}/index.ts`), resolve("src/shared.ts")]

    if (script !== "listener") {
      files.push(resolve("src/config.ts"))
    }

    const result = tstl.transpileFiles(files, {
      ...BASE_OPTIONS,
      luaBundle: `${script}.slua`,
      luaBundleEntry: resolve(`src/${script}/index.ts`),
    })

    if (reportDiagnostics(result.diagnostics)) {
      hasErrors = true
    }
  }

  if (hasErrors) {
    return false
  }

  // Prepend file comment and generated header to each .slua file
  for (let i = 0; i < SCRIPTS.length; i++) {
    const filePath = resolve(DIST_FILES[i])
    const content = readFileSync(filePath, "utf8")
    const comment = extractFileComment(`src/${SCRIPTS[i]}/index.ts`)

    const parts: string[] = []

    if (comment) {
      parts.push(comment)
    }

    parts.push(GENERATED_HEADER)

    writeFileSync(filePath, parts.join("\n\n") + "\n" + content)
  }

  // Format .slua output with StyLua
  try {
    execSync(`bunx stylua --syntax luau --verify -- ${DIST_FILES.join(" ")}`)
  } catch (e: unknown) {
    console.warn("warning: stylua formatting failed")
    if (e instanceof Error && "stderr" in e) console.warn(String(e.stderr))
  }

  console.log(`Built ${DIST_FILES.join(", ")}`)

  return true
}

if (!build() && !WATCH) {
  process.exit(1)
}

if (WATCH) {
  console.log("Watching src/ for changes...")

  let debounce: Timer | null = null

  watch(resolve("src"), { recursive: true }, (_event: string, filename: string | null) => {
    if (!filename || !filename.endsWith(".ts")) {
      return
    }

    if (debounce) {
      clearTimeout(debounce)
    }

    debounce = setTimeout(() => {
      debounce = null

      console.log(`\nRebuilding...`)

      build()
    }, 100)
  })
}
