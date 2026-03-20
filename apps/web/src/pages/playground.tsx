import { useEffect, useRef, useState } from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import { IconBrandGithub, IconExternalLink, IconInfoCircle, IconRotate } from "@tabler/icons-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import type { WorkerDiagnostic, WorkerResponse } from "../transpiler.worker"

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

  if (message.toLowerCase() === "ping") {
    ll.RegionSayTo(id, 0, "pong!")
  }
})

ll.Listen(67, "", owner, "")
`

const STORAGE_KEY = "slua.playground-code"

export function Playground() {
  const [initialCode] = useState(() => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CODE)
  const [lua, setLua] = useState("")
  const [diagnostics, setDiagnostics] = useState<WorkerDiagnostic[]>([])
  const [resetOpen, setResetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"typescript" | "lua">("typescript")
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 640px)").matches)
  const workerRef = useRef<Worker | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)")
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    const worker = new Worker(new URL("../transpiler.worker.ts", import.meta.url), {
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

    // Transpile the initial code on mount
    worker.postMessage(initialCode)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      worker.terminate()
    }
  }, [initialCode])

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  function handleChange(value: string | undefined) {
    const code = value ?? ""
    localStorage.setItem(STORAGE_KEY, code)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      workerRef.current?.postMessage(code)
    }, 300)
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY)
    if (editorRef.current) {
      editorRef.current.setValue(DEFAULT_CODE)
    }
    workerRef.current?.postMessage(DEFAULT_CODE)
    setActiveTab("typescript")
    setResetOpen(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-45px)] bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <span className="font-semibold text-sm">TypeScript to SLua Playground</span>
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DialogTrigger className="text-muted-foreground hover:text-foreground transition-colors">
                      <IconRotate size={18} />
                    </DialogTrigger>
                  }
                />
                <TooltipContent>Reset to default</TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-sm gap-5">
                <DialogHeader>
                  <DialogTitle>Reset to default</DialogTitle>
                  <DialogDescription>
                    This will discard your changes and restore the example code.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                  <Button variant="destructive" onClick={handleReset}>
                    Reset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DialogTrigger className="text-muted-foreground hover:text-foreground transition-colors">
                      <IconInfoCircle size={18} />
                    </DialogTrigger>
                  }
                />
                <TooltipContent>Credits</TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-md gap-5">
                <DialogHeader>
                  <DialogTitle>Credits</DialogTitle>
                  <DialogDescription>
                    Open-source projects that make this possible
                  </DialogDescription>
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
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href="https://github.com/gwigz/slua"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <IconBrandGithub size={18} />
                  </a>
                }
              />
              <TooltipContent>View on GitHub</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </header>

      {isDesktop ? (
        <div className="flex flex-1 min-h-0">
          {/* TypeScript input */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-border">
            <div className="px-3 py-1 text-xs text-muted-foreground border-b border-border">
              TypeScript
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                defaultLanguage="typescript"
                defaultValue={initialCode}
                theme="vitesse-dark"
                onMount={handleMount}
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
            <div className="px-3 py-1 text-xs text-muted-foreground border-b border-border">
              SLua
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                language="lua"
                value={lua}
                theme="vitesse-dark"
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
      ) : (
        <>
          {/* Mobile tab bar */}
          <div className="flex shrink-0 border-b border-border">
            <button
              className={`flex-1 px-3 py-1.5 text-xs transition-colors ${activeTab === "typescript" ? "text-foreground border-b-2 border-foreground -mb-px" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("typescript")}
            >
              TypeScript
            </button>
            <button
              className={`flex-1 px-3 py-1.5 text-xs transition-colors ${activeTab === "lua" ? "text-foreground border-b-2 border-foreground -mb-px" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("lua")}
            >
              SLua
            </button>
          </div>

          {/* Mobile: both editors always mounted, visibility-toggled to avoid Monaco remount issues */}
          <div className="flex-1 min-h-0 relative">
            <div
              className={`absolute inset-0 ${activeTab !== "typescript" ? "invisible pointer-events-none" : ""}`}
            >
              <Editor
                defaultLanguage="typescript"
                defaultValue={initialCode}
                theme="vitesse-dark"
                onMount={handleMount}
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
            <div
              className={`absolute inset-0 ${activeTab !== "lua" ? "invisible pointer-events-none" : ""}`}
            >
              <Editor
                language="lua"
                value={lua}
                theme="vitesse-dark"
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
        </>
      )}

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
