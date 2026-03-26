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
import { Card, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
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

export function ResourceCard({
  resource,
}: {
  resource: {
    title: string
    author?: string
    description: string
    url: string
    icon: React.ComponentType<{ className?: string }>
    wip?: boolean
  }
}) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block transition-all duration-300 hover:-translate-y-0.5"
    >
      <Card className="h-full border-[var(--surface-glass-border)] bg-[var(--surface-glass)] backdrop-blur-sm transition-colors group-hover:border-white/[0.12] group-hover:shadow-lg group-hover:shadow-[var(--highlight)]/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <resource.icon className="size-5 text-fd-muted-foreground group-hover:text-[var(--highlight)] transition-colors" />
            {resource.wip && (
              <Badge
                variant="outline"
                className="ml-auto rounded-full text-[10px] uppercase text-fd-muted-foreground/60"
              >
                Work in progress
              </Badge>
            )}
          </div>
          <CardTitle className="mt-2">{resource.title}</CardTitle>
          {resource.author && (
            <p className="text-xs" style={{ color: "var(--highlight)" }}>
              by {resource.author}
            </p>
          )}
          <CardDescription>{resource.description}</CardDescription>
        </CardHeader>
      </Card>
    </a>
  )
}

export function Resources() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-fd-background">
      <div
        className={`max-w-5xl mx-auto px-6 ${inView ? "" : "opacity-0 translate-y-6"}`}
        style={inView ? { animation: "fade-in-up 0.6s ease-out forwards" } : undefined}
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-fd-foreground text-center">
          Resources
        </h2>
        <p className="text-fd-muted-foreground text-center max-w-2xl mx-auto mt-4">
          Tools, documentation, and community projects for SLua development
        </p>

        <div className="mt-12 sm:mt-16 space-y-10">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-fd-muted-foreground mb-4">
              Official
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {OFFICIAL.map((resource) => (
                <ResourceCard key={resource.title} resource={resource} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-widest text-fd-muted-foreground mb-4">
              Community
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMMUNITY.map((resource) => (
                <ResourceCard key={resource.title} resource={resource} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-fd-muted-foreground/50 text-center mt-10">
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
