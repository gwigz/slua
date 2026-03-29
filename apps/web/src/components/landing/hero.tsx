"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { IconArrowRight, IconCopy, IconCheck } from "@tabler/icons-react"

const COMMAND = "bunx @gwigz/slua-create"

export function Hero() {
  const [copied, setCopied] = useState(false)

  const copyCommand = useCallback(() => {
    navigator.clipboard.writeText(COMMAND)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <section className="dark relative flex items-center justify-center overflow-hidden bg-fd-background pt-14 pb-16 sm:pt-20 sm:pb-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 45%, black 20%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 50% at 50% 45%, black 20%, transparent 70%)",
          }}
        />

        {/* Blue glow */}
        <div
          className="absolute -top-32 right-[12%] h-150 w-150 rounded-full"
          style={{
            background: "radial-gradient(circle, var(--color-fd-primary), transparent 70%)",
            opacity: 0.045,
          }}
        />

        {/* Amber glow */}
        <div
          className="absolute -bottom-32 left-[12%] h-125 w-125 rounded-full"
          style={{
            background: "radial-gradient(circle, var(--highlight), transparent 70%)",
            opacity: 0.06,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-fd-foreground">
        {/* Headline */}
        <h1
          className="hero-stagger font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          style={{ "--stagger": 1 } as React.CSSProperties}
        >
          Write <span className="text-[#3178c6]">TypeScript</span>
          <br />
          Run <span style={{ color: "var(--highlight)" }}>SLua</span>
        </h1>

        {/* Subtitle */}
        <p
          className="hero-stagger mx-auto mt-6 max-w-xl text-base sm:text-lg text-fd-muted-foreground leading-relaxed"
          style={{ "--stagger": 2 } as React.CSSProperties}
        >
          A{" "}
          <a
            href="https://typescripttolua.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fd-foreground/80 hover:text-fd-foreground transition-colors underline decoration-white/20 underline-offset-2 hover:decoration-white/40"
          >
            TypeScript-to-Lua
          </a>{" "}
          plugin for Second Life with full type coverage, editor support, and compile-time safety.
        </p>

        {/* Terminal block */}
        <div
          className="hero-stagger mx-auto mt-10 max-w-md"
          style={{ "--stagger": 3 } as React.CSSProperties}
        >
          <div className="flex items-center rounded-lg border border-fd-border bg-fd-card/80 px-4 py-3 font-mono text-sm">
            <span className="select-none text-fd-muted-foreground/60 mr-3">$</span>
            <span className="flex-1 text-left text-fd-foreground">{COMMAND}</span>
            <button
              onClick={copyCommand}
              className="ml-3 text-fd-muted-foreground/60 hover:text-fd-foreground transition-colors cursor-pointer"
              aria-label="Copy command"
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </button>
          </div>
        </div>

        {/* CTAs */}
        <div
          className="hero-stagger mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ "--stagger": 4 } as React.CSSProperties}
        >
          <Link
            href="/docs/slua"
            className="inline-flex items-center justify-center rounded-md border border-fd-border bg-fd-muted/30 px-7 py-3 text-sm font-medium text-fd-muted-foreground transition-all duration-200 hover:border-fd-border hover:text-fd-foreground hover:bg-fd-muted/60"
          >
            Documentation
          </Link>
          <Link
            href="/playground"
            className="group inline-flex items-center justify-center rounded-md border border-[var(--highlight)]/40 bg-[var(--highlight)]/10 px-7 py-3 text-sm font-semibold text-[var(--highlight)] transition-all duration-200 hover:bg-[var(--highlight)]/15 hover:border-[var(--highlight)]/60"
          >
            Playground
            <IconArrowRight
              size={16}
              className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
