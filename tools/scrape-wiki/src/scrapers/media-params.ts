import { fetchHtml, parseInlineParam } from "../parse-params.js"
import type { TypedListArg, TypedListParamSet } from "../types.js"

/**
 * Manual return type overrides for constants where the wiki description
 * is ambiguous or uses "integer boolean" which we want typed as boolean.
 */
const returnOverrides: Record<string, TypedListArg[]> = {
  PRIM_MEDIA_ALT_IMAGE_ENABLE: [{ type: "boolean", name: "altImageEnable" }],
  PRIM_MEDIA_AUTO_LOOP: [{ type: "boolean", name: "autoLoop" }],
  PRIM_MEDIA_AUTO_PLAY: [{ type: "boolean", name: "autoPlay" }],
  PRIM_MEDIA_AUTO_SCALE: [{ type: "boolean", name: "autoScale" }],
  PRIM_MEDIA_AUTO_ZOOM: [{ type: "boolean", name: "autoZoom" }],
  PRIM_MEDIA_FIRST_CLICK_INTERACT: [{ type: "boolean", name: "firstClickInteract" }],
  PRIM_MEDIA_WHITELIST_ENABLE: [{ type: "boolean", name: "whitelistEnable" }],
}

/**
 * Scrape PRIM_MEDIA_* constants from the llGetPrimMediaParams wiki page.
 *
 * Table format: [ CONSTANT_NAME ] | value | [ type name ] description
 */
export async function scrapeMediaParams(): Promise<TypedListParamSet[]> {
  const { load } = await import("cheerio")
  const html = await fetchHtml("https://wiki.secondlife.com/wiki/LlGetPrimMediaParams")
  const $ = load(html)

  let table: ReturnType<typeof $> | null = null
  $("table").each((_, t) => {
    const text = $(t).text()
    if (
      text.includes("PRIM_MEDIA_CURRENT_URL") &&
      text.includes("PRIM_MEDIA_HOME_URL") &&
      text.includes("PRIM_MEDIA_CONTROLS")
    ) {
      table = $(t)
      return false
    }
  })

  if (!table) throw new Error("Could not find media params table on wiki page")

  const params: { name: string; value: number; args: never[]; returns: TypedListArg[] }[] = []

  ;(table as ReturnType<typeof $>).find("tr").each((_, row) => {
    const cells = $(row).children("td")
    if (cells.length < 3) return

    // Column 0: [ CONSTANT_NAME ]
    const flagText = cells.eq(0).text().trim()
    const flagMatch = flagText.match(/\[\s*(PRIM_MEDIA_\w+)\s*\]/)
    if (!flagMatch) return

    const flag = flagMatch[1]

    // Column 1: integer value
    const value = parseInt(cells.eq(1).text().trim(), 10)
    if (isNaN(value)) return

    // Check for manual override first
    if (returnOverrides[flag]) {
      params.push({ name: flag, value, args: [], returns: returnOverrides[flag] })
      return
    }

    // Column 2: [ type name ] description — parse the bracketed return type
    const descText = cells.eq(2).text().trim()
    const returnMatch = descText.match(/\[\s*(\w+\s+\w+)\s*\]/)
    if (returnMatch) {
      const parsed = parseInlineParam(returnMatch[1])
      if (parsed.length > 0) {
        params.push({ name: flag, value, args: [], returns: parsed })
        return
      }
    }

    // Fallback: unknown return type, skip
  })

  return [
    {
      name: "MediaParam",
      functions: ["llGetPrimMediaParams", "llGetLinkMedia"],
      params,
    },
  ]
}
