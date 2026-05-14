#!/usr/bin/env bun
/** Generates the typed definitions and plugin data modules, then formats them. */
import { mkdirSync, writeFileSync } from "fs"
import { dirname, resolve } from "path"
import { $ } from "bun"
import { generate } from "./src/index"

const root = resolve(import.meta.dir, "../..")

const fromRoot = (rel: string) => resolve(root, rel)

const inputs = {
  slua: fromRoot("refs/lsl-definitions/slua_definitions.yaml"),
  lsl: fromRoot("refs/lsl-definitions/lsl_definitions.yaml"),
  typedListParams: fromRoot("refs/typed-list-params.json"),
}

const result = generate(inputs.slua, inputs.lsl, inputs.typedListParams)

const files: [path: string, content: string | undefined][] = [
  [fromRoot("packages/types/index.d.ts"), result.types],
  [fromRoot("packages/tstl-plugin/src/generated/builder-data.ts"), result.builderData],
  [fromRoot("packages/tstl-plugin/src/generated/slua-globals.ts"), result.sluaGlobals],
]

const written: string[] = []

for (const [file, content] of files) {
  if (!content) {
    continue
  }

  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content, "utf8")

  written.push(file)
  console.log(`Generated ${file}`)
}

await $`oxfmt --write ${written}`
