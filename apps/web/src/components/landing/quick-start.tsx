"use client"

import { useState, useRef, useEffect } from "react"
import { IconCopy, IconCheck } from "@tabler/icons-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { useInView } from "~/lib/use-in-view"
import type { QuickStartBlocks } from "~/components/landing/code-preview"

const PACKAGES = ["typescript", "typescript-to-lua", "@gwigz/slua-types", "@gwigz/slua-tstl-plugin"]

const MANAGERS = [
  { label: "npm", install: `npm install --save-dev \\\n  ${PACKAGES.join(" \\\n  ")}`, run: "npx" },
  { label: "pnpm", install: `pnpm add -D \\\n  ${PACKAGES.join(" \\\n  ")}`, run: "pnpm" },
  { label: "bun", install: `bun add --dev \\\n  ${PACKAGES.join(" \\\n  ")}`, run: "bunx" },
  {
    label: "deno",
    install: `deno add --dev \\\n  ${PACKAGES.map((p) => `npm:${p}`).join(" \\\n  ")}`,
    run: "deno run",
  },
] as const

const VSCODE_SETTINGS = `{
  "files.associations": {
    "*.slua": "lua"
  }
}`

const GITATTRIBUTES = `*.slua linguist-language=Lua`

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "moduleDetection": "force",
    "types": [
      "@typescript-to-lua/language-extensions",
      "@gwigz/slua-types"
    ]
  },
  "tstl": {
    "luaTarget": "Luau",
    "luaLibImport": "inline",
    "luaPlugins": [{ "name": "@gwigz/slua-tstl-plugin" }],
    "extension": "slua"
  }
}`

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`p-1.5 rounded text-fd-muted-foreground/50 hover:text-fd-muted-foreground transition-colors ${className ?? "absolute top-2.5 right-2.5"}`}
    >
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
    </button>
  )
}

function Step({
  number,
  title,
  last,
  children,
}: {
  number: number
  title: React.ReactNode
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--highlight)]/30 text-xs font-medium text-[var(--highlight)]">
          {number}
        </div>
        {!last && <div className="mt-2 w-px grow bg-white/6" />}
      </div>
      <div className={`min-w-0 flex-1 ${last ? "" : "pb-10"}`}>
        <h3 className="text-sm font-medium text-fd-foreground">{title}</h3>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}

function CodeBlock({ code, html, label }: { code: string; html?: string; label?: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      {label && (
        <div className="flex items-center justify-between border-b border-fd-border px-4 py-2">
          <span className="text-xs font-medium text-fd-muted-foreground">{label}</span>
          <CopyButton text={code} className="-mr-1.5" />
        </div>
      )}
      {html ? (
        <div
          className="not-fumadocs-codeblock p-4 text-sm overflow-x-auto font-mono [&_pre]:bg-transparent! [&_pre]:m-0 [&_pre]:p-0 [&_code]:text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="p-4 text-sm overflow-x-auto font-mono text-fd-muted-foreground">
          <code>{code}</code>
        </pre>
      )}
      {!label && <CopyButton text={code} />}
    </div>
  )
}

export function QuickStart({ blocks }: { blocks: QuickStartBlocks }) {
  const { ref, inView } = useInView()
  const [active, setActive] = useState("npm")
  const manager = MANAGERS.find((m) => m.label === active) ?? MANAGERS[0]

  return (
    <section ref={ref} id="quick-start" className="py-24 sm:py-32 bg-fd-background scroll-mt-16">
      <div
        className={`max-w-2xl mx-auto px-6 ${inView ? "" : "opacity-0 translate-y-6"}`}
        style={inView ? { animation: "fade-in-up 0.6s ease-out forwards" } : undefined}
      >
        <span
          className="block text-xs font-medium uppercase tracking-widest text-center mb-4"
          style={{ color: "var(--highlight)" }}
        >
          Quick Start
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-fd-foreground text-center">
          Get Started
        </h2>
        <p className="text-fd-muted-foreground text-center max-w-xl mx-auto mt-4">
          Set up a new project in two steps. See the{" "}
          <a
            href="https://typescripttolua.github.io/docs/configuration"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--highlight)] hover:underline"
          >
            TSTL docs
          </a>{" "}
          for more configuration options.
        </p>

        <Tabs
          value={active}
          onValueChange={(val) => setActive(val as string)}
          className="mt-12 sm:mt-16"
        >
          <Step number={1} title="Install dependencies">
            <TabsList variant="line" className="mb-3">
              {MANAGERS.map((m) => (
                <TabsTrigger key={m.label} value={m.label}>
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {MANAGERS.map((m) => (
              <TabsContent key={m.label} value={m.label}>
                <CodeBlock code={m.install} html={blocks.install[m.label]} />
              </TabsContent>
            ))}
          </Step>

          <Step
            number={2}
            title={
              <>
                Create <code>tsconfig.json</code>
              </>
            }
          >
            <CodeBlock code={TSCONFIG} html={blocks.tsconfig} label="tsconfig.json" />
            <p className="mt-2 text-xs text-fd-muted-foreground/60">
              See{" "}
              <a
                href="https://typescripttolua.github.io/docs/configuration"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--highlight)]/70 hover:underline"
              >
                TSTL configuration
              </a>{" "}
              for all available options.
            </p>
          </Step>

          <Step
            number={3}
            title={
              <>
                Editor &amp; GitHub setup{" "}
                <span className="text-fd-muted-foreground/40">(optional)</span>
              </>
            }
          >
            <p className="text-xs text-fd-muted-foreground/60 mb-3">
              Map <code>.slua</code> to Lua highlighting in{" "}
              <a
                href="https://code.visualstudio.com/docs/getstarted/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--highlight)]/70 hover:underline"
              >
                VS Code
              </a>{" "}
              and forks:
            </p>
            <CodeBlock
              code={VSCODE_SETTINGS}
              html={blocks.vscodeSettings}
              label=".vscode/settings.json"
            />
            <p className="text-xs text-fd-muted-foreground/60 mt-3 mb-3">
              Tell GitHub to highlight <code>.slua</code> files as Lua:
            </p>
            <CodeBlock code={GITATTRIBUTES} html={blocks.gitattributes} label=".gitattributes" />
            <p className="mt-3 text-xs text-fd-muted-foreground/60">
              You may also like the{" "}
              <a
                href="https://github.com/secondlife/sl-vscode-plugin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--highlight)]/70 hover:underline"
              >
                Second Life SLua/LSL extension
              </a>{" "}
              for additional language support.
            </p>
          </Step>

          <Step number={4} title="Write TypeScript, compile to SLua" last>
            <CodeBlock code={`${manager.run} tstl`} html={blocks.compile[manager.label]} />
          </Step>
        </Tabs>
      </div>
    </section>
  )
}
