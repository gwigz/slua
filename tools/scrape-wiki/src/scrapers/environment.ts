import { fetchHtml, parseRawParams } from "../parse-params.js"
import type { TypedListArg, TypedListParamSet } from "../types.js"

const PREFIX_PATTERNS = ["SKY_", "WATER_", "ENVIRONMENT_DAYINFO"]

/**
 * Scrape environment constants from the llGetEnvironment wiki page.
 *
 * Table format: constant | value | return values (as comma-separated typed params)
 */
export async function scrapeEnvironment(): Promise<TypedListParamSet[]> {
  const { load } = await import("cheerio")
  const html = await fetchHtml("https://wiki.secondlife.com/wiki/LlGetEnvironment")
  const $ = load(html)

  let table: ReturnType<typeof $> | null = null

  $("table").each((_, t) => {
    const text = $(t).text()
    if (text.includes("SKY_AMBIENT") && text.includes("WATER_FOG") && text.includes("SKY_CLOUDS")) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error("Could not find environment params table on wiki page")

  const params: { name: string; value: number; args: never[]; returns: TypedListArg[] }[] = []

  ;(table as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 3) return

    const flag = cells.eq(0).text().trim()
    const value = parseInt(cells.eq(1).text().trim(), 10)

    if (isNaN(value)) return
    if (!PREFIX_PATTERNS.some((p) => flag.startsWith(p))) return

    // Column 2: comma-separated return types like "vector color, float coverage, ..."
    const returnText = cells.eq(2).text().trim()
    const returns = returnText ? parseRawParams(returnText) : []

    if (returns.length > 0) {
      params.push({ name: flag, value, args: [], returns })
    }
  })

  return [
    {
      name: "EnvironmentParam",
      functions: ["llGetEnvironment"],
      params,
    },
  ]
}
