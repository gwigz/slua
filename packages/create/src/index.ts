#!/usr/bin/env node

import { relative } from "node:path"
import { confirm, intro, isCancel, outro } from "@clack/prompts"
import pc from "picocolors"
import { runPrompts } from "./prompts.js"
import { install, scaffold } from "./scaffold.js"

async function main() {
  console.log()

  intro(pc.bgCyan(pc.black(" @gwigz/slua-create ")))

  const options = await runPrompts(process.argv[2])

  if (!options) {
    outro(pc.red("Operation cancelled."))
    process.exit(0)
  }

  await scaffold(options)

  const pm = options.packageManager
  const relDir = relative(process.cwd(), options.directory) || "."
  const run = pm === "npm" ? "npm run" : pm

  const shouldInstall = await confirm({
    message: "Install packages?",
    initialValue: true,
  })

  if (isCancel(shouldInstall)) {
    outro(pc.red("Operation cancelled."))
    process.exit(0)
  }

  if (shouldInstall) {
    await install(options)

    outro(`Now run:\n${pc.dim(`   cd ${relDir}\n   ${run} build --watch`)}`)
  } else {
    outro(`Now run:\n${pc.dim(`   cd ${relDir}\n   ${pm} install\n   ${run} build --watch`)}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
