import { codeToHtml } from "shiki"
import { transformerTwoslash, rendererRich } from "@shikijs/twoslash"
import fs from "node:fs"
import path from "node:path"
import { examples } from "./generated/examples"

function loadExtraFiles(): Record<string, string> {
  try {
    const typesPath = path.resolve(process.cwd(), "../../packages/types/index.d.ts")
    const sluaTypes = fs
      .readFileSync(typesPath, "utf-8")
      .replace(/\/\/\/\s*<reference\s+types="[^"]*"\s*\/>\s*\n?/g, "")

    // Try to load language extensions (may be hoisted to workspace root)
    let langExtTypes = ""
    for (const base of ["node_modules", "../../node_modules"]) {
      try {
        const langExtPath = path.resolve(
          process.cwd(),
          base,
          "@typescript-to-lua/language-extensions/index.d.ts",
        )
        langExtTypes = fs.readFileSync(langExtPath, "utf-8")
        break
      } catch {
        // try next path
      }
    }

    // Module type signatures for Twoslash hover hints
    const modulesDir = path.resolve(process.cwd(), "../../packages/modules/src")
    let yieldTypes = ""

    try {
      yieldTypes = fs.readFileSync(path.join(modulesDir, "yield/index.ts"), "utf-8")
    } catch {}

    return {
      "language-extensions.d.ts": langExtTypes,
      "globals.d.ts": sluaTypes,
      "@gwigz/slua-modules/yield.d.ts": yieldTypes,
    }
  } catch {
    return {}
  }
}

async function highlightCode(code: string, lang: string, useTwoslash = false) {
  const transformers = useTwoslash
    ? [
        transformerTwoslash({
          renderer: rendererRich({ queryRendering: "line" }),
          twoslashOptions: { extraFiles: loadExtraFiles() },
        }),
      ]
    : []

  return codeToHtml(code, {
    lang,
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
    transformers,
  })
}

export type CodeGalleryTab = {
  id: string
  label: string
  tsHtml: string
  luaHtml: string
}

// Twoslash directives prepended to specific examples to suppress expected errors.
// Vector + Vector uses TSTL operator overloading which TypeScript doesn't natively support.
const TWOSLASH_DIRECTIVES: Record<string, string> = {
  "type-safety": "// @errors: 2365\n",
}

export async function CodeGalleryPreview(): Promise<CodeGalleryTab[]> {
  const entries = Object.values(examples)

  const tabs = await Promise.all(
    entries.map(async (ex) => {
      const directives = TWOSLASH_DIRECTIVES[ex.id] ?? ""
      const [tsHtml, luaHtml] = await Promise.all([
        highlightCode(directives + ex.ts, "tsx", true),
        highlightCode(ex.lua, "lua"),
      ])

      return { id: ex.id, label: ex.label, tsHtml, luaHtml }
    }),
  )

  return tabs
}
