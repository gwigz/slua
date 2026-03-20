import fs from "node:fs"
import { createRequire } from "node:module"
import path from "path"
import type { Plugin } from "vite"
import { defineConfig } from "vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"

const _require = createRequire(import.meta.url)

const resolve = (p: string) => path.resolve(__dirname, p)
const shim = (name: string) => resolve(`src/shims/${name}.ts`)

/**
 * Stub TSTL's file resolver module. It's a relative require("./resolve") from
 * transpiler.js so resolve.alias can't intercept it -- we need a resolveId hook.
 * This eliminates the entire enhanced-resolve -> graceful-fs -> constants chain.
 */
function stubTstlResolve(): Plugin {
  const target = path.normalize("typescript-to-lua/dist/transpilation/resolve")
  const stub = shim("resolve-stub")

  return {
    name: "stub-tstl-resolve",
    resolveId(id, importer) {
      if (!importer) {
        return
      }

      const resolved = path.resolve(path.dirname(importer), id)

      if (resolved.includes(target)) {
        return stub
      }
    },
  }
}

/**
 * Bundle TSTL's lualib files into a virtual module so the browser worker can
 * serve them to the transpiler. Without this, resolveLuaLibDir() resolves to
 * a bogus /dist/lualib/... path because __dirname is shimmed to '/'.
 */
function tstlLualib(): Plugin {
  return {
    name: "tstl-lualib",
    resolveId(id) {
      if (id === "virtual:tstl-lualib") return "\0virtual:tstl-lualib"
    },
    load(id) {
      if (id !== "\0virtual:tstl-lualib") return

      const tstlDist = path.dirname(_require.resolve("typescript-to-lua"))
      const lualibDir = path.join(tstlDist, "lualib", "universal")

      const entries: string[] = []
      for (const file of fs.readdirSync(lualibDir)) {
        const content = fs.readFileSync(path.join(lualibDir, file), "utf-8")
        entries.push(`  ${JSON.stringify(file)}: ${JSON.stringify(content)}`)
      }

      return `export default {\n${entries.join(",\n")}\n}`
    },
  }
}

/**
 * Inject Node.js globals into pre-bundled dependencies during Rolldown's
 * dep optimization pass. Uses an import so the shim is shared across chunks.
 */
const processShim = shim("process")

const nodeGlobalsBanner = [
  `import __process_shim from '${processShim}';`,
  `if (!globalThis.process) globalThis.process = __process_shim;`,
  `if (!globalThis.global) globalThis.global = globalThis;`,
  `if (typeof __filename === 'undefined') globalThis.__filename = '/index.js';`,
  `if (typeof __dirname === 'undefined') globalThis.__dirname = '/';`,
].join("\n")

/**
 * Self-contained Node.js globals shim for production bundles.
 * The optimizeDeps banner above uses an absolute import path that only the dev
 * server can resolve. Production output needs a self-contained IIFE instead.
 *
 * Keep the process object in sync with src/shims/process.ts
 */
const nodeGlobalsIIFE = `;(function() {
  if (globalThis.process) return;
  var noop = function() {};
  globalThis.process = {
    title: "browser",
    env: {},
    argv: [],
    version: "v22.0.0",
    versions: { node: "22.0.0" },
    on: noop, addListener: noop, once: noop, off: noop,
    removeListener: noop, removeAllListeners: noop, emit: noop,
    prependListener: noop, prependOnceListener: noop,
    listeners: function() { return []; },
    binding: function() { throw new Error("process.binding is not supported"); },
    cwd: function() { return "/"; },
    chdir: function() { throw new Error("process.chdir is not supported"); },
    umask: function() { return 0; },
    nextTick: function(fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      setTimeout(function() { fn.apply(null, args); }, 0);
    },
    platform: typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "darwin" : "linux"
  };
  if (!globalThis.global) globalThis.global = globalThis;
  if (typeof __filename === "undefined") globalThis.__filename = "/index.js";
  if (typeof __dirname === "undefined") globalThis.__dirname = "/";
})();`

/**
 * Pre-render the homepage code showcase blocks at build time using Shiki with
 * twoslash for real TypeScript type inference. Serves the result as a virtual
 * module so the browser never needs to load Shiki or run the TS compiler.
 */
import { TS_LIB_NAMES } from "./src/monaco/ts-lib-names"
import { formatLua } from "./src/format-lua"

