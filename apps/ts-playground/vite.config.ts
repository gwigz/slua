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
 * This eliminates the entire enhanced-resolve → graceful-fs → constants chain.
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
  plugins: [injectNodeGlobals(), stubTstlResolve(), tstlLualib(), tailwindcss(), react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
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
