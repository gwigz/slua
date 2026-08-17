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
// Mock Vector / Quaternion / UUID
//
// Mirrors the SLua globals declared in @gwigz/slua-types closely enough for
// unit tests; quaternion math is intentionally simple (slerp is nlerp).
// ---

class MockVector {
  constructor(
    public x: number,
    public y: number,
    public z: number = 0,
  ) {}

  static create(x: number, y: number, z = 0) {
    return new MockVector(x, y, z)
  }

  static get zero() {
    return new MockVector(0, 0, 0)
  }

  static get one() {
    return new MockVector(1, 1, 1)
  }

  static magnitude(vec: MockVector): number {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
  }

  static normalize(vec: MockVector): MockVector {
    const magnitude = MockVector.magnitude(vec)
    return new MockVector(vec.x / magnitude, vec.y / magnitude, vec.z / magnitude)
  }

  static cross(a: MockVector, b: MockVector): MockVector {
    return new MockVector(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)
  }

  static dot(a: MockVector, b: MockVector): number {
    return a.x * b.x + a.y * b.y + a.z * b.z
  }

  static angle(a: MockVector, b: MockVector, axis?: MockVector): number {
    const cos = MockVector.dot(a, b) / (MockVector.magnitude(a) * MockVector.magnitude(b))
    // Clamp: float rounding can push parallel vectors past ±1, acos -> NaN
    const angle = Math.acos(Math.min(Math.max(cos, -1), 1))

    if (axis !== undefined && MockVector.dot(axis, MockVector.cross(a, b)) < 0) {
      return -angle
    }

    return angle
  }

  static floor(vec: MockVector): MockVector {
    return new MockVector(Math.floor(vec.x), Math.floor(vec.y), Math.floor(vec.z))
  }

  static ceil(vec: MockVector): MockVector {
    return new MockVector(Math.ceil(vec.x), Math.ceil(vec.y), Math.ceil(vec.z))
  }

  static abs(vec: MockVector): MockVector {
    return new MockVector(Math.abs(vec.x), Math.abs(vec.y), Math.abs(vec.z))
  }

  static sign(vec: MockVector): MockVector {
    return new MockVector(Math.sign(vec.x), Math.sign(vec.y), Math.sign(vec.z))
  }

  static clamp(vec: MockVector, min: MockVector, max: MockVector): MockVector {
    return new MockVector(
      Math.min(Math.max(vec.x, min.x), max.x),
      Math.min(Math.max(vec.y, min.y), max.y),
      Math.min(Math.max(vec.z, min.z), max.z),
    )
  }

  static max(...vecs: MockVector[]): MockVector {
    return new MockVector(
      Math.max(...vecs.map((v) => v.x)),
      Math.max(...vecs.map((v) => v.y)),
      Math.max(...vecs.map((v) => v.z)),
    )
  }

  static min(...vecs: MockVector[]): MockVector {
    return new MockVector(
      Math.min(...vecs.map((v) => v.x)),
      Math.min(...vecs.map((v) => v.y)),
      Math.min(...vecs.map((v) => v.z)),
    )
  }

