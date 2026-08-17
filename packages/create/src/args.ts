import { parseArgs } from "node:util"
import type { Extras, Template } from "./prompts.js"
import { validateDirectory } from "./utils.js"

export interface CliFlags {
  directory?: string
  template?: Template
  /** undefined = unanswered, [] = explicit "none" */
  extras?: (keyof Extras)[]
  git?: boolean
  install?: boolean
  yes: boolean
  help: boolean
  version: boolean
}

export class CliUsageError extends Error {}

export const EXTRA_NAMES = [
  "jsx",
  "config",
  "utilities",
  "yield",
  "stylua",
  "linting",
  "formatting",
] as const satisfies readonly (keyof Extras)[]

export function helpText(): string {
  return `Scaffold a TSTL-powered SLua project.

Usage:
  slua-create [directory] [options]

Options:
  -t, --template <single|multi>  project template (default: single)
  -e, --extras <list>            comma-separated extras, or "none"; repeatable
                                 (${EXTRA_NAMES.join(", ")})
      --git / --no-git           initialize a git repository (default: git)
      --install / --no-install   install dependencies (default: install)
  -y, --yes                      accept defaults for all unanswered prompts
  -h, --help                     show this help
  -v, --version                  show version

Any option answered by a flag is skipped when prompting. With --yes (or when
stdin is not a TTY) no prompts are shown, and [directory] is required.`
}

function resolveNegatable(
  name: string,
  positive: boolean | undefined,
  negative: boolean | undefined,
): boolean | undefined {
  if (positive && negative) {
    throw new CliUsageError(`--${name} and --no-${name} cannot be combined`)
  }

  if (positive) return true
  if (negative) return false

  return undefined
}

function parseExtras(values: string[] | undefined): (keyof Extras)[] | undefined {
  if (values === undefined || values.length === 0) return undefined

  const tokens = values
    .flatMap((value) => value.split(","))
    .map((token) => token.trim())
    .filter((token) => token !== "")

  if (tokens.includes("none")) {
    if (tokens.length > 1) {
      throw new CliUsageError('--extras "none" cannot be combined with other extras')
    }

    return []
  }

  const extras: (keyof Extras)[] = []

  for (const token of tokens) {
    if (!(EXTRA_NAMES as readonly string[]).includes(token)) {
      throw new CliUsageError(
        `unknown extra "${token}" (expected one of: ${EXTRA_NAMES.join(", ")}, none)`,
      )
    }

    if (!extras.includes(token as keyof Extras)) {
      extras.push(token as keyof Extras)
    }
  }

  return extras
}

function rawParse(argv: string[]) {
  try {
    return parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        help: { type: "boolean", short: "h", default: false },
        version: { type: "boolean", short: "v", default: false },
        template: { type: "string", short: "t" },
        extras: { type: "string", short: "e", multiple: true },
        git: { type: "boolean" },
        "no-git": { type: "boolean" },
        install: { type: "boolean" },
        "no-install": { type: "boolean" },
        yes: { type: "boolean", short: "y", default: false },
      },
    })
  } catch (error) {
    throw new CliUsageError(error instanceof Error ? error.message : String(error))
  }
}

export function parseCliArgs(argv: string[]): CliFlags {
  const { values, positionals } = rawParse(argv)

  if (positionals.length > 1) {
    throw new CliUsageError(`unexpected argument "${positionals[1]}"`)
  }

  const directory = positionals[0]

  if (directory !== undefined) {
    const problem = validateDirectory(directory)

    if (problem) throw new CliUsageError(problem)
  }

  if (
    values.template !== undefined &&
    values.template !== "single" &&
    values.template !== "multi"
  ) {
    throw new CliUsageError(`invalid template "${values.template}" (expected single or multi)`)
  }

  return {
    directory,
    template: values.template,
    extras: parseExtras(values.extras),
    git: resolveNegatable("git", values.git, values["no-git"]),
    install: resolveNegatable("install", values.install, values["no-install"]),
    yes: values.yes,
    help: values.help,
    version: values.version,
  }
}
