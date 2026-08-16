import { MODULES, readModuleFiles } from "@gwigz/slua-modules/vendor"
import type { ModuleName } from "@gwigz/slua-modules/vendor"
import type { Extras } from "../prompts.js"
import { formatJson } from "../utils.js"

function selectedModules(extras: Extras): ModuleName[] {
  const selected: ModuleName[] = []

  if (extras.config) selected.push("config")
  if (extras.yield) selected.push("yield")

  return selected
}

export function moduleDefine(extras: Extras): Record<string, boolean> {
  return Object.assign({}, ...selectedModules(extras).map((name) => MODULES[name].defaultDefine))
}

export function vendoredModuleFiles(extras: Extras, prefix: string): Record<string, string> {
  const files: Record<string, string> = {}

  for (const name of selectedModules(extras)) {
    for (const file of readModuleFiles(name)) {
      files[prefix + file.path] = file.content
    }
  }

  return files
}

export function moduleFlagsFiles(extras: Extras, prefix: string): string[] {
  return selectedModules(extras)
    .map((name) => MODULES[name].flagsFile)
    .filter((file): file is string => file !== undefined)
    .map((file) => prefix + file)
}

export function mainTsContent(): string {
  return `const owner = ll.GetOwner()

LLEvents.on("touch_start", (events) => {
  for (const event of events) {
    const key = event.getKey()

    if (key === owner) {
      ll.Say(0, "Hello, owner!")
      return
    }

    ll.Say(0, "You are not the owner.")
  }
})
`
}

export function sharedTsContent(): string {
  return `// Shared utilities used across scripts
export {}
`
}

export function oxlintrcContent(extraIgnores: string[] = []): string {
  return formatJson({
    $schema:
      "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
    extends: ["./node_modules/@gwigz/slua-oxlint-config/.oxlintrc.json"],
    rules: {
      "no-unused-vars": "off",
      "typescript/no-extraneous-class": "off",
      "unicorn/require-module-specifiers": "off",
    },
    categories: {
      correctness: "error",
      suspicious: "warn",
      perf: "warn",
    },
    ignorePatterns: ["dist/", "out/", "node_modules/", ...extraIgnores],
    overrides: [
      {
        files: ["**/*.d.ts"],
        rules: { "no-redeclare": "off" },
      },
    ],
  })
}

export function oxfmtrcContent(): string {
  return formatJson({
    $schema: "./node_modules/oxfmt/configuration_schema.json",
    ignorePatterns: ["dist/", "out/", "node_modules/"],
    semi: false,
  })
}

export function tsconfigNodeContent(): string {
  return formatJson({
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
      skipLibCheck: true,
      types: ["node"],
    },
    include: ["build.ts"],
  })
}

