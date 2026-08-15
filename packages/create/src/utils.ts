export function detectPackageManager(): string {
  const agent = process.env.npm_config_user_agent ?? ""

  if (agent.startsWith("bun")) return "bun"
  if (agent.startsWith("pnpm")) return "pnpm"
  if (agent.startsWith("yarn")) return "yarn"
  if (agent) return "npm"

  // Fallback when run directly (e.g. `bun src/index.ts`)
  if (process.argv0 === "bun") return "bun"

  return "npm"
}

export function toValidPackageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-~]/g, "-")
    .replace(/^[-.]/, "")
    .replace(/[-.]$/, "")
}

export function validateDirectory(value: string | undefined): string | undefined {
  if (!value?.trim()) return "Please enter a directory path"

  return undefined
}

// Matches oxfmt's JSON style: arrays of primitives are inlined when they fit
// within the print width, so scaffolded files pass `oxfmt --check` untouched.
export function formatJson(obj: unknown): string {
  return printJson(obj, 0) + "\n"
}

const PRINT_WIDTH = 80

function printJson(value: unknown, depth: number): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"

    if (value.every((item) => typeof item !== "object" || item === null)) {
      const inline = `[${value.map((item) => JSON.stringify(item)).join(", ")}]`

      if (depth * 2 + inline.length <= PRINT_WIDTH) return inline
    }

    const pad = "  ".repeat(depth)
    const childPad = "  ".repeat(depth + 1)
    const items = value.map((item) => childPad + printJson(item, depth + 1))

    return `[\n${items.join(",\n")}\n${pad}]`
  }

  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value)

    if (entries.length === 0) return "{}"

    const pad = "  ".repeat(depth)
    const childPad = "  ".repeat(depth + 1)

    const items = entries.map(
      ([key, item]) => `${childPad}${JSON.stringify(key)}: ${printJson(item, depth + 1)}`,
    )

    return `{\n${items.join(",\n")}\n${pad}}`
  }

  return JSON.stringify(value)
}

export function sortKeys(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).toSorted(([a], [b]) => a.localeCompare(b)))
}
