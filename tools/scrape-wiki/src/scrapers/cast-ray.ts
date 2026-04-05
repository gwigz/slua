import { load } from "cheerio"
import { parseRawParams, fetchHtml } from "../parse-params.js"
import type { TypedListParamSet, TypedListRule } from "../types.js"

const WIKI_URL = "https://wiki.secondlife.com/wiki/LlCastRay"

export async function scrapeCastRay(): Promise<TypedListParamSet[]> {
  const html = await fetchHtml(WIKI_URL)
  const $ = load(html)

  let table: ReturnType<typeof $> | null = null
  $("table").each((_, t) => {
    const text = $(t).text()
    if (
      text.includes("RC_REJECT_TYPES") &&
      text.includes("RC_MAX_HITS") &&
      text.includes("RC_DATA_FLAGS")
    ) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error("Could not find cast ray options table")

  const params: TypedListRule[] = []

  ;(table as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 3) return

    // Flag names are wrapped in brackets: "[ RC_REJECT_TYPES ]"
    const flagCell = cells.eq(0).text().trim()
    const flagMatch = flagCell.match(/\[\s*(RC_\w+)\s*\]/)
    if (!flagMatch) return
    const flag = flagMatch[1]
    const value = parseInt(cells.eq(1).text().trim(), 10)
    const paramText = cells.eq(2).text().trim()

    if (isNaN(value)) return

    const inner = paramText.replace(/^\[?\s*/, "").replace(/\s*\]?\s*$/, "")
    const args = parseRawParams(inner)

    params.push({ name: flag, value, args })
  })

  return [
    {
      name: "CastRayParam",
      functions: ["llCastRay"],
      params,
    },
  ]
}
