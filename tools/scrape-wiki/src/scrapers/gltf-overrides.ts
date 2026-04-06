import { load } from "cheerio"
import { fetchHtml } from "../parse-params.js"
import type { TypedListParamSet, TypedListRule } from "../types.js"

const WIKI_URL = "https://wiki.secondlife.com/wiki/LlSetLinkGLTFOverrides"

export async function scrapeGltfOverrides(): Promise<TypedListParamSet[]> {
  const html = await fetchHtml(WIKI_URL)
  const $ = load(html)

  let table: ReturnType<typeof $> | null = null

  $("table").each((_, t) => {
    const text = $(t).text()
    if (
      text.includes("OVERRIDE_GLTF_BASE_COLOR_FACTOR") &&
      text.includes("OVERRIDE_GLTF_EMISSIVE_FACTOR")
    ) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error("Could not find GLTF overrides table")

  const params: TypedListRule[] = []

  ;(table as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 3) return

    const flag = cells.eq(0).text().trim()
    const value = parseInt(cells.eq(1).text().trim(), 10)
    const typeText = cells.eq(2).text().trim().toLowerCase()

    if (!flag.startsWith("OVERRIDE_GLTF_") || isNaN(value)) return

    const args =
      typeText === "vector" || typeText === "float" || typeText === "integer"
        ? [{ type: typeText, name: flag.replace(/^OVERRIDE_GLTF_/, "").toLowerCase() }]
        : []

    params.push({ name: flag, value, args })
  })

  return [
    {
      name: "GltfOverrideParam",
      functions: ["llSetLinkGLTFOverrides"],
      params,
    },
  ]
}
