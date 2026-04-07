// Mock constants
const NAK_VALUE = "\x15"
const EOF_VALUE = "\x04"
const CHANGED_INVENTORY_VALUE = 1
const NULL_KEY_VALUE = "00000000-0000-0000-0000-000000000000"
const DEBUG_CHANNEL_VALUE = 2147483647
// Internal state
let notecards: Record<string, string[]> = {}
let inventoryKeys: Record<string, string> = {}
let eventHandlers: Record<string, ((...args: any[]) => void)[]> = {}
let timerCallbacks: Set<(...args: any[]) => void> = new Set()
let keyCounter = 0

function nextKey(): string {
  keyCounter++

  return `00000000-0000-0000-0000-${String(keyCounter).padStart(12, "0")}`
}

// ---
// Mock LLEvents
// ---

const mockLLEvents = {
  on(event: string, callback: (...args: any[]) => void) {
    if (!eventHandlers[event]) {
      eventHandlers[event] = []
    }
    eventHandlers[event].push(callback)
    return callback
  },

  off(event: string, callback: (...args: any[]) => void) {
    const handlers = eventHandlers[event]
    if (!handlers) return false

    const index = handlers.indexOf(callback)
    if (index === -1) return false

    handlers.splice(index, 1)
    return true
  },

  once(event: string, callback: (...args: any[]) => void) {
    const wrapper = (...args: any[]) => {
      mockLLEvents.off(event, wrapper)
      callback(...args)
    }

    return mockLLEvents.on(event, wrapper)
  },

  handlers(event: string) {
    return eventHandlers[event] ?? []
  },

  eventNames() {
    return Object.keys(eventHandlers).filter((e) => eventHandlers[e].length > 0)
  },
}

// ---
// Mock LLTimers
// ---

const mockLLTimers = {
  every(_seconds: number, callback: (...args: any[]) => void) {
    timerCallbacks.add(callback)
    return callback
  },

  once(_seconds: number, callback: (...args: any[]) => void) {
    timerCallbacks.add(callback)
    return callback
  },

  off(callback: (...args: any[]) => void) {
    return timerCallbacks.delete(callback)
  },
}

// ---
// Mock ll namespace
// ---

const mockLL: Record<string, (...args: any[]) => any> = {
  GetNotecardLineSync(name: string, lineNum: number): string {
    const lines = notecards[name]
    if (!lines) return NAK_VALUE
    if (lineNum >= lines.length) return EOF_VALUE
    return lines[lineNum]
  },

  GetNotecardLine(_name: string, _lineNum: number): string {
    return nextKey()
  },

  GetInventoryKey(name: string): string {
    if (!inventoryKeys[name]) {
      inventoryKeys[name] = nextKey()
    }
    return inventoryKeys[name]
  },

  Say() {},
  RegionSay() {},
  RegionSayTo() {},
  OwnerSay() {},
  Whisper() {},
  Shout() {},
  Listen() {
    return 0
  },
  ListenRemove() {},
  ListenControl() {},
  SetObjectName() {},
  GetOwner() {
    return NULL_KEY_VALUE
  },
  GetKey() {
    return NULL_KEY_VALUE
  },

  // Dataserver functions
  RequestAgentData(): string {
    return nextKey()
  },
  RequestDisplayName(): string {
    return nextKey()
  },
  RequestSimulatorData(): string {
    return nextKey()
  },
  RequestInventoryData(): string {
    return nextKey()
  },
  GetNumberOfNotecardLines(): string {
    return nextKey()
  },
  FindNotecardTextCount(): string {
    return nextKey()
  },

  // HTTP
  HTTPRequest(): string {
    return nextKey()
  },

  // Permissions
  RequestPermissions() {},
  TransferLindenDollars(): string {
    return nextKey()
  },

  // KV store
  CreateKeyValue(): string {
    return nextKey()
  },
  ReadKeyValue(): string {
    return nextKey()
  },
  UpdateKeyValue(): string {
    return nextKey()
  },
  DeleteKeyValue(): string {
    return nextKey()
  },
  DataSizeKeyValue(): string {
    return nextKey()
  },

  // Dialog/TextBox
  Dialog() {},
  TextBox() {},

  // Sensor
  Sensor() {},
}

// ---
// Mock lljson
// ---

const mockLljson = {
  encode(value: unknown): string {
    return JSON.stringify(value)
  },

  decode(text: string): any {
    return JSON.parse(text)
  },

  slencode(value: unknown): string {
    return JSON.stringify(value)
  },

  sldecode(text: string): any {
    return JSON.parse(text)
  },
}

// ---
// Mock tonumber
// ---

function mockToNumber(s: string, base?: number): number | undefined {
  const n = base !== undefined ? parseInt(s, base) : Number(s)
  return isNaN(n) ? undefined : n
}

// ---
// Mock coroutine namespace
// ---

let coroutineYieldValue: any = undefined

const mockCoroutine = {
  create(fn: (...args: any[]) => any) {
    return { __fn: fn, __status: "suspended" } as any
  },

  resume(co: any, ...args: any[]) {
    co.__lastResumeArgs = args

    // Initial spawn resume, actually run the function
    if (co.__fn && co.__status === "suspended") {
      co.__status = "running"
      co.__fn(...args)
      co.__status = "dead"
    }

    return [true, ...args]
  },

  running(): any {
    return { __mock: true }
  },

  yield(..._args: any[]): any {
    return coroutineYieldValue
  },

  status(co: any): string {
    return co?.__status ?? "suspended"
  },

  isyieldable(): boolean {
    return true
  },

  wrap(fn: (...args: any[]) => any) {
    return fn
  },

  close(co: any) {
    if (co) co.__status = "dead"
    return [true, undefined]
  },
}

