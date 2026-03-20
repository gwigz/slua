import { Hero } from "~/components/hero"
import { CodeShowcase } from "~/components/code-showcase"
import { QuickStart } from "~/components/quick-start"
import { Examples } from "~/components/examples"
import { Resources } from "~/components/resources"

export function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Hero />
      <CodeShowcase />
      <Examples />
      <QuickStart />
      <Resources />
    </div>
  )
}