export function buildTsContent(extras: Extras, packageManager: string): string {
  const runner = packageManager === "bun" ? "bunx" : "npx"
  const ext = extras.jsx ? "tsx" : "ts"

  const importLines = [
    '/// <reference types="node" />',
    'import ts, { type Diagnostic } from "typescript"',
    'import * as tstl from "typescript-to-lua"',
    'import { shakeModules, stripDeadExports } from "@gwigz/slua-tstl-plugin/shake"',
    'import { watch, readFileSync } from "node:fs"',
  ]

  if (extras.stylua) {
    importLines.push('import { execSync } from "node:child_process"')
  }

  importLines.push('import { resolve } from "node:path"')

  const defineEntries = Object.entries(moduleDefine(extras)).map(
    ([flag, value]) => `${flag}: ${value}`,
  )

  let pluginLine = '    { name: "@gwigz/slua-tstl-plugin", optimize: true },'
  if (defineEntries.length > 0) {
    pluginLine = `    {
      name: "@gwigz/slua-tstl-plugin",
      optimize: true,
      define: {
${defineEntries.map((entry) => `        ${entry},`).join("\n")}
      },
    },`
  }

  const fileEntries = [
    "entry",
    ...moduleFlagsFiles(extras, "src/modules/").map((file) => `resolve("${file}")`),
  ]

  const filesLine =
    fileEntries.length > 1
      ? `const files = [\n${fileEntries.map((entry) => `      ${entry},`).join("\n")}\n    ]`
      : `const files = [${fileEntries.join(", ")}]`

  const jsxOptions = extras.jsx
    ? `
  jsx: ts.JsxEmit.React,
  jsxFactory: "h",
  jsxFragmentFactory: "Fragment",`
    : ""

  let styluaBlock = ""
  if (extras.stylua) {
    styluaBlock = `

  // Format output with StyLua
  try {
    execSync(\`${runner} stylua --syntax luau --verify -- \${DIST_FILES.join(" ")}\`)
  } catch (error) {
    console.warn("warning: stylua formatting failed")

    if (error instanceof Error && "stderr" in error) {
      console.warn(String(error.stderr))
    }
  }`
  }

  const watchFilter = extras.jsx
    ? `    if (filename === null) return
    if (!(filename.endsWith(".ts") || filename.endsWith(".tsx"))) return`
    : '    if (filename === null || !filename.endsWith(".ts")) return'

  return `${importLines.join("\n")}

const WATCH = process.argv.includes("--watch")
const SCRIPTS = ["new-script"]
const DIST_FILES = SCRIPTS.map((s) => \`dist/\${s}.slua\`)

const BASE_OPTIONS: tstl.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  moduleDetection: ts.ModuleDetectionKind.Force,
  skipLibCheck: true,
  lib: ["lib.esnext.d.ts"],
  types: ["@typescript-to-lua/language-extensions", "@gwigz/slua-types"],
  rootDir: resolve("."),
  outDir: resolve("dist"),
  luaTarget: tstl.LuaTarget.Luau,
  luaLibImport: tstl.LuaLibImportKind.Inline,
  noHeader: true,
  noImplicitSelf: true,
  noImplicitGlobalVariables: true,${jsxOptions}
  luaPlugins: [
${pluginLine}
    { name: "@gwigz/tstl-bundle-flatten" },
  ],
}

function reportDiagnostics(diagnostics: readonly Diagnostic[]) {
  let hasErrors = false

  for (const diagnostic of diagnostics) {
    const msg = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\\n")

    if (msg.includes("luaBundle")) continue

    if (msg.includes("Invalid ambient identifier") && diagnostic.file?.fileName.endsWith(".d.ts")) {
      continue
    }

    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      console.error("Error:", msg)
      hasErrors = true
    } else if (diagnostic.category === ts.DiagnosticCategory.Warning) {
      console.warn("Warning:", msg)
    }
  }

  return hasErrors
}

// Tree-shakes vendored modules, returns stripped sources keyed by file path
async function shake(entry: string) {
  const shaken = new Map<string, string>()

  try {
    const result = await shakeModules({ entry: [entry], tsconfig: resolve("tsconfig.json") })

    for (const [file, surviving] of result.survivingExports) {
      shaken.set(resolve(file), stripDeadExports(readFileSync(file, "utf8"), surviving))
    }
  } catch (error) {
    console.warn("warning: tree-shaking skipped:", error instanceof Error ? error.message : error)
  }

  return shaken
}

async function build() {
  let hasErrors = false

  for (const script of SCRIPTS) {
    const entry = resolve(\`src/\${script}/index.${ext}\`)
    ${filesLine}

    const options: tstl.CompilerOptions = {
      ...BASE_OPTIONS,
      luaBundle: \`\${script}.slua\`,
      luaBundleEntry: entry,
    }

    const shaken = await shake(entry)
    const host = ts.createCompilerHost(options)
    const readSourceFile = host.getSourceFile.bind(host)

    host.getSourceFile = (fileName, languageVersion, ...args) => {
      const stripped = shaken.get(resolve(fileName))

      if (stripped !== undefined) {
        return ts.createSourceFile(fileName, stripped, languageVersion, true)
      }

      return readSourceFile(fileName, languageVersion, ...args)
    }

    const program = ts.createProgram(files, options, host)
    const result = new tstl.Transpiler().emit({ program })

    if (reportDiagnostics([...ts.getPreEmitDiagnostics(program), ...result.diagnostics])) {
      hasErrors = true
    }
  }

  if (hasErrors) return false${styluaBlock}

  console.log(\`Built \${DIST_FILES.join(", ")}\`)

  return true
}

if (!(await build()) && !WATCH) {
  process.exit(1)
}

if (WATCH) {
  console.log("Watching src/ for changes...")

  let debounce: ReturnType<typeof setTimeout> | null = null
  let pending: Promise<unknown> = Promise.resolve()

  watch(resolve("src"), { recursive: true }, (_event: string, filename: string | null) => {
${watchFilter}

    if (debounce) clearTimeout(debounce)

    debounce = setTimeout(() => {
      debounce = null
      console.log(\`\\nRebuilding...\`)
      pending = pending.then(() => build())
    }, 50)
  })
}
`
}
