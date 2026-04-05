import { load } from "cheerio"
import { writeFileSync } from "fs"
import { resolve } from "path"
import { parseUsageString, type PrimParamRules, type PrimParamRule } from "./parse-params.js"

const WIKI_URL = "https://wiki.secondlife.com/wiki/LlSetPrimitiveParams"

async function scrape(): Promise<PrimParamRules> {
  console.log(`Fetching ${WIKI_URL}...`)
  const res = await fetch(WIKI_URL)
  const html = await res.text()
  const $ = load(html)

  // Find the setter params table by its header pattern: "Flag | V | Description | Usage"
  let paramsTable: ReturnType<typeof $> | null = null

  $("table").each((_, table) => {
    const firstRow = $(table).find("tr").first()
    const headers = firstRow
      .find("th, td")
      .map((_, el) => $(el).text().trim())
      .get()
    if (headers[0] === "Flag" && headers[1] === "V" && headers[3] === "Usage") {
      paramsTable = $(table)
      return false // break
    }
  })

  if (!paramsTable) {
    throw new Error("Could not find the setter params table on the wiki page")
  }

  const params: PrimParamRule[] = []
  const typeShapes: PrimParamRule[] = []

  // Process top-level rows (4 cells: Flag, V, Description, Usage)
  paramsTable!.find(":scope > tbody > tr, :scope > tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 4) return

    const flag = cells.eq(0).text().trim()
    const value = parseInt(cells.eq(1).text().trim(), 10)
    const usage = cells.eq(3).text().trim()

    if (!flag.startsWith("PRIM_") || isNaN(value)) return
    // Skip PRIM_TYPE itself (it has "+ flag_parameters" not a bracket signature)
    if (usage.includes("flag_parameters")) return
    // Skip PRIM_TYPE_LEGACY
    if (flag.includes("LEGACY")) return

    const args = parseUsageString(usage)

    params.push({ name: flag, value, args })
  })

  // Extract PRIM_TYPE shape variants from the setter's "flag Constants" table.
  // We identify it as a small table (< 30 rows) containing both PRIM_TYPE_BOX
  // and PRIM_TYPE_SCULPT — this distinguishes it from the larger getter table.
  let typeShapeTable: ReturnType<typeof $> | null = null

  $("table").each((_, table) => {
    const rows = $(table).find("tr")
    if (rows.length < 5 || rows.length > 30) return
    const text = $(table).text()
    if (text.includes("PRIM_TYPE_BOX") && text.includes("PRIM_TYPE_SCULPT")) {
      typeShapeTable = $(table)
      return false
    }
  })

  if (typeShapeTable) {
    ;(typeShapeTable as ReturnType<typeof $>).find("tr").each((_, row) => {
      const cells = $(row).children("td")
      if (cells.length < 3) return

      const flag = cells.eq(0).text().trim()
      const value = parseInt(cells.eq(1).text().trim(), 10)
      let usage = cells.eq(2).text().trim()

      if (!flag.startsWith("PRIM_TYPE_") || isNaN(value)) return

      // Clean up trailing text like "Sculpted_Prims:_FAQ" after the brackets
      const bracketEnd = usage.lastIndexOf("]")
      if (bracketEnd !== -1) {
        usage = usage.slice(0, bracketEnd + 1)
      }

      // The usage for type shapes doesn't include the flag name prefix,
      // so we add a dummy prefix so parseUsageString can strip it
      const innerContent = usage.replace(/^\[?\s*/, "").replace(/\s*\]?\s*$/, "")
      const args = parseUsageString(`[ DUMMY, ${innerContent} ]`)

      typeShapes.push({ name: flag, value, args })
    })
  } else {
    console.warn("Warning: Could not find the type shapes sub-table")
  }

  return { params, typeShapes }
}

async function main() {
  const rules = await scrape()

  console.log(`Found ${rules.params.length} param rules`)
  console.log(`Found ${rules.typeShapes.length} type shape rules`)

  const outPath = resolve(import.meta.dir, "../../../refs/prim-param-rules.json")
  writeFileSync(outPath, JSON.stringify(rules, null, 2) + "\n", "utf8")

  console.log(`Written to ${outPath}`)
}

main()
