import { writeFileSync, mkdirSync } from "node:fs"
import { execSync } from "node:child_process"
import { join, dirname } from "node:path"
import { spinner } from "@clack/prompts"
import type { ProjectOptions } from "./prompts.js"
import { generateSingleTemplate } from "./templates/single.js"
import { generateMultiTemplate } from "./templates/multi.js"

export async function scaffold(options: ProjectOptions): Promise<void> {
  const files =
    options.template === "single" ? generateSingleTemplate(options) : generateMultiTemplate(options)

  const s = spinner()

  s.start("Scaffolding project...")

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(options.directory, filePath)

    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, content)
  }

  if (options.git) {
    try {
      execSync("git init", { cwd: options.directory, stdio: "ignore" })
    } catch {
      // git init failed, non-fatal
    }
  }

  s.stop("Done!")
}

export async function install(options: ProjectOptions): Promise<void> {
  const s = spinner()

  s.start("Installing packages...")

  try {
    execSync(`${options.packageManager} install`, {
      cwd: options.directory,
      stdio: "ignore",
    })

    s.stop("Packages installed!")
  } catch {
    s.stop("Failed to install packages.")
  }
}
