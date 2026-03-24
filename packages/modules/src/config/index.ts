export type ConfigObject = Record<string, string | number | string[]>

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

function forceCache(notecard: string, callback: () => void) {
  const requestId = ll.GetNotecardLine(notecard, 0)

  function handler(id: uuid, _data: string) {
    if (id !== requestId) {
      return
    }

    LLEvents.off("dataserver", handler)

    callback()
  }

  LLEvents.on("dataserver", handler)
}

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
 * Read a settings notecard and apply the values to the config object
 *
 * @example
 * ```ts
 * const config = {
 *   // default values
 *   // note these are required to correctly type the config object
 *   // any missing values here will not be read from the notecard
 *   PRIVATE_CHANNEL: -1731704569,
 *   WELCOME_MESSAGE: "Welcome",
 *   ADMIN_KEYS: ["00000000-0000-0000-0000-000000000000"],
 * }
 *
 * loadConfig("settings.yml", config, () => {
 *   // initialize your script here
 *   console.log(config)
 *
 *   onConfigChanged("settings.yml", config, () => {
 *     // update your script here
 *     console.log(config)
 *   })
 * })
 * ```
 */
export function loadConfig(notecard: string, config: ConfigObject, callback: () => void) {
  readNotecardSync(notecard, (lines) => {
    applyConfig(config, parseLines(lines))
    callback()
  })
}

/**
 * Watch for changes to a settings notecard and apply them to the config object
 *
 * @note This will create an LLEvent listener for each call, so only use it once per notecard
 */
export function onConfigChanged(notecard: string, config: ConfigObject, callback: () => void) {
  let lastKey = ll.GetInventoryKey(notecard)

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
      applyConfig(config, parseLines(lines))
      callback()
    })
  })
}