// ---
// Globals tracking
// ---

const GLOBAL_KEYS = [
  "ll",
  "LLEvents",
  "LLTimers",
  "NAK",
  "EOF",
  "CHANGED_INVENTORY",
  "NULL_KEY",
  "DEBUG_CHANNEL",
  "tonumber",
  "lljson",
  "coroutine",
  "$multi",
  "CONFIG_YAML_PARSER",
  "CONFIG_LLJSON_PARSER",
  "YIELD_DATASERVER_AGENT",
  "YIELD_DATASERVER_DISPLAY_NAME",
  "YIELD_DATASERVER_SIM",
  "YIELD_DATASERVER_INVENTORY",
  "YIELD_DATASERVER_NOTECARD",
  "YIELD_DATASERVER_TEXT_COUNT",
  "YIELD_KV",
  "YIELD_DIALOG",
  "YIELD_HTTP",
  "httpRequest",
  "YIELD_PERMISSIONS",
  "YIELD_SENSOR",
] as const

const savedGlobals: Record<string, any> = {}

/**
 * Install mock globals into the test environment.
 * Call in `beforeEach`.
 */
export function setup(): void {
  const g = globalThis as any

  // Save any existing values
  for (const key of GLOBAL_KEYS) {
    if (key in g) {
      savedGlobals[key] = g[key]
    }
  }

  g.ll = new Proxy(mockLL, {
    get(target, prop: string) {
      return target[prop] ?? (() => {})
    },
  })

  g.LLEvents = mockLLEvents
  g.LLTimers = mockLLTimers
  g.NAK = NAK_VALUE
  g.EOF = EOF_VALUE
  g.CHANGED_INVENTORY = CHANGED_INVENTORY_VALUE
  g.NULL_KEY = NULL_KEY_VALUE
  g.DEBUG_CHANNEL = DEBUG_CHANNEL_VALUE
  g.tonumber = mockToNumber
  g.lljson = mockLljson
  g.coroutine = { ...mockCoroutine }
  g.$multi = (...args: any[]) => args
  g.CONFIG_YAML_PARSER = true
  g.CONFIG_LLJSON_PARSER = false
  g.YIELD_DATASERVER_AGENT = true
  g.YIELD_DATASERVER_DISPLAY_NAME = true
  g.YIELD_DATASERVER_SIM = true
  g.YIELD_DATASERVER_INVENTORY = true
  g.YIELD_DATASERVER_NOTECARD = true
  g.YIELD_DATASERVER_TEXT_COUNT = true
  g.YIELD_KV = true
  g.YIELD_DIALOG = true
  g.YIELD_HTTP = true
  g.YIELD_PERMISSIONS = true
  g.YIELD_SENSOR = true
}

/**
 * Remove SLua mock globals and reset all internal state.
 * Call in `afterEach`.
 */
export function teardown(): void {
  const g = globalThis as any

  for (const key of GLOBAL_KEYS) {
    if (key in savedGlobals) {
      g[key] = savedGlobals[key]
      delete savedGlobals[key]
    } else {
      delete g[key]
    }
  }

  notecards = {}
  inventoryKeys = {}
  eventHandlers = {}
  timerCallbacks = new Set()
  keyCounter = 0
  coroutineYieldValue = undefined
}

/**
 * Register notecard content for `ll.GetNotecardLineSync` to return.
 *
 * @example
 * ```ts
 * // From a multi-line string
 * notecard("settings.yml", "CHANNEL: -123\nMESSAGE: Hello")
 *
 * // From an array of lines
 * notecard("settings.yml", ["CHANNEL: -123", "MESSAGE: Hello"])
 * ```
 */
export function notecard(name: string, content: string | string[]): void {
  const lines = typeof content === "string" ? content.split("\n") : content
  notecards[name] = lines

  // Update inventory key so onConfigChanged detects the change
  inventoryKeys[name] = nextKey()
}

/**
 * Trigger an event on the mock `LLEvents`, calling all registered handlers.
 *
 * @example
 * ```ts
 * emit("changed", CHANGED_INVENTORY)
 * emit("dataserver", requestId, "data")
 * ```
 */
export function emit(event: string, ...args: any[]): void {
  const handlers = eventHandlers[event]
  if (!handlers) return

  // Copy to avoid issues if handlers modify the array (e.g., off() inside once())
  // oxlint-disable-next-line unicorn/no-useless-spread
  for (const handler of [...handlers]) {
    handler(...args)
  }
}

/**
 * Fire all pending timer callbacks and clear the set.
 * Simulates time passing in tests.
 *
 * @example
 * ```ts
 * LLTimers.once(5, () => { ll.Say(0, "done") })
 * tick() // fires the callback immediately
 * ```
 */
export function tick(): void {
  const callbacks = [...timerCallbacks]
  timerCallbacks.clear()

  for (const callback of callbacks) {
    callback()
  }
}

/**
 * Set the value that `coroutine.yield()` will return in the mock.
 * Call this before triggering code that will yield.
 */
export function setCoroutineYieldValue(value: any): void {
  coroutineYieldValue = value
}
