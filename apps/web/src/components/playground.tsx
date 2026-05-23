"use client"

import { useEffect, useRef, useState } from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import {
  IconAdjustments,
  IconCheck,
  IconExternalLink,
  IconInfoCircle,
  IconLink,
  IconRotate,
} from "@tabler/icons-react"
import type { OptimizeFlags } from "@gwigz/slua-tstl-plugin"
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
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Toggle } from "~/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { PlaygroundTabs } from "~/components/playground-tabs"
import { beforeMount as monacoBeforeMount } from "~/playground/monaco-setup"
import { WORKER_VERSION } from "~/playground/generated/worker-version"
import { EDITOR_OPTIONS, useMonacoTheme } from "~/playground/shared"
import { DEFAULT_OPTIMIZE, OPTIMIZE_OPTIONS } from "~/playground/optimize-options"
import { encodeShared, decodeShared } from "~/playground/share"
import type { WorkerDiagnostic, WorkerRequest, WorkerResponse } from "~/playground/types"

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
const OPTIMIZE_KEY = "slua.playground-optimize"

function loadOptimize(): OptimizeFlags {
  try {
    const saved = localStorage.getItem(OPTIMIZE_KEY)
    return saved ? { ...DEFAULT_OPTIMIZE, ...JSON.parse(saved) } : { ...DEFAULT_OPTIMIZE }
  } catch {
    return { ...DEFAULT_OPTIMIZE }
  }
}

// Once the user edits, the URL no longer reflects a shared snapshot.
function clearShareHash() {
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search)
  }
}

export default function Playground() {
  const monacoTheme = useMonacoTheme()
  // A shared link (#code/...) takes priority over the locally-saved draft.
  const [shared] = useState(() => decodeShared(window.location.hash))
  const [initialCode] = useState(
    () => shared?.code ?? localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CODE,
  )
  const [optimize, setOptimize] = useState<OptimizeFlags>(() =>
    shared?.optimize ? { ...DEFAULT_OPTIMIZE, ...shared.optimize } : loadOptimize(),
  )
  const [copied, setCopied] = useState(false)
  const [lua, setLua] = useState("")
  const [diagnostics, setDiagnostics] = useState<WorkerDiagnostic[]>([])
  const [globalErrors, setGlobalErrors] = useState<WorkerDiagnostic[]>([])
  const [resetOpen, setResetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"typescript" | "lua">("typescript")
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 640px)").matches)
  const workerRef = useRef<Worker | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const optimizeRef = useRef(optimize)
  const didMountRef = useRef(false)

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
    const worker = new Worker(`/playground-worker.js?v=${WORKER_VERSION}`)

    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      setLua(event.data.lua)
      setDiagnostics(event.data.diagnostics)
    })

    worker.addEventListener("error", (event: ErrorEvent) => {
      console.error("[playground] worker error:", event)

      const stack = event.error instanceof Error ? event.error.stack : undefined
      const location =
        event.filename && event.lineno !== undefined
          ? ` (${event.filename}:${event.lineno}:${event.colno ?? 0})`
          : ""

      setDiagnostics([
        {
          message: `${event.message || "Worker error"}${location}`,
          stack,
          start: undefined,
          length: undefined,
        },
      ])
    })

    workerRef.current = worker

    // Transpile the initial code on mount
    worker.postMessage({ code: initialCode, optimize: optimizeRef.current } satisfies WorkerRequest)

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

  async function handleShare() {
    const code = editorRef.current?.getValue() ?? initialCode
    const hash = encodeShared({ code, optimize })
    const url = `${window.location.origin}${window.location.pathname}${hash}`

    window.history.replaceState(null, "", url)

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard blocked; the URL bar still holds the shareable link
    }
  }

  function handleChange(value: string | undefined) {
    const code = value ?? ""

    localStorage.setItem(STORAGE_KEY, code)
    clearShareHash()

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      workerRef.current?.postMessage({
        code,
        optimize: optimizeRef.current,
      } satisfies WorkerRequest)
    }, 300)
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY)

    if (editorRef.current) {
      editorRef.current.setValue(DEFAULT_CODE)
    }

    workerRef.current?.postMessage({
      code: DEFAULT_CODE,
      optimize: optimizeRef.current,
    } satisfies WorkerRequest)

    setActiveTab("typescript")
    setResetOpen(false)
  }

  // Re-transpile when optimize flags change (and persist them).
  useEffect(() => {
    optimizeRef.current = optimize
    localStorage.setItem(OPTIMIZE_KEY, JSON.stringify(optimize))

    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    workerRef.current?.postMessage({
      code: editorRef.current?.getValue() ?? initialCode,
      optimize,
    } satisfies WorkerRequest)
  }, [optimize, initialCode])

  function setFlag(key: keyof OptimizeFlags, value: boolean) {
    setOptimize((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-fd-background text-fd-foreground">
      <header className="flex items-center justify-between px-4 py-2 border-b border-fd-border shrink-0">
        <PlaygroundTabs activeTab="typescript" />
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={handleShare}
                    className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
                  >
                    {copied ? (
                      <IconCheck size={18} className="text-fd-accent-foreground" />
                    ) : (
                      <IconLink size={18} />
                    )}
                  </button>
                }
              />
              <TooltipContent>{copied ? "Link copied!" : "Copy share link"}</TooltipContent>
            </Tooltip>
            <Popover>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <PopoverTrigger className="text-fd-muted-foreground hover:text-fd-foreground transition-colors">
                      <IconAdjustments size={18} />
                    </PopoverTrigger>
                  }
                />
                <TooltipContent>Optimizations</TooltipContent>
              </Tooltip>
              <PopoverContent align="end" className="w-64 p-0">
                <div className="flex items-center justify-between border-b border-fd-border px-3 py-2">
                  <span className="text-sm font-medium">Optimizations</span>
                  <button
                    type="button"
                    className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors"
                    onClick={() => setOptimize({ ...DEFAULT_OPTIMIZE })}
                  >
                    Reset
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto p-1">
                  {OPTIMIZE_OPTIONS.map((opt) => (
                    <Toggle
                      key={opt.key}
                      pressed={optimize[opt.key] ?? false}
                      onPressedChange={(pressed) => setFlag(opt.key, pressed)}
                      title={opt.description}
                      className="w-full justify-between gap-3 rounded-sm border-0 px-2 py-1.5 font-normal"
                    >
                      <span>{opt.label}</span>
                      {(optimize[opt.key] ?? false) && (
                        <IconCheck size={14} className="text-fd-accent-foreground" />
                      )}
                    </Toggle>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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
              <span className="min-w-0 flex-1 wrap-break-word">
                {d.message}
                {d.stack && (
                  <details className="mt-1 opacity-60">
                    <summary className="cursor-pointer">Stack</summary>
                    <pre className="mt-1 text-[10px] whitespace-pre-wrap wrap-break-word">
                      {d.stack}
                    </pre>
                  </details>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
