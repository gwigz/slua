// Custom TypeScript worker entry point that calls initialize() synchronously
// during module evaluation, bypassing the onmessage-based lazy initialization
// in Monaco's ts.worker.js. Combined with the patched editor.worker.js (which
// removes the fallback handler), this eliminates the race condition in
// monaco-editor 0.52 where initialize(null) could win against
// initialize(factory) in Vite 8's blob-wrapped module workers.

import { initialize, create } from "monaco-editor/esm/vs/language/typescript/ts.worker"

initialize((ctx: object, createData: object) => create(ctx, createData))
