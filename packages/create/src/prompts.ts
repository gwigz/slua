import { resolve, basename } from "node:path"
import * as p from "@clack/prompts"
import { detectPackageManager, toValidPackageName, validateDirectory } from "./utils.js"

export type Template = "single" | "multi"

export interface Extras {
  jsx: boolean
  config: boolean
  yield: boolean
  stylua: boolean
  linting: boolean
  formatting: boolean
}

export interface ProjectOptions {
  directory: string
  projectName: string
  template: Template
  extras: Extras
  git: boolean
  packageManager: string
}

export async function runPrompts(positionalDir?: string): Promise<ProjectOptions | undefined> {
  let directory: string

  if (positionalDir) {
    directory = positionalDir
  } else {
    const result = await p.text({
      message: "Where should we create your project?",
      placeholder: "./my-slua-project",
      validate: validateDirectory,
    })

    if (p.isCancel(result)) return undefined

    directory = result
  }

  const template = await p.select({
    message: "What template would you like to use?",
    options: [
      {
        value: "single" as const,
        label: "Single script",
        hint: "one main.ts, builds with TSTL",
      },
      {
        value: "multi" as const,
        label: "Multi-script",
        hint: "custom build.ts with multiple entry points",
      },
    ],
  })

  if (p.isCancel(template)) return undefined

  const selectedExtras = await p.multiselect({
    message: "Which extras would you like to include?",
    options: [
      { value: "jsx" as const, label: "JSX templates", hint: "@gwigz/jsx-inline" },
      { value: "config" as const, label: "Config module", hint: "@gwigz/slua-modules/config" },
      { value: "yield" as const, label: "Yield module", hint: "@gwigz/slua-modules/yield" },
      { value: "stylua" as const, label: "StyLua formatting" },
      { value: "linting" as const, label: "Linting", hint: "oxlint" },
      { value: "formatting" as const, label: "Formatting", hint: "oxfmt" },
    ],
    required: false,
  })

  if (p.isCancel(selectedExtras)) return undefined

  const git = await p.confirm({
    message: "Initialize a git repository?",
    initialValue: true,
  })

  if (p.isCancel(git)) return undefined

  const resolvedDir = resolve(directory)
  const projectName = toValidPackageName(basename(resolvedDir))

  return {
    directory: resolvedDir,
    projectName,
    template,
    extras: {
      jsx: selectedExtras.includes("jsx"),
      config: selectedExtras.includes("config"),
      yield: selectedExtras.includes("yield"),
      stylua: selectedExtras.includes("stylua"),
      linting: selectedExtras.includes("linting"),
      formatting: selectedExtras.includes("formatting"),
    },
    git,
    packageManager: detectPackageManager(),
  }
}
