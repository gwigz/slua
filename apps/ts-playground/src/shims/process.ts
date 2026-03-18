// Process shim for TypeScript/TSTL running in the browser.
// NOTE: browser must NOT be set -- TypeScript's isNodeLikeSystem() checks
// !process.browser to decide whether to create ts.sys. TSTL's
// createVirtualProgram needs ts.sys.fileExists to exist.
const noop = () => {}

const process = {
  title: "browser",
  env: {},
  argv: [] as string[],
  version: "v22.0.0",
  versions: { node: "22.0.0" },
  on: noop,
  addListener: noop,
  once: noop,
  off: noop,
  removeListener: noop,
  removeAllListeners: noop,
  emit: noop,
  prependListener: noop,
  prependOnceListener: noop,
  listeners: () => [],
  binding: () => {
    throw new Error("process.binding is not supported")
  },
  cwd: () => "/",
  chdir: () => {
    throw new Error("process.chdir is not supported")
  },
  umask: () => 0,
  nextTick: (fn: Function, ...args: unknown[]) => setTimeout(() => fn(...args), 0),
  platform: typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "darwin" : "linux",
}

export default process
