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

export function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2) + "\n"
}

export function sortKeys(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).toSorted(([a], [b]) => a.localeCompare(b)))
}
