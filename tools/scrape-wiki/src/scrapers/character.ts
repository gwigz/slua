import { load } from "cheerio"
import { loadConstantValues, fetchHtml, cleanDescription } from "../parse-params.js"
import type { TypedListParamSet, TypedListRule } from "../types.js"

const WIKI_URL = "https://wiki.secondlife.com/wiki/LlCreateCharacter"

export async function scrapeCharacter(): Promise<TypedListParamSet[]> {
  const html = await fetchHtml(WIKI_URL)
  const $ = load(html)

  const constants = loadConstantValues("CHARACTER_")

  let table: ReturnType<typeof $> | null = null
  $("table").each((_, t) => {
    const text = $(t).text()
    if (text.includes("CHARACTER_DESIRED_SPEED") && text.includes("CHARACTER_RADIUS")) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error("Could not find character options table")

  const params: TypedListRule[] = []

  ;(table as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 3) return

    const flag = cells.eq(0).text().trim()
    if (!flag.startsWith("CHARACTER_")) return

    const value = constants[flag]
    if (value === undefined) return

    const rangeText = cells.eq(2).text().trim()

    const isFloat = /\d+\.\d+/.test(rangeText)
    const argType = isFloat ? "float" : "integer"
    const argName = flag.replace(/^CHARACTER_/, "").toLowerCase()

    // Column 4 is "Description"
    const comment = cells.length > 4 ? cleanDescription(cells.eq(4).text()) : ""

    params.push({
      name: flag,
      value,
      args: [{ type: argType, name: argName }],
      ...(comment ? { comment } : {}),
    })
  })

  return [
    {
      name: "CharacterParam",
      functions: ["llCreateCharacter", "llUpdateCharacter"],
      params,
    },
  ]
}