  static lerp(a: MockVector, b: MockVector, t: number): MockVector {
    return new MockVector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t)
  }

  add(other: MockVector): MockVector {
    return new MockVector(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  sub(other: MockVector): MockVector {
    return new MockVector(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  neg(): MockVector {
    return new MockVector(-this.x, -this.y, -this.z)
  }

  mul(other: number | MockVector | MockQuaternion): MockVector {
    if (typeof other === "number") {
      return new MockVector(this.x * other, this.y * other, this.z * other)
    }
    if (other instanceof MockQuaternion) {
      return rotateByQuaternion(this, other)
    }
    return new MockVector(this.x * other.x, this.y * other.y, this.z * other.z)
  }

  div(other: number | MockVector | MockQuaternion): MockVector {
    if (typeof other === "number") {
      return new MockVector(this.x / other, this.y / other, this.z / other)
    }
    if (other instanceof MockQuaternion) {
      return rotateByQuaternion(this, MockQuaternion.conjugate(other))
    }
    return new MockVector(this.x / other.x, this.y / other.y, this.z / other.z)
  }

  toString(): string {
    return `<${this.x}, ${this.y}, ${this.z}>`
  }
}

function rotateByQuaternion(vec: MockVector, quat: MockQuaternion): MockVector {
  // v' = v + 2s(r x v) + 2(r x (r x v)), where r is the quaternion's vector part
  const r = new MockVector(quat.x, quat.y, quat.z)
  const rxv = MockVector.cross(r, vec)
  const rxrxv = MockVector.cross(r, rxv)

  return vec.add(rxv.mul(2 * quat.s)).add(rxrxv.mul(2))
}

class MockQuaternion {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public s: number,
  ) {}

  static create(x: number, y: number, z: number, s: number) {
    return new MockQuaternion(x, y, z, s)
  }

  static get identity() {
    return new MockQuaternion(0, 0, 0, 1)
  }

  static magnitude(quat: MockQuaternion): number {
    return Math.sqrt(quat.x * quat.x + quat.y * quat.y + quat.z * quat.z + quat.s * quat.s)
  }

  static normalize(quat: MockQuaternion): MockQuaternion {
    const magnitude = MockQuaternion.magnitude(quat)
    if (magnitude === 0) return MockQuaternion.identity

    return new MockQuaternion(
      quat.x / magnitude,
      quat.y / magnitude,
      quat.z / magnitude,
      quat.s / magnitude,
    )
  }

  static dot(a: MockQuaternion, b: MockQuaternion): number {
    return a.x * b.x + a.y * b.y + a.z * b.z + a.s * b.s
  }

  static slerp(a: MockQuaternion, b: MockQuaternion, t: number): MockQuaternion {
    // nlerp: fine for tests, not a true slerp
    const sign = MockQuaternion.dot(a, b) < 0 ? -1 : 1

    return MockQuaternion.normalize(
      new MockQuaternion(
        a.x + (b.x * sign - a.x) * t,
        a.y + (b.y * sign - a.y) * t,
        a.z + (b.z * sign - a.z) * t,
        a.s + (b.s * sign - a.s) * t,
      ),
    )
  }

  static conjugate(quat: MockQuaternion): MockQuaternion {
    return new MockQuaternion(-quat.x, -quat.y, -quat.z, quat.s)
  }

  static tofwd(quat: MockQuaternion): MockVector {
    return rotateByQuaternion(new MockVector(1, 0, 0), quat)
  }

  static toleft(quat: MockQuaternion): MockVector {
    return rotateByQuaternion(new MockVector(0, 1, 0), quat)
  }

  static toup(quat: MockQuaternion): MockVector {
    return rotateByQuaternion(new MockVector(0, 0, 1), quat)
  }

  add(other: MockQuaternion): MockQuaternion {
    return new MockQuaternion(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z,
      this.s + other.s,
    )
  }

  sub(other: MockQuaternion): MockQuaternion {
    return new MockQuaternion(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z,
      this.s - other.s,
    )
  }

  neg(): MockQuaternion {
    return new MockQuaternion(-this.x, -this.y, -this.z, -this.s)
  }

  mul(other: MockQuaternion): MockQuaternion {
    // SLua order: v * (a * b) rotates by a then b, i.e. the Hamilton
    // product b * a
    return hamiltonProduct(other, this)
  }

  div(other: MockQuaternion): MockQuaternion {
    return hamiltonProduct(MockQuaternion.conjugate(other), this)
  }

  toString(): string {
    return `<${this.x}, ${this.y}, ${this.z}, ${this.s}>`
  }
}

function hamiltonProduct(p: MockQuaternion, q: MockQuaternion): MockQuaternion {
  return new MockQuaternion(
    p.s * q.x + q.s * p.x + (p.y * q.z - p.z * q.y),
    p.s * q.y + q.s * p.y + (p.z * q.x - p.x * q.z),
    p.s * q.z + q.s * p.z + (p.x * q.y - p.y * q.x),
    p.s * q.s - p.x * q.x - p.y * q.y - p.z * q.z,
  )
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

class MockUUID {
  private value: string

  constructor(value?: string | MockUUID) {
    const str = (value === undefined ? NULL_KEY_VALUE : String(value)).toLowerCase()

    // The real uuid.create throws on strings that are not valid UUIDs
    if (!UUID_PATTERN.test(str)) {
      throw new Error(`invalid UUID "${str}"`)
    }

    this.value = str
  }

  static create(value?: string | MockUUID) {
    return new MockUUID(value)
  }

  get istruthy(): boolean {
    return this.value !== NULL_KEY_VALUE
  }

  get bytes(): string {
    const hex = this.value.replace(/-/g, "")
    let out = ""

    for (let i = 0; i < hex.length; i += 2) {
      out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16))
    }

    return out
  }

  toString(): string {
    return this.value
  }
}

// ---
// Chat capture
// ---

export interface ChatMessage {
  func: "Say" | "Whisper" | "Shout" | "OwnerSay" | "RegionSay" | "RegionSayTo"
  channel: number
  text: string
  /** Only set for RegionSayTo */
  target?: string
}

const chatLog: ChatMessage[] = []

/**
 * All chat sent through the mock `ll` since the last `setup()`/`teardown()`.
 *
 * @example
 * ```ts
 * ll.Say(0, "hello")
 * expect(chatMessages()).toEqual([{ func: "Say", channel: 0, text: "hello" }])
 * ```
 */
export function chatMessages(): readonly ChatMessage[] {
  return chatLog
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

  Say(channel: number, text: string) {
    chatLog.push({ func: "Say", channel, text })
  },
  RegionSay(channel: number, text: string) {
    chatLog.push({ func: "RegionSay", channel, text })
  },
  RegionSayTo(target: any, channel: number, text: string) {
    chatLog.push({ func: "RegionSayTo", channel, text, target: String(target) })
  },
  OwnerSay(text: string) {
    chatLog.push({ func: "OwnerSay", channel: 0, text })
  },
  Whisper(channel: number, text: string) {
    chatLog.push({ func: "Whisper", channel, text })
  },
  Shout(channel: number, text: string) {
    chatLog.push({ func: "Shout", channel, text })
  },
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
  "Vector",
  "Quaternion",
  "UUID",
  "vector",
  "quaternion",
  "uuid",
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
  "YIELD_PERMISSIONS",
  "YIELD_SENSOR",
  "HTTP_METHOD",
  "HTTP_MIMETYPE",
  "HTTP_BODY_MAXLENGTH",
  "HTTP_VERIFY_CERT",
  "HTTP_VERBOSE_THROTTLE",
  "HTTP_CUSTOM_HEADER",
  "HTTP_PRAGMA_NO_CACHE",
  "HTTP_USER_AGENT",
  "HTTP_ACCEPT",
  "HTTP_EXTENDED_ERROR",
] as const

const savedGlobals: Record<string, any> = {}

/**
 * Install mock globals into the test environment.
 * Call in `beforeEach`.
 */
export function setup(): void {
  const g = globalThis as any

  // Truncate in place so references from chatMessages() stay live
  chatLog.length = 0

  // Save any existing values
  for (const key of GLOBAL_KEYS) {
    if (key in g) {
      savedGlobals[key] = g[key]
    }
  }

  // Fresh copy per setup, so per-test overrides like `ll.Foo = ...` cannot
  // leak into later tests (same pattern as coroutine below)
  g.ll = new Proxy({ ...mockLL } as Record<string, (...args: any[]) => any>, {
    get(target, prop: string) {
      return target[prop] ?? (() => {})
    },
  })

  g.LLEvents = mockLLEvents
  g.LLTimers = mockLLTimers
  g.Vector = MockVector
  g.Quaternion = MockQuaternion
  g.UUID = MockUUID
  // SLua's runtime globals are lowercase; the tstl plugin maps Vector -> vector
  g.vector = MockVector
  g.quaternion = MockQuaternion
  g.uuid = MockUUID
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
  g.HTTP_METHOD = 0
  g.HTTP_MIMETYPE = 1
  g.HTTP_BODY_MAXLENGTH = 2
  g.HTTP_VERIFY_CERT = 3
  g.HTTP_VERBOSE_THROTTLE = 4
  g.HTTP_CUSTOM_HEADER = 5
  g.HTTP_PRAGMA_NO_CACHE = 6
  g.HTTP_USER_AGENT = 7
  g.HTTP_ACCEPT = 8
  g.HTTP_EXTENDED_ERROR = 9
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
  chatLog.length = 0
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
