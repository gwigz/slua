/**
 * @module config
 *
 * Read and watch settings notecards with typed defaults.
 *
 * Supports two notecard formats, each gated by a compile-time flag
 * so unused parser code is stripped from the Lua output:
 *
 * - **yml** (`CONFIG_YAML_PARSER`) simple `key: value` pairs, one
 *   per line. Comments (`#`) and blank lines are ignored. Strings,
 *   numbers, and comma-separated arrays are coerced automatically
 *   based on the type of each default value.
 * - **lljson** (`CONFIG_LLJSON_PARSER`) full JSON via `lljson.sldecode`.
 *   Natively supports vectors, rotations, and UUIDs, but you still
 *   need to provide defaults for those types (e.g. `Vector.zero`,
 *   `Quaternion.identity`, `NULL_KEY`).
 *
 * @define Set flags via `@gwigz/slua-tstl-plugin` `define` option.
 * Code guarded by a flag set to `false` is stripped at compile time.
 *
 * @version 0.1.0
 */

/**
 * Supported value types for config entries.
 *
 * - `string` plain text (yml: `\\n` is unescaped to newline)
 * - `number` parsed via `tonumber`
 * - `string[]` yml: comma-separated list, lljson: JSON array
 */
export type ConfigValue = string | number | string[]

/** A flat key-value config object where every value is a {@link ConfigValue}. */
export type ConfigObject = Record<string, ConfigValue>

/**
 * Options passed to {@link loadConfig} and {@link onConfigChanged}.
 *
 * @typeParam T - The shape of the config object, inferred from `config`.
 */
export interface ConfigOptions<T extends Record<string, ConfigValue>> {
  /**
   * The config object to read into. Mutated in-place by
   * {@link loadConfig} and {@link onConfigChanged}.
   *
   * Keys not present in `config` are ignored when parsing the
   * notecard. The type of each value determines how the raw
   * notecard entry is coerced (number, string, or string array).
   */
  config: T

  /**
   * Notecard format.
   *
   * - `"yml"` (default) simple `key: value` lines.
   * - `"lljson"` JSON decoded via `lljson.sldecode`. Requires
   *   `CONFIG_LLJSON_PARSER` to be set to `true` in the TSTL
   *   plugin define options. The lljson format natively supports
   *   vectors, rotations, and UUIDs, provide appropriate defaults
   *   such as `Vector.zero`, `Quaternion.identity`, or `NULL_KEY`.
   *
   * @default "yml"
   */
  type?: "yml" | "lljson"
}

/** @internal Read a notecard line-by-line, force-caching if needed. */
function readNotecardSync(notecard: string, callback: (lines: string[]) => void) {
  const lines: string[] = []
  let lineNum = 0

  while (true) {
    const line = ll.GetNotecardLineSync(notecard, lineNum)

    if (line === NAK) {
      // Not cached, force cache then retry
      forceCache(notecard, () => readNotecardSync(notecard, callback))
      return
    }

    if (line === EOF) {
      break
    }

    lines.push(line)
    lineNum++
  }

  callback(lines)
}

/** @internal Trigger a dataserver read to force the notecard into cache. */
function forceCache(notecard: string, callback: () => void) {
  const requestId = ll.GetNotecardLine(notecard, 0)

  function handler(id: UUID, _data: string) {
    if (id !== requestId) {
      return
    }

    LLEvents.off("dataserver", handler)

    callback()
  }

  LLEvents.on("dataserver", handler)
}

/**
 * @internal Parse yml-style `key: value` lines into a flat string map.
 * @define CONFIG_YAML_PARSER
 */
function parseLines(lines: string[]): Record<string, string> {
  const parsed: Record<string, string> = {}

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue
    }

    const sepIndex = trimmed.indexOf(":")

    if (sepIndex === -1) {
      continue
    }

    const key = trimmed.substring(0, sepIndex).trim()
    const value = trimmed.substring(sepIndex + 1).trim()

    parsed[key] = value
  }

  return parsed
}

/**
 * @internal Apply yml-parsed string values to a config object, coercing types based on defaults.
 * @define CONFIG_YAML_PARSER
 */
function applyConfig(config: ConfigObject, parsed: Record<string, string>) {
  for (const key in parsed) {
    if (config[key] === undefined) {
      continue
    }

    const value = parsed[key]
    const existing = config[key]

    if (typeof existing === "number") {
      const num = tonumber(value)

      if (num !== undefined) {
        config[key] = num
      }
    } else if (Array.isArray(existing)) {
      if (value === "") {
        config[key] = []
      } else {
        config[key] = value.split(",").map((s: string) => s.trim())
      }
    } else {
      config[key] = value.replaceAll("\\n", "\n")
    }
  }
}

