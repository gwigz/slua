// Monaco's FileAccess.asBrowserUri() calls toUri(path, moduleIdToUrl) where
// moduleIdToUrl is undefined in ESM builds outside VS Code. Setting
// _VSCODE_FILE_ROOT makes toUri resolve paths relative to the origin instead,
// avoiding the crash. Monaco's own blob-wrapper worker bootstrap sets this too.
;(globalThis as Record<string, unknown>)._VSCODE_FILE_ROOT = globalThis.origin + "/"

// Must be set before any monaco-editor imports execute.
// ES module imports are hoisted, so this file must be imported before
// monaco-editor to ensure getWorker is available when the editor initializes.
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === "typescript" || label === "javascript") {
      return new Worker(new URL("./ts-worker.ts", import.meta.url), { type: "module" })
    }

    return new Worker(new URL("./editor-worker.ts", import.meta.url), { type: "module" })
  },
}
