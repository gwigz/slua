import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { setup, teardown, notecard, emit, setCoroutineYieldValue } from "../testing"
import { loadConfig, onConfigChanged } from "."

beforeEach(() => setup())
afterEach(() => teardown())

describe("loadConfig", () => {
  it("reads notecard and applies string values", () => {
    notecard("settings.yml", ["MESSAGE: Hello world"])

    const config = { MESSAGE: "" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.MESSAGE).toBe("Hello world")
    })
  })

  it("converts numeric values via tonumber", () => {
    notecard("settings.yml", ["CHANNEL: -1731704569"])

    const config = { CHANNEL: 0 }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.CHANNEL).toBe(-1731704569)
    })
  })

  it("splits comma-separated values into arrays", () => {
    notecard("settings.yml", ["KEYS: aaa, bbb, ccc"])

    const config = { KEYS: ["default"] }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KEYS).toEqual(["aaa", "bbb", "ccc"])
    })
  })

  it("trims whitespace around array items", () => {
    notecard("settings.yml", ["ITEMS:  foo ,  bar  "])

    const config = { ITEMS: [] as string[] }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.ITEMS).toEqual(["foo", "bar"])
    })
  })

  it("sets empty string to empty array", () => {
    notecard("settings.yml", ["ITEMS: "])

    const config = { ITEMS: ["existing"] }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.ITEMS).toEqual([])
    })
  })

  it("replaces \\n escape sequences in strings", () => {
    notecard("settings.yml", ["MSG: Hello\\nWorld"])

    const config = { MSG: "" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.MSG).toBe("Hello\nWorld")
    })
  })

  it("ignores unknown keys not in the config object", () => {
    notecard("settings.yml", ["KNOWN: value", "UNKNOWN: ignored"])

    const config = { KNOWN: "" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KNOWN).toBe("value")
      expect((config as any).UNKNOWN).toBeUndefined()
    })
  })

  it("skips empty lines and comments", () => {
    notecard("settings.yml", ["# This is a comment", "", "  ", "KEY: value", "# Another comment"])

    const config = { KEY: "" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KEY).toBe("value")
    })
  })

  it("skips lines without a colon separator", () => {
    notecard("settings.yml", ["NOCOLON", "KEY: value"])

    const config = { KEY: "", NOCOLON: "" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KEY).toBe("value")
      expect(config.NOCOLON).toBe("")
    })
  })

  it("handles multiple config types together", () => {
    notecard("settings.yml", ["CHANNEL: -123", "MESSAGE: Hello", "ADMINS: alice, bob"])

    const config = {
      CHANNEL: 0,
      MESSAGE: "",
      ADMINS: [] as string[],
    }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.CHANNEL).toBe(-123)
      expect(config.MESSAGE).toBe("Hello")
      expect(config.ADMINS).toEqual(["alice", "bob"])
    })
  })

  it("preserves default values for keys not in notecard", () => {
    notecard("settings.yml", ["A: 1"])

    const config = { A: 0, B: 42, C: "default" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.A).toBe(1)
      expect(config.B).toBe(42)
      expect(config.C).toBe("default")
    })
  })

  it("skips invalid numeric values", () => {
    notecard("settings.yml", ["NUM: not_a_number"])

    const config = { NUM: 42 }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.NUM).toBe(42)
    })
  })

  it("reads from a custom notecard name", () => {
    notecard("custom.yml", ["KEY: custom"])

    const config = { KEY: "" }

    loadConfig("custom.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KEY).toBe("custom")
    })
  })

  it("handles values with colons in them", () => {
    notecard("settings.yml", ["URL: https://example.com"])

    const config = { URL: "" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.URL).toBe("https://example.com")
    })
  })

  it("mutates the config object in place", () => {
    notecard("settings.yml", ["KEY: updated"])

    const config = { KEY: "original" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KEY).toBe("updated")
    })
  })

  it("calls callback with ok=false and error on timeout", () => {
    // No notecard registered, GetNotecardLineSync returns NAK,
    // triggering the yieldDataserver path which will time out
    setCoroutineYieldValue([false, "timeout"])

    const config = { KEY: "default" }

    loadConfig("missing.yml", { config, timeout: 5 }, (ok, error) => {
      expect(ok).toBe(false)
      expect(error).toBe("timeout")
      expect(config.KEY).toBe("default")
    })
  })
})

