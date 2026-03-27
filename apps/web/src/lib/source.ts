import { docs } from "collections/server"
import { type InferPageType, loader } from "fumadocs-core/source"
import { createElement } from "react"
import * as LucideIcons from "lucide-react"

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  plugins: [],
  icon(name) {
    const iconColors: Record<string, string> = {
      Code2: "text-blue-400",
      Terminal: "text-green-400",
      Braces: "text-amber-400",
      Package: "text-purple-400",
    }

    if (name && name in LucideIcons) {
      return createElement((LucideIcons as unknown as Record<string, React.ElementType>)[name], {
        className: `size-4 ${iconColors[name] ?? ""}`.trim(),
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
