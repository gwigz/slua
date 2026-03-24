import { Hero } from "~/components/landing/hero"
import { CodeShowcase } from "~/components/landing/code-showcase"
import { Examples } from "~/components/landing/examples"
import { QuickStart } from "~/components/landing/quick-start"
import { Resources } from "~/components/landing/resources"
import { HeroPreview, ShowcasePreview, QuickStartPreview } from "~/components/landing/code-preview"

export default async function HomePage() {
  const [heroPreview, showcasePreview, quickstartBlocks] = await Promise.all([
    HeroPreview(),
    ShowcasePreview(),
    QuickStartPreview(),
  ])

  return (
    <>
      <Hero tsPreview={heroPreview.tsHtml} luaPreview={heroPreview.luaHtml} />
      <CodeShowcase tsHtml={showcasePreview.tsHtml} luaHtml={showcasePreview.luaHtml} />
      <Examples />
      <QuickStart blocks={quickstartBlocks} />
      <Resources />
    </>
  )
}
