import { useRef, useCallback } from "react"
import { Link } from "react-router"
import { IconArrowRight } from "@tabler/icons-react"
import { LuauLogo } from "./luau-logo"
import { TypeScriptLogo } from "./typescript-logo"
import { useTwoslashPortal } from "~/lib/use-twoslash-portal"
import { tsHtml as tsPreview, luaHtml as luaPreview } from "virtual:hero-preview"

export function Hero() {
  const tsRef = useRef<HTMLDivElement>(null)
  const luaRef = useRef<HTMLDivElement>(null)
  const syncing = useRef(false)

  const syncScroll = useCallback((source: HTMLDivElement, target: HTMLDivElement) => {
    if (syncing.current) return
    syncing.current = true
    target.scrollLeft = source.scrollLeft
    syncing.current = false
  }, [])

  useTwoslashPortal(tsRef)

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-[#0a0a0a] pt-14 pb-16 sm:pt-20 sm:pb-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid + dot pattern */}
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
            background: "radial-gradient(circle, var(--primary), transparent 70%)",
            opacity: 0.045,
          }}
        />

        {/* Ochre glow */}
        <div
          className="absolute -bottom-32 left-[12%] h-125 w-125 rounded-full"
          style={{
            background: "radial-gradient(circle, var(--highlight), transparent 70%)",
            opacity: 0.06,
          }}
        />

        {/* Floating logos */}
        <TypeScriptLogo
          size={128}
          className="absolute top-[10%] left-[8%] text-primary/[0.08] animate-[hero-float_14s_ease-in-out_infinite]"
        />
        <LuauLogo
          size={120}
          className="absolute top-[18%] right-[8%] text-(--highlight) opacity-[0.08] animate-[hero-float-alt_16s_ease-in-out_infinite]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Headline */}
        <h1
          className="hero-stagger font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          style={{ "--stagger": 1 } as React.CSSProperties}
        >
          Write <span className="text-primary">TypeScript</span>
          <br />
          Run <span style={{ color: "var(--highlight)" }}>SLua</span>
        </h1>

        {/* Subtitle */}
        <p
          className="hero-stagger mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          style={{ "--stagger": 2 } as React.CSSProperties}
        >
          LSL type definitions and a{" "}
          <a
            href="https://typescripttolua.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 hover:text-foreground transition-colors underline decoration-white/20 underline-offset-2 hover:decoration-white/40"
          >
            TypeScript-to-Lua
          </a>{" "}
          plugin for Second Life. Full editor support, compile-time safety, minimal runtime
          overhead.
        </p>

        {/* CTAs */}
        <div
          className="hero-stagger mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ "--stagger": 3 } as React.CSSProperties}
        >
          <Link
            to="/playground"
            className="group inline-flex items-center justify-center rounded-md bg-[var(--highlight)] px-7 py-3 text-sm font-semibold text-[#0a0a0a] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_30px_oklch(0.72_0.12_70/0.15)]"
          >
            Try the Playground
            <IconArrowRight
              size={16}
              className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="#quick-start"
            className="inline-flex items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] px-7 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.05]"
          >
            Get Started
          </a>
        </div>

        {/* Code preview */}
        <div
          className="hero-stagger mt-16 mx-auto max-w-3xl"
          style={{ "--stagger": 5 } as React.CSSProperties}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 rounded-lg overflow-hidden border border-white/[0.06]">
            {/* TypeScript panel */}
            <div className="bg-[#111] sm:border-r border-white/[0.06] flex flex-col">
              <div className="border-b border-white/[0.06] px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">TypeScript</span>
              </div>
              <div
                ref={tsRef}
                className="twoslash flex-1 py-2.5 pl-3 text-[13px] leading-relaxed text-left overflow-x-auto [&_pre]:bg-transparent! [&_pre]:m-0 [&_pre]:p-0 [&_pre]:pr-3 [&_pre]:w-fit [&_pre]:min-w-full [&_code]:text-[13px]"
                onScroll={() =>
                  tsRef.current && luaRef.current && syncScroll(tsRef.current, luaRef.current)
                }
                dangerouslySetInnerHTML={{ __html: tsPreview }}
              />
            </div>

            {/* SLua panel */}
            <div className="bg-[#111] border-t sm:border-t-0 border-white/[0.06]">
              <div className="border-b border-white/[0.06] px-3 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">SLua</span>
              </div>
              <div
                ref={luaRef}
                className="py-2.5 pl-3 text-[13px] leading-relaxed text-left overflow-x-auto [&_pre]:bg-transparent! [&_pre]:m-0 [&_pre]:p-0 [&_pre]:pr-3 [&_pre]:w-fit [&_pre]:min-w-full [&_code]:text-[13px]"
                onScroll={() =>
                  luaRef.current && tsRef.current && syncScroll(luaRef.current, tsRef.current)
                }
                dangerouslySetInnerHTML={{ __html: luaPreview }}
              />
            </div>
          </div>

          {/* TSTL attribution */}
          <p className="mt-3 text-[11px] text-muted-foreground/40">
            Powered by{" "}
            <a
              href="https://typescripttolua.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground/60 transition-colors"
            >
              TypeScript-to-Lua
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
