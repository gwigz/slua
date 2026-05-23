import { fetchHtml, parseInlineParam, cleanDescription } from "../parse-params.js"
import type { TypedListArg, TypedListParamSet, TypedListRule } from "../types.js"

/**
 * Scrape PARCEL_MEDIA_COMMAND_* constants from the llParcelMediaQuery wiki page.
 *
 * Table format: value | CONSTANT_NAME | type name | description
 */
export async function scrapeParcelMediaQuery(): Promise<TypedListParamSet[]> {
  const { load } = await import("cheerio")
  const html = await fetchHtml("https://wiki.secondlife.com/wiki/LlParcelMediaQuery")
  const $ = load(html)

  let table: ReturnType<typeof $> | null = null

  $("table").each((_, t) => {
    const text = $(t).text()
    if (
      text.includes("PARCEL_MEDIA_COMMAND_TEXTURE") &&
      text.includes("PARCEL_MEDIA_COMMAND_URL")
    ) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error("Could not find parcel media query table on wiki page")

  const params: TypedListRule[] = []

  ;(table as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 3) return

    // Column 0: integer value
    const value = parseInt(cells.eq(0).text().trim(), 10)
    if (isNaN(value)) return

    // Column 1: CONSTANT_NAME
    const flag = cells.eq(1).text().trim()
    if (!flag.startsWith("PARCEL_MEDIA_COMMAND_")) return

    // Column 2: type name (e.g. "key uuid", "string url", "integer x, integer y")
    const typeText = cells.eq(2).text().trim()

    const returns: TypedListArg[] = []
    for (const part of typeText.split(",")) {
      const parsed = parseInlineParam(part.trim())
      returns.push(...parsed)
    }

    // Column 3: description
    const comment = cells.length > 3 ? cleanDescription(cells.eq(3).text()) : ""

    if (returns.length > 0) {
      params.push({ name: flag, value, args: [], returns, ...(comment ? { comment } : {}) })
    }
  })

  return [
    {
      name: "ParcelMediaQuery",
      functions: ["llParcelMediaQuery"],
      params,
    },
  ]
}
