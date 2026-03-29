"use client"

import Link from "next/link"
import {
  IconCode,
  IconPlug,
  IconPackage,
  IconPlayerPlay,
  IconTerminal,
  IconShield,
} from "@tabler/icons-react"
import { useInView } from "~/lib/use-in-view"

const FEATURES = [
  {
    icon: IconCode,
    title: "Type Definitions",
    description: "Full LSL and SLua API coverage with autocomplete and inline docs.",
    href: "/docs/slua/api",
  },
  {
    icon: IconPlug,
    title: "TSTL Plugin",
    description: "Bitwise ops, self-calls, index correction, and dead code elimination.",
    href: "/docs/slua/transpiler-plugin",
  },
  {
    icon: IconPackage,
    title: "Modules",
    description: "Coroutine-based async, config loading, and yield wrappers.",
    href: "/docs/modules",
  },
  {
    icon: IconPlayerPlay,
    title: "Playground",
    description: "Try ts-slua in the browser with Monaco editor.",
    href: "/playground",
  },
  {
    icon: IconTerminal,
    title: "Scaffolding",
    description: "Bootstrap projects instantly with bunx @gwigz/slua-create.",
    href: "/docs/slua/getting-started",
  },
  {
    icon: IconShield,
    title: "Linting",
    description: "oxlint config with SLua-specific rules for consistent code.",
    href: "/docs/slua/getting-started",
  },
] as const

export function Features() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="relative bg-fd-background py-24 sm:py-32">
      <div
        className={`mx-auto max-w-5xl px-6 ${inView ? "" : "opacity-0 translate-y-6"}`}
        style={inView ? { animation: "fade-in-up 0.6s ease-out forwards" } : undefined}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-fd-foreground">
            Everything You Need
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-lg border border-fd-border bg-fd-card/50 p-5 transition-all duration-200 hover:border-[var(--highlight)]/40 hover:bg-fd-card/80"
            >
              <feature.icon size={22} className="mb-3 text-(--highlight)" stroke={1.5} />
              <h3 className="text-sm font-semibold text-fd-foreground mb-1">{feature.title}</h3>
              <p className="text-xs text-fd-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
