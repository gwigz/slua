import { load } from "cheerio"
import { parseInlineParam, loadConstantValues, fetchHtml } from "../parse-params.js"
import type { TypedListParamSet, TypedListRule } from "../types.js"

const WIKI_URL = "https://wiki.secondlife.com/wiki/LlSetCameraParams"

export async function scrapeCameraParams(): Promise<TypedListParamSet[]> {
  const html = await fetchHtml(WIKI_URL)
  const $ = load(html)

  const constants = loadConstantValues("CAMERA_")

  let table: ReturnType<typeof $> | null = null
  $("table").each((_, t) => {
    const text = $(t).text()
    if (text.includes("CAMERA_ACTIVE") && text.includes("CAMERA_DISTANCE")) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error("Could not find camera params table")

  const params: TypedListRule[] = []

  ;(table as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 3) return

    const flag = cells.eq(0).text().trim()
    if (!flag.startsWith("CAMERA_")) return

    const value = constants[flag]
    if (value === undefined) return

    // Column 2 is "Parameter" (column 1 is the integer value on the wiki)
    const paramText = cells.eq(2).text().trim()
    const args = parseInlineParam(paramText)

    params.push({ name: flag, value, args })
  })

  return [
    {
      name: "CameraParam",
      functions: ["llSetCameraParams"],
      params,
    },
  ]
}
