"use client"

import { IconCloudSearch, IconMessageForward, IconReplace } from "@tabler/icons-react"
import { ResourceCard } from "~/components/landing/resources"
import { useInView } from "~/lib/use-in-view"

const EXAMPLES = [
  {
    title: "slua-derez-patcher",
    description:
      "Skips the rez-edit-take-replace cycle, patches rezzed objects in-place using ll.DerezObject",
    url: "https://github.com/gwigz/slua-derez-patcher",
    icon: IconReplace,
  },
  {
    title: "sim-wide-relay",
    description: "Region-wide chat relay system, a multi-script project deployed at a live sim",
    url: "https://github.com/gwigz/slua/tree/main/examples/sim-wide-relay",
    icon: IconMessageForward,
  },
  {
    title: "weather-fetcher",
    description:
      "Fetches weather data via HTTP, displays it as hover text, and refreshes on a timer",
    url: "https://github.com/gwigz/slua/tree/main/examples/weather-fetcher",
    icon: IconCloudSearch,
  },
]

export function Examples() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-fd-background">
      <div
        className={`max-w-5xl mx-auto px-6 ${inView ? "" : "opacity-0 translate-y-6"}`}
        style={inView ? { animation: "fade-in-up 0.6s ease-out forwards" } : undefined}
      >
        <span
          className="block text-xs font-medium uppercase tracking-widest text-center mb-4"
          style={{ color: "var(--highlight)" }}
        >
          Real-world Usage
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-fd-foreground text-center">
          Examples
        </h2>
        <p className="text-fd-muted-foreground text-center max-w-2xl mx-auto mt-4">
          Projects built with this toolchain, it&apos;s how the rough edges get found and fixed.
        </p>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EXAMPLES.map((example) => (
            <ResourceCard key={example.title} resource={example} />
          ))}
        </div>
      </div>
    </section>
  )
}
