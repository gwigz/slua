import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

export interface ModuleEntry {
  description: string
  /** Files to copy, relative to src/, tests excluded. */
  files: string[]
  /** Shared internal/ helpers this module depends on, relative to src/. */
  internal: string[]
  /** Compile-time define flags and their suggested defaults, empty when the module has none. */
  defaultDefine: Record<string, boolean>
  /** The flags.d.ts file consumers must add to their tsconfig include, if any. */
  flagsFile?: string
}

export type ModuleName = "config" | "utilities" | "yield" | "testing"

export const MODULES: Record<ModuleName, ModuleEntry> = {
  config: {
    description: "typed notecard config with YAML and lljson parsers",
    files: ["config/index.ts", "config/flags.d.ts"],
    internal: ["internal/spawn.ts", "internal/yield-dataserver.ts", "internal/with-timeout.ts"],
    defaultDefine: {
      CONFIG_YAML_PARSER: true,
      CONFIG_LLJSON_PARSER: false,
    },
    flagsFile: "config/flags.d.ts",
  },
  utilities: {
    description: "debounce, throttle, and cooldown rate-limiting primitives",
    files: [
      "utilities/index.ts",
      "utilities/debounce.ts",
      "utilities/throttle.ts",
      "utilities/cooldown.ts",
    ],
    internal: [],
    defaultDefine: {},
  },
  yield: {
    description: "coroutine wrappers that flatten callback APIs into sequential code",
    files: ["yield/index.ts", "yield/flags.d.ts"],
    internal: ["internal/spawn.ts", "internal/yield-dataserver.ts", "internal/with-timeout.ts"],
    defaultDefine: {
      YIELD_DATASERVER_AGENT: true,
      YIELD_DATASERVER_DISPLAY_NAME: true,
      YIELD_DATASERVER_SIM: true,
      YIELD_DATASERVER_INVENTORY: true,
      YIELD_DATASERVER_NOTECARD: true,
      YIELD_DATASERVER_TEXT_COUNT: true,
      YIELD_KV: true,
      YIELD_DIALOG: true,
      YIELD_HTTP: true,
      YIELD_PERMISSIONS: true,
      YIELD_SENSOR: true,
    },
    flagsFile: "yield/flags.d.ts",
  },
  testing: {
    description: "mock ll, LLEvents, and LLTimers globals for unit testing",
    files: ["testing/index.ts"],
    internal: [],
    defaultDefine: {},
  },
}

export const MODULE_NAMES = Object.keys(MODULES) as ModuleName[]

export function isModuleName(name: string): name is ModuleName {
  return name in MODULES
}

const SRC_DIR = fileURLToPath(new URL("../src/", import.meta.url))

/**
 * Reads a module's source files (plus its internal/ dependencies) with import
 * specifiers in doc comments rewritten to the vendored "./modules/*" form.
 * Paths are relative to the vendor target directory.
 */
export function readModuleFiles(name: ModuleName): { path: string; content: string }[] {
  const entry = MODULES[name]

  return [...entry.files, ...entry.internal].map((path) => ({
    path,
    content: readFileSync(join(SRC_DIR, path), "utf8").replaceAll(
      '"@gwigz/slua-modules/',
      '"./modules/',
    ),
  }))
}
