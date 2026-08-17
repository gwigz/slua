import type { ProjectOptions } from "../prompts.js"
import { formatJson, sortKeys } from "../utils.js"
import { VERSIONS } from "./versions.js"
import { GITIGNORE, EDITORCONFIG, VSCODE_SETTINGS, VSCODE_EXTENSIONS } from "./common.js"
import {
  mainTsContent,
  moduleDefine,
  moduleFlagsFiles,
  vendoredModuleFiles,
  oxlintrcContent,
  oxfmtrcContent,
} from "./snippets.js"

export function generateSingleTemplate(options: ProjectOptions): Record<string, string> {
  const { extras, projectName } = options
  const ext = extras.jsx ? "tsx" : "ts"
  const files: Record<string, string> = {}

  // package.json
  const devDependencies: Record<string, string> = {
    "@gwigz/slua-tstl-plugin": VERSIONS["@gwigz/slua-tstl-plugin"],
    "@gwigz/slua-types": VERSIONS["@gwigz/slua-types"],
    "@gwigz/tstl-bundle-flatten": VERSIONS["@gwigz/tstl-bundle-flatten"],
    "@typescript-to-lua/language-extensions": VERSIONS["@typescript-to-lua/language-extensions"],
    "darklua-wasm": VERSIONS["darklua-wasm"],
    typescript: VERSIONS["typescript"],
    "typescript-to-lua": VERSIONS["typescript-to-lua"],
  }

  if (extras.jsx) {
    devDependencies["@gwigz/jsx-inline"] = VERSIONS["@gwigz/jsx-inline"]
  }

  if (extras.stylua) {
    devDependencies["@johnnymorganz/stylua-bin"] = VERSIONS["@johnnymorganz/stylua-bin"]
  }

  if (extras.linting) {
    devDependencies["@gwigz/slua-oxlint-config"] = VERSIONS["@gwigz/slua-oxlint-config"]
    devDependencies["oxlint"] = VERSIONS["oxlint"]
    devDependencies["oxlint-plugin-eslint"] = VERSIONS["oxlint-plugin-eslint"]
    devDependencies["oxlint-tsgolint"] = VERSIONS["oxlint-tsgolint"]
  }

  if (extras.formatting) {
    devDependencies["oxfmt"] = VERSIONS["oxfmt"]
  }

  const scripts: Record<string, string> = {
    build: "tstl -p tsconfig.json",
    dev: "tstl -p tsconfig.json --watch",
  }

  if (extras.stylua) {
    scripts.format = "stylua --syntax luau out/"
  }
  if (extras.linting) {
    scripts.lint = "oxlint --type-aware"
  }
  if (extras.formatting) {
    scripts.fmt = "oxfmt --write ."
  }

  const pkg: Record<string, unknown> = {
    name: projectName,
    private: true,
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
    rootDir: ".",
    outDir: "out",
  }

  if (extras.jsx) {
    compilerOptions.jsx = "react"
    compilerOptions.jsxFactory = "h"
    compilerOptions.jsxFragmentFactory = "Fragment"
  }

  const pluginEntry: Record<string, unknown> = { name: "@gwigz/slua-tstl-plugin" }
  const define = moduleDefine(extras)

  if (Object.keys(define).length > 0) {
    pluginEntry.define = define
  }

  const luaPlugins: Record<string, unknown>[] = [
    pluginEntry,
    { name: "@gwigz/tstl-bundle-flatten", shake: true },
  ]

  const includes: string[] = [`new-script.${ext}`, ...moduleFlagsFiles(extras, "modules/")]

  const tsconfig = {
    $schema:
      "https://raw.githubusercontent.com/TypeScriptToLua/TypeScriptToLua/master/tsconfig-schema.json",
    compilerOptions,
    tstl: {
      luaTarget: "Luau",
      // "require-minimal" + luaBundle + bundle-flatten emits each used lualib
      // helper exactly once, flattened to the top of the script
      luaLibImport: "require-minimal",
      luaBundle: "new-script.slua",
      luaBundleEntry: `new-script.${ext}`,
      noImplicitSelf: true,
      noImplicitGlobalVariables: true,
      luaPlugins,
      extension: "slua",
    },
    include: includes,
  }

  files["tsconfig.json"] = formatJson(tsconfig)

  // Source files

  files[`new-script.${ext}`] = mainTsContent()

  Object.assign(files, vendoredModuleFiles(extras, "modules/"))

  if (extras.linting) {
    // The vendored modules/ dir sits outside the tsconfig program (only its
    // flags.d.ts files are included), so type-aware lint cannot resolve it.
    files[".oxlintrc.json"] = oxlintrcContent(
      extras.config || extras.utilities || extras.yield ? ["modules/"] : [],
    )
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
