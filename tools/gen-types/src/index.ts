import { readFileSync } from "fs"
import { parseSluaDefinitions, parseLslDefinitions } from "./parser"
import { emitAll, emitBuilderData, emitSluaGlobals } from "./emitter"
import type { TypedListParams } from "./types"

export function generate(
  sluaYamlPath: string,
  lslYamlPath: string,
  typedListParamsPath?: string,
): { types: string; builderData?: string; sluaGlobals: string } {
  const sluaYaml = readFileSync(sluaYamlPath, "utf8")
  const lslYaml = readFileSync(lslYamlPath, "utf8")
  const slua = parseSluaDefinitions(sluaYaml)
  const lsl = parseLslDefinitions(lslYaml)

  let typedListParams: TypedListParams | undefined
  if (typedListParamsPath) {
    typedListParams = JSON.parse(readFileSync(typedListParamsPath, "utf8"))
  }

  const types = emitAll(slua, lsl, typedListParams)
  const builderData = typedListParams ? emitBuilderData(typedListParams) : undefined
  const sluaGlobals = emitSluaGlobals(slua, lsl)

  return { types, builderData, sluaGlobals }
}
