import { codeToHtml } from "shiki"
import { transformerTwoslash, rendererRich } from "@shikijs/twoslash"
import fs from "node:fs"
import path from "node:path"

const HERO_TS = `\
const isValidCommand = (command: string) =>
  ["bite", "scratch", "pounce"].includes(command)`

const HERO_LUA = `\
local function isValidCommand(command)
    return ({ "bite", "scratch", "pounce" }):includes(command)
end`

const SHOWCASE_TS = `\
let owner = ll.GetOwner()

LLEvents.on("changed", (changed) => {
  if ((changed & CHANGED_OWNER) !== 0) {
    owner = ll.GetOwner()
  }
})

LLEvents.on("touch_start", (events) => {
  for (const event of events) {
    ll.Say(0, \`\${event.getName()} touched at \${event.getTouchPos()}\`)
  }
})`

const SHOWCASE_LUA = `\
local owner = ll.GetOwner()

LLEvents.on("changed", function(changed)
    if bit32.band(changed, CHANGED_OWNER) ~= 0 then
        owner = ll.GetOwner()
    end
end)

LLEvents.on("touch_start", function(events)
    for _, event in events do
        ll.Say(0, event:getName() .. " touched at " .. tostring(event:getTouchPos()))
    end
end)`

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

    return {
      "language-extensions.d.ts": langExtTypes,
      "globals.d.ts": sluaTypes,
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
    theme: "vitesse-dark",
    transformers,
  })
}

export async function HeroPreview() {
  const [tsHtml, luaHtml] = await Promise.all([
    highlightCode(HERO_TS, "tsx", true),
    highlightCode(HERO_LUA, "lua"),
  ])

  return { tsHtml, luaHtml }
}

export async function ShowcasePreview() {
  const [tsHtml, luaHtml] = await Promise.all([
    highlightCode(SHOWCASE_TS, "tsx", true),
    highlightCode(SHOWCASE_LUA, "lua"),
  ])

  return { tsHtml, luaHtml }
}

/* ── QuickStart code blocks ─────────────────────────────────── */

const PACKAGES = ["typescript", "typescript-to-lua", "@gwigz/slua-types", "@gwigz/slua-tstl-plugin"]

const MANAGERS = [
  { label: "npm", install: `npm install --save-dev \\\n  ${PACKAGES.join(" \\\n  ")}`, run: "npx" },
  { label: "pnpm", install: `pnpm add -D \\\n  ${PACKAGES.join(" \\\n  ")}`, run: "pnpm" },
  { label: "bun", install: `bun add --dev \\\n  ${PACKAGES.join(" \\\n  ")}`, run: "bunx" },
  {
    label: "deno",
    install: `deno add --dev \\\n  ${PACKAGES.map((p) => `npm:${p}`).join(" \\\n  ")}`,
    run: "deno run",
  },
] as const

const TSCONFIG_CODE = `{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "moduleDetection": "force",
    "types": [
      "@typescript-to-lua/language-extensions",
      "@gwigz/slua-types"
    ]
  },
  "tstl": {
    "luaTarget": "Luau",
    "luaLibImport": "inline",
    "luaPlugins": [{ "name": "@gwigz/slua-tstl-plugin" }],
    "extension": "slua"
  }
}`

const VSCODE_SETTINGS_CODE = `{
  "files.associations": {
    "*.slua": "lua"
  }
}`

const GITATTRIBUTES_CODE = `*.slua linguist-language=Lua`

export type QuickStartBlocks = {
  install: Record<string, string>
  tsconfig: string
  compile: Record<string, string>
  vscodeSettings: string
  gitattributes: string
}

export async function QuickStartPreview(): Promise<QuickStartBlocks> {
  const [installEntries, tsconfig, compileEntries, vscodeSettings, gitattributes] =
    await Promise.all([
      Promise.all(
        MANAGERS.map(async (m) => [m.label, await highlightCode(m.install, "bash")] as const),
      ),
      highlightCode(TSCONFIG_CODE, "jsonc"),
      Promise.all(
        MANAGERS.map(async (m) => [m.label, await highlightCode(`${m.run} tstl`, "bash")] as const),
      ),
      highlightCode(VSCODE_SETTINGS_CODE, "jsonc"),
      highlightCode(GITATTRIBUTES_CODE, "ini"),
    ])

  return {
    install: Object.fromEntries(installEntries),
    tsconfig,
    compile: Object.fromEntries(compileEntries),
    vscodeSettings,
    gitattributes,
  }
}
