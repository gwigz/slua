import { readFile } from "node:fs/promises"
import { dirname, isAbsolute, join, resolve } from "node:path"
import {
  type ObjectRef,
  type ObjectSelector,
  parseObjectRef,
  parseObjectSelector,
} from "./addressing.js"
import type { ScriptVM } from "./protocol/types.js"
import { loadSourceMapFor } from "./sourcemap.js"

const VM_VALUES: ScriptVM[] = ["luau", "mono", "lsl2"]

/** Everything needed to deploy one built script. */
export interface Target {
  name: string
  /** Absolute path to the built output. */
  file: string
  ref: ObjectRef
  vm?: ScriptVM
  /** Derez back into the source prim's contents after a successful push. */
  saveBack?: boolean
}

/** The parts of a target a source header or config entry may specify. */
export interface PartialTarget {
  object?: ObjectSelector
  link?: string
  item?: string
  vm?: ScriptVM
  saveBack?: boolean
  file?: string
  entry?: string
}

function parseVm(raw: string, where: string): ScriptVM {
  if (!VM_VALUES.includes(raw as ScriptVM)) {
    throw new Error(`${where}: vm must be one of ${VM_VALUES.join(", ")}, got "${raw}"`)
  }

  return raw as ScriptVM
}

/**
 * Reads the leading comment block of a source file.
 *
 * Tags are only honoured above the first line of code, so a `@slua-` string
 * appearing later in the file cannot change where the script deploys.
 */
export function leadingComment(source: string): string {
  const lines: string[] = []

  // Both comment syntaxes, so a header works in TypeScript, LSL and Lua alike.
  let blockEnd: string | undefined

  for (const line of source.split("\n")) {
    const trimmed = line.trim()

    if (blockEnd !== undefined) {
      lines.push(trimmed)

      if (trimmed.includes(blockEnd)) blockEnd = undefined

      continue
    }

    if (trimmed === "") continue

    const opener = trimmed.startsWith("/*") ? "*/" : trimmed.startsWith("--[[") ? "]]" : undefined

    if (opener !== undefined) {
      lines.push(trimmed)

      if (!trimmed.includes(opener)) blockEnd = opener

      continue
    }

    if (trimmed.startsWith("//") || trimmed.startsWith("--")) {
      lines.push(trimmed)

      continue
    }

    break
  }

  return lines.join("\n")
}

export interface HeaderTagOptions {
  /**
   * Skip unrecognised `@slua-*` tags instead of failing.
   *
   * Set when sweeping the inputs behind a bundle: those include vendored code
   * nobody here wrote, and one stray tag in a dependency should not stop a
   * push.
   */
  lenient?: boolean
}

/**
 * Parses `@slua-*` tags out of a file's header comment.
 *
 * A header can name the whole destination, so a small project deploys with no
 * config file at all.
 */
export function parseHeaderTags(
  source: string,
  where = "header",
  options: HeaderTagOptions = {},
): PartialTarget {
  const header = leadingComment(source)
  const tags: PartialTarget = {}

  for (const [, tag, rawValue] of header.matchAll(/@slua-([a-z-]+)(?:[ \t]+([^\n*]*))?/g)) {
    const value = rawValue?.trim() ?? ""

    switch (tag) {
      case "target": {
        const ref = parseObjectRef(value)

        tags.object = ref.object
        tags.link = ref.link
        tags.item = ref.item

        break
      }

      case "object":
        tags.object = parseObjectSelector(value)

        break

      case "item":
        tags.item = value

        break

      case "link":
        tags.link = value

        break

      case "vm":
        tags.vm = parseVm(value, where)

        break

      case "save-back":
        tags.saveBack = value === "" || value === "true"

        break

      default:
        if (options.lenient) break

        throw new Error(`${where}: unknown tag @slua-${tag}`)
    }
  }

  return tags
}

async function tagsIn(
  file: string,
  options?: HeaderTagOptions,
): Promise<PartialTarget | undefined> {
  let text: string

  try {
    text = await readFile(file, "utf8")
  } catch {
    return undefined
  }

  const tags = parseHeaderTags(text, file, options)

  return Object.keys(tags).length > 0 ? tags : undefined
}