function twoslashCodeBlocks(): Plugin {
  const sluaTypes = fs
    .readFileSync(resolve("../../packages/types/index.d.ts"), "utf-8")
    .replace(/\/\/\/\s*<reference\s+types="[^"]*"\s*\/>\s*\n?/g, "")

  const langExtTypes = fs.readFileSync(
    _require.resolve("@typescript-to-lua/language-extensions/index.d.ts"),
    "utf-8",
  )

  const twoslashExtraFiles = {
    "language-extensions.d.ts": langExtTypes,
    "globals.d.ts": sluaTypes,
  }

  const TS_CODE = `\
let owner = ll.GetOwner()

LLEvents.on("changed", (changed) => {
  if ((changed & CHANGED_OWNER) !== 0) {
    owner = ll.GetOwner()
  }
})

LLEvents.on("touch_start", (events) => {
  for (const event of events) {
    ll.Say(0, \`\${event.getName()} touched at \${event.getTouchPos()}\`)
  }
})`

  const HERO_TS = `\
const isValidCommand = (command: string) =>
  ["bite", "scratch", "pounce"].includes(command)`

  // Lazily initialized
  let sharedInit: Promise<{
    codeToHtml: (typeof import("shiki"))["codeToHtml"]
    transformerTwoslash: (typeof import("@shikijs/twoslash"))["transformerTwoslash"]
    rendererRich: (typeof import("@shikijs/twoslash"))["rendererRich"]
    transpileToLua: (tsCode: string) => string
  }> | null = null

  function getShared() {
    if (!sharedInit) {
      sharedInit = (async () => {
        const [{ codeToHtml }, { transformerTwoslash, rendererRich }, sluaPlugin] =
          await Promise.all([
            import("shiki"),
            import("@shikijs/twoslash"),
            import("../../packages/tstl-plugin/dist/index.js"),
          ])

        // Resolve TSTL from the plugin's context so both share typescript 5.7.x.
        // The web workspace uses a newer TS which would cause a
        // duplicate-instance AST crash.
        const pluginRequire = createRequire(resolve("../../packages/tstl-plugin/package.json"))
        const tstl: typeof import("typescript-to-lua") = pluginRequire("typescript-to-lua")

        // Read the same curated lib files the browser worker uses. Using the
        // full esnext libs adds Symbol.iterator overloads that cause TSTL to
        // emit __TS__Iterator instead of plain ipairs for array for-of loops.
        const tsDir = path.dirname(pluginRequire.resolve("typescript"))
        const libFiles = Object.fromEntries(
          TS_LIB_NAMES.map((n) => [n, fs.readFileSync(path.join(tsDir, n), "utf-8")]),
        )

        const transpileOpts = {
          luaTarget: tstl.LuaTarget.Luau,
          noImplicitSelf: true,
          noHeader: true,
          luaLibImport: tstl.LuaLibImportKind.Inline,
          noImplicitGlobalVariables: true,
          noLib: true,
          strict: true,
          luaPlugins: [{ plugin: sluaPlugin.default as import("typescript-to-lua").Plugin }],
        }

        function transpileToLua(tsCode: string) {
          const clean = tsCode.replace(/^\s*\/\/\s*\^[?!].*$/gm, "")
          const result = tstl.transpileVirtualProject(
            {
              "main.ts": clean,
              ...libFiles,
              "language-extensions.d.ts": langExtTypes,
              "slua.d.ts": sluaTypes,
            },
            transpileOpts,
          )

          const lua = formatLua(
            result.transpiledFiles.find((f) => f.outPath === "main.lua")?.lua?.trimEnd() ?? "",
          )

          if (!lua) {
            const msgs = result.diagnostics.map((d) =>
              typeof d.messageText === "string" ? d.messageText : d.messageText.messageText,
            )
            throw new Error(`Failed to transpile showcase code:\n${msgs.join("\n")}`)
          }

          return lua
        }

        return { codeToHtml, transformerTwoslash, rendererRich, transpileToLua }
      })()
    }

    return sharedInit
  }

  return {
    name: "twoslash-code-blocks",
    resolveId(id) {
      if (id === "virtual:twoslash-blocks") return "\0virtual:twoslash-blocks"
      if (id === "virtual:hero-preview") return "\0virtual:hero-preview"
      if (id === "virtual:quickstart-blocks") return "\0virtual:quickstart-blocks"
    },
    async load(id) {
      if (
        id !== "\0virtual:twoslash-blocks" &&
        id !== "\0virtual:hero-preview" &&
        id !== "\0virtual:quickstart-blocks"
      )
        return

      const { codeToHtml, transformerTwoslash, rendererRich, transpileToLua } = await getShared()

      const twoslashTransformer = transformerTwoslash({
        renderer: rendererRich({ queryRendering: "line" }),
        twoslashOptions: { extraFiles: twoslashExtraFiles },
      })

      // Hero preview
      if (id === "\0virtual:hero-preview") {
        const heroLua = transpileToLua(HERO_TS)

        const [heroTsHtml, heroLuaHtml] = await Promise.all([
          codeToHtml(HERO_TS, {
            lang: "tsx",
            theme: "vitesse-dark",
            transformers: [twoslashTransformer],
          }),
          codeToHtml(heroLua, { lang: "lua", theme: "vitesse-dark" }),
        ])

        return [
          `export const tsHtml = ${JSON.stringify(heroTsHtml)};`,
          `export const luaHtml = ${JSON.stringify(heroLuaHtml)};`,
        ].join("\n")
      }

      // Quick-start blocks — plain Shiki (no twoslash needed)
      if (id === "\0virtual:quickstart-blocks") {
        const pkgs = [
          "typescript",
          "typescript-to-lua",
          "@gwigz/slua-types",
          "@gwigz/slua-tstl-plugin",
        ]

        const managers = [
          {
            label: "npm",
            install: `npm install --save-dev \\\n  ${pkgs.join(" \\\n  ")}`,
            run: "npx",
          },
          {
            label: "pnpm",
            install: `pnpm add -D \\\n  ${pkgs.join(" \\\n  ")}`,
            run: "pnpm",
          },
          {
            label: "bun",
            install: `bun add --dev \\\n  ${pkgs.join(" \\\n  ")}`,
            run: "bunx",
          },
          {
            label: "deno",
            install: `deno add --dev \\\n  ${pkgs.map((p) => `npm:${p}`).join(" \\\n  ")}`,
            run: "deno run",
          },
        ]

        const tsconfig = `{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "moduleDetection": "force",
    "types": [
      "@typescript-to-lua/language-extensions",
      "@gwigz/slua-types"
    ]
  },
  "tstl": {
    "luaTarget": "Luau",
    "luaLibImport": "inline",
    "luaPlugins": [{ "name": "@gwigz/slua-tstl-plugin" }],
    "extension": "slua"
  }
}`

        const vscodeSettings = `{
  "files.associations": {
    "*.slua": "lua"
  }
}`

        const gitattributes = `*.slua linguist-language=Lua`

        const [installHtmls, tsconfigHtml, compileHtmls, vscodeSettingsHtml, gitattributesHtml] =
          await Promise.all([
            Promise.all(
              managers.map((m) => codeToHtml(m.install, { lang: "bash", theme: "vitesse-dark" })),
            ),
            codeToHtml(tsconfig, { lang: "jsonc", theme: "vitesse-dark" }),
            Promise.all(
              managers.map((m) =>
                codeToHtml(`${m.run} tstl`, { lang: "bash", theme: "vitesse-dark" }),
              ),
            ),
            codeToHtml(vscodeSettings, { lang: "jsonc", theme: "vitesse-dark" }),
            codeToHtml(gitattributes, { lang: "ini", theme: "vitesse-dark" }),
          ])

        const install = Object.fromEntries(managers.map((m, i) => [m.label, installHtmls[i]]))
        const compile = Object.fromEntries(managers.map((m, i) => [m.label, compileHtmls[i]]))

        return [
          `export const install = ${JSON.stringify(install)};`,
          `export const tsconfig = ${JSON.stringify(tsconfigHtml)};`,
          `export const compile = ${JSON.stringify(compile)};`,
          `export const vscodeSettings = ${JSON.stringify(vscodeSettingsHtml)};`,
          `export const gitattributes = ${JSON.stringify(gitattributesHtml)};`,
        ].join("\n")
      }

      // Showcase blocks
      const LUA_CODE = transpileToLua(TS_CODE)

      const [tsHtml, luaHtml] = await Promise.all([
        codeToHtml(TS_CODE, {
          lang: "tsx",
          theme: "vitesse-dark",
          transformers: [twoslashTransformer],
        }),
        codeToHtml(LUA_CODE, {
          lang: "lua",
          theme: "vitesse-dark",
        }),
      ])

      return [
        `export const tsHtml = ${JSON.stringify(tsHtml)};`,
        `export const luaHtml = ${JSON.stringify(luaHtml)};`,
      ].join("\n")
    },
  }
}

