import { useEffect, useRef, useState } from "react"
import Editor from "@monaco-editor/react"
import { IconBrandGithub, IconExternalLink, IconInfoCircle } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import type { WorkerDiagnostic, WorkerResponse } from "./transpiler.worker"

const CREDITS = [
  {
    name: "TypeScript-to-Lua",
    url: "https://github.com/TypeScriptToLua/TypeScriptToLua",
    description: "Core transpiler powering TypeScript to Lua conversion",
    color: "var(--chart-1)", // keyword blue
  },
  {
    name: "ts-morph",
    url: "https://github.com/dsherret/ts-morph",
    description: "TypeScript AST manipulation for type generation",
    color: "var(--chart-2)", // type teal
  },
  {
    name: "TypeScript",
    url: "https://github.com/microsoft/TypeScript",
    description: "The source language and type system",
    color: "var(--chart-5)", // function yellow
  },
  {
    name: "lsl-definitions",
    url: "https://github.com/secondlife/lsl-definitions",
    description: "Official LSL and SLua API definitions",
    color: "var(--chart-3)", // string orange
  },
  {
    name: "SLua",
    url: "https://github.com/secondlife/slua",
    description: "The Second Life Luau runtime",
    color: "var(--chart-1)", // keyword blue
  },
  {
    name: "Luau",
    url: "https://github.com/luau-lang/luau",
    description: "The target Lua runtime that powers SLua in Second Life",
    color: "var(--chart-1)", // keyword blue
  },
]

const DEFAULT_CODE = `\
let owner = ll.GetOwner()

LLEvents.on("changed", (changed) => {
  if ((changed & CHANGED_OWNER) !== 0) {
    owner = ll.GetOwner()
  }
})

LLEvents.on("touch_start", (events) => {
  for (const event of events) {
    const key = event.getKey()

    if (key !== owner) {
      continue
    }

    ll.Say(0, \`Hello secondlife:///app/agent/\${key}/about!\`)
  }
})

LLEvents.on("listen", (_channel, _name, id, message) => {
  // if (ll.GetAgentSize(id) === ZERO_VECTOR) {
  //   return
  // }

  if (message === "ping") {
    ll.RegionSayTo(id, 0, "pong!")
  }
})

ll.Listen(67, "", owner, "")
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
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/gwigz/slua"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconBrandGithub size={18} />
          </a>
          <Dialog>
            <DialogTrigger className="text-muted-foreground hover:text-foreground transition-colors">
              <IconInfoCircle size={18} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-md gap-5">
              <DialogHeader>
                <DialogTitle>Credits</DialogTitle>
                <DialogDescription>Open-source projects that make this possible</DialogDescription>
              </DialogHeader>
              <ul className="grid gap-1">
                {CREDITS.map((credit) => (
                  <li key={credit.name}>
                    <a
                      href={credit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 border border-border/50 px-3 py-2 rounded-sm transition-colors hover:bg-muted/60"
                    >
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-xs font-medium truncate"
                            style={{ color: credit.color }}
                          >
                            {credit.name}
                          </span>
                          <IconExternalLink
                            size={11}
                            className="shrink-0 opacity-0 -translate-y-px transition-all group-hover:opacity-40"
                          />
                        </span>
                        <span className="text-[11px] leading-snug text-muted-foreground">
                          {credit.description}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
        </div>
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