/**
 * Reads the header tags for a file about to be pushed.
 *
 * For a compiled bundle that means the sources behind it; for a hand-written
 * script, LSL or otherwise, the file is its own source.
 */
export async function readHeaderTagsFor(file: string): Promise<PartialTarget | undefined> {
  const map = await loadSourceMapFor(file)
  const found: PartialTarget[] = []

  for (const source of map?.sources ?? []) {
    const tags = await tagsIn(source, { lenient: true })

    if (tags) found.push(tags)
  }

  // TSTL emits dependencies before the entry, so when several files carry
  // tags the last one is the entry point.
  return found.at(-1) ?? (await tagsIn(file))
}

interface RawTarget {
  file?: string
  entry?: string
  object?: string | { id?: string; name?: string; description?: string }
  link?: string
  item?: string
  vm?: string
  saveBack?: boolean
}

function parseSelector(raw: NonNullable<RawTarget["object"]>, where: string): ObjectSelector {
  if (typeof raw === "string") return parseObjectSelector(raw)

  if (raw.id) return { kind: "id", value: raw.id }
  if (raw.name) return { kind: "name", value: raw.name }
  if (raw.description) return { kind: "description", value: raw.description }

  throw new Error(`${where}: object needs one of id, name or description`)
}

export interface Config {
  /** Directory the config was found in; relative paths resolve against it. */
  root: string
  targets: Record<string, PartialTarget>
}

export function parseConfig(json: string, root: string, where: string): Config {
  let raw: { targets?: Record<string, RawTarget> }

  try {
    raw = JSON.parse(json)
  } catch (error) {
    throw new Error(`${where}: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    })
  }

  const targets: Record<string, PartialTarget> = {}

  for (const [name, entry] of Object.entries(raw.targets ?? {})) {
    const at = `${where}: target "${name}"`

    targets[name] = {
      file: entry.file,
      entry: entry.entry,
      object: entry.object === undefined ? undefined : parseSelector(entry.object, at),
      link: entry.link,
      item: entry.item,
      vm: entry.vm === undefined ? undefined : parseVm(entry.vm, at),
      saveBack: entry.saveBack,
    }
  }

  return { root, targets }
}

export const CONFIG_FILENAME = "slua.json"

/** Finds and loads the nearest config, walking up from `from`. */
export async function loadConfig(from: string = process.cwd()): Promise<Config | undefined> {
  let dir = resolve(from)

  for (;;) {
    const path = join(dir, CONFIG_FILENAME)

    try {
      return parseConfig(await readFile(path, "utf8"), dir, path)
    } catch (error) {
      // A malformed config is worth reporting; a missing one just means we
      // keep looking further up.
      if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") throw error
    }

    const parent = dirname(dir)

    if (parent === dir) return undefined

    dir = parent
  }
}

function merge(...layers: (PartialTarget | undefined)[]): PartialTarget {
  const result: PartialTarget = {}

  // Later layers win, so callers pass them in increasing precedence.
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer ?? {})) {
      if (value !== undefined) (result as Record<string, unknown>)[key] = value
    }
  }

  return result
}

export interface ResolveOptions {
  name: string
  /** Overrides from the command line, which beat everything else. */
  cli?: PartialTarget
  config?: PartialTarget
  header?: PartialTarget
  configRoot?: string
}

/**
 * Combines the layers into a deployable target.
 *
 * Precedence is command line, then config, then the source header: the header
 * is the default a script ships with, and config retargets it per environment
 * without touching the source.
 */
export function resolveTarget({ name, cli, config, header, configRoot }: ResolveOptions): Target {
  const merged = merge(header, config, cli)

  if (!merged.file) throw new Error(`target "${name}" has no file to push`)
  if (!merged.object)
    throw new Error(`target "${name}" has no object; set @slua-target or --object`)
  if (!merged.item) throw new Error(`target "${name}" has no item; set @slua-target or --item`)

  const base = configRoot ?? process.cwd()

  return {
    name,
    file: isAbsolute(merged.file) ? merged.file : resolve(base, merged.file),
    ref: { object: merged.object, link: merged.link, item: merged.item },
    vm: merged.vm,
    saveBack: merged.saveBack,
  }
}
