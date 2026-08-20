import { docs } from "collections/server"
import { type InferPageType, loader } from "fumadocs-core/source"
import { createElement } from "react"
import * as LucideIcons from "lucide-react"

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  plugins: [],
  // Page icons stay monochrome. The package tabs get their colors in the docs
  // layout instead, since several pages reuse the same glyph as a root folder.
  icon(name) {
    if (name && name in LucideIcons) {
      return createElement((LucideIcons as unknown as Record<string, React.ElementType>)[name], {
        className: "size-4",
      })
    }
  },
})

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "image.webp"]

  return {
    segments,
    url: `/og/docs/${segments.join("/")}`,
  }
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed")

  return `# ${page.data.title}

${processed}`
}
