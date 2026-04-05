import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { dirname, resolve } from "path"
import { Command } from "commander"
import { parseSluaDefinitions, parseLslDefinitions } from "./parser"
import { emitAll, emitBuilderData } from "./emitter"
import type { TypedListParams } from "./types"

export function generate(
  sluaYamlPath: string,
  lslYamlPath: string,
  typedListParamsPath?: string,
): { types: string; builderData?: string } {
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

  return { types, builderData }
}

if (import.meta.main) {
  const program = new Command()
    .name("gen-types")
    .description("Generate TypeScript declarations from SLua/LSL YAML definitions")
    .argument("<slua-yaml>", "path to slua_definitions.yaml")
    .argument("<lsl-yaml>", "path to lsl_definitions.yaml")
    .option("-o, --output <path>", "output file path", "packages/types/index.d.ts")
    .option("--typed-list-params <path>", "path to typed-list-params.json")
    .option("--builder-data <path>", "output path for builder data module")
    .action(
      (
        sluaPath: string,
        lslPath: string,
        opts: { output: string; typedListParams?: string; builderData?: string },
      ) => {
        const result = generate(
          resolve(sluaPath),
          resolve(lslPath),
          opts.typedListParams ? resolve(opts.typedListParams) : undefined,
        )
        const outFile = resolve(opts.output)

        mkdirSync(dirname(outFile), { recursive: true })
        writeFileSync(outFile, result.types, "utf8")
        console.log(`Generated ${outFile}`)

        if (result.builderData && opts.builderData) {
          const builderFile = resolve(opts.builderData)
          mkdirSync(dirname(builderFile), { recursive: true })
          writeFileSync(builderFile, result.builderData, "utf8")
          console.log(`Generated ${builderFile}`)
        }
      },
    )

  program.parse()
}