/**
 * Vite plugin that injects Node.js globals into production bundles via the
 * banner output hook. Only active during `vite build`.
 */
function injectNodeGlobals(): Plugin {
  return {
    name: "inject-node-globals",
    apply: "build",
    banner: () => nodeGlobalsIIFE,
  }
}

export default defineConfig({
  plugins: [
    injectNodeGlobals(),
    stubTstlResolve(),
    tstlLualib(),
    twoslashCodeBlocks(),
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    // Force a single instance of each package so the ts.sys.readFile
    // patch in transpiler.worker.ts applies to the same TypeScript copy
    // that TSTL and the slua plugin use.  Without this, Rolldown creates
    // duplicate CJS-to-ESM instances (one per ESM import chain), causing
    // the worker to patch the wrong ts.sys and lualib reads to fail.
    dedupe: ["typescript", "typescript-to-lua"],
    alias: {
      "~": resolve("src"),
      // Node built-in polyfills
      path: shim("path"),
      buffer: "buffer",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      // Stub modules that don't exist in the browser
      os: shim("os"),
      fs: shim("fs"),
      "graceful-fs": shim("fs"),
      perf_hooks: shim("empty"),
      assert: resolve("src/shims/assert.js"),
      constants: shim("empty"),
    },
  },
  optimizeDeps: {
    rolldownOptions: {
      plugins: [{ name: "node-globals", banner: nodeGlobalsBanner }],
    },
  },
  worker: {
    format: "es",
    plugins: () => [injectNodeGlobals(), tstlLualib()],
  },
})