/**
 * @internal Dispatch to the correct parser based on `type` and compile-time flags.
 *
 * @define Both `CONFIG_YAML_PARSER` and `CONFIG_LLJSON_PARSER` are evaluated at
 * compile time. When a flag is `false`, the entire guarded block (including any
 * helper functions it calls) is stripped from the Lua output by dead code elimination.
 */
function applyFromLines(config: ConfigObject, lines: string[], type: "yml" | "lljson") {
  if (CONFIG_LLJSON_PARSER) {
    if (type === "lljson") {
      // lljson decodes to proper types natively (including vectors,
      // rotations, UUIDs), so we just assign known keys directly.
      const decoded = lljson.sldecode(lines.join("\n"))

      for (const key in config) {
        if (key in decoded) {
          config[key] = decoded[key]
        }
      }

      return
    }
  }

  if (CONFIG_YAML_PARSER) {
    applyConfig(config, parseLines(lines))
  }
}

/**
 * Read a settings notecard and apply values to `config` in-place.
 *
 * @typeParam T - Config shape, inferred from `options.config`.
 * @param notecard - Name of the notecard in the object's inventory.
 * @param options - Config options including the target object and optional format.
 * @param callback - Called once the notecard has been read and applied.
 *
 * @example
 * ```ts
 * const config = {
 *   PRIVATE_CHANNEL: -1731704569,
 *   WELCOME_MESSAGE: "Welcome",
 *   ADMIN_KEYS: ["00000000-0000-0000-0000-000000000000"],
 * }
 *
 * loadConfig("settings.yml", { config }, () => {
 *   ll.Say(config.PRIVATE_CHANNEL, config.WELCOME_MESSAGE)
 * })
 * ```
 *
 * @example Using lljson (requires `CONFIG_LLJSON_PARSER: true`):
 * ```ts
 * const config = {
 *   SPAWN_POS: Vector.zero,
 *   SPAWN_ROT: Quaternion.identity,
 *   OWNER: NULL_KEY,
 *   RADIUS: 10,
 * }
 *
 * loadConfig("config.json", { config, type: "lljson" }, () => {
 *   ll.SetPos(config.SPAWN_POS)
 * })
 * ```
 */
export function loadConfig<T extends Record<string, ConfigValue>>(
  notecard: string,
  options: ConfigOptions<T>,
  callback: () => void,
) {
  const config = options.config
  const type = options.type ?? "yml"

  readNotecardSync(notecard, (lines) => {
    applyFromLines(config, lines, type)
    callback()
  })
}

/**
 * Watch for changes to a settings notecard and re-parse on update.
 *
 * Each time the notecard's inventory key changes, `config` is
 * reset to a snapshot taken at registration time, then re-parsed
 * from the updated notecard — the same object is mutated in-place.
 *
 * @typeParam T - Config shape, inferred from `options.config`.
 * @param notecard - Name of the notecard in the object's inventory.
 * @param options - Config options including the target object and optional format.
 * @param callback - Called once the config has been re-applied.
 *
 * @note Creates a persistent `changed` event listener. Call once per notecard.
 *
 * @example
 * ```ts
 * const config = { CHANNEL: 0, MESSAGE: "" }
 *
 * loadConfig("settings.yml", { config }, () => {
 *   onConfigChanged("settings.yml", { config }, () => {
 *     ll.Say(config.CHANNEL, "Config reloaded")
 *   })
 * })
 * ```
 */
export function onConfigChanged<T extends Record<string, ConfigValue>>(
  notecard: string,
  options: ConfigOptions<T>,
  callback: () => void,
) {
  let lastKey = ll.GetInventoryKey(notecard)
  const config = options.config
  const snapshot = { ...config } as T
  const type = options.type ?? "yml"

  LLEvents.on("changed", (changed) => {
    if ((changed & CHANGED_INVENTORY) === 0) {
      return
    }

    const currentKey = ll.GetInventoryKey(notecard)

    if (currentKey === lastKey) {
      return
    }

    lastKey = currentKey

    readNotecardSync(notecard, (lines) => {
      // Reset to snapshot then re-apply
      for (const key in snapshot) {
        config[key] = snapshot[key]
      }

      applyFromLines(config, lines, type)
      callback()
    })
  })
}
