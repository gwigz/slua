/**
 * Standalone Vite config that builds the TSTL transpiler web worker as a
 * self-contained IIFE bundle. The output is placed in public/ so Next.js
 * serves it as a static asset.
 *
 * Run:  vite build -c vite.worker.config.ts
 * Watch: vite build -c vite.worker.config.ts --watch
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { defineConfig, type Plugin } from "vite"

const _require = createRequire(import.meta.url)

const resolve = (p: string) => path.resolve(__dirname, p)
const shim = (name: string) => resolve(`src/playground/worker/shims/${name}.ts`)

// ---------------------------------------------------------------------------
// Plugins (inlined from apps/web/vite.config.ts)
// ---------------------------------------------------------------------------

/**
 * Stub TSTL's file resolver module. It's a relative require("./resolve") from
 * transpiler.js so resolve.alias can't intercept it -- we need a resolveId hook.
 */
function stubTstlResolve(): Plugin {
  const target = path.normalize("typescript-to-lua/dist/transpilation/resolve")
  const stub = shim("resolve-stub")

  return {
    name: "stub-tstl-resolve",
    resolveId(id, importer) {
      if (!importer) return
      const resolved = path.resolve(path.dirname(importer), id)
      if (resolved.includes(target)) return stub
    },
  }
}

/**
 * Bundle TSTL's lualib files into a virtual module so the browser worker can
 * serve them to the transpiler.
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
 * Self-contained Node.js globals shim prepended to the production bundle.
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
  if (typeof require === "undefined") globalThis.require = function(m) { throw new Error("require(" + m + ") not available"); };
})();`

function injectNodeGlobals(): Plugin {
  return {
    name: "inject-node-globals",
    apply: "build",
    banner: () => nodeGlobalsIIFE,
  }
}

// ---------------------------------------------------------------------------
// Build config
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [injectNodeGlobals(), stubTstlResolve(), tstlLualib()],
  build: {
    lib: {
      entry: resolve("src/playground/worker/transpiler.worker.ts"),
      formats: ["iife"],
      name: "TranspilerWorker",
      fileName: () => "playground-worker.js",
    },
    outDir: resolve("public"),
    emptyOutDir: false,
    minify: true,
    sourcemap: true,
  },
  resolve: {
    dedupe: ["typescript", "typescript-to-lua"],
    alias: {
      // Workspace packages, explicit paths so Rolldown can resolve ?raw imports
      "@gwigz/slua-types": resolve("../../packages/types"),
      "@gwigz/slua-tstl-plugin": resolve("../../packages/tstl-plugin"),
      path: shim("path"),
      buffer: "buffer",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      os: shim("os"),
      fs: shim("fs"),
      "graceful-fs": shim("fs"),
      perf_hooks: shim("empty"),
      assert: resolve("src/playground/worker/shims/assert.js"),
      constants: shim("empty"),
    },
  },
})
