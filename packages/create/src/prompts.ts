import { resolve, basename } from "node:path"
import * as p from "@clack/prompts"
import { CliUsageError, type CliFlags } from "./args.js"
import { detectPackageManager, toValidPackageName, validateDirectory } from "./utils.js"

export type Template = "single" | "multi"

export interface Extras {
  jsx: boolean
  config: boolean
  utilities: boolean
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
  /** undefined = ask before installing */
  install?: boolean
  packageManager: string
}

function toExtras(selected: (keyof Extras)[]): Extras {
  return {
    jsx: selected.includes("jsx"),
    config: selected.includes("config"),
    utilities: selected.includes("utilities"),
    yield: selected.includes("yield"),
    stylua: selected.includes("stylua"),
    linting: selected.includes("linting"),
    formatting: selected.includes("formatting"),
  }
}

/**
 * Fills in whatever the flags leave unanswered. Interactively this prompts;
 * with --yes (or a non-TTY stdin) it falls back to defaults instead, except
 * for the directory, which is always required and has no default.
 */
export async function runPrompts(flags: CliFlags): Promise<ProjectOptions | undefined> {
  const interactive = process.stdin.isTTY === true && !flags.yes

  if (!interactive && flags.directory === undefined) {
    throw new CliUsageError(
      "a [directory] argument is required in non-interactive mode, e.g. slua-create my-project --yes",
    )
  }

  let directory: string

  if (flags.directory !== undefined) {
    directory = flags.directory
  } else {
    const result = await p.text({
      message: "Where should we create your project?",
      placeholder: "./my-slua-project",
      validate: validateDirectory,
    })

    if (p.isCancel(result)) return undefined

    directory = result
  }

  let template: Template

  if (flags.template !== undefined) {
    template = flags.template
  } else if (!interactive) {
    template = "single"
  } else {
    const result = await p.select({
      message: "What template would you like to use?",
      options: [
        {
          value: "single" as const,
          label: "Single script",
          hint: "one new-script.ts, builds with TSTL",
        },
        {
          value: "multi" as const,
          label: "Multi-script",
          hint: "custom build.ts with multiple entry points",
        },
      ],
    })

    if (p.isCancel(result)) return undefined

    template = result
  }

  let selectedExtras: (keyof Extras)[]

  if (flags.extras !== undefined) {
    selectedExtras = flags.extras
  } else if (!interactive) {
    selectedExtras = []
  } else {
    const result = await p.multiselect({
      message: "Which extras would you like to include?",
      options: [
        { value: "jsx" as const, label: "JSX templates", hint: "@gwigz/jsx-inline" },
        { value: "config" as const, label: "Config module", hint: "vendors slua-modules config" },
        {
          value: "utilities" as const,
          label: "Utilities module",
          hint: "vendors slua-modules utilities",
        },
        { value: "yield" as const, label: "Yield module", hint: "vendors slua-modules yield" },
        { value: "stylua" as const, label: "StyLua formatting" },
        { value: "linting" as const, label: "Linting", hint: "oxlint" },
        { value: "formatting" as const, label: "Formatting", hint: "oxfmt" },
      ],
      required: false,
    })

    if (p.isCancel(result)) return undefined

    selectedExtras = result
  }

  let git: boolean

  if (flags.git !== undefined) {
    git = flags.git
  } else if (!interactive) {
    git = true
  } else {
    const result = await p.confirm({
      message: "Initialize a git repository?",
      initialValue: true,
    })

    if (p.isCancel(result)) return undefined

    git = result
  }

  const install = flags.install ?? (interactive ? undefined : true)

  const resolvedDir = resolve(directory)
  const projectName = toValidPackageName(basename(resolvedDir))

  return {
    directory: resolvedDir,
    projectName,
    template,
    extras: toExtras(selectedExtras),
    git,
    install,
    packageManager: detectPackageManager(),
  }
}
