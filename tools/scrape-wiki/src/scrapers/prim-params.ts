import { load } from "cheerio"
import { parseUsageString, parseRawParams, fetchHtml } from "../parse-params.js"
import type { TypedListParamSet, TypedListRule } from "../types.js"

const SETTER_URL = "https://wiki.secondlife.com/wiki/LlSetPrimitiveParams"

export async function scrapePrimParams(): Promise<TypedListParamSet[]> {
  const html = await fetchHtml(SETTER_URL)
  const $ = load(html)

  // Find setter params table: headers "Flag | V | Description | Usage"
  let paramsTable: ReturnType<typeof $> | null = null

  $("table").each((_, table) => {
    const headers = $(table)
      .find("tr")
      .first()
      .find("th, td")
      .map((_i, el) => $(el).text().trim())
      .get()

    if (headers[0] === "Flag" && headers[1] === "V" && headers[3] === "Usage") {
      paramsTable = $(table)
      return false
    }
  })

  if (!paramsTable) throw new Error("Could not find setter params table on LlSetPrimitiveParams")

  const params: TypedListRule[] = []

  ;(paramsTable as ReturnType<typeof $>).find(":scope > tbody > tr, :scope > tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 4) return

    const flag = cells.eq(0).text().trim()
    const value = parseInt(cells.eq(1).text().trim(), 10)
    const usage = cells.eq(3).text().trim()

    if (!flag.startsWith("PRIM_") || isNaN(value)) return
    if (usage.includes("flag_parameters")) return
    if (flag.includes("LEGACY")) return

    params.push({ name: flag, value, args: parseUsageString(usage) })
  })

  // PRIM_TYPE shape sub-table: small table containing PRIM_TYPE_BOX and PRIM_TYPE_SCULPT
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

  const typeShapes: TypedListRule[] = []

  if (typeShapeTable) {
    ;(typeShapeTable as ReturnType<typeof $>).find("tr").each((_, row) => {
      const cells = $(row).children("td")
      if (cells.length < 3) return

      const flag = cells.eq(0).text().trim()
      const value = parseInt(cells.eq(1).text().trim(), 10)
      let usage = cells.eq(2).text().trim()

      if (!flag.startsWith("PRIM_TYPE_") || isNaN(value)) return

      const bracketEnd = usage.lastIndexOf("]")
      if (bracketEnd !== -1) usage = usage.slice(0, bracketEnd + 1)

      const innerContent = usage.replace(/^\[?\s*/, "").replace(/\s*\]?\s*$/, "")
      typeShapes.push({ name: flag, value, args: parseRawParams(innerContent) })
    })
  }

  const GETTER_URL = "https://wiki.secondlife.com/wiki/LlGetPrimitiveParams"

  // --- Getter set ---
  const getterHtml = await fetchHtml(GETTER_URL)
  const $g = load(getterHtml)

  let getterTable: ReturnType<typeof $g> | null = null

  $g("table").each((_, table) => {
    const headers = $g(table)
      .find("tr")
      .first()
      .find("th, td")
      .map((_i, el) => $g(el).text().trim())
      .get()
    if (headers[0] === "Parameter" && headers.some((h) => h.includes("Return"))) {
      getterTable = $g(table)
      return false
    }
  })

  const getterParams: TypedListRule[] = []

  if (getterTable) {
    ;(getterTable as ReturnType<typeof $g>)
      .find(":scope > tbody > tr, :scope > tr")
      .each((_, row) => {
        const cells = $g(row).children("td")
        if (cells.length < 3) return

        const paramCell = cells.eq(0).text().trim()
        const valueCell = cells.eq(1).text().trim()
        const returnCell = cells.eq(2).text().trim()

        const constMatch = paramCell.match(/\[\s*(PRIM_\w+)/)
        if (!constMatch) return
        const flag = constMatch[1]
        const value = parseInt(valueCell, 10)
        if (isNaN(value)) return
        if (flag.includes("LEGACY")) return

        const args = parseUsageString(paramCell)

        // Parse return values from the Return Values column: [ type name, type name, ... ]
        const returnInner = returnCell.replace(/^\[?\s*/, "").replace(/\s*\]?\s*$/, "")
        const returns = returnInner ? parseRawParams(returnInner) : []

        getterParams.push({
          name: flag,
          value,
          args,
          ...(returns.length > 0 ? { returns } : {}),
        })
      })
  }

  return [
    {
      name: "PrimParam",
      functions: [
        "llSetPrimitiveParams",
        "llSetLinkPrimitiveParams",
        "llSetLinkPrimitiveParamsFast",
      ],
      params,
      ...(typeShapes.length > 0
        ? { subDispatch: { constant: "PRIM_TYPE", name: "PrimTypeShape", params: typeShapes } }
        : {}),
    },
    {
      name: "PrimParamGet",
      functions: ["llGetPrimitiveParams", "llGetLinkPrimitiveParams"],
      params: getterParams,
    },
  ]
}
