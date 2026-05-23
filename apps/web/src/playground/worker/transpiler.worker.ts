import ts from "typescript"
import * as tstl from "typescript-to-lua"
import createPlugin from "@gwigz/slua-tstl-plugin"
import type { WorkerRequest } from "../types"
import sluaTypes from "@gwigz/slua-types/index.d.ts?raw"
import langExt from "@typescript-to-lua/language-extensions/index.d.ts?raw"
import lualibFiles from "virtual:tstl-lualib"
import { tsLibs } from "./ts-libs"
import { formatLua } from "./format-lua"

// Patch ts.sys.readFile so TSTL can resolve lualib .lua / .json files that
// live inside node_modules at build time but aren't on a real filesystem here.
const _readFile = ts.sys.readFile.bind(ts.sys)

ts.sys.readFile = (filePath: string, encoding?: string) => {
  const name = filePath.split("/").pop()
  if (name && name in lualibFiles) return lualibFiles[name]
  return _readFile(filePath, encoding)
}

export interface WorkerDiagnostic {
  message: string
  start: number | undefined
  length: number | undefined
  stack?: string
}

export interface WorkerResponse {
  lua: string
  diagnostics: WorkerDiagnostic[]
}

const TSTL_OPTIONS: tstl.CompilerOptions = {
  luaTarget: tstl.LuaTarget.Luau,
  noImplicitSelf: true,
  noHeader: true,
  luaLibImport: tstl.LuaLibImportKind.Inline,
  noImplicitGlobalVariables: true,
  noLib: true,
  strict: true,
}

function flattenMessage(msg: string | import("typescript").DiagnosticMessageChain): string {
  if (typeof msg === "string") {
    return msg
  }

  const rest = msg.next ? msg.next.map(flattenMessage).join("\n") : ""

  return rest ? `${msg.messageText}\n${rest}` : msg.messageText
}

// TSTL treats "bit32" as a Lua keyword even when targeting Luau.
// The plugin fixes the output; filter the spurious diagnostic here.
function isTstlKeywordDiagnostic(msg: string | ts.DiagnosticMessageChain) {
  const text = typeof msg === "string" ? msg : msg.messageText

  return text.includes("Invalid ambient identifier name 'bit32'")
}

self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const { code, optimize } = event.data

  try {
    const result = tstl.transpileVirtualProject(
      {
        "main.ts": code,
        ...Object.fromEntries(tsLibs),
        "language-extensions.d.ts": langExt,
        "slua.d.ts": sluaTypes,
      },
      { ...TSTL_OPTIONS, luaPlugins: [{ plugin: createPlugin({ optimize }) }] },
    )

    const lua = formatLua(
      result.transpiledFiles.find((file) => file.outPath === "main.lua")?.lua ?? "",
    )

    const diagnostics: WorkerDiagnostic[] = result.diagnostics
      .filter(
        (data) => data.file?.fileName === "main.ts" && !isTstlKeywordDiagnostic(data.messageText),
      )
      .map((data) => ({
        message: flattenMessage(data.messageText),
        start: data.start,
        length: data.length,
      }))

    self.postMessage({ lua, diagnostics })
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    const stack = err instanceof Error ? err.stack : undefined

    self.postMessage({
      lua: "",
      diagnostics: [{ message, stack, start: undefined, length: undefined }],
    })
  }
})
