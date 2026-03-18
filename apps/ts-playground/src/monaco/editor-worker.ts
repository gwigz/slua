// Basic editor worker entry point (diff, links, etc.)
// Calls initialize(null) explicitly during module evaluation instead of relying
// on the fallback onmessage handler in editor.worker.js, which can race with
// message delivery in blob-wrapped module workers.
;(globalThis as Record<string, unknown>)._VSCODE_FILE_ROOT = globalThis.origin + "/"

import { initialize } from "monaco-editor/esm/vs/editor/editor.worker"

initialize(null)
