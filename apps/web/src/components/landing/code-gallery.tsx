"use client"

import { useRef, useState, useCallback } from "react"
import { useInView } from "~/lib/use-in-view"
import { useTwoslashPortal } from "~/lib/use-twoslash-portal"
import type { CodeGalleryTab } from "./code-preview"

function CodePanel({
  label,
  html,
  twoslash,
  scrollRef,
  onScroll,
}: {
  label: string
  html: string
  twoslash?: boolean
  scrollRef: React.RefObject<HTMLDivElement | null>
  onScroll: () => void
}) {
  const portalRef = useRef<HTMLDivElement>(null)

  useTwoslashPortal(portalRef, twoslash ? [html] : [])

  return (
    <div className="min-w-0 flex flex-col overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="border-b border-fd-border px-4 py-2">
        <span className="text-xs font-medium text-fd-muted-foreground">{label}</span>
      </div>
      <div
        ref={(el) => {
          scrollRef.current = el
          if (twoslash && portalRef.current !== el) {
            ;(portalRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          }
        }}
        onScroll={onScroll}
        className="not-fumadocs-codeblock flex-1 overflow-x-auto py-3 pl-4 text-[13px] leading-relaxed font-mono [&_pre]:bg-transparent! [&_pre]:m-0 [&_pre]:p-0 [&_pre]:pr-4 [&_pre]:w-fit [&_pre]:min-w-full [&_code]:text-[13px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function CodeGallery({ tabs }: { tabs: CodeGalleryTab[] }) {
  const { ref: sectionRef, inView } = useInView()
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "")
  const tsScrollRef = useRef<HTMLDivElement>(null)
  const luaScrollRef = useRef<HTMLDivElement>(null)
  const syncing = useRef(false)

  const syncScroll = useCallback((source: HTMLDivElement | null, target: HTMLDivElement | null) => {
    if (syncing.current || !source || !target) return
    syncing.current = true
    target.scrollLeft = source.scrollLeft
    syncing.current = false
  }, [])

  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0]

  return (
    <section ref={sectionRef} className="relative bg-fd-background py-24 sm:py-32">
      <div
        className={`mx-auto max-w-5xl px-6 ${inView ? "" : "opacity-0 translate-y-6"}`}
        style={inView ? { animation: "fade-in-up 0.6s ease-out forwards" } : undefined}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-fd-foreground">
            TypeScript in, Lua out
          </h2>
          <p className="mt-4 mx-auto max-w-lg text-fd-muted-foreground text-sm sm:text-base leading-relaxed">
            Every example is transpiled through the TSTL pipeline
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex gap-1 rounded-lg border border-fd-border bg-fd-card/50 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-fd-muted text-fd-foreground border border-fd-border"
                    : "text-fd-muted-foreground hover:text-fd-foreground border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code panels */}
        {current && (
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-[1fr] gap-4">
            <CodePanel
              label="TypeScript"
              html={current.tsHtml}
              twoslash
              scrollRef={tsScrollRef}
              onScroll={() => syncScroll(tsScrollRef.current, luaScrollRef.current)}
            />
            <CodePanel
              label="SLua"
              html={current.luaHtml}
              scrollRef={luaScrollRef}
              onScroll={() => syncScroll(luaScrollRef.current, tsScrollRef.current)}
            />
          </div>
        )}

        {/* TSTL attribution */}
        <p className="mt-4 text-center text-[11px] text-fd-muted-foreground/40">
          Powered by{" "}
          <a
            href="https://typescripttolua.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fd-muted-foreground/60 transition-colors"
          >
            TypeScript-to-Lua
          </a>
        </p>
      </div>
    </section>
  )
}
