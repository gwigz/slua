#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { confirm, intro, isCancel, log, outro } from "@clack/prompts"
import pc from "picocolors"
import { MODULES, MODULE_NAMES, isModuleName, readModuleFiles } from "./vendor.js"
import type { ModuleName } from "./vendor.js"

function printUsage() {
  console.log(`
Usage:
  slua-modules list                      show available modules
  slua-modules add <module...> [--dir <path>]

Modules are copied into src/modules/ (or modules/ when there is no src/
directory), shared internal/ helpers included. Use --dir to override.
`)
}

function list() {
  console.log()

  for (const name of MODULE_NAMES) {
    const entry = MODULES[name]
    const flags = Object.keys(entry.defaultDefine).length

    console.log(
      `  ${pc.cyan(name.padEnd(10))} ${entry.description}${
        flags > 0 ? pc.dim(` (${flags} compile-time flags)`) : ""
      }`,
    )
  }

  console.log()
}

interface AddArgs {
  modules: ModuleName[]
  dir?: string
}

function parseAddArgs(args: string[]): AddArgs | undefined {
  const modules: ModuleName[] = []
  let dir: string | undefined

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === "--dir") {
      dir = args[++i]

      if (!dir) {
        console.error(pc.red("error: --dir requires a path"))
        return undefined
      }
    } else if (isModuleName(arg)) {
      modules.push(arg)
    } else {
      console.error(pc.red(`error: unknown module "${arg}", available: ${MODULE_NAMES.join(", ")}`))
      return undefined
    }
  }

  if (modules.length === 0) {
    console.error(pc.red(`error: no modules given, available: ${MODULE_NAMES.join(", ")}`))
    return undefined
  }

  return { modules, dir }
}

async function add(args: AddArgs) {
  intro(pc.bgCyan(pc.black(" @gwigz/slua-modules ")))

  const target = args.dir ?? (existsSync("src") ? join("src", "modules") : "modules")
  const added: ModuleName[] = []

  for (const name of args.modules) {
    const files = readModuleFiles(name)

    const changed = files.filter((file) => {
      const path = join(target, file.path)

      if (!existsSync(path)) return true

      return readFileSync(path, "utf8") !== file.content
    })

    const existing = changed.filter((file) => existsSync(join(target, file.path)))

    if (existing.length > 0) {
      const overwrite = await confirm({
        message: `Overwrite ${existing.length} existing file${existing.length > 1 ? "s" : ""} for ${name}? (${existing
          .map((file) => join(target, file.path))
          .join(", ")})`,
      })

      if (isCancel(overwrite)) {
        outro(pc.red("Operation cancelled."))
        process.exit(0)
      }

      if (!overwrite) {
        log.warn(`Skipped ${name}`)
        continue
      }
    }

    for (const file of changed) {
      const path = join(target, file.path)

      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, file.content)
    }

    added.push(name)
    log.success(`Added ${name} ${pc.dim(`(${join(target, name)})`)}`)
  }

  if (added.length === 0) {
    outro("Nothing added.")
    return
  }

  const importBase = relative(".", target) || "."
  const lines: string[] = ["Next steps:"]

  for (const name of added) {
    lines.push(
      `  import from ${pc.cyan(`"./${importBase}/${name}"`)} (adjust to your script's location)`,
    )
  }

  const defines = added.flatMap((name) => Object.entries(MODULES[name].defaultDefine))

  if (defines.length > 0) {
    lines.push(
      "",
      '  set flags on the "@gwigz/slua-tstl-plugin" entry in tsconfig (or build.ts):',
      `    ${pc.dim(`"define": { ${defines.map(([flag, value]) => `"${flag}": ${value}`).join(", ")} }`)}`,
    )

    const flagsFiles = added
      .map((name) => MODULES[name].flagsFile)
      .filter((file) => file !== undefined)
      .map((file) => join(importBase, file))

    lines.push(
      "",
      `  keep ${flagsFiles.map((file) => pc.cyan(file)).join(" and ")} in your tsconfig`,
      "  include (and any explicit build.ts files array), nothing imports them directly",
    )
  }

  outro(lines.join("\n"))
}

async function main() {
  const [command, ...rest] = process.argv.slice(2)

  if (command === "list") {
    list()
    return
  }

  if (command === "add") {
    const args = parseAddArgs(rest)

    if (!args) {
      process.exit(1)
    }

    await add(args)
    return
  }

  printUsage()

  if (command !== undefined && command !== "help" && command !== "--help") {
    console.error(pc.red(`error: unknown command "${command}"`))
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
