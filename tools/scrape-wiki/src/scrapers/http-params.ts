import { load } from "cheerio"
import { parseRawParams, fetchHtml, cleanDescription } from "../parse-params.js"
import type { TypedListParamSet, TypedListRule } from "../types.js"

const WIKI_URL = "https://wiki.secondlife.com/wiki/LlHTTPRequest"

export async function scrapeHttpParams(): Promise<TypedListParamSet[]> {
  const html = await fetchHtml(WIKI_URL)
  const $ = load(html)

  let table: ReturnType<typeof $> | null = null

  $("table").each((_, t) => {
    const text = $(t).text()
    if (text.includes("HTTP_METHOD") && text.includes("HTTP_MIMETYPE")) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error("Could not find HTTP params table on LlHTTPRequest")

  const params: TypedListRule[] = []

  ;(table as ReturnType<typeof $>).find(":scope > tbody > tr, :scope > tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 4) return

    const flag = cells.eq(0).text().trim()
    const value = parseInt(cells.eq(1).text().trim(), 10)
    const paramText = cells.eq(2).text().trim()

    if (!flag.startsWith("HTTP_") || isNaN(value)) return

    const inner = paramText.replace(/^\[?\s*/, "").replace(/\s*\]?\s*$/, "")
    const args = parseRawParams(inner)

    // Column 4 is "Description"
    const comment = cells.length > 4 ? cleanDescription(cells.eq(4).text()) : ""

    params.push({ name: flag, value, args, ...(comment ? { comment } : {}) })
  })

  return [
    {
      name: "HttpParam",
      functions: ["llHTTPRequest"],
      params,
    },
  ]
}
