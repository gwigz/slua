import { load } from "cheerio"
import { parseInlineParam, loadConstantValues, fetchHtml } from "../parse-params.js"
import type { TypedListParamSet, TypedListRule } from "../types.js"

const WIKI_URL = "https://wiki.secondlife.com/wiki/LlParticleSystem"

export async function scrapeParticleSystem(): Promise<TypedListParamSet[]> {
  const html = await fetchHtml(WIKI_URL)
  const $ = load(html)

  const constants = loadConstantValues("PSYS_")

  // Find the main rules table, contains PSYS_PART_FLAGS and PSYS_SRC_PATTERN
  let rulesTable: ReturnType<typeof $> | null = null
  $("table").each((_, table) => {
    const text = $(table).text()
    if (
      text.includes("PSYS_PART_FLAGS") &&
      text.includes("PSYS_SRC_PATTERN") &&
      text.includes("PSYS_SRC_MAX_AGE")
    ) {
      rulesTable = $(table)
      return false
    }
  })

  if (!rulesTable) throw new Error("Could not find particle system rules table")

  const params: TypedListRule[] = []
  const seen = new Set<string>()

  ;(rulesTable as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 2) return

    const flag = cells.eq(0).text().trim()
    if (
      !flag.startsWith("PSYS_") ||
      flag.includes("MASK") ||
      flag.startsWith("PSYS_PART_BF_") ||
      flag.startsWith("PSYS_SRC_PATTERN_")
    )
      return
    if (seen.has(flag)) return
    seen.add(flag)

    const value = constants[flag]
    if (value === undefined) return

    const paramText = cells.eq(1).text().trim()
    const args = parseInlineParam(paramText)

    params.push({ name: flag, value, args })
  })

  return [
    {
      name: "ParticleSystemParam",
      functions: ["llParticleSystem", "llLinkParticleSystem"],
      params,
    },
  ]
}
