"use client"

import { useEffect, useRef, useState } from "react"
import Editor from "@monaco-editor/react"
import { IconSettings } from "@tabler/icons-react"
import { PlaygroundTabs } from "~/components/playground-tabs"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Toggle } from "~/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { beforeMount as monacoBeforeMount } from "~/playground/monaco-setup"
import { EDITOR_OPTIONS, useMonacoTheme } from "~/playground/shared"
import { jsonToSlencode } from "~/playground/json-encode"
import { cn } from "~/lib/cn"

const DEFAULT_JSON = `{
  "name": "My Object",
  "position": { "x": 128.5, "y": 0, "z": 25.3 },
  "rotation": { "x": 0, "y": 0, "z": 0, "w": 1 },
  "owner": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "velocity": "<0, 0, -9.8>",
  "data": [1, 2, 3],
  "active": true
}`

export function JsonPlayground() {
  const monacoTheme = useMonacoTheme()

  const [initialState] = useState(() => {
    const input = localStorage.getItem("slua.json-playground-input") ?? DEFAULT_JSON
    const prettyPrint = localStorage.getItem("slua.json-playground-pretty") !== "false"
    const tight = localStorage.getItem("slua.json-playground-tight") === "true"
    const detectVectors = localStorage.getItem("slua.json-playground-detect-vectors") !== "false"
    const detectQuaternions = localStorage.getItem("slua.json-playground-detect-quats") !== "false"
    const detectUuids = localStorage.getItem("slua.json-playground-detect-uuids") !== "false"
    const result = jsonToSlencode(
      input,
      { detectVectors, detectQuaternions, detectUuids },
      { prettyPrint, tight },
    )

    return { input, prettyPrint, tight, detectVectors, detectQuaternions, detectUuids, ...result }
  })

  const [input, setInput] = useState(initialState.input)
  const [prettyPrint, setPrettyPrint] = useState(initialState.prettyPrint)
  const [tight, setTight] = useState(initialState.tight)
  const [detectVectors, setDetectVectors] = useState(initialState.detectVectors)
  const [detectQuaternions, setDetectQuaternions] = useState(initialState.detectQuaternions)
  const [detectUuids, setDetectUuids] = useState(initialState.detectUuids)
  const [output, setOutput] = useState(initialState.output)
  const [error, setError] = useState<string | null>(initialState.error)
  const [activeTab, setActiveTab] = useState<"input" | "output">("input")
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 640px)").matches)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)")
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)

    mq.addEventListener("change", handler)

    return () => mq.removeEventListener("change", handler)
  }, [])

  function encodeNow(
    currentInput: string,
    detection: { detectVectors: boolean; detectQuaternions: boolean; detectUuids: boolean },
    encodeOpts: { prettyPrint: boolean; tight: boolean },
  ) {
    const result = jsonToSlencode(currentInput, detection, encodeOpts)

    setOutput(result.output)
    setError(result.error)
  }

  function handleInputChange(value: string | undefined) {
    const text = value ?? ""

    setInput(text)
    localStorage.setItem("slua.json-playground-input", text)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      encodeNow(text, { detectVectors, detectQuaternions, detectUuids }, { prettyPrint, tight })
    }, 300)
  }

  function handlePrettyPrint() {
    const newVal = !prettyPrint

    setPrettyPrint(newVal)
    localStorage.setItem("slua.json-playground-pretty", String(newVal))

    if (debounceRef.current) clearTimeout(debounceRef.current)

    encodeNow(
      input,
      { detectVectors, detectQuaternions, detectUuids },
      { prettyPrint: newVal, tight },
    )
  }

  function handleTight() {
    const newVal = !tight

    setTight(newVal)
    localStorage.setItem("slua.json-playground-tight", String(newVal))

    if (debounceRef.current) clearTimeout(debounceRef.current)

    encodeNow(
      input,
      { detectVectors, detectQuaternions, detectUuids },
      { prettyPrint, tight: newVal },
    )
  }

  function handleDetectVectors() {
    const newVal = !detectVectors

    setDetectVectors(newVal)
    localStorage.setItem("slua.json-playground-detect-vectors", String(newVal))

    if (debounceRef.current) clearTimeout(debounceRef.current)

    encodeNow(
      input,
      { detectVectors: newVal, detectQuaternions, detectUuids },
      { prettyPrint, tight },
    )
  }

  function handleDetectQuaternions() {
    const newVal = !detectQuaternions

    setDetectQuaternions(newVal)
    localStorage.setItem("slua.json-playground-detect-quats", String(newVal))

    if (debounceRef.current) clearTimeout(debounceRef.current)

    encodeNow(
      input,
      { detectVectors, detectQuaternions: newVal, detectUuids },
      { prettyPrint, tight },
    )
  }

  function handleDetectUuids() {
    const newVal = !detectUuids

    setDetectUuids(newVal)
    localStorage.setItem("slua.json-playground-detect-uuids", String(newVal))

    if (debounceRef.current) clearTimeout(debounceRef.current)

    encodeNow(
      input,
      { detectVectors, detectQuaternions, detectUuids: newVal },
      { prettyPrint, tight },
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-fd-background text-fd-foreground">
      <header className="flex items-center justify-between px-4 py-2 border-b border-fd-border shrink-0">
        <PlaygroundTabs activeTab="json" />
        <TooltipProvider>
          <Popover>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PopoverTrigger className="text-fd-muted-foreground hover:text-fd-foreground transition-colors">
                    <IconSettings size={18} />
                  </PopoverTrigger>
                }
              />
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-3" side="bottom" align="end">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-fd-muted-foreground mb-1">Output</p>
                <div className="flex flex-wrap gap-1.5">
                  <Toggle pressed={prettyPrint} onPressedChange={() => handlePrettyPrint()}>
                    Pretty
                  </Toggle>
                  <Toggle pressed={tight} onPressedChange={() => handleTight()}>
                    Tight
                  </Toggle>
                </div>
                <p className="text-xs font-medium text-fd-muted-foreground mt-1 mb-1">Detection</p>
                <div className="flex flex-wrap gap-1.5">
                  <Toggle pressed={detectVectors} onPressedChange={() => handleDetectVectors()}>
                    Vectors
                  </Toggle>
                  <Toggle
                    pressed={detectQuaternions}
                    onPressedChange={() => handleDetectQuaternions()}
                  >
                    Quats
                  </Toggle>
                  <Toggle pressed={detectUuids} onPressedChange={() => handleDetectUuids()}>
                    UUIDs
                  </Toggle>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </TooltipProvider>
      </header>

      {isDesktop ? (
        <div className="flex flex-1 min-h-0">
          {/* JSON input */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-fd-border">
            <div className="px-3 py-1 text-xs text-fd-muted-foreground border-b border-fd-border">
              JSON
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                defaultLanguage="json"
                defaultValue={input}
                theme={monacoTheme}
                beforeMount={monacoBeforeMount}
                onChange={handleInputChange}
                options={EDITOR_OPTIONS}
              />
            </div>
          </div>

          {/* slencode output */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="px-3 py-1 text-xs text-fd-muted-foreground border-b border-fd-border">
              slencode
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                language="json"
                value={output}
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
              className={cn(
                "flex-1 px-3 py-1.5 text-xs transition-colors",
                activeTab === "input"
                  ? "text-fd-foreground border-b-2 border-fd-foreground -mb-px"
                  : "text-fd-muted-foreground",
              )}
              onClick={() => setActiveTab("input")}
            >
              JSON
            </button>
            <button
              className={cn(
                "flex-1 px-3 py-1.5 text-xs transition-colors",
                activeTab === "output"
                  ? "text-fd-foreground border-b-2 border-fd-foreground -mb-px"
                  : "text-fd-muted-foreground",
              )}
              onClick={() => setActiveTab("output")}
            >
              slencode
            </button>
          </div>

          {/* Mobile: both editors always mounted, visibility-toggled to avoid Monaco remount issues */}
          <div className="flex-1 min-h-0 relative">
            <div
              className={cn(
                "absolute inset-0",
                activeTab !== "input" && "invisible pointer-events-none",
              )}
            >
              <Editor
                defaultLanguage="json"
                defaultValue={input}
                theme={monacoTheme}
                beforeMount={monacoBeforeMount}
                onChange={handleInputChange}
                options={EDITOR_OPTIONS}
              />
            </div>
            <div
              className={cn(
                "absolute inset-0",
                activeTab !== "output" && "invisible pointer-events-none",
              )}
            >
              <Editor
                language="json"
                value={output}
                theme={monacoTheme}
                beforeMount={monacoBeforeMount}
                options={{ ...EDITOR_OPTIONS, readOnly: true }}
              />
            </div>
          </div>
        </>
      )}

      {/* Error display */}
      {error && (
        <div className="shrink-0 max-h-36 overflow-y-auto border-t border-fd-border bg-fd-muted/40">
          <div className="flex items-start gap-2 px-4 py-1.5 text-xs font-mono text-red-400">
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
