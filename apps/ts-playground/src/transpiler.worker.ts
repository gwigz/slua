import * as tstl from "typescript-to-lua"
import sluaPlugin from "@gwigz/slua-tstl-plugin"
import sluaTypes from "@gwigz/slua-types/index.d.ts?raw"
import langExt from "@typescript-to-lua/language-extensions/index.d.ts?raw"
import { tsLibs } from "./ts-libs"

export interface WorkerDiagnostic {
  message: string
  start: number | undefined
  length: number | undefined
}

export interface WorkerResponse {
  lua: string
  diagnostics: WorkerDiagnostic[]
}

const TSTL_OPTIONS: tstl.CompilerOptions = {
  luaTarget: tstl.LuaTarget.Luau,
  noImplicitSelf: true,
  noHeader: true,
  luaLibImport: tstl.LuaLibImportKind.None,
  noImplicitGlobalVariables: true,
  noLib: true,
  strict: true,
  luaPlugins: [{ plugin: sluaPlugin as tstl.Plugin }],
}

function flattenMessage(msg: string | import("typescript").DiagnosticMessageChain): string {
  if (typeof msg === "string") return msg
  const rest = msg.next ? msg.next.map(flattenMessage).join("\n") : ""
  return rest ? `${msg.messageText}\n${rest}` : msg.messageText
}

self.onmessage = (e: MessageEvent<string>) => {
  const code: string = e.data

  try {
    const result = tstl.transpileVirtualProject(
      {
        "main.ts": code,
        ...Object.fromEntries(tsLibs),
        "language-extensions.d.ts": langExt,
        "slua.d.ts": sluaTypes,
      },
      TSTL_OPTIONS,
    )

    const lua = result.transpiledFiles.find((f) => f.outPath === "main.lua")?.lua ?? ""

    const diagnostics: WorkerDiagnostic[] = result.diagnostics
      .filter((d) => d.file?.fileName === "main.ts")
      .map((d) => ({
        message: flattenMessage(d.messageText),
        start: d.start,
        length: d.length,
      }))

    const response: WorkerResponse = { lua, diagnostics }

    self.postMessage(response)
  } catch (err) {
    const response: WorkerResponse = {
      lua: "",
      diagnostics: [{ message: String(err), start: undefined, length: undefined }],
    }

    self.postMessage(response)
  }
}
