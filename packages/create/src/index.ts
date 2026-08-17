#!/usr/bin/env node

import { createRequire } from "node:module"
import { relative } from "node:path"
import { confirm, intro, isCancel, outro } from "@clack/prompts"
import pc from "picocolors"
import { CliUsageError, helpText, parseCliArgs } from "./args.js"
import { runPrompts } from "./prompts.js"
import { install, scaffold } from "./scaffold.js"

async function main() {
  const flags = parseCliArgs(process.argv.slice(2))

  if (flags.help) {
    console.log(helpText())
    return
  }

  if (flags.version) {
    console.log(createRequire(import.meta.url)("../package.json").version)
    return
  }

  console.log()

  intro(pc.bgCyan(pc.black(" @gwigz/slua-create ")))

  const options = await runPrompts(flags)

  if (!options) {
    outro(pc.red("Operation cancelled."))
    process.exit(0)
  }

  await scaffold(options)

  const pm = options.packageManager
  const relDir = relative(process.cwd(), options.directory) || "."
  const cdTarget = /\s/.test(relDir) ? JSON.stringify(relDir) : relDir
  const run = pm === "npm" ? "npm run" : pm

  let shouldInstall = options.install

  if (shouldInstall === undefined) {
    const answer = await confirm({
      message: "Install packages?",
      initialValue: true,
    })

    if (isCancel(answer)) {
      outro(pc.red("Operation cancelled."))
      process.exit(0)
    }

    shouldInstall = answer
  }

  if (shouldInstall) {
    await install(options)

    outro(`Now run:\n${pc.dim(`   cd ${cdTarget}\n   ${run} dev`)}`)
  } else {
    outro(`Now run:\n${pc.dim(`   cd ${cdTarget}\n   ${pm} install\n   ${run} dev`)}`)
  }
}

main().catch((err) => {
  if (err instanceof CliUsageError) {
    console.error(`${pc.red("error:")} ${err.message}\n`)
    console.error(helpText())
    process.exit(1)
  }

  console.error(err)
  process.exit(1)
})
