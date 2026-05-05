"use client"

import { useEffect, useRef, useState } from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import { IconExternalLink, IconInfoCircle, IconRotate } from "@tabler/icons-react"
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
import { PlaygroundTabs } from "~/components/playground-tabs"
import { beforeMount as monacoBeforeMount } from "~/playground/monaco-setup"
import { EDITOR_OPTIONS, useMonacoTheme } from "~/playground/shared"
import type { WorkerDiagnostic, WorkerResponse } from "~/playground/types"

const CREDITS = [
  {
    name: "TypeScript-to-Lua",
    url: "https://github.com/TypeScriptToLua/TypeScriptToLua",
    description: "Core transpiler powering TypeScript to Lua conversion",
    color: "var(--chart-1)",
  },
  {
    name: "ts-morph",
    url: "https://github.com/dsherret/ts-morph",
    description: "TypeScript AST manipulation for type generation",
    color: "var(--chart-2)",
  },
  {
    name: "TypeScript",
    url: "https://github.com/microsoft/TypeScript",
    description: "The source language and type system",
    color: "var(--chart-5)",
  },
  {
    name: "lsl-definitions",
    url: "https://github.com/secondlife/lsl-definitions",
    description: "Official LSL and SLua API definitions",
    color: "var(--chart-3)",
  },
  {
    name: "SLua",
    url: "https://github.com/secondlife/slua",
    description: "The Second Life Luau runtime",
    color: "var(--chart-1)",
  },
  {
    name: "Luau",
    url: "https://github.com/luau-lang/luau",
    description: "The target Lua runtime that powers SLua in Second Life",
    color: "var(--chart-1)",
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

export default function Playground() {
  const monacoTheme = useMonacoTheme()
  const [initialCode] = useState(() => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CODE)
  const [lua, setLua] = useState("")
  const [diagnostics, setDiagnostics] = useState<WorkerDiagnostic[]>([])
  const [globalErrors, setGlobalErrors] = useState<WorkerDiagnostic[]>([])
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
    const handleError = (event: ErrorEvent) => {
      console.error("[playground] window error:", event.error ?? event.message)

      const location = event.filename ? ` (${event.filename}:${event.lineno}:${event.colno})` : ""

      setGlobalErrors((prev) => [
        ...prev,
        { message: `${event.message}${location}`, start: undefined, length: undefined },
      ])
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("[playground] unhandled rejection:", event.reason)

      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason)

      setGlobalErrors((prev) => [
        ...prev,
        { message: `Unhandled rejection: ${reason}`, start: undefined, length: undefined },
      ])
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  useEffect(() => {
    const worker = new Worker("/playground-worker.js")

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
    <div className="flex flex-col flex-1 min-h-0 bg-fd-background text-fd-foreground">
      <header className="flex items-center justify-between px-4 py-2 border-b border-fd-border shrink-0">
        <PlaygroundTabs activeTab="typescript" />
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DialogTrigger className="text-fd-muted-foreground hover:text-fd-foreground transition-colors">
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
                    <DialogTrigger className="text-fd-muted-foreground hover:text-fd-foreground transition-colors">
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
                        className="group flex items-start gap-3 border border-fd-border/50 px-3 py-2 rounded-sm transition-colors hover:bg-fd-muted/50"
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
                          <span className="text-[11px] leading-snug text-fd-muted-foreground">
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
        </TooltipProvider>
      </header>

      {isDesktop ? (
        <div className="flex flex-1 min-h-0">
          {/* TypeScript input */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-fd-border">
            <div className="px-3 py-1 text-xs text-fd-muted-foreground border-b border-fd-border">
              TypeScript
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                defaultLanguage="typescript"
                defaultValue={initialCode}
                theme={monacoTheme}
                beforeMount={monacoBeforeMount}
                onMount={handleMount}
                onChange={handleChange}
                options={EDITOR_OPTIONS}
              />
            </div>
          </div>

          {/* Lua output */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="px-3 py-1 text-xs text-fd-muted-foreground border-b border-fd-border">
              SLua
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                language="lua"
                value={lua}
                theme={monacoTheme}
                beforeMount={monacoBeforeMount}
                options={{ ...EDITOR_OPTIONS, readOnly: true }}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile tab bar */}
          <div className="flex shrink-0 border-b border-fd-border">
            <button
              className={`flex-1 px-3 py-1.5 text-xs transition-colors ${activeTab === "typescript" ? "text-fd-foreground border-b-2 border-fd-foreground -mb-px" : "text-fd-muted-foreground"}`}
              onClick={() => setActiveTab("typescript")}
            >
              TypeScript
            </button>
            <button
              className={`flex-1 px-3 py-1.5 text-xs transition-colors ${activeTab === "lua" ? "text-fd-foreground border-b-2 border-fd-foreground -mb-px" : "text-fd-muted-foreground"}`}
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
                theme={monacoTheme}
                beforeMount={monacoBeforeMount}
                onMount={handleMount}
                onChange={handleChange}
                options={EDITOR_OPTIONS}
              />
            </div>
            <div
              className={`absolute inset-0 ${activeTab !== "lua" ? "invisible pointer-events-none" : ""}`}
            >
              <Editor
                language="lua"
                value={lua}
                theme={monacoTheme}
                beforeMount={monacoBeforeMount}
                options={{ ...EDITOR_OPTIONS, readOnly: true }}
              />
            </div>
          </div>
        </>
      )}

      {/* Diagnostics */}
      {(diagnostics.length > 0 || globalErrors.length > 0) && (
        <div className="shrink-0 max-h-36 overflow-y-auto border-t border-fd-border bg-fd-muted/40">
          {[...diagnostics, ...globalErrors].map((d, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-4 py-1.5 text-xs font-mono text-red-400"
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
