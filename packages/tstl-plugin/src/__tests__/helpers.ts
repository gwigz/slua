import * as tstl from "typescript-to-lua"
import plugin from "../index"

export function transpile(code: string): string {
  const result = tstl.transpileVirtualProject(
    { "main.ts": code },
    {
      luaTarget: tstl.LuaTarget.Luau,
      noImplicitSelf: true,
      noHeader: true,
      luaLibImport: tstl.LuaLibImportKind.None,
      luaPlugins: [{ plugin: plugin as tstl.Plugin }],
    },
  )

  if (result.diagnostics.length > 0) {
    const messages = result.diagnostics.map((d) =>
      typeof d.messageText === "string" ? d.messageText : d.messageText.messageText,
    )

    throw new Error(`Transpilation failed:\n${messages.join("\n")}`)
  }

  return result.transpiledFiles.find((f) => f.outPath === "main.lua")?.lua ?? ""
}
