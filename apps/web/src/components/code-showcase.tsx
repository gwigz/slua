import { useRef } from "react"
import { IconBraces, IconPackage, IconArrowsExchange } from "@tabler/icons-react"
import { tsHtml, luaHtml } from "virtual:twoslash-blocks"
import { useInView } from "~/lib/use-in-view"
import { useTwoslashPortal } from "~/lib/use-twoslash-portal"

function CodeBlock({ label, html }: { label: string; html: string }) {
  const contentRef = useRef<HTMLDivElement>(null)

  useTwoslashPortal(contentRef, [html])

  return (
    <div className="overflow-x-auto rounded-lg border border-white/6 bg-[#0d0d0d]">
      <div className="border-b border-white/6 px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div
        ref={contentRef}
        className="p-4 text-sm font-mono [&_pre]:bg-transparent! [&_code]:text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function CodeShowcase() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="relative bg-[#0a0a0a] py-24 sm:py-32">
      <div
        className={`mx-auto max-w-6xl px-6 ${inView ? "" : "opacity-0 translate-y-6"}`}
        style={inView ? { animation: "fade-in-up 0.6s ease-out forwards" } : undefined}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left side */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <span
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: "var(--highlight)" }}
            >
              Why TypeScript?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Your Stack, Their Runtime
            </h2>
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                If TypeScript is where you're productive, you don't need to learn a new language to
                script for Second Life. SLua has decent tooling, but this lets you stay in the
                ecosystem you already know.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    icon: IconBraces,
                    text: "Generics, mapped types, and conditional types beyond Luau's type system",
                  },
                  {
                    icon: IconPackage,
                    text: (
                      <>
                        npm linters, formatters, and editor configs (such as{" "}
                        <a
                          href="https://oxc.rs/docs/guide/usage/linter"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--highlight)] hover:underline"
                        >
                          oxlint
                        </a>{" "}
                        and{" "}
                        <a
                          href="https://oxc.rs/docs/guide/usage/formatter"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--highlight)] hover:underline"
                        >
                          oxfmt
                        </a>
                        ) carry over unchanged
                      </>
                    ),
                  },
                  {
                    icon: IconArrowsExchange,
                    text: "Import/export module system across scripts",
                  },
                ].map(({ icon: Icon, text }, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3.5 py-3"
                  >
                    <Icon
                      size={18}
                      className="shrink-0 mt-0.5 text-[var(--highlight)]"
                      stroke={1.5}
                    />
                    <span className="text-sm text-muted-foreground leading-snug">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              That extends to JSX too.{" "}
              <a
                href="https://github.com/gwigz/slua-derez-patcher"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--highlight)] hover:underline"
              >
                slua-derez-patcher
              </a>{" "}
              uses it as a compile-time HTML templating layer that gets embedded directly into the
              Luau output.
            </p>
          </div>

          {/* Right side */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <CodeBlock label="TypeScript" html={tsHtml} />
            <CodeBlock label="SLua" html={luaHtml} />
          </div>
        </div>
      </div>
    </section>
  )
}
