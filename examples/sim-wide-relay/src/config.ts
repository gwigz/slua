const NOTECARD_NAME = "settings.yml"

type ConfigObject = Record<string, string | number | string[]>

function readNotecardSync(callback: (lines: string[]) => void) {
  const lines: string[] = []
  let lineNum = 0

  while (true) {
    const line = ll.GetNotecardLineSync(NOTECARD_NAME, lineNum)

    if (line === NAK) {
      // Not cached, force cache then retry
      forceCache(() => readNotecardSync(callback))
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

function forceCache(callback: () => void) {
  const requestId = ll.GetNotecardLine(NOTECARD_NAME, 0)

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

export function loadConfig(config: ConfigObject, callback: () => void) {
  readNotecardSync((lines) => {
    applyConfig(config, parseLines(lines))
    callback()
  })
}

export function onConfigChanged(config: ConfigObject, callback: () => void) {
  let lastKey = ll.GetInventoryKey(NOTECARD_NAME)

  LLEvents.on("changed", (changed) => {
    if ((changed & CHANGED_INVENTORY) === 0) {
      return
    }

    const currentKey = ll.GetInventoryKey(NOTECARD_NAME)

    if (currentKey === lastKey) {
      return
    }

    lastKey = currentKey

    readNotecardSync((lines) => {
      applyConfig(config, parseLines(lines))
      callback()
    })
  })
}
