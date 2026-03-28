import type { ProjectOptions } from "../prompts.js"
import { formatJson, sortKeys } from "../utils.js"
import { VERSIONS } from "./versions.js"
import { GITIGNORE, EDITORCONFIG, VSCODE_SETTINGS, VSCODE_EXTENSIONS } from "./common.js"
import {
  mainTsContent,
  buildTsContent,
  flagsDtsContent,
  yieldDefine,
  oxlintrcContent,
  oxfmtrcContent,
} from "./snippets.js"

export function generateMultiTemplate(options: ProjectOptions): Record<string, string> {
  const { extras, projectName, packageManager } = options
  const ext = extras.jsx ? "tsx" : "ts"
  const isBun = packageManager === "bun"
  const run = isBun ? "bun" : "npx tsx"
  const files: Record<string, string> = {}

  // package.json

  const devDependencies: Record<string, string> = {
    "@gwigz/slua-tstl-plugin": VERSIONS["@gwigz/slua-tstl-plugin"],
    "@gwigz/slua-types": VERSIONS["@gwigz/slua-types"],
    "@gwigz/tstl-bundle-flatten": VERSIONS["@gwigz/tstl-bundle-flatten"],
    "@typescript-to-lua/language-extensions": VERSIONS["@typescript-to-lua/language-extensions"],
    "@types/node": VERSIONS["@types/node"],
    "typescript-to-lua": VERSIONS["typescript-to-lua"],
  }

  if (extras.jsx) {
    devDependencies["@gwigz/jsx-inline"] = VERSIONS["@gwigz/jsx-inline"]
  }

  if (extras.config || extras.yield) {
    devDependencies["@gwigz/slua-modules"] = VERSIONS["@gwigz/slua-modules"]
  }

  if (extras.stylua) {
    devDependencies["@johnnymorganz/stylua-bin"] = VERSIONS["@johnnymorganz/stylua-bin"]
  }

  if (extras.linting) {
    devDependencies["@gwigz/slua-oxlint-config"] = VERSIONS["@gwigz/slua-oxlint-config"]
    devDependencies["oxlint"] = VERSIONS["oxlint"]
    devDependencies["oxlint-plugin-eslint"] = VERSIONS["oxlint-plugin-eslint"]
  }

  if (extras.formatting) {
    devDependencies["oxfmt"] = VERSIONS["oxfmt"]
  }

  if (!isBun) {
    devDependencies["tsx"] = VERSIONS["tsx"]
  }

  const scripts: Record<string, string> = {
    build: `${run} build.ts`,
    dev: `${run} build.ts --watch`,
  }

  if (extras.linting) {
    scripts.lint = "oxlint"
  }
  if (extras.formatting) {
    scripts.fmt = "oxfmt --write ."
  }

  const pkg: Record<string, unknown> = {
    name: projectName,
    private: true,
    type: "module",
    scripts,
    devDependencies: sortKeys(devDependencies),
  }

  if (extras.stylua) {
    pkg.trustedDependencies = ["@johnnymorganz/stylua-bin"]
  }

  files["package.json"] = formatJson(pkg)

  // tsconfig.json

  const compilerOptions: Record<string, unknown> = {
    target: "ESNext",
    module: "ESNext",
    moduleResolution: "bundler",
    strict: true,
    moduleDetection: "force",
    skipLibCheck: true,
    lib: ["ESNext"],
    types: ["@typescript-to-lua/language-extensions", "@gwigz/slua-types"],
    rootDir: "src",
    outDir: "dist",
  }

  if (extras.jsx) {
    compilerOptions.jsx = "react"
    compilerOptions.jsxFactory = "h"
    compilerOptions.jsxFragmentFactory = "Fragment"
  }

  const includes: string[] = ["src"]

  if (extras.config || extras.yield) {
    includes.push("flags.d.ts")
  }

  const pluginEntry: Record<string, unknown> = { name: "@gwigz/slua-tstl-plugin", optimize: true }

  if (extras.config || extras.yield) {
    const define: Record<string, boolean> = {}
    if (extras.config) {
      define.CONFIG_YAML_PARSER = true
      define.CONFIG_LLJSON_PARSER = false
    }
    if (extras.yield) {
      Object.assign(define, yieldDefine())
    }
    pluginEntry.define = define
  }

  const luaPlugins: Record<string, unknown>[] = [
    pluginEntry,
    { name: "@gwigz/tstl-bundle-flatten" },
  ]

  const tsconfig = {
    $schema:
      "https://raw.githubusercontent.com/TypeScriptToLua/TypeScriptToLua/master/tsconfig-schema.json",
    include: includes,
    compilerOptions,
    tstl: {
      extension: "slua",
      luaTarget: "Luau",
      luaLibImport: "inline",
      noImplicitSelf: true,
      noImplicitGlobalVariables: true,
      luaPlugins,
    },
  }

  files["tsconfig.json"] = formatJson(tsconfig)

  // Source files

  files["build.ts"] = buildTsContent(extras, packageManager)
  files[`src/new-script/index.${ext}`] = mainTsContent()

  if (extras.config || extras.yield) {
    files["flags.d.ts"] = flagsDtsContent(extras)
  }

  if (extras.linting) {
    files[".oxlintrc.json"] = oxlintrcContent()
  }

  if (extras.formatting) {
    files[".oxfmtrc.json"] = oxfmtrcContent()
  }

  // Common files

  files[".vscode/settings.json"] = VSCODE_SETTINGS

  if (extras.linting || extras.formatting) {
    files[".vscode/extensions.json"] = VSCODE_EXTENSIONS
  }
  files[".gitignore"] = GITIGNORE
  files[".editorconfig"] = EDITORCONFIG

  return files
}
