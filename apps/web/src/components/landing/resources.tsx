"use client"

import {
  IconBook,
  IconCode,
  IconWorld,
  IconBrandVscode,
  IconFile,
  IconBrandGithub,
} from "@tabler/icons-react"
import { Badge } from "~/components/ui/badge"
import { useInView } from "~/lib/use-in-view"

const OFFICIAL = [
  {
    title: "Creator Portal",
    description: "Second Life creator tools and documentation",
    url: "https://create.secondlife.com",
    icon: IconWorld,
    wip: true,
  },
  {
    title: "VSCode Extension",
    description: "SLua language support for VS Code by Linden Lab",
    url: "https://github.com/secondlife/sl-vscode-plugin",
    icon: IconBrandVscode,
  },
  {
    title: "LSL Definitions",
    description: "LSL and SLua API definitions by Linden Lab",
    url: "https://github.com/secondlife/lsl-definitions",
    icon: IconFile,
  },
]

const COMMUNITY = [
  {
    title: "SLua Docs",
    author: "Suzanna Linn",
    description: "Comprehensive SLua documentation and reference",
    url: "https://suzanna-linn.github.io/slua",
    icon: IconBook,
  },
  {
    title: "slua.dev",
    description: "Community SLua website and resources",
    url: "https://slua.dev",
    icon: IconCode,
    wip: true,
  },
  {
    title: "@gwigz/slua",
    description: "TypeScript type definitions and TSTL transpiler plugin",
    url: "https://github.com/gwigz/slua",
    icon: IconBrandGithub,
  },
]

type Resource = (typeof OFFICIAL)[number] & { author?: string }

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-lg border border-fd-border bg-fd-card/50 p-5 transition-all duration-200 hover:border-[var(--highlight)]/40 hover:bg-fd-card/80"
    >
      <div className="flex items-center gap-2 mb-3">
        <resource.icon size={22} className="text-[var(--highlight)]" stroke={1.5} />
        {resource.wip && (
          <Badge
            variant="outline"
            className="ml-auto rounded-full text-[10px] uppercase text-fd-muted-foreground/60"
          >
            Work in progress
          </Badge>
        )}
      </div>
      <h3 className="text-sm font-semibold text-fd-foreground mb-1">{resource.title}</h3>
      {resource.author && (
        <p className="text-xs mb-1" style={{ color: "var(--highlight)" }}>
          by {resource.author}
        </p>
      )}
      <p className="text-xs text-fd-muted-foreground leading-relaxed">{resource.description}</p>
    </a>
  )
}

export function Resources() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="dark py-20 sm:py-28 bg-fd-background">
      <div
        className={`max-w-5xl mx-auto px-6 ${inView ? "" : "opacity-0 translate-y-6"}`}
        style={inView ? { animation: "fade-in-up 0.6s ease-out forwards" } : undefined}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-fd-foreground">
            Resources
          </h2>
          <p className="text-fd-muted-foreground max-w-2xl mx-auto mt-3 text-sm sm:text-base">
            Tools, documentation, and community projects for SLua development
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-fd-muted-foreground mb-3">
              Official
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {OFFICIAL.map((resource) => (
                <ResourceCard key={resource.title} resource={resource} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-fd-muted-foreground mb-3">
              Community
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMMUNITY.map((resource) => (
                <ResourceCard key={resource.title} resource={resource} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-fd-muted-foreground/50 text-center mt-8">
          Function descriptions and API data sourced from{" "}
          <a
            href="https://github.com/secondlife/lsl-definitions"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-fd-muted-foreground transition-colors"
          >
            lsl-definitions
          </a>{" "}
          by Linden Lab and its contributors
        </p>
      </div>
    </section>
  )
}
