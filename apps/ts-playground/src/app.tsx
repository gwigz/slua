import { useEffect, useRef, useState } from "react"
import Editor from "@monaco-editor/react"
import { IconBrandGithub } from "@tabler/icons-react"
import type { WorkerDiagnostic, WorkerResponse } from "./transpiler.worker"

const DEFAULT_CODE = `\
/** Only JSDoc comments are preserved in the Lua output */
const owner = ll.GetOwner()

// This comment will be stripped from the output
LLEvents.on("touch_start", (events) => {
  for (const event of events) {
    const key = event.getKey()

    if (key !== owner) {
      continue
    }

    ll.Say(0, \`Hello secondlife:///app/agent/\${key}/about!\`)
  }
})
`

export function App() {
  const [lua, setLua] = useState("")
  const [diagnostics, setDiagnostics] = useState<WorkerDiagnostic[]>([])
  const workerRef = useRef<Worker | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const worker = new Worker(new URL("./transpiler.worker.ts", import.meta.url), {
      type: "module",
    })

    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      setLua(event.data.lua)
      setDiagnostics(event.data.diagnostics)
    })

    worker.addEventListener("error", (event: ErrorEvent) => {
      setDiagnostics([{ message: event.message, start: undefined, length: undefined }])
    })

    workerRef.current = worker

    // Transpile the default code on mount
    worker.postMessage(DEFAULT_CODE)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      worker.terminate()
    }
  }, [])

  function handleChange(value: string | undefined) {
    const code = value ?? ""

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      workerRef.current?.postMessage(code)
    }, 300)
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <span className="font-semibold text-sm">TypeScript to SLua Playground</span>
        <a
          href="https://github.com/gwigz/slua"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconBrandGithub size={18} />
        </a>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* TypeScript input */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-border">
          <div className="px-3 py-1 text-xs text-muted-foreground border-b border-border">
            TypeScript
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              defaultLanguage="typescript"
              defaultValue={DEFAULT_CODE}
              theme="vs-dark"
              onChange={handleChange}
              options={{
                minimap: { enabled: false },
                fontFamily: "'Fira Code', monospace",
                fontLigatures: true,
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Lua output */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="px-3 py-1 text-xs text-muted-foreground border-b border-border">SLua</div>
          <div className="flex-1 min-h-0">
            <Editor
              language="lua"
              value={lua}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontFamily: "'Fira Code', monospace",
                fontLigatures: true,
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      {diagnostics.length > 0 && (
        <div className="shrink-0 max-h-36 overflow-y-auto border-t border-border bg-muted/40">
          {diagnostics.map((d, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-4 py-1.5 text-xs font-mono text-destructive"
            >
              <span className="shrink-0 opacity-60">
                {d.start !== undefined ? `[${d.start}]` : ""}
              </span>
              <span>{d.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
