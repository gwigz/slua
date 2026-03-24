/**
 * Build-time script that reads TypeScript lib files, SLua types, and
 * language-extensions types, then writes them as a generated TypeScript
 * module so the Monaco editor client component can load them as strings
 * (no ?raw / webpack config needed).
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const _require = createRequire(import.meta.url)
const outDir = path.resolve(import.meta.dirname, "../src/playground/generated")

// Curated list of TypeScript lib files (must stay in sync with ts-lib-names.ts)
const TS_LIB_NAMES = [
  "lib.es5.d.ts",
  "lib.es2015.core.d.ts",
  "lib.es2015.collection.d.ts",
  "lib.es2015.iterable.d.ts",
  "lib.es2015.generator.d.ts",
  "lib.es2015.promise.d.ts",
  "lib.es2015.proxy.d.ts",
  "lib.es2015.reflect.d.ts",
  "lib.es2015.symbol.d.ts",
  "lib.es2015.symbol.wellknown.d.ts",
  "lib.es2016.array.include.d.ts",
  "lib.es2017.object.d.ts",
  "lib.es2017.string.d.ts",
  "lib.es2019.array.d.ts",
  "lib.es2019.object.d.ts",
  "lib.es2019.string.d.ts",
  "lib.es2021.string.d.ts",
  "lib.es2022.array.d.ts",
  "lib.es2022.object.d.ts",
  "lib.es2022.string.d.ts",
  "lib.es2023.array.d.ts",
] as const

// Read TypeScript lib files
const tsDir = path.dirname(_require.resolve("typescript"))
const tsLibs = TS_LIB_NAMES.map(
  (name) => [name, fs.readFileSync(path.join(tsDir, name), "utf-8")] as const,
)

// Read SLua types
const sluaTypes = fs.readFileSync(
  path.resolve(import.meta.dirname, "../../../packages/types/index.d.ts"),
  "utf-8",
)

// Read language-extensions types
const langExtensions = fs.readFileSync(
  _require.resolve("@typescript-to-lua/language-extensions/index.d.ts"),
  "utf-8",
)

// Generate the output module
const lines = [
  "// GENERATED FILE, do not edit. Run `bun scripts/generate-playground-libs.ts` to regenerate.",
  "",
  `export const sluaTypes = ${JSON.stringify(sluaTypes)}`,
  "",
  `export const langExtensions = ${JSON.stringify(langExtensions)}`,
  "",
  `export const tsLibs: [string, string][] = ${JSON.stringify(tsLibs)}`,
  "",
]

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, "libs.ts"), lines.join("\n"))

console.log(`Generated ${path.join(outDir, "libs.ts")} (${tsLibs.length} lib files)`)
