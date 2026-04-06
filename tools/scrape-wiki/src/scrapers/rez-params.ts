import { load } from "cheerio"
import { parseRawParams, fetchHtml } from "../parse-params.js"
import type { TypedListParamSet, TypedListRule } from "../types.js"

const WIKI_URL = "https://wiki.secondlife.com/wiki/LlRezObjectWithParams"

export async function scrapeRezParams(): Promise<TypedListParamSet[]> {
  const html = await fetchHtml(WIKI_URL)
  const $ = load(html)

  let table: ReturnType<typeof $> | null = null

  $("table").each((_, t) => {
    const text = $(t).text()
    if (text.includes("REZ_PARAM") && text.includes("REZ_FLAGS") && text.includes("REZ_POS")) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error("Could not find rez params table")

  const params: TypedListRule[] = []

  ;(table as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 3) return

    const flag = cells.eq(0).text().trim()
    const value = parseInt(cells.eq(1).text().trim(), 10)
    const valuesText = cells.eq(2).text().trim()

    if (!flag.startsWith("REZ_") || isNaN(value)) return
    // Skip bitmask values for REZ_FLAGS
    if (flag.startsWith("REZ_FLAG_")) return

    const args = parseRawParams(valuesText)

    params.push({ name: flag, value, args })
  })

  return [
    {
      name: "RezParam",
      functions: ["llRezObjectWithParams"],
      params,
    },
  ]
}