describe("onConfigChanged", () => {
  it("fires callback when notecard changes", () => {
    notecard("settings.yml", ["KEY: original"])
    let callCount = 0

    const config = { KEY: "" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KEY).toBe("original")

      onConfigChanged("settings.yml", { config }, (ok) => {
        expect(ok).toBe(true)
        callCount++
        expect(config.KEY).toBe("updated")
      })

      // Update notecard content (also updates inventory key)
      notecard("settings.yml", ["KEY: updated"])

      // Trigger the changed event with CHANGED_INVENTORY flag
      emit("changed", CHANGED_INVENTORY)

      expect(callCount).toBe(1)
    })
  })

  it("ignores changed events without CHANGED_INVENTORY flag", () => {
    notecard("settings.yml", ["KEY: original"])
    let callCount = 0

    const config = { KEY: "" }

    loadConfig("settings.yml", { config }, () => {
      onConfigChanged("settings.yml", { config }, () => {
        callCount++
      })

      // Trigger with a different flag
      emit("changed", 2)

      expect(callCount).toBe(0)
    })
  })

  it("ignores changed events when inventory key hasn't changed", () => {
    notecard("settings.yml", ["KEY: original"])
    let callCount = 0

    const config = { KEY: "" }

    loadConfig("settings.yml", { config }, () => {
      onConfigChanged("settings.yml", { config }, () => {
        callCount++
      })

      // Trigger without updating notecard content (key stays the same)
      emit("changed", CHANGED_INVENTORY)

      expect(callCount).toBe(0)
    })
  })

  it("resets to snapshot values before re-parsing", () => {
    notecard("settings.yml", ["A: 1", "B: 2"])

    const config = { A: 0, B: 0 }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.A).toBe(1)
      expect(config.B).toBe(2)

      onConfigChanged("settings.yml", { config }, (ok) => {
        expect(ok).toBe(true)
        // A was removed from notecard, should reset to snapshot value (1)
        expect(config.A).toBe(1)
        expect(config.B).toBe(99)
      })

      // Update notecard to only have B
      notecard("settings.yml", ["B: 99"])
      emit("changed", CHANGED_INVENTORY)
    })
  })
})

describe("loadConfig with lljson", () => {
  beforeEach(() => {
    ;(globalThis as any).CONFIG_LLJSON_PARSER = true
  })

  it("parses JSON notecard when type is lljson", () => {
    notecard("config.json", ['{"CHANNEL": -123, "MESSAGE": "Hello"}'])

    const config = { CHANNEL: 0, MESSAGE: "" }

    loadConfig("config.json", { config, type: "lljson" }, (ok) => {
      expect(ok).toBe(true)
      expect(config.CHANNEL).toBe(-123)
      expect(config.MESSAGE).toBe("Hello")
    })
  })

  it("ignores unknown keys in JSON notecard", () => {
    notecard("config.json", ['{"KNOWN": "value", "UNKNOWN": "ignored"}'])

    const config = { KNOWN: "" }

    loadConfig("config.json", { config, type: "lljson" }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KNOWN).toBe("value")
      expect((config as any).UNKNOWN).toBeUndefined()
    })
  })

  it("handles JSON arrays", () => {
    notecard("config.json", ['{"ITEMS": ["a", "b", "c"]}'])

    const config = { ITEMS: [] as string[] }

    loadConfig("config.json", { config, type: "lljson" }, (ok) => {
      expect(ok).toBe(true)
      expect(config.ITEMS).toEqual(["a", "b", "c"])
    })
  })

  it("falls back to yml parser when type is yml even with flag enabled", () => {
    notecard("settings.yml", ["KEY: value"])

    const config = { KEY: "" }

    loadConfig("settings.yml", { config, type: "yml" }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KEY).toBe("value")
    })
  })

  it("defaults to yml parser when type is omitted", () => {
    notecard("settings.yml", ["KEY: value"])

    const config = { KEY: "" }

    loadConfig("settings.yml", { config }, (ok) => {
      expect(ok).toBe(true)
      expect(config.KEY).toBe("value")
    })
  })
})
