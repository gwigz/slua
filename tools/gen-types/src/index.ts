import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { dirname, resolve } from "path"
import { Command } from "commander"
import { parseSluaDefinitions, parseLslDefinitions } from "./parser"
import { emitAll } from "./emitter"

export function generate(sluaYamlPath: string, lslYamlPath: string) {
  const sluaYaml = readFileSync(sluaYamlPath, "utf8")
  const lslYaml = readFileSync(lslYamlPath, "utf8")
  const slua = parseSluaDefinitions(sluaYaml)
  const lsl = parseLslDefinitions(lslYaml)

  return emitAll(slua, lsl)
}

if (import.meta.main) {
  const program = new Command()
    .name("gen-types")
    .description("Generate TypeScript declarations from SLua/LSL YAML definitions")
    .argument("<slua-yaml>", "path to slua_definitions.yaml")
    .argument("<lsl-yaml>", "path to lsl_definitions.yaml")
    .option("-o, --output <path>", "output file path", "packages/types/index.d.ts")
    .action((sluaPath: string, lslPath: string, opts: { output: string }) => {
      const output = generate(resolve(sluaPath), resolve(lslPath))
      const outFile = resolve(opts.output)

      mkdirSync(dirname(outFile), { recursive: true })
      writeFileSync(outFile, output, "utf8")

      console.log(`Generated ${outFile}`)
    })

  program.parse()
}
