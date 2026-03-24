// Auto-generated from slua_definitions.yaml and lsl_definitions.yaml
// Do not edit manually.
/// <reference types="@typescript-to-lua/language-extensions" />
/**
 * A set of four float values. Used to represent rotations and orientations.
 * @customConstructor quaternion.create
 */
declare class Quaternion {
  constructor(x: number, y: number, z: number, s: number)
  readonly x: number
  readonly y: number
  readonly z: number
  readonly s: number
  add: LuaAdditionMethod<quaternion, quaternion>
  sub: LuaSubtractionMethod<quaternion, quaternion>
  mul: LuaMultiplicationMethod<quaternion, quaternion>
  div: LuaDivisionMethod<quaternion, quaternion>
  neg: LuaNegationMethod<quaternion>
}

declare type quaternion = Quaternion

/**
 * A 128‑bit unique identifier formatted as 36 hexadecimal characters (8‑4‑4‑4‑12), e.g. "A822FF2B-FF02-461D-B45D-DCD10A2DE0C2".
 * @customConstructor uuid.create
 */
declare class UUID {
  constructor(value: string | undefined | buffer | uuid)
  /** Returns true if the UUID is not the null UUID (all zeros) */
  readonly istruthy: boolean
  /** Returns the raw 16-byte binary string of the UUID, or nil if the UUID is not in a compressed state */
  readonly bytes: string
}

declare type uuid = UUID

/**
 * A set of three float values. Used to represent colors (RGB), positions, directions, and velocities.
 * @customConstructor vector.create
 */
declare class Vector {
  constructor(x: number, y: number, z?: number)
  readonly x: number
  readonly y: number
  readonly z: number
  /** Native component-wise addition */
  add: LuaAdditionMethod<vector, vector>
  /** Native component-wise subtraction */
  sub: LuaSubtractionMethod<vector, vector>
  /** Unary negation */
  neg: LuaNegationMethod<vector>
  /** Multiplication: vector * vector / number -> vector (Scale), vector * quaternion -> vector (Rotation) */
  mul: LuaMultiplicationMethod<number, vector> &
    LuaMultiplicationMethod<vector, vector> &
    LuaMultiplicationMethod<quaternion, vector>
  /** Division: vector / number -> vector (Scale), vector / quaternion -> vector (Rotation by inverse) */
  div: LuaDivisionMethod<number, vector> &
    LuaDivisionMethod<vector, vector> &
    LuaDivisionMethod<quaternion, vector>
  /** LSL-style modulo: vector % vector -> vector (Cross Product) */
  mod: LuaModuloMethod<vector, vector>
}

declare type vector = Vector

/** Event detection class providing access to detected object/avatar information */
declare interface DetectedEvent {
  readonly index: number
  readonly valid: boolean
  readonly canAdjustDamage: boolean
  /** Changes the amount of damage to be delivered by this damage event. */
  adjustDamage(damage: number): void
  /** Returns a list containing the current damage for the event, the damage type and the original damage delivered. */
  getDamage(): list
  /**
   * Returns the grab offset of a user touching the object.
   * Returns <0.0, 0.0, 0.0> if Number is not a valid object.
   */
  getGrab(): vector
  /**
   * Returns TRUE if detected object or agent Number has the same user group active as this object.
   * It will return FALSE if the object or agent is in the group, but the group is not active.
   */
  getGroup(): number
  /**
   * Returns the key of detected object or avatar number.
   * Returns NULL_KEY if Number is not a valid index.
   */
  getKey(): uuid
  /**
   * Returns the link position of the triggered event for touches and collisions only.
   * 0 for a non-linked object, 1 for the root of a linked object, 2 for the first child, etc.
   */
  getLinkNumber(): number
  /**
   * Returns the name of detected object or avatar number.
   * Returns the name of detected object number.
   * Returns empty string if Number is not a valid index.
   */
  getName(): string
  /**
   * Returns the key of detected object's owner.
   * Returns invalid key if Number is not a valid index.
   */
  getOwner(): uuid
  /**
   * Returns the position of detected object or avatar number.
   * Returns <0.0, 0.0, 0.0> if Number is not a valid index.
   */
  getPos(): vector
  /** Returns the key for the rezzer of the detected object. */
  getRezzer(): uuid
  /**
   * Returns the rotation of detected object or avatar number.
   * Returns <0.0, 0.0, 0.0, 1.0> if Number is not a valid offset.
   */
  getRot(): quaternion
  /**
   * Returns the surface bi-normal for a triggered touch event.
   * Returns a vector that is the surface bi-normal (tangent to the surface) where the touch event was triggered.
   */
  getTouchBinormal(): vector
  /** Returns the index of the face where the avatar clicked in a triggered touch event. */
  getTouchFace(): number
  /**
   * Returns the surface normal for a triggered touch event.
   * Returns a vector that is the surface normal (perpendicular to the surface) where the touch event was triggered.
   */
  getTouchNormal(): vector
  /**
   * Returns the position, in region coordinates, where the object was touched in a triggered touch event.
   * Unless it is a HUD, in which case it returns the position relative to the attach point.
   */
  getTouchPos(): vector
  /**
   * Returns a vector that is the surface coordinates where the prim was touched.
   * The X and Y vector positions contain the horizontal (S) and vertical (T) face coordinates respectively.
   * Each component is in the interval [0.0, 1.0].
   * TOUCH_INVALID_TEXCOORD is returned if the surface coordinates cannot be determined (e.g. when the viewer does not support this function).
   */
  getTouchST(): vector
  /**
   * Returns a vector that is the texture coordinates for where the prim was touched.
   * The X and Y vector positions contain the U and V face coordinates respectively.
   * TOUCH_INVALID_TEXCOORD is returned if the touch UV coordinates cannot be determined (e.g. when the viewer does not support this function).
   */
  getTouchUV(): vector
  /**
   * Returns the type (AGENT, ACTIVE, PASSIVE, SCRIPTED) of detected object.
   * Returns 0 if number is not a valid index.
   * Note that number is a bit-field, so comparisons need to be a bitwise checked. e.g.:
   * integer iType = llDetectedType(0);
   * {
   * 	// ...do stuff with the agent
   * }
   */
  getType(): number
  /**
   * Returns the velocity of the detected object Number.
   * Returns<0.0, 0.0, 0.0> if Number is not a valid offset.
   */
  getVel(): vector
}

/** @noSelf */
declare interface LLEventMap {
  at_rot_target: (
    targetNumber: number,
    targetRotation: quaternion,
    currentRotation: quaternion,
  ) => void
  at_target: (targetNumber: number, targetPosition: vector, currentPosition: vector) => void
  attach: (avatarId: uuid) => void
  changed: (changed: number) => void
  collision: (detected: DetectedEvent[]) => void
  collision_end: (detected: DetectedEvent[]) => void
  collision_start: (detected: DetectedEvent[]) => void
  control: (avatarId: uuid, levels: number, edges: number) => void
  dataserver: (requestId: uuid, data: string) => void
  email: (
    time: string,
    address: string,
    subject: string,
    body: string,
    numberRemaining: number,
  ) => void
  experience_permissions: (agentId: uuid) => void
  experience_permissions_denied: (agentId: uuid, reason: number) => void
  final_damage: (detected: DetectedEvent[]) => void
  game_control: (id: uuid, buttons: number, axes: number[]) => void
  http_request: (httpRequestId: uuid, httpMethod: string, body: string) => void
  http_response: (httpRequestId: uuid, status: number, metadata: list, body: string) => void
  land_collision: (position: vector) => void
  land_collision_end: (position: vector) => void
  land_collision_start: (position: vector) => void
  link_message: (sendersLink: number, value: number, text: string, id: string) => void
  linkset_data: (action: number, name: string, value: string) => void
  listen: (channel: number, name: string, id: uuid, text: string) => void
  money: (payer: uuid, amount: number) => void
  moving_end: () => void
  moving_start: () => void
  no_sensor: () => void
  not_at_rot_target: () => void
  not_at_target: () => void
  object_rez: (rezzedObjectsId: uuid) => void
  on_damage: (detected: DetectedEvent[]) => void
  on_death: () => void
  on_rez: (startParameter: number) => void
  path_update: (type: number, reserved: list) => void
  remote_data: (
    eventType: number,
    channelId: uuid,
    messageId: uuid,
    sender: string,
    iData: number,
    sData: string,
  ) => void
  run_time_permissions: (permissionFlags: number) => void
  sensor: (detected: DetectedEvent[]) => void
  timer: () => void
  touch: (detected: DetectedEvent[]) => void
  touch_end: (detected: DetectedEvent[]) => void
  touch_start: (detected: DetectedEvent[]) => void
  transaction_result: (requestId: uuid, success: number, message: string) => void
}

/** 'rotation' is an alias for 'quaternion' */
declare type rotation = quaternion
declare type list = (string | number | vector | uuid | quaternion | boolean)[]
declare type LLDetectedEventName =
  | "collision"
  | "collision_end"
  | "collision_start"
  | "final_damage"
  | "on_damage"
  | "sensor"
  | "touch"
  | "touch_end"
  | "touch_start"
declare type LLNonDetectedEventName =
  | "at_rot_target"
  | "at_target"
  | "attach"
  | "changed"
  | "control"
  | "dataserver"
  | "email"
  | "experience_permissions"
  | "experience_permissions_denied"
  | "game_control"
  | "http_request"
  | "http_response"
  | "land_collision"
  | "land_collision_end"
  | "land_collision_start"
  | "link_message"
  | "linkset_data"
  | "listen"
  | "money"
  | "moving_end"
  | "moving_start"
  | "no_sensor"
  | "not_at_rot_target"
  | "not_at_target"
  | "object_rez"
  | "on_death"
  | "on_rez"
  | "path_update"
  | "remote_data"
  | "run_time_permissions"
  | "timer"
  | "transaction_result"
declare type LLEventName = keyof LLEventMap
declare type LLEventHandler = (this: void, ...args: any[]) => void
declare type LLDetectedEventHandler = (this: void, detected: DetectedEvent[]) => void
/** Callback type for LLTimers.every() - receives scheduled time and interval */
declare type LLTimerEveryCallback = (this: void, scheduled: number, interval: number) => void
/** Callback type for LLTimers.once() - receives scheduled time */
declare type LLTimerOnceCallback = (this: void, scheduled: number) => void
/** Union of timer callback types */
declare type LLTimerCallback = LLTimerEveryCallback | LLTimerOnceCallback
/** Date/time table structure used by os.date and os.time */
declare type OsDateTime = {
  year: number
  month: number
  day: number
  hour?: number
  min?: number
  sec?: number
  wday?: number
  yday?: number
  isdst?: boolean
}
/** Configuration options for lljson encoding */
declare type LLJsonEncodeOptions = {
  tight?: boolean
  skip_tojson?: boolean
  allow_sparse?: boolean
  replacer: ((this: void, key: any, value: any, parent: any[] | undefined) => any) | undefined
}
declare type LLJsonDecodeReviverWithoutPath = (
  this: void,
  key: string | number,
  value: any,
  parent: any[] | undefined,
  ctx: any[],
) => any
declare type LLJsonDecodeOptionsWithoutPath =
  | { track_path?: false; reviver?: LLJsonDecodeReviverWithoutPath }
  | LLJsonDecodeReviverWithoutPath
declare type LLJsonDecodeOptionsWithPath = {
  track_path: true
  reviver: (
    this: void,
    key: string | number,
    value: any,
    parent: any[] | undefined,
    ctx: { path: (string | number)[] },
  ) => any
}
/** Configuration options for lljson decoding */
declare type LLJsonDecodeOptions = LLJsonDecodeOptionsWithoutPath | LLJsonDecodeOptionsWithPath

/** Event registration and management class for Second Life events */
declare interface LLEvents {
  /** Registers a callback for an event. Returns the callback. */
  on<E extends keyof LLEventMap>(event: E, callback: LLEventMap[E]): LLEventMap[E]
  /** Unregisters a callback. Returns true if found and removed. */
  off<E extends keyof LLEventMap>(event: E, callback: LLEventMap[E]): boolean
  /** Registers a one-time callback. Returns the wrapper function. */
  once<E extends keyof LLEventMap>(event: E, callback: LLEventMap[E]): LLEventMap[E]
  /** Returns a list of all handlers for a specific event. */
  handlers<E extends keyof LLEventMap>(event: E): LLEventMap[E][]
  /** Returns a list of all event names that have handlers. */
  eventNames(): (keyof LLEventMap)[]
}

/** Timer management class for scheduling periodic and one-time callbacks */
declare interface LLTimers {
  /** Registers a callback to be called every N seconds. Returns the callback. */
  every(seconds: number, callback: LLTimerEveryCallback): LLTimerCallback
  /** Registers a callback to be called once after N seconds. Returns the callback. */
  once(seconds: number, callback: LLTimerOnceCallback): LLTimerCallback
  /** Unregisters a timer callback. Returns true if found and removed. */
  off(callback: LLTimerCallback): boolean
}

/** rotation is an alias for quaternion. */
declare const rotation: typeof quaternion
/** Event registration and management singleton for Second Life events. */
declare const LLEvents: LLEvents
/** Timer management singleton for scheduling periodic and one-time callbacks. */
declare const LLTimers: LLTimers

/**
 * Dangerously executes a required module function
 * @noSelf
 */
declare function dangerouslyexecuterequiredmodule(f: (this: void, ...args: any[]) => any[]): any[]
/**
 * Creates a new uuid from a string, buffer, or existing uuid. Returns nil if the string is not a valid UUID, or the the buffer is shorter than 16 bytes.
 * @noSelf
 */
declare function touuid(val: string | undefined | buffer | uuid): uuid | undefined
/**
 * Converts a string to a vector, returns nil if invalid
 * @noSelf
 */
declare function tovector(val: string | undefined | vector): vector | undefined
/**
 * Converts a string to a quaternion, returns nil if invalid
 * @noSelf
 */
declare function toquaternion(val: string | undefined | quaternion): quaternion | undefined
/**
 * Converts a string to a rotation (quaternion), returns nil if invalid
 * @noSelf
 */
declare function torotation(val: string | undefined | quaternion): quaternion | undefined
/**
 * Checks if the value is truthy; if not, raises an error with the optional message.
 * @noSelf
 */
declare function assert<T>(value?: T, message?: string): T
/**
 * Raises an error with the specified object and optional call stack level.
 * @noSelf
 */
declare function error(obj: any, level?: number): never
/**
 * Returns the total heap size in kilobytes.
 * @noSelf
 */
declare function gcinfo(): number
/**
 * Returns the metatable for the specified object.
 * @noSelf
 */
declare function getmetatable(obj: any): Record<any, any> | undefined
/**
 * Returns the next key-value pair in the table traversal order.
 * @noSelf
 */
declare function next<K, V>(t: Record<K, V>, i?: K): LuaMultiReturn<[K, V]> | undefined
/**
 * Creates a new untyped userdata object with an optional metatable.
 * @noSelf
 */
declare function newproxy(mt?: boolean): any
/**
 * Prints all arguments to standard output using Tab as a separator.
 * @noSelf
 */
declare function print(...args: any[]): void
/**
 * Returns true if a and b have the same type and value.
 * @noSelf
 */
declare function rawequal(a: any, b: any): boolean
/**
 * Performs a table lookup bypassing metatables.
 * @noSelf
 */
declare function rawget<K, V>(t: Record<K, V>, k: K): V | undefined
/**
 * Assigns a value to a table field bypassing metatables.
 * @noSelf
 */
declare function rawset<K, V>(t: Record<K, V>, k: K, v: V): Record<K, V>
/**
 * Returns the length of a table or string bypassing metatables.
 * @noSelf
 */
declare function rawlen<K, V>(t: Record<any, any> | string): number
/**
 * Returns a subset of arguments or the number of arguments.
 * @noSelf
 */
declare function select(i: string | number, ...args: any[]): any
/**
 * Changes the metatable for the given table.
 * @noSelf
 */
declare function setmetatable(t: Record<any, any>, mt?: Record<any, any>): void
/**
 * Converts the input string to a number in the specified base.
 * @noSelf
 */
declare function tonumber(s: string, base?: number): number | undefined
/**
 * Converts the input object to a string.
 * @noSelf
 */
declare function tostring(obj: any): string
/**
 * Returns the type of the object as a string.
 * @noSelf
 */
declare function type(obj: any): string
/**
 * Returns an iterator for numeric key-value pairs in the table.
 * @noSelf
 */
declare function ipairs<V>(
  t: V[],
): LuaMultiReturn<
  [(this: void, arg0: V[], arg1: number) => LuaMultiReturn<[number | undefined, V]>, V[], number]
>
/**
 * Returns an iterator for all key-value pairs in the table.
 * @noSelf
 */
declare function pairs<K, V>(
  t: Record<K, V>,
): LuaMultiReturn<
  [(this: void, arg0: Record<K, V>, arg1: K) => LuaMultiReturn<[K | undefined, V]>, Record<K, V>, K]
>
/**
 * Calls function f with parameters args, returning success and function results or an error.
 * @noSelf
 */
declare function pcall(f: (...args: any[]) => any, ...args: any[][]): any
/**
 * Calls function f with parameters args, handling errors with e if they occur.
 * @noSelf
 */
declare function xpcall<E>(
  f: (...args: any[]) => any,
  e: (...args: any[]) => any,
  ...args: any[][]
): any
/**
 * Execute the named external module.
 * @noSelf
 */
declare function require(target: string): any
/**
 * Returns values from an array in the specified index range.
 * @noSelf
 */
declare function unpack<V>(a: V[], f?: number, t?: number): V[]

/** Bitwise operations library. */
/** @noSelf */
declare namespace bit32 {
  /** Shifts n by i bits to the right. If i is negative, a left shift is performed.Does an arithmetic shift: The most significant bit of n is propagated during the shift. */
  export function arshift(n: number, i: number): number

  /** Performs a bitwise AND operation on input numbers. */
  export function band(...args: number[]): number

  /** Returns the bitwise negation of the input number. */
  export function bnot(n: number): number

  /** Performs a bitwise OR operation on input numbers. */
  export function bor(...args: number[]): number

  /** Performs a bitwise XOR operation on input numbers. */
  export function bxor(...args: number[]): number

  /** Performs a bitwise AND operation on input numbers.Returns true if result is non-zero. */
  export function btest(...args: number[]): boolean

  /** Extracts bits from n at position field with width */
  export function extract(n: number, field: number, width?: number): number

  /** Rotates n by i bits to the left. If i is negative, a right rotate is performed. */
  export function lrotate(n: number, i: number): number

  /** Shifts n by i bits to the left. If i is negative, a right shift is performed. */
  export function lshift(n: number, i: number): number

  /** Replaces bits in n at position field with width using value v */
  export function replace(n: number, v: number, field: number, width?: number): number

  /** Rotates n by i bits to the right. If i is negative, a left rotate is performed. */
  export function rrotate(n: number, i: number): number

  /** Shifts n by i bits to the right. If i is negative, a left shift is performed. */
  export function rshift(n: number, i: number): number

  /** Wrap this number from float64 range to signed int32 range and truncate to integer. Makes integer arithmetic compatable with LSL. */
  export function s32(n: number): number

  /** Multiplies two signed 32-bit integers. Returns the result as a signed 32-bit integer, wrapping as necessary. Avoids precision loss ascociated with float64 multiplication. Compatible with LSL integer multiplication. */
  export function smul(a: number, b: number): number

  /** Count leading zeros */
  export function countlz(n: number): number

  /** Count trailing zeros */
  export function countrz(n: number): number

  /** Swap byte order */
  export function byteswap(n: number): number
}

/** Buffer manipulation library for binary data. */
/** @noSelf */
declare namespace buffer {
  /** Creates a buffer of the requested size with all bytes initialized to 0. */
  export function create(size: number): buffer

  /** Creates a buffer initialized to the contents of the string. */
  export function fromstring(str: string): buffer

  /** Returns the buffer data as a string. */
  export function tostring(b: buffer): string

  /** Reads a signed 8-bit integer from the buffer at the given offset. */
  export function readi8(b: buffer, offset: number): number

  /** Reads an unsigned 8-bit integer from the buffer at the given offset. */
  export function readu8(b: buffer, offset: number): number

  /** Reads a signed 16-bit integer from the buffer at the given offset. */
  export function readi16(b: buffer, offset: number): number

  /** Reads an unsigned 16-bit integer from the buffer at the given offset. */
  export function readu16(b: buffer, offset: number): number

  /** Reads a signed 32-bit integer from the buffer at the given offset. */
  export function readi32(b: buffer, offset: number): number

  /** Reads an unsigned 32-bit integer from the buffer at the given offset. */
  export function readu32(b: buffer, offset: number): number

  /** Reads a 32-bit floating-point number from the buffer at the given offset. */
  export function readf32(b: buffer, offset: number): number

  /** Reads a 64-bit floating-point number from the buffer at the given offset. */
  export function readf64(b: buffer, offset: number): number

  /** Writes a signed 8-bit integer to the buffer at the given offset. */
  export function writei8(b: buffer, offset: number, value: number): void

  /** Writes an unsigned 8-bit integer to the buffer at the given offset. */
  export function writeu8(b: buffer, offset: number, value: number): void

  /** Writes a signed 16-bit integer to the buffer at the given offset. */
  export function writei16(b: buffer, offset: number, value: number): void

  /** Writes an unsigned 16-bit integer to the buffer at the given offset. */
  export function writeu16(b: buffer, offset: number, value: number): void

  /** Writes a signed 32-bit integer to the buffer at the given offset. */
  export function writei32(b: buffer, offset: number, value: number): void

  /** Writes an unsigned 32-bit integer to the buffer at the given offset. */
  export function writeu32(b: buffer, offset: number, value: number): void

  /** Writes a 32-bit floating-point number to the buffer at the given offset. */
  export function writef32(b: buffer, offset: number, value: number): void

  /** Writes a 64-bit floating-point number to the buffer at the given offset. */
  export function writef64(b: buffer, offset: number, value: number): void

  /** Reads a string of the given length from the buffer at the specified offset. */
  export function readstring(b: buffer, offset: number, count: number): string

  /** Writes data from a string into the buffer at the specified offset. */
  export function writestring(b: buffer, offset: number, value: string, count?: number): void

  /** Returns the size of the buffer in bytes. */
  export function len(b: buffer): number

  /** Copies bytes from the source buffer into the target buffer. */
  export function copy(
    target: buffer,
    targetOffset: number,
    source: buffer,
    sourceOffset?: number,
    count?: number,
  ): void

  /** Fills the buffer with the specified value starting at the given offset. */
  export function fill(b: buffer, offset: number, value: number, count?: number): void

  /** Reads up to 32 bits from the buffer at the given offset. */
  export function readbits(b: buffer, bitOffset: number, bitCount: number): number

  /** Writes up to 32 bits to the buffer at the given offset. */
  export function writebits(b: buffer, bitOffset: number, bitCount: number, value: number): void
}

/** Coroutine manipulation library. */
/** @noSelf */
declare namespace coroutine {
  /** Returns a new coroutine that, when resumed, will run function f. */
  export function create(f: (this: void, ...args: any[]) => any[]): LuaThread

  /** Resumes a coroutine, returning true and results if successful, or false and an error. */
  export function resume(co: LuaThread, ...args: any[]): LuaMultiReturn<[boolean, ...args: any[]]>

  /** Returns the currently running coroutine, or nil if called from in the main coroutine. */
  export function running(): LuaThread | undefined

  /** Returns the status of the coroutine: "running", "suspended", "normal", or "dead". */
  export function status(co: LuaThread): "running" | "suspended" | "normal" | "dead"

  /** Creates a coroutine and returns a function that resumes it. */
  export function wrap(
    f: (this: void, ...args: any[]) => any[],
  ): (this: void, ...args: any[]) => any[]

  /** Yields the current coroutine, passing arguments to the resuming code. */
  export function yield(...args: any[]): any[]

  /** Returns true if the currently running coroutine can yield. */
  export function isyieldable(): boolean

  /** Closes a coroutine, returning true if successful or false and an error. */
  export function close(co: LuaThread): LuaMultiReturn<[boolean, string | undefined]>
}

/** Debug library for introspection. */
/** @noSelf */
declare namespace debug {
  /** Returns information about a stack frame or function based on specified format. */
  export function info(
    co: LuaThread | ((this: void, ...args: any[]) => any[]) | number,
    level: number,
    s: string,
  ): any[]

  /** Returns a human-readable call stack starting from the specified level. */
  export function traceback(co: LuaThread, msg?: string, level?: number): string

  /** Returns a table containing debug information about a function or stack frame. */
  export function getinfo(
    thread: LuaThread,
    function_: ((this: void, ...args: any[]) => any[]) | number,
    what: string,
  ): Record<any, any>

  /** Returns the name and value of a local variable at the specified stack level. */
  export function getlocal(level: number, index: number): string | any

  /** Sets the value of a local variable at the specified stack level. */
  export function setlocal(level: number, index: number, value: any): boolean

  /** Returns the name and value of an upvalue for a given function. */
  export function getupvalue(
    function_: (this: void, ...args: any[]) => any[],
    index: number,
  ): string | any

  /** Sets the value of an upvalue for a given function. */
  export function setupvalue(
    function_: (this: void, ...args: any[]) => any[],
    index: number,
    value: any,
  ): string

  /** Returns the metatable of the given value, if any. */
  export function getmetatable(value: any): Record<any, any> | undefined

  /** Sets the metatable for a given value. */
  export function setmetatable(value: any, metatable?: Record<any, any>): any
}

/** Base64 encoding/decoding library. */
/** @noSelf */
declare namespace llbase64 {
  /** Encodes a string or buffer to base64 */
  export function encode(data: string | buffer): string

  /** Decodes a base64 string to a string, or buffer if asBuffer is true. The output is truncated at the first decoding error. */
  export function decode(data: string, asBuffer?: false): string
}

/** JSON encoding/decoding library for Second Life. */
/** @noSelf */
declare namespace lljson {
  /** Encodes a Lua value as JSON. Raises an error if value contains unsupported types. */
  export function encode(value: any, options?: LLJsonEncodeOptions): string

  /** Decodes a JSON string to a Lua value. Raises an error if JSON is invalid. */
  export function decode(json: string, options?: LLJsonDecodeOptions): any

  /** Encodes a Lua value as JSON, preserving SL types. Use tight to encode more compactly. Raises an error if value contains unsupported types. */
  export function slencode(value: any, options?: LLJsonEncodeOptions): string

  /** Decodes a JSON string to a Lua value, preserving SL types. Raises an error if JSON is invalid. */
  export function sldecode(json: string, options?: LLJsonDecodeOptions): any

  /** A constant to pass for null to json encode. */
  export const null_: any
  /** A constant to return from a reviver/replacer replacer function to omit this item. */
  export const remove: any
  /** Metatable for declaring table as an array for json encode. */
  export const array_mt: { __jsonhint: string }
  /** Metatable for declaring table as an object for json encode. */
  export const object_mt: { __jsonhint: string }
  /** A constant to pass for an empty array to json encode. */
  export const empty_array: any[]
  /** A constant to pass for an empty object to json encode. */
  export const empty_object: any[]
}

/** Mathematical functions library. */
/** @noSelf */
declare namespace math {
  /** Returns the absolute value of n. */
  export function abs(n: number): number

  /** Returns the arc cosine of n in radians. */
  export function acos(n: number): number

  /** Returns the arc sine of n in radians. */
  export function asin(n: number): number

  /** Returns the arc tangent of n in radians. */
  export function atan(n: number): number

  /** Returns the arc tangent of y/x in radians, using the signs to determine the quadrant. */
  export function atan2(y: number, x: number): number

  /** Returns the smallest integer larger than or equal to n. */
  export function ceil(n: number): number

  /** Returns n clamped between min and max. */
  export function clamp(n: number, min: number, max: number): number

  /** Returns the cosine of n (n is in radians). */
  export function cos(n: number): number

  /** Returns the hyperbolic cosine of n. */
  export function cosh(n: number): number

  /** Converts n from radians to degrees. */
  export function deg(n: number): number

  /** Returns the base-e exponent of n. */
  export function exp(n: number): number

  /** Returns the largest integer smaller than or equal to n. */
  export function floor(n: number): number

  /** Returns the remainder of x modulo y, rounded towards zero. */
  export function fmod(x: number, y: number): number

  /** Returns m and e such that n = m * 2^e. */
  export function frexp(n: number): LuaMultiReturn<[number, number]>

  /** Returns s * 2^e. */
  export function ldexp(s: number, e: number): number

  /** Linearly interpolates between a and b using factor t. */
  export function lerp(a: number, b: number, t: number): number

  /** Returns the logarithm of n in the given base (default e). */
  export function log(n: number, base?: number): number

  /** Returns the base-10 logarithm of n. */
  export function log10(n: number): number

  /** Maps n from input range to output range. */
  export function map(
    n: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number

  /** Returns the maximum value from the given numbers. */
  export function max(n: number, ...args: number[]): number

  /** Returns the minimum value from the given numbers. */
  export function min(n: number, ...args: number[]): number

  /** Returns the integer and fractional parts of n. */
  export function modf(n: number): LuaMultiReturn<[number, number]>

  /** Returns Perlin noise value for the point (x, y, z). */
  export function noise(x: number, y?: number, z?: number): number

  /** Returns base to the power of exponent. */
  export function pow(base: number, exponent: number): number

  /** Converts n from degrees to radians. */
  export function rad(n: number): number

  /** Returns a random number within the given range. */
  export function random(min?: number, max?: number): number

  /** Sets the seed for the random number generator. */
  export function randomseed(seed: number): void

  /** Rounds n to the nearest integer. */
  export function round(n: number): number

  /** Returns -1 if n is negative, 1 if positive, and 0 if zero. */
  export function sign(n: number): number

  /** Returns the sine of n (n is in radians). */
  export function sin(n: number): number

  /** Returns the hyperbolic sine of n. */
  export function sinh(n: number): number

  /** Returns the square root of n. */
  export function sqrt(n: number): number

  /** Returns the tangent of n (n is in radians). */
  export function tan(n: number): number

  /** Returns the hyperbolic tangent of n. */
  export function tanh(n: number): number

  /** Returns true if n is NaN. */
  export function isnan(n: number): boolean

  /** Returns true if n is infinite. */
  export function isinf(n: number): boolean

  /** Returns true if n is finite. */
  export function isfinite(n: number): boolean

  /** The value of pi */
  export const pi: number
  /** A value larger than any other numeric value (infinity) */
  export const huge: number
}

/** Operating system facilities library. */
/** @noSelf */
declare namespace os {
  /** Returns a high-precision timestamp in seconds for measuring durations. */
  export function clock(): number

  /** Returns a table or string representation of the time based on the provided format. */
  export function date(s?: string, t?: number): string | OsDateTime | undefined

  /**
   * Returns the difference in seconds between two timestamps. Same as a - b.
   * @deprecated Same as a - b
   */
  export function difftime(a: number, b?: number): number

  /** Returns the current Unix timestamp or the timestamp of the given date. */
  export function time(t?: OsDateTime): number | undefined
}

/** Quaternion manipulation library. */
/** @noSelf */
declare namespace Quaternion {
  /** Creates a new quaternion with the given component values. */
  export function create(x: number, y: number, z: number, s: number): quaternion

  /** Computes the normalized version (unit quaternion) of the quaternion. */
  export function normalize(q: quaternion): quaternion

  /** Computes the magnitude of the quaternion. */
  export function magnitude(q: quaternion): number

  /** Computes the dot product of two quaternions. */
  export function dot(a: quaternion, b: quaternion): number

  /** Spherical linear interpolation from a to b using factor t. */
  export function slerp(a: quaternion, b: quaternion, t: number): quaternion

  /** Computes the conjugate of the quaternion. */
  export function conjugate(q: quaternion): quaternion

  /** Computes the forward vector from the quaternion. */
  export function tofwd(q: quaternion): vector

  /** Computes the left vector from the quaternion. */
  export function toleft(q: quaternion): vector

  /** Computes the up vector from the quaternion. */
  export function toup(q: quaternion): vector

  /** Identity quaternion constant. */
  export const identity: quaternion
}

/** String manipulation library. */
/** @noSelf */
declare namespace string {
  /** Returns the numeric code of every byte in the input string within the given range. */
  export function byte(s: string, i?: number): number

  export function byte(s: string, i: number, j: number): number[]

  /** Returns a string containing characters for the given byte values. */
  export function char(...args: number[]): string

  /** Finds the first instance of the pattern in the string. */
  export function find(
    s: string,
    pattern: string,
    init?: number,
    plain?: boolean,
  ): LuaMultiReturn<[number | undefined, number | undefined, ...args: string[]]>

  /** Formats input values into a string using printf-style format specifiers. */
  export function format(formatstring: string, ...args: any[]): string

  /** Returns an iterator function for pattern matches */
  export function gmatch(s: string, pattern: string): (this: void) => string[]

  /** Performs pattern-based substitution in a string. */
  export function gsub(
    s: string,
    pattern: string,
    repl: string | Record<string, string> | ((this: void, ...args: string[]) => string),
    maxn?: number,
  ): LuaMultiReturn<[string, number]>

  /** Returns the number of bytes in the string. Identical to #s */
  export function len(s: string): number

  /** Returns a lowercase version of the input string. */
  export function lower(s: string): string

  /** Finds and returns matches for a pattern in the input string. */
  export function match(s: string, pattern: string, init?: number): string[]

  /** Packs values into a binary string. */
  export function pack(fmt: string, ...args: any[]): string

  /** Returns the size of a packed string for the given format. */
  export function packsize(fmt: string): number

  /** Returns the input string repeated a given number of times. */
  export function rep(s: string, n: number): string

  /** Returns the input string with bytes in reverse order. */
  export function reverse(s: string): string

  /** Splits a string by separator. Returns a list of substrings. */
  export function split(s: string, separator?: string): string[]

  /** Returns a substring from the given range. */
  export function sub(s: string, i: number, j?: number): string

  /** Decodes a binary string using a pack format. */
  export function unpack(fmt: string, s: string, init?: number): any[]

  /** Returns an uppercase version of the input string. */
  export function upper(s: string): string
}

/** Table manipulation library. Tables are collections of key-value pairs. */
/** @noSelf */
declare namespace table {
  /** Joins an array of strings into one string, with an optional separator. */
  export function concat(a: (string | number)[], sep?: string, i?: number, j?: number): string

  /**
   * Iterates over all key-value pairs in the table (deprecated).
   * @deprecated Use a for loop instead
   */
  export function foreach<K, V, R>(
    t: Record<K, V>,
    f?: (this: void, key: K, value: V) => R,
  ): R | undefined

  /**
   * Iterates over all index-value pairs in the array (deprecated).
   * @deprecated Use a for loop instead
   */
  export function foreachi<V, R>(
    a: V[],
    f?: (this: void, index: number, value: V) => R,
  ): R | undefined

  /**
   * Returns the length of an array (deprecated; use # instead).
   * @deprecated Use '#' instead.
   */
  export function getn(a: any[]): number

  /** Returns the highest numeric key in the table. */
  export function maxn(t: any[]): number

  /** Inserts an element at the specified index, or at the end of the array. */
  export function insert<V>(a: V[], i: number, v: V): void

  /** Appends one or more an elements to end of the array. */
  export function append<V>(a: V[], ...args: V[]): void

  /** Appends all elements from one array to the end of another. Shorthand for table.move(b, 1, #b, #a+1, a) */
  export function extend<V>(a: V[], b: V[]): V[]

  /** Removes and returns the element at the specified index from the array, or from the end of the array. */
  export function remove<V>(a: V[], i?: number): V | undefined

  /** Sorts an array in place. */
  export function sort<V>(a: V[], f?: (this: void, a: V, b: V) => boolean): void

  /** Packs multiple arguments into a new array with length field n. */
  export function pack<V>(...args: V[]): { n: number; [index: number]: V }

  /** Unpacks array elements into multiple return values. */
  export function unpack<V>(a: V[], i?: number, j?: number): V[]

  /** Inserts elements [i..j] from src array into dest array at [d]. */
  export function move<V>(src: V[], i: number, j: number, d: number, dest?: V[]): V[]

  /** Creates a new table with pre-allocated array capacity, optionally filled. */
  export function create<V>(n: number, v?: V): V[]

  /** Finds the first occurrence of a value in the array and returns its index. */
  export function find<V>(t: V[], v: V, i?: number): number | undefined

  /** Clears all elements from a table while keeping its capacity. */
  export function clear(t: any[]): void

  /** Reduces the memory usage of the table to the minimum necessary. */
  export function shrink<V>(t: V[], reorder?: boolean): V[]

  /** Freezes a table, making it read-only. */
  export function freeze<table>(t: table): table

  /** Returns true if a table is frozen. */
  export function isfrozen(t: any[]): boolean

  /** Creates a shallow copy of the table. */
  export function clone<table>(t: table): table
}

/** UTF-8 support library. */
/** @noSelf */
declare namespace utf8 {
  /** Creates a string from Unicode codepoints. */
  export function char(...args: number[]): string

  /** Returns an iterator that produces the byte offset and Unicode codepoint for each character in the string. */
  export function codes(
    s: string,
  ): LuaMultiReturn<
    [(this: void, arg0: string, arg1: number) => LuaMultiReturn<[number, number]>, string, number]
  >

  /** Returns the Unicode codepoints in the specified range of the string. */
  export function codepoint(s: string, i?: number): number

  export function codepoint(s: string, i: number, j: number): number[]

  /** Returns the number of Unicode codepoints in the specified range of the string, or nil and error index. */
  export function len(
    s: string,
    i?: number,
    j?: number,
  ): LuaMultiReturn<[number | undefined, number | undefined]>

  /** Returns the byte offset of the nth Unicode codepoint in the string. */
  export function offset(s: string, n: number, i?: number): number | undefined

  /** Pattern that matches exactly one UTF-8 byte sequence */
  export const charpattern: string
}

/** UUID library. */
/** @noSelf */
declare namespace UUID {
  /** Creates a new uuid from a string, buffer, or existing uuid. Throws an error if the string is not a valid UUID, or the the buffer is shorter than 16 bytes. */
  export function create(value: string | undefined | buffer | uuid): uuid
}

/** Vector manipuluation library. */
/** @noSelf */
declare namespace Vector {
  /** Creates a new vector with the given component values. */
  export function create(x: number, y: number, z?: number): vector

  /** Computes the magnitude of the vector. */
  export function magnitude(v: vector): number

  /** Computes the normalized version (unit vector) of the vector. */
  export function normalize(v: vector): vector

  /** Computes the cross product of two vectors. */
  export function cross(a: vector, b: vector): vector

  /** Computes the dot product of two vectors. */
  export function dot(a: vector, b: vector): number

  /** Computes the angle between two vectors in radians. The axis, if specified, is used to determine the sign of the angle. */
  export function angle(a: vector, b: vector, axis?: vector): number

  /** Applies math.floor to each component of the vector. */
  export function floor(v: vector): vector

  /** Applies math.ceil to each component of the vector. */
  export function ceil(v: vector): vector

  /** Applies math.abs to each component of the vector. */
  export function abs(v: vector): vector

  /** Applies math.sign to each component of the vector. */
  export function sign(v: vector): vector

  /** Clamps each component of the vector between min and max values. */
  export function clamp(v: vector, min: vector, max: vector): vector

  /** Applies math.max to each component of the vectors. */
  export function max(v: vector, ...args: vector[]): vector

  /** Applies math.max to each component of the vectors. */
  export function min(v: vector, ...args: vector[]): vector

  /** Linearly interpolates between a and b using factor t. */
  export function lerp(a: vector, b: vector, t: number): vector

  /** Constant vector with all components set to 0. */
  export const zero: vector
  /** Constant vector with all components set to 1. */
  export const one: vector
}

/** @noSelf */
declare namespace ll {
  /** Returns the absolute (positive) version of Value. */
  export function Abs(value: number): number

  /** Returns the arc-cosine of Value, in radians. */
  export function Acos(value: number): number

  /**
   * Add avatar ID to the parcel ban list for the specified number of Hours.
   * A value of 0 for Hours will add the agent indefinitely.
   * The smallest value that Hours will accept is 0.01; anything smaller will be seen as 0.
   * When values that small are used, it seems the function bans in approximately 30 second increments (Probably 36 second increments, as 0.01 of an hour is 36 seconds).
   * Residents teleporting to a parcel where they are banned will be redirected to a neighbouring parcel.
   */
  export function AddToLandBanList(id: uuid, hours: number): void

  /** Add avatar ID to the land pass list, for a duration of Hours. */
  export function AddToLandPassList(id: uuid, hours: number): void

  /**
   * Changes the amount of damage to be delivered by this damage event.
   * @indexArg number
   */
  export function AdjustDamage(number: number, damage: number): void

  /**
   * Adjusts the volume (0.0 - 1.0) of the currently playing attached sound.
   * This function has no effect on sounds started with llTriggerSound.
   */
  export function AdjustSoundVolume(volume: number): void

  /** Returns TRUE if the agent is in the Experience and the Experience can run in the current location. */
  export function AgentInExperience(agentId: uuid): number

  /** If Flag == TRUE, users without object modify permissions can still drop inventory items into the object. */
  export function AllowInventoryDrop(flag: number): void

  /** Returns the angle, in radians, between rotations Rot1 and Rot2. */
  export function AngleBetween(rot1: quaternion, rot2: quaternion): number

  /**
   * Applies impulse to the object.
   * If Local == TRUE, apply the Force in local coordinates; otherwise, apply the Force in global coordinates.
   * This function only works on physical objects.
   */
  export function ApplyImpulse(force: vector, local: number): void

  /**
   * Applies rotational impulse to the object.
   * If Local == TRUE, apply the Force in local coordinates; otherwise, apply the Force in global coordinates.
   * This function only works on physical objects.
   */
  export function ApplyRotationalImpulse(force: vector, local: number): void

  /** Returns the arc-sine, in radians, of Value. */
  export function Asin(value: number): number

  /** Returns the arc-tangent2 of y, x. */
  export function Atan2(y: number, x: number): number

  /**
   * Attach to avatar at point AttachmentPoint.
   * Requires the PERMISSION_ATTACH runtime permission.
   */
  export function AttachToAvatar(attachmentPoint: number): void

  /**
   * Follows the same convention as llAttachToAvatar, with the exception that the object will not create new inventory for the user, and will disappear on detach or disconnect.
   * Requires the PERMISSION_ATTACH runtime permission.
   */
  export function AttachToAvatarTemp(attachPoint: number): void

  /**
   * If an avatar is sitting on the link's sit target, return the avatar's key, NULL_KEY otherwise.
   * Returns a key that is the UUID of the user seated on the specified link's prim.
   */
  export function AvatarOnLinkSitTarget(linkNumber: number): uuid

  /**
   * If an avatar is seated on the sit target, returns the avatar's key, otherwise NULL_KEY.
   * This only will detect avatars sitting on sit targets defined with llSitTarget.
   */
  export function AvatarOnSitTarget(): uuid

  /** Returns the rotation represented by coordinate axes Forward, Left, and Up. */
  export function Axes2Rot(forward: vector, left: vector, up: vector): quaternion

  /** Returns the rotation that is a generated Angle about Axis. */
  export function AxisAngle2Rot(axis: vector, angle: number): quaternion

  /**
   * Returns an integer that is the Text, Base64 decoded as a big endian integer.
   * Returns zero if Text is longer then 8 characters. If Text contains fewer then 6 characters, the return value is unpredictable.
   */
  export function Base64ToInteger(text: string): number

  /**
   * Converts a Base64 string to a conventional string.
   * If the conversion creates any unprintable characters, they are converted to question marks.
   */
  export function Base64ToString(text: string): string

  /**
   * De-links all prims in the link set.
   * Requires the PERMISSION_CHANGE_LINKS runtime permission.
   */
  export function BreakAllLinks(): void

  /**
   * De-links the prim with the given link number.
   * Requires the PERMISSION_CHANGE_LINKS runtime permission.
   */
  export function BreakLink(linkNumber: number): void

  /** Create a list from a string of comma separated values specified in Text. */
  export function CSV2List(text: string): string[]

  /**
   * Casts a ray into the physics world from 'start' to 'end' and returns data according to details in Options.
   * Reports collision data for intersections with objects.
   * Return value: [UUID_1, {link_number_1}, hit_position_1, {hit_normal_1}, UUID_2, {link_number_2}, hit_position_2, {hit_normal_2}, ... , status_code] where {} indicates optional data.
   */
  export function CastRay(start: vector, end: vector, options: list): list

  /** Returns smallest integer value >= Value. */
  export function Ceil(value: number): number

  /** Returns a single character string that is the representation of the unicode value. */
  export function Char(value: number): string

  /**
   * Resets all camera parameters to default values and turns off scripted camera control.
   * Requires the PERMISSION_CONTROL_CAMERA runtime permission (automatically granted to attached or sat on objects).
   */
  export function ClearCameraParams(): void

  export function ClearExperience(agentId: uuid, experienceId: uuid): void

  export function ClearExperiencePermissions(agentId: uuid): void

  /**
   * Clears (deletes) the media and all parameters from the given Face on the linked prim.
   * Returns an integer that is a STATUS_* flag, which details the success/failure of the operation.
   */
  export function ClearLinkMedia(link: number, face: number): number

  /**
   * Clears (deletes) the media and all parameters from the given Face.
   * Returns an integer that is a STATUS_* flag which details the success/failure of the operation.
   */
  export function ClearPrimMedia(face: number): number

  /** This function is deprecated. */
  export function CloseRemoteDataChannel(channelId: uuid): void

  /** Returns the cloud density at the object's position + Offset. */
  export function Cloud(offset: vector): number

  /** Specify an empty string or NULL_KEY for Accept, to not filter on the corresponding parameter. */
  export function CollisionFilter(objectName: string, objectId: uuid, accept: number): void

  /**
   * Suppress default collision sounds, replace default impact sounds with ImpactSound.
   * The ImpactSound must be in the object inventory.
   * Supply an empty string to suppress collision sounds.
   */
  export function CollisionSound(impactSound: string, impactVolume: number): void

  /** Suppress default collision sprites, replace default impact sprite with ImpactSprite; found in the object inventory (empty string to just suppress). */
  export function CollisionSprite(impactSprite: string): void

  /** Returns hex-encoded Hash string of Message using digest Algorithm. */
  export function ComputeHash(message: string, algorithm: string): string

  /** Returns the cosine of Theta (Theta in radians). */
  export function Cos(theta: number): number

  /**
   * Convert link-set to AI/Physics character.
   * Creates a path-finding entity, known as a "character", from the object containing the script. Required to activate use of path-finding functions.
   * Options is a list of key/value pairs.
   */
  export function CreateCharacter(options: list): void

  /** Starts an asychronous transaction to create a key-value pair. Will fail with XP_ERROR_STORAGE_EXCEPTION if the key already exists. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value passed to the function. */
  export function CreateKeyValue(key: string, value: string): uuid

  /**
   * Attempt to link the object the script is in, to target.
   * Requires the PERMISSION_CHANGE_LINKS runtime permission.
   */
  export function CreateLink(targetPrim: uuid, parent: number): void

  /** Generates a damage event on the targeted agent or task. */
  export function Damage(target: uuid, damage: number, type: number): void

  /** Starts an asychronous transaction the request the used and total amount of data allocated for the Experience. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the the amount in use and the third item will be the total available. */
  export function DataSizeKeyValue(): uuid

  /**
   * Convert link-set from AI/Physics character to Physics object.
   * Convert the current link-set back to a standard object, removing all path-finding properties.
   */
  export function DeleteCharacter(): void

  /** Starts an asychronous transaction to delete a key-value pair. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value associated with the key. */
  export function DeleteKeyValue(key: string): uuid

  /**
   * Removes the slice from start to end and returns the remainder of the list.
   * Remove a slice from the list and return the remainder, start and end are inclusive.
   * Using negative numbers for start and/or end causes the index to count backwards from the length of the list, so 0, -1 would delete the entire list.
   * If Start is larger than End the list deleted is the exclusion of the entries; so 6, 4 would delete the entire list except for the 5th list entry.
   * @indexArg start
   * @indexArg end
   */
  export function DeleteSubList(source: T[], start: number, end: number): T[]

  /**
   * Removes the indicated sub-string and returns the result.
   * Start and End are inclusive.
   * Using negative numbers for Start and/or End causes the index to count backwards from the length of the string, so 0, -1 would delete the entire string.
   * If Start is larger than End, the sub-string is the exclusion of the entries; so 6, 4 would delete the entire string except for the 5th character.
   * @indexArg start
   * @indexArg end
   */
  export function DeleteSubString(source: string, start: number, end: number): string

  /** Derezzes an object previously rezzed by a script in this region. Returns TRUE on success or FALSE if the object could not be derezzed. */
  export function DerezObject(id: uuid, flags: number): number

  /**
   * Remove the object containing the script from the avatar.
   * Requires the PERMISSION_ATTACH runtime permission (automatically granted to attached objects).
   */
  export function DetachFromAvatar(): void

  /**
   * Returns a list containing the current damage for the event, the damage type and the original damage delivered.
   * @indexArg number
   */
  export function DetectedDamage(number: number): list

  /**
   * Returns the grab offset of a user touching the object.
   * Returns <0.0, 0.0, 0.0> if Number is not a valid object.
   * @indexArg number
   */
  export function DetectedGrab(number: number): vector

  /**
   * Returns TRUE if detected object or agent Number has the same user group active as this object.
   * It will return FALSE if the object or agent is in the group, but the group is not active.
   * @indexArg number
   */
  export function DetectedGroup(number: number): number

  /**
   * Returns the key of detected object or avatar number.
   * Returns NULL_KEY if Number is not a valid index.
   * @indexArg number
   */
  export function DetectedKey(number: number): uuid

  /**
   * Returns the link position of the triggered event for touches and collisions only.
   * 0 for a non-linked object, 1 for the root of a linked object, 2 for the first child, etc.
   * @indexArg number
   */
  export function DetectedLinkNumber(number: number): number

  /**
   * Returns the name of detected object or avatar number.
   * Returns the name of detected object number.
   * Returns empty string if Number is not a valid index.
   * @indexArg number
   */
  export function DetectedName(number: number): string

  /**
   * Returns the key of detected object's owner.
   * Returns invalid key if Number is not a valid index.
   * @indexArg number
   */
  export function DetectedOwner(number: number): uuid

  /**
   * Returns the position of detected object or avatar number.
   * Returns <0.0, 0.0, 0.0> if Number is not a valid index.
   * @indexArg number
   */
  export function DetectedPos(number: number): vector

  /**
   * Returns the key for the rezzer of the detected object.
   * @indexArg number
   */
  export function DetectedRezzer(number: number): uuid

  /**
   * Returns the rotation of detected object or avatar number.
   * Returns <0.0, 0.0, 0.0, 1.0> if Number is not a valid offset.
   * @indexArg number
   */
  export function DetectedRot(number: number): quaternion

  /**
   * Returns the surface bi-normal for a triggered touch event.
   * Returns a vector that is the surface bi-normal (tangent to the surface) where the touch event was triggered.
   * @indexArg index
   */
  export function DetectedTouchBinormal(index: number): vector

  /**
   * Returns the index of the face where the avatar clicked in a triggered touch event.
   * @indexArg index
   */
  export function DetectedTouchFace(index: number): number

  /**
   * Returns the surface normal for a triggered touch event.
   * Returns a vector that is the surface normal (perpendicular to the surface) where the touch event was triggered.
   * @indexArg index
   */
  export function DetectedTouchNormal(index: number): vector

  /**
   * Returns the position, in region coordinates, where the object was touched in a triggered touch event.
   * Unless it is a HUD, in which case it returns the position relative to the attach point.
   * @indexArg index
   */
  export function DetectedTouchPos(index: number): vector

  /**
   * Returns a vector that is the surface coordinates where the prim was touched.
   * The X and Y vector positions contain the horizontal (S) and vertical (T) face coordinates respectively.
   * Each component is in the interval [0.0, 1.0].
   * TOUCH_INVALID_TEXCOORD is returned if the surface coordinates cannot be determined (e.g. when the viewer does not support this function).
   * @indexArg index
   */
  export function DetectedTouchST(index: number): vector

  /**
   * Returns a vector that is the texture coordinates for where the prim was touched.
   * The X and Y vector positions contain the U and V face coordinates respectively.
   * TOUCH_INVALID_TEXCOORD is returned if the touch UV coordinates cannot be determined (e.g. when the viewer does not support this function).
   * @indexArg index
   */
  export function DetectedTouchUV(index: number): vector

  /**
   * Returns the type (AGENT, ACTIVE, PASSIVE, SCRIPTED) of detected object.
   * Returns 0 if number is not a valid index.
   * Note that number is a bit-field, so comparisons need to be a bitwise checked. e.g.:
   * integer iType = llDetectedType(0);
   * {
   * 	// ...do stuff with the agent
   * }
   * @indexArg number
   */
  export function DetectedType(number: number): number

  /**
   * Returns the velocity of the detected object Number.
   * Returns<0.0, 0.0, 0.0> if Number is not a valid offset.
   * @indexArg number
   */
  export function DetectedVel(number: number): vector

  /**
   * Shows a dialog box on the avatar's screen with the message.
   * Up to 12 strings in the list form buttons.
   * If a button is clicked, the name is chatted on Channel.
   * Opens a "notify box" in the given avatars screen displaying the message.
   * Up to twelve buttons can be specified in a list of strings. When the user clicks a button, the name of the button is said on the specified channel.
   * Channels work just like llSay(), so channel 0 can be heard by everyone.
   * The chat originates at the object's position, not the avatar's position, even though it is said as the avatar (uses avatar's UUID and Name etc.).
   * Examples:
   * llDialog(who, "Are you a boy or a girl?", [ "Boy", "Girl" ], -4913);
   * llDialog(who, "This shows only an OK button.", [], -192);
   * llDialog(who, "This chats so you can 'hear' it.", ["Hooray"], 0);
   */
  export function Dialog(avatarId: uuid, text: string, buttons: string[], channel: number): void

  /** Delete the object which holds the script. */
  export function Die(): void

  /**
   * Returns the list as a single string, using Separator between the entries.
   * Write the list out as a single string, using Separator between values.
   */
  export function DumpList2String(source: list, separator: string): string

  /**
   * Checks to see whether the border hit by Direction from Position is the edge of the world (has no neighboring region).
   * Returns TRUE if the line along Direction from Position hits the edge of the world in the current simulator, returns FALSE if that edge crosses into another simulator.
   */
  export function EdgeOfWorld(position: vector, direction: vector): number

  /**
   * Ejects AvatarID from land that you own.
   * Ejects AvatarID from land that the object owner (group or resident) owns.
   */
  export function EjectFromLand(avatarId: uuid): void

  /**
   * Sends email to Address with Subject and Message.
   * Sends an email to Address with Subject and Message.
   */
  export function Email(address: string, subject: string, text: string): void

  /**
   * Returns an escaped/encoded version of url, replacing spaces with %20 etc.
   * Returns the string that is the URL-escaped version of URL (replacing spaces with %20, etc.).
   * This function returns the UTF-8 encoded escape codes for selected characters.
   */
  export function EscapeURL(url: string): string

  /**
   * Returns the rotation representation of the Euler angles.
   * Returns the rotation represented by the Euler Angle.
   */
  export function Euler2Rot(vector: vector): quaternion

  /**
   * Evade a specified target.
   * Characters will (roughly) try to hide from their pursuers if there is a good hiding spot along their fleeing path. Hiding means no direct line of sight from the head of the character (centre of the top of its physics bounding box) to the head of its pursuer and no direct path between the two on the navigation-mesh.
   */
  export function Evade(targetId: uuid, options: list): void

  /**
   * Execute a character command.
   * Send a command to the path system.
   * Currently only supports stopping the current path-finding operation or causing the character to jump.
   */
  export function ExecCharacterCmd(command: number, options: list): void

  /**
   * Returns the positive version of Value.
   * Returns the absolute value of Value.
   */
  export function Fabs(value: number): number

  /** Searches the text of a cached notecard for lines containing the given pattern and returns the number of matches found through a dataserver event. */
  export function FindNotecardTextCount(notecardName: string, pattern: string, options: list): uuid

  /**
   * Searches the text of a cached notecard for lines containing the given pattern. Returns a list of line numbers and column where a match is found. If the notecard is not inthe cache it returns a list containing a single entry of NAK. If no matches are found anempty list is returned.
   * @indexArg startMatch
   * @indexReturn
   */
  export function FindNotecardTextSync(
    notecardName: string,
    pattern: string,
    startMatch: number,
    count: number,
    options: list,
  ): list

  /**
   * Flee from a point.
   * Directs a character (llCreateCharacter) to keep away from a defined position in the region or adjacent regions.
   */
  export function FleeFrom(source: vector, distance: number, options: list): void

  /** Returns largest integer value <= Value. */
  export function Floor(value: number): number

  /**
   * If Enable is TRUE any avatar that sits on this object is forced into mouse-look mode.
   * After calling this function with Enable set to TRUE, any agent sitting down on the prim will be forced into mouse-look.
   * Just like llSitTarget, this changes a permanent property of the prim (not the object) and needs to be reset by calling this function with Enable set to FALSE in order to disable it.
   */
  export function ForceMouselook(enable: number): void

  /**
   * Returns a pseudo random number in the range [0, Magnitude] or [Magnitude, 0].
   * Returns a pseudo-random number between [0, Magnitude].
   */
  export function Frand(magnitude: number): number

  /**
   * Generates a key (SHA-1 hash) using UUID generation to create a unique key.
   * As the UUID produced is versioned, it should never return a value of NULL_KEY.
   * The specific UUID version is an implementation detail that has changed in the past and may change again in the future. Do not depend upon the UUID that is returned to be version 5 SHA-1 hash.
   */
  export function GenerateKey(): uuid

  /**
   * Returns the acceleration of the object relative to the region's axes.
   * Gets the acceleration of the object.
   */
  export function GetAccel(): vector

  /**
   * Returns an integer bit-field containing the agent information about id.
   * Returns AGENT_FLYING, AGENT_ATTACHMENTS, AGENT_SCRIPTED, AGENT_SITTING, AGENT_ON_OBJECT, AGENT_MOUSELOOK, AGENT_AWAY, AGENT_BUSY, AGENT_TYPING, AGENT_CROUCHING, AGENT_ALWAYS_RUN, AGENT_WALKING, AGENT_IN_AIR and/or AGENT_FLOATING_VIA_SCRIPTED_ATTACHMENT.
   * Returns information about the given agent ID as a bit-field of agent info constants.
   */
  export function GetAgentInfo(avatarId: uuid): number

  /**
   * Returns the language code of the preferred interface language of the avatar.
   * Returns a string that is the language code of the preferred interface language of the resident.
   */
  export function GetAgentLanguage(avatarId: uuid): string

  /**
   * Requests a list of agents currently in the region, limited by the scope parameter.
   * Returns a list [key UUID-0, key UUID-1, ..., key UUID-n] or [string error_msg] - returns avatar keys for all agents in the region limited to the area(s) specified by scope
   */
  export function GetAgentList(scope: number, options: list): uuid[]

  /**
   * If the avatar is in the same region, returns the size of the bounding box of the requested avatar by id, otherwise returns ZERO_VECTOR.
   * If the agent is in the same region as the object, returns the size of the avatar.
   */
  export function GetAgentSize(avatarId: uuid): vector

  /**
   * Returns the alpha value of Face.
   * Returns the 'alpha' of the given face. If face is ALL_SIDES the value returned is the mean average of all faces.
   */
  export function GetAlpha(face: number): number

  /**
   * Returns the name of the currently playing locomotion animation for the avatar id.
   * Returns the currently playing animation for the specified avatar ID.
   */
  export function GetAnimation(avatarId: uuid): string

  /**
   * Returns a list of keys of playing animations for an avatar.
   * Returns a list of keys of all playing animations for the specified avatar ID.
   */
  export function GetAnimationList(avatarId: uuid): uuid[]

  /**
   * Returns a string that is the name of the animation that is used for the specified animation state.
   * Requires the PERMISSION_OVERRIDE_ANIMATIONS or PERMISSION_TRIGGER_ANIMATION runtime permission (automatically granted to attached objects).
   */
  export function GetAnimationOverride(animationState: string): string

  /** Returns the object's attachment point, or 0 if not attached. */
  export function GetAttached(): number

  /** Returns a list of keys of all visible (not HUD) attachments on the avatar identified by the ID argument */
  export function GetAttachedList(id: uuid): uuid[]

  /** Retrieves a list of attachments on an avatar. */
  export function GetAttachedListFiltered(agentId: uuid, options: list): uuid[]

  /** Returns the bounding box around the object (including any linked prims) relative to its root prim, as a list in the format [ (vector) min_corner, (vector) max_corner ]. */
  export function GetBoundingBox(id: uuid): vector[]

  /** Returns the current camera aspect ratio (width / height) of the agent who has granted the scripted object PERMISSION_TRACK_CAMERA permissions. If no permissions have been granted: it returns zero. */
  export function GetCameraAspect(): number

  /** Returns the current camera field of view of the agent who has granted the scripted object PERMISSION_TRACK_CAMERA permissions. If no permissions have been granted: it returns zero. */
  export function GetCameraFOV(): number

  /**
   * Returns the current camera position for the agent the task has permissions for.
   * Returns the position of the camera, of the user that granted the script PERMISSION_TRACK_CAMERA. If no user has granted the permission, it returns ZERO_VECTOR.
   */
  export function GetCameraPos(): vector

  /** Returns the current camera orientation for the agent the task has permissions for. If no user has granted the PERMISSION_TRACK_CAMERA permission, returns ZERO_ROTATION. */
  export function GetCameraRot(): quaternion

  /** Returns the prim's centre of mass (unless called from the root prim, where it returns the object's centre of mass). */
  export function GetCenterOfMass(): vector

  /**
   * Get the closest navigable point to the point provided.
   * The function accepts a point in region-local space (like all the other path-finding methods) and returns either an empty list or a list containing a single vector which is the closest point on the navigation-mesh to the point provided.
   */
  export function GetClosestNavPoint(point: vector, options: list): vector[]

  /**
   * Returns the color on Face.
   * Returns the color of Face as a vector of red, green, and blue values between 0 and 1. If face is ALL_SIDES the color returned is the mean average of each channel.
   */
  export function GetColor(face: number): vector

  /**
   * Returns a key for the creator of the prim.
   * Returns the key of the object's original creator. Similar to llGetOwner.
   */
  export function GetCreator(): uuid

  /**
   * Returns the current date in the UTC time zone in the format YYYY-MM-DD.
   * Returns the current UTC date as YYYY-MM-DD.
   */
  export function GetDate(): string

  /** Returns the number of seconds in a day on this parcel. */
  export function GetDayLength(): number

  /** Returns the number of seconds in a day is offset from midnight in this parcel. */
  export function GetDayOffset(): number

  /** Returns the display name of an avatar, if the avatar is connected to the current region, or if the name has been cached.  Otherwise, returns an empty string. Use llRequestDisplayName if the avatar may be absent from the region. */
  export function GetDisplayName(avatarId: uuid): string

  /** Returns how much energy is in the object as a percentage of maximum. */
  export function GetEnergy(): number

  /** Returns a string with the requested data about the region. */
  export function GetEnv(dataRequest: string): string

  /** Returns a string with the requested data about the region. */
  export function GetEnvironment(position: vector, envParams: number[]): list

  /** Returns a list with the following Experience properties: [Experience Name, Owner ID, Group ID, Experience ID, State, State Message]. State is an integer corresponding to one of the constants XP_ERROR_... and State Message is the string returned by llGetExperienceErrorMessage for that integer. */
  export function GetExperienceDetails(experienceId: uuid): list

  /** Returns a string describing the error code passed or the string corresponding with XP_ERROR_UNKNOWN_ERROR if the value is not a valid Experience error code. */
  export function GetExperienceErrorMessage(error: number): string

  export function GetExperienceList(agentId: uuid): uuid[]

  /**
   * Returns the force (if the script is physical).
   * Returns the current force if the script is physical.
   */
  export function GetForce(): vector

  /**
   * Returns the number of free bytes of memory the script can use.
   * Returns the available free space for the current script. This is inaccurate with LSO.
   */
  export function GetFreeMemory(): number

  /**
   * Returns the number of available URLs for the current script.
   * Returns an integer that is the number of available URLs.
   */
  export function GetFreeURLs(): number

  /**
   * Returns the time in seconds since midnight GMT.
   * Gets the time in seconds since midnight in GMT/UTC.
   */
  export function GetGMTclock(): number

  /** Returns the vector that is the geometric center of the object relative to the root prim. */
  export function GetGeometricCenter(): vector

  /**
   * Returns the value for header for request_id.
   * Returns a string that is the value of the Header for HTTPRequestID.
   */
  export function GetHTTPHeader(httpRequestId: uuid, header: string): string

  /** Returns the current health of an avatar or object in the region. */
  export function GetHealth(id: uuid): number

  /** Returns the time at which the item was placed into this prim's inventory as a timestamp. */
  export function GetInventoryAcquireTime(inventoryItem: string): string

  /**
   * Returns a key for the creator of the inventory item.
   * This function returns the UUID of the creator of item. If item is not found in inventory, the object says "No item named 'name'".
   */
  export function GetInventoryCreator(inventoryItem: string): uuid

  /** Returns the item description of the item in inventory. If item is not found in inventory, the object says "No item named 'name'" to the debug channel and returns an empty string. */
  export function GetInventoryDesc(inventoryItem: string): string

  /**
   * Returns the key that is the UUID of the inventory named.
   * Returns the key of the inventory named.
   */
  export function GetInventoryKey(inventoryItem: string): uuid

  /**
   * Returns the name of the inventory item of a given type, specified by index number.
   * Use the inventory constants INVENTORY_* to specify the type.
   * @indexArg index
   */
  export function GetInventoryName(inventoryType: number, index: number): string

  /**
   * Returns the quantity of items of a given type (INVENTORY_* flag) in the prim's inventory.
   * Use the inventory constants INVENTORY_* to specify the type.
   */
  export function GetInventoryNumber(inventoryType: number): number

  /**
   * Returns the requested permission mask for the inventory item.
   * Returns the requested permission mask for the inventory item defined by InventoryItem. If item is not in the object's inventory, llGetInventoryPermMask returns FALSE and causes the object to say "No item named '<item>'", where "<item>" is item.
   */
  export function GetInventoryPermMask(inventoryItem: string, bitMask: number): number

  /**
   * Returns the type of the named inventory item.
   * Like all inventory functions, llGetInventoryType is case-sensitive.
   */
  export function GetInventoryType(inventoryItem: string): number

  /**
   * Returns the key of the prim the script is attached to.
   * Get the key for the object which has this script.
   */
  export function GetKey(): uuid

  /**
   * Returns the key of the land owner, returns NULL_KEY if public.
   * Returns the key of the land owner at Position, or NULL_KEY if public.
   */
  export function GetLandOwnerAt(position: vector): uuid

  /**
   * Returns the key of the linked prim LinkNumber.
   * Returns the key of LinkNumber in the link set.
   */
  export function GetLinkKey(linkNumber: number): uuid

  /** Get the media parameters for a particular face on linked prim, given the desired list of parameter names. Returns a list of values in the order requested.	Returns an empty list if no media exists on the face. */
  export function GetLinkMedia(linkNumber: number, face: number, parameters: number[]): list

  /**
   * Returns the name of LinkNumber in a link set.
   * Returns the name of LinkNumber the link set.
   */
  export function GetLinkName(linkNumber: number): string

  /**
   * Returns the link number of the prim containing the script (0 means not linked, 1 the prim is the root, 2 the prim is the first child, etc.).
   * Returns the link number of the prim containing the script. 0 means no link, 1 the root, 2 for first child, etc.
   */
  export function GetLinkNumber(): number

  /**
   * Returns the number of sides of the specified linked prim.
   * Returns an integer that is the number of faces (or sides) of the prim link.
   */
  export function GetLinkNumberOfSides(linkNumber: number): number

  /**
   * Returns the list of primitive attributes requested in the Parameters list for LinkNumber.
   * PRIM_* flags can be broken into three categories, face flags, prim flags, and object flags.
   * * Supplying a prim or object flag will return that flag's attributes.
   * * Face flags require the user to also supply a face index parameter.
   */
  export function GetLinkPrimitiveParams(linkNumber: number, parameters: number[]): list

  /** Returns the sit flags set on the specified prim in a linkset. */
  export function GetLinkSitFlags(linkNumber: number): number

  /**
   * Returns the type of the index entry in the list (TYPE_INTEGER, TYPE_FLOAT, TYPE_STRING, TYPE_KEY, TYPE_VECTOR, TYPE_ROTATION, or TYPE_INVALID if index is off list).
   * Returns the type of the variable at Index in ListVariable.
   * @indexArg index
   */
  export function GetListEntryType(listVariable: list, index: number): number

  /**
   * Returns the number of elements in the list.
   * Returns the number of elements in ListVariable.
   */
  export function GetListLength(listVariable: list): number

  /**
   * Returns the position relative to the root.
   * Returns the local position of a child object relative to the root.
   */
  export function GetLocalPos(): vector

  /**
   * Returns the rotation local to the root.
   * Returns the local rotation of a child object relative to the root.
   */
  export function GetLocalRot(): quaternion

  /**
   * Returns the mass of object that the script is attached to.
   * Returns the scripted object's mass. When called from a script in a link-set, the parent will return the sum of the link-set weights, while a child will return just its own mass. When called from a script inside an attachment, this function will return the mass of the avatar it's attached to, not its own.
   */
  export function GetMass(): number

  /** Acts as llGetMass(), except that the units of the value returned are Kg. */
  export function GetMassMKS(): number

  /** Returns the largest multiplicative uniform scale factor that can be successfully applied (via llScaleByFactor()) to the object without violating prim size or linkability rules. */
  export function GetMaxScaleFactor(): number

  /** Get the maximum memory a script can use, in bytes. */
  export function GetMemoryLimit(): number

  /** Returns the smallest multiplicative uniform scale factor that can be successfully applied (via llScaleByFactor()) to the object without violating prim size or linkability rules. */
  export function GetMinScaleFactor(): number

  /**
   * Returns a normalized vector of the direction of the moon in the parcel.
   * Returns the moon's direction on the simulator in the parcel.
   */
  export function GetMoonDirection(): vector

  /** Returns the rotation applied to the moon in the parcel. */
  export function GetMoonRotation(): quaternion

  /**
   * Fetch the next queued email with that matches the given address and/or subject, via the email event.
   * If the parameters are blank, they are not used for filtering.
   */
  export function GetNextEmail(address: string, subject: string): void

  /**
   * Returns LineNumber from NotecardName via the dataserver event. The line index starts at zero in LSL, one in Lua.
   * If the requested line is passed the end of the note-card the dataserver event will return the constant EOF string.
   * The key returned by this function is a unique identifier which will be supplied to the dataserver event in the requested parameter.
   * @indexArg lineNumber
   */
  export function GetNotecardLine(notecardName: string, lineNumber: number): uuid

  /**
   * Returns LineNumber from NotecardName. The line index starts at zero in LSL, one in Lua.
   * If the requested line is past the end of the note-card the return value will be set to the constant EOF string.
   * If the note-card is not cached on the simulator the return value is the NAK string.
   * @indexArg lineNumber
   */
  export function GetNotecardLineSync(notecardName: string, lineNumber: number): string

  /**
   * Returns the number of lines contained within a notecard via the dataserver event.
   * The key returned by this function is a query ID for identifying the dataserver reply.
   */
  export function GetNumberOfNotecardLines(notecardName: string): uuid

  /**
   * Returns the number of prims in a link set the script is attached to.
   * Returns the number of prims in (and avatars seated on) the object the script is in.
   */
  export function GetNumberOfPrims(): number

  /**
   * Returns the number of faces (or sides) of the prim.
   * Returns the number of sides of the prim which has the script.
   */
  export function GetNumberOfSides(): number

  /**
   * Returns a list of names of playing animations for an object.
   * Returns a list of names of all playing animations for the current object.
   */
  export function GetObjectAnimationNames(): string[]

  /**
   * Returns the description of the prim the script is attached to.
   * Returns the description of the scripted object/prim. You can set the description using llSetObjectDesc.
   */
  export function GetObjectDesc(): string

  /**
   * Returns a list of object details specified in the Parameters list for the object or avatar in the region with key ID.
   * Parameters are specified by the OBJECT_* constants.
   */
  export function GetObjectDetails(id: uuid, parameters: number[]): list

  /**
   * Returns the key of the linked prim link_no in a linkset.
   * Returns the key of link_no in the link set specified by id.
   */
  export function GetObjectLinkKey(id: uuid, linkNo: number): uuid

  /**
   * Returns the mass of the avatar or object in the region.
   * Gets the mass of the object or avatar corresponding to ID.
   */
  export function GetObjectMass(id: uuid): number

  /**
   * Returns the name of the prim which the script is attached to.
   * Returns the name of the prim (not object) which contains the script.
   */
  export function GetObjectName(): string

  /** Returns the permission mask of the requested category for the object. */
  export function GetObjectPermMask(category: number): number

  /**
   * Returns the total number of prims for an object in the region.
   * Returns the prim count for any object id in the same region.
   */
  export function GetObjectPrimCount(objectId: uuid): number

  /**
   * Returns the rotation velocity in radians per second.
   * Returns a vector that is the rotation velocity of the object in radians per second.
   */
  export function GetOmega(): vector

  /**
   * Returns the object owner's UUID.
   * Returns the key for the owner of the object.
   */
  export function GetOwner(): uuid

  /**
   * Returns the owner of ObjectID.
   * Returns the key for the owner of object ObjectID.
   */
  export function GetOwnerKey(objectId: uuid): uuid

  /**
   * Returns a list of parcel details specified in the ParcelDetails list for the parcel at Position.
   * Parameters is one or more of: PARCEL_DETAILS_NAME, _DESC, _OWNER, _GROUP, _AREA, _ID, _SEE_AVATARS.
   * Returns a list that is the parcel details specified in ParcelDetails (in the same order) for the parcel at Position.
   */
  export function GetParcelDetails(position: vector, parcelDetails: number[]): list

  /**
   * Returns a mask of the parcel flags (PARCEL_FLAG_*) for the parcel that includes the point Position.
   * Returns a bit-field specifying the parcel flags (PARCEL_FLAG_*) for the parcel at Position.
   */
  export function GetParcelFlags(position: vector): number

  /**
   * Returns the maximum number of prims allowed on the parcel at Position for a given scope.
   * The scope may be set to an individual parcel or the combined resources of all parcels with the same ownership in the region.
   */
  export function GetParcelMaxPrims(position: vector, simWide: number): number

  /**
   * Gets the streaming audio URL for the parcel object is on.
   * The object owner, avatar or group, must also be the land owner.
   */
  export function GetParcelMusicURL(): string

  /**
   * Returns the number of prims on the parcel at Position of the given category.
   * Categories: PARCEL_COUNT_TOTAL, _OWNER, _GROUP, _OTHER, _SELECTED, _TEMP.
   * Returns the number of prims used on the parcel at Position which are in Category.
   * If SimWide is TRUE, it returns the total number of objects for all parcels with matching ownership in the category specified.
   * If SimWide is FALSE, it returns the number of objects on this specific parcel in the category specified
   */
  export function GetParcelPrimCount(position: vector, category: number, simWide: number): number

  /**
   * Returns a list of up to 100 residents who own objects on the parcel at Position, with per-owner land impact totals.
   * Requires owner-like permissions for the parcel, and for the script owner to be present in the region.
   * The list is formatted as [ key agentKey1, integer agentLI1, key agentKey2, integer agentLI2, ... ], sorted by agent key.
   * The integers are the combined land impacts of the objects owned by the corresponding agents.
   */
  export function GetParcelPrimOwners(position: vector): list

  /** Returns an integer bitmask of the permissions that have been granted to the script.  Individual permissions can be determined using a bit-wise "and" operation against the PERMISSION_* constants */
  export function GetPermissions(): number

  /**
   * Returns the key of the avatar that last granted or declined permissions to the script.
   * Returns NULL_KEY if permissions were never granted or declined.
   */
  export function GetPermissionsKey(): uuid

  /** Returns a list of the form [float gravity_multiplier, float restitution, float friction, float density]. */
  export function GetPhysicsMaterial(): number[]

  /**
   * Returns the position of the task in region coordinates.
   * Returns the vector position of the task in region coordinates.
   */
  export function GetPos(): vector

  /** Returns the media parameters for a particular face on an object, given the desired list of parameter names, in the order requested. Returns an empty list if no media exists on the face. */
  export function GetPrimMediaParams(face: number, parameters: number[]): list

  /**
   * Returns the primitive parameters specified in the parameters list.
   * Returns primitive parameters specified in the Parameters list.
   */
  export function GetPrimitiveParams(parameters: number[]): list

  /**
   * Returns the number of avatars in the region.
   * Returns an integer that is the number of avatars in the region.
   */
  export function GetRegionAgentCount(): number

  /**
   * Returns a vector, in meters, that is the global location of the south-west corner of the region which the object is in.
   * Returns the Region-Corner of the simulator containing the task. The region-corner is a vector (values in meters) representing distance from the first region.
   */
  export function GetRegionCorner(): vector

  /** Returns the number of seconds in a day in this region. */
  export function GetRegionDayLength(): number

  /** Returns the number of seconds in a day is offset from midnight in this parcel. */
  export function GetRegionDayOffset(): number

  /** Returns the mean region frames per second. */
  export function GetRegionFPS(): number

  /**
   * Returns the region flags (REGION_FLAG_*) for the region the object is in.
   * Returns a bit-field specifying the region flags (REGION_FLAG_*) for the region the object is in.
   */
  export function GetRegionFlags(): number

  /**
   * Returns a normalized vector of the direction of the moon in the region.
   * Returns the moon's direction on the simulator.
   */
  export function GetRegionMoonDirection(): vector

  /** Returns the rotation applied to the moon in the region. */
  export function GetRegionMoonRotation(): quaternion

  /** Returns the current region name. */
  export function GetRegionName(): string

  /**
   * Returns a normalized vector of the direction of the sun in the region.
   * Returns the sun's direction on the simulator.
   */
  export function GetRegionSunDirection(): vector

  /** Returns the rotation applied to the sun in the region. */
  export function GetRegionSunRotation(): quaternion

  /**
   * Returns the current time dilation as a float between 0.0 (full dilation) and 1.0 (no dilation).
   * Returns the current time dilation as a float between 0.0 and 1.0.
   */
  export function GetRegionTimeDilation(): number

  /** Returns the time in seconds since environmental midnight for the entire region. */
  export function GetRegionTimeOfDay(): number

  /**
   * Returns a string that is the render material on face (the inventory name if it is a material in the prim's inventory, otherwise the key).
   * Returns the render material of a face, if it is found in object inventory, its key otherwise.
   */
  export function GetRenderMaterial(face: number): string

  /**
   * Returns the position (in region coordinates) of the root prim of the object which the script is attached to.
   * This is used to allow a child prim to determine where the root is.
   */
  export function GetRootPosition(): vector

  /**
   * Returns the rotation (relative to the region) of the root prim of the object which the script is attached to.
   * Gets the global rotation of the root object of the object script is attached to.
   */
  export function GetRootRotation(): quaternion

  /**
   * Returns the rotation relative to the region's axes.
   * Returns the rotation.
   */
  export function GetRot(): quaternion

  /**
   * Returns the maximum used memory for the current script. Only valid after using PROFILE_SCRIPT_MEMORY. Non-mono scripts always use 16k.
   * Returns the integer of the most bytes used while llScriptProfiler was last active.
   */
  export function GetSPMaxMemory(): number

  /**
   * Returns the scale of the prim.
   * Returns a vector that is the scale (dimensions) of the prim.
   */
  export function GetScale(): vector

  /**
   * Returns the name of the script that this function is used in.
   * Returns the name of this script.
   */
  export function GetScriptName(): string

  /**
   * Returns TRUE if the script named is running.
   * Returns TRUE if ScriptName is running.
   */
  export function GetScriptState(scriptName: string): number

  /** Returns a float that is the requested statistic. */
  export function GetSimStats(statType: number): number

  /**
   * Returns the host-name of the machine which the script is running on.
   * For example, "sim225.agni.lindenlab.com".
   */
  export function GetSimulatorHostname(): string

  /**
   * Returns an integer that is the script rez parameter.
   * If the object was rezzed by an agent, this function returns 0.
   */
  export function GetStartParameter(): number

  /**
   * Returns a string that is the value passed to llRezObjectWithParams with REZ_PARAM_STRING.
   * If the object was rezzed by an agent, this function returns an empty string.
   */
  export function GetStartString(): string

  export function GetStaticPath(start: vector, end: vector, radius: number, parameters: list): list

  /** Returns boolean value of the specified status (e.g. STATUS_PHANTOM) of the object the script is attached to. */
  export function GetStatus(statusFlag: number): number

  /**
   * Returns a sub-string from String, in a range specified by the Start and End indices (inclusive).
   * Using negative numbers for Start and/or End causes the index to count backwards from the length of the string, so 0, -1 would capture the entire string.
   * If Start is greater than End, the sub string is the exclusion of the entries.
   * @indexArg start
   * @indexArg end
   */
  export function GetSubString(string: string, start: number, end: number): string

  /**
   * Returns a normalized vector of the direction of the sun in the parcel.
   * Returns the sun's direction on the simulator in the parcel.
   */
  export function GetSunDirection(): vector

  /** Returns the rotation applied to the sun in the parcel. */
  export function GetSunRotation(): quaternion

  /**
   * Returns a string that is the texture on face (the inventory name if it is a texture in the prim's inventory, otherwise the key).
   * Returns the texture of a face, if it is found in object inventory, its key otherwise.
   */
  export function GetTexture(face: number): string

  /** Returns the texture offset of face in the x and y components of a vector. */
  export function GetTextureOffset(face: number): vector

  /** Returns the texture rotation of side. */
  export function GetTextureRot(face: number): number

  /**
   * Returns the texture scale of side in the x and y components of a vector.
   * Returns the texture scale of a side in the x and y components of a vector.
   */
  export function GetTextureScale(face: number): vector

  /** Returns the time in seconds since the last region reset, script reset, or call to either llResetTime or llGetAndResetTime. */
  export function GetTime(): number

  /** Returns the time in seconds since environmental midnight on the parcel. */
  export function GetTimeOfDay(): number

  /** Returns a time-stamp (UTC time zone) in the format: YYYY-MM-DDThh:mm:ss.ff..fZ. */
  export function GetTimestamp(): string

  /**
   * Returns the torque (if the script is physical).
   * Returns a vector that is the torque (if the script is physical).
   */
  export function GetTorque(): vector

  /** Returns the number of seconds elapsed since 00:00 hours, Jan 1, 1970 UTC from the system clock. */
  export function GetUnixTime(): number

  /**
   * Returns the current used memory for the current script. Non-mono scripts always use 16K.
   * Returns the integer of the number of bytes of memory currently in use by the script. Non-mono scripts always use 16K.
   */
  export function GetUsedMemory(): number

  /** Returns the username of an avatar, if the avatar is connected to the current region, or if the name has been cached.  Otherwise, returns an empty string. Use llRequestUsername if the avatar may be absent from the region. */
  export function GetUsername(avatarId: uuid): string

  /**
   * Returns the velocity of the object.
   * Returns a vector that is the velocity of the object.
   */
  export function GetVel(): vector

  /** Returns a list of the current value for each requested visual parameter. */
  export function GetVisualParams(id: uuid, parameters: (number | string)[]): (number | "")[]

  /**
   * Returns the time in seconds since midnight California Pacific time (PST/PDT).
   * Returns the time in seconds since simulator's time-zone midnight (Pacific Time).
   */
  export function GetWallclock(): number

  /** Give InventoryItems to the specified agent as a new folder of items, as permitted by the permissions system. The target must be an agent. */
  export function GiveAgentInventory(
    agentId: uuid,
    folderName: string,
    inventoryItems: string[],
    options: list,
  ): number

  /**
   * Give InventoryItem to destination represented by TargetID, as permitted by the permissions system.
   * TargetID may be any agent or an object in the same region.
   */
  export function GiveInventory(targetId: uuid, inventoryItem: string): void

  /**
   * Give InventoryItems to destination (represented by TargetID) as a new folder of items, as permitted by the permissions system.
   * TargetID may be any agent or an object in the same region. If TargetID is an object, the items are passed directly to the object inventory (no folder is created).
   */
  export function GiveInventoryList(
    targetId: uuid,
    folderName: string,
    inventoryItems: string[],
  ): void

  /**
   * Transfers Amount of L$ from script owner to AvatarID.
   * This call will silently fail if PERMISSION_DEBIT has not been granted.
   */
  export function GiveMoney(avatarId: uuid, amount: number): number

  /** Rez directly off of a UUID if owner has god-bit set. */
  export function GodLikeRezObject(inventoryItemId: uuid, position: vector): void

  /**
   * Returns the ground height at the object position + offset.
   * Returns the ground height at the object's position + Offset.
   */
  export function Ground(offset: vector): number

  /**
   * Returns the ground contour direction below the object position + Offset.
   * Returns the ground contour at the object's position + Offset.
   */
  export function GroundContour(offset: vector): vector

  /**
   * Returns the ground normal below the object position + offset.
   * Returns the ground contour at the object's position + Offset.
   */
  export function GroundNormal(offset: vector): vector

  /**
   * Critically damps to height if within height * 0.5 of level (either above ground level or above the higher of land and water if water == TRUE).
   * Critically damps to fHeight if within fHeight * 0.5 of ground or water level.
   * The height is above ground level if iWater is FALSE or above the higher of land and water if iWater is TRUE.
   * Do not use with vehicles. Only works in physics-enabled objects.
   */
  export function GroundRepel(height: number, water: number, tau: number): void

  /**
   * Returns the ground slope below the object position + Offset.
   * Returns the ground slope at the object position + Offset.
   */
  export function GroundSlope(offset: vector): vector

  /** Returns the base64-encoded hashed message authentication code (HMAC), of Message using PEM-formatted Key and digest Algorithm (md5, sha1, sha224, sha256, sha384, sha512). */
  export function HMAC(key: string, message: string, algorithm: string): string

  /**
   * Sends an HTTP request to the specified URL with the Body of the request and Parameters.
   * Returns a key that is a handle identifying the HTTP request made.
   */
  export function HTTPRequest(url: string, parameters: list, body: string): uuid

  /** Responds to an incoming HTTP request which was triggerd by an http_request event within the script. HTTPRequestID specifies the request to respond to (this ID is supplied in the http_request event handler).  Status and Body specify the status code and message to respond with. */
  export function HTTPResponse(httpRequestId: uuid, status: number, body: string): void

  /** Calculates the 32bit hash value for the provided string. */
  export function Hash(value: string): number

  /**
   * Inserts SourceVariable into TargetVariable at Position, and returns the result.
   * Inserts SourceVariable into TargetVariable at Position and returns the result. Note this does not alter TargetVariable.
   * @indexArg position
   */
  export function InsertString(
    targetVariable: string,
    position: number,
    sourceVariable: string,
  ): string

  /**
   * IMs Text to the user identified.
   * Send Text to the user as an instant message.
   */
  export function InstantMessage(avatarId: uuid, text: string): void

  /**
   * Returns a string that is a Base64 big endian encode of Value.
   * Encodes the Value as an 8-character Base64 string.
   */
  export function IntegerToBase64(value: number): string

  /** Returns TRUE if avatar ID is a friend of the script owner. */
  export function IsFriend(agentId: uuid): number

  /** Checks the face for a PBR render material. */
  export function IsLinkGLTFMaterial(link: number, face: number): number

  /**
   * Converts the top level of the JSON string to a list.
   * @deprecated Use 'lljson.decode' instead.
   */
  export function Json2List(json: string): list

  /**
   * Gets the value indicated by Specifiers from the JSON string.
   * @deprecated Use 'lljson.decode' instead. Also, the indices are zero-based.
   */
  export function JsonGetValue(json: string, specifiers: list): string

  /**
   * Returns a new JSON string that is the JSON given with the Value indicated by Specifiers set to Value.
   * @deprecated Use 'lljson.encode' instead. Also, the indices are zero-based.
   */
  export function JsonSetValue(json: string, specifiers: list, value: string): string

  /**
   * Returns the type constant (JSON_*) for the value in JSON indicated by Specifiers.
   * @deprecated Use 'lljson.decode' and 'typeof' instead. Also, the indices are zero-based.
   */
  export function JsonValueType(json: string, specifiers: list): string

  /**
   * Returns the name of the prim or avatar specified by ID. The ID must be a valid rezzed prim or avatar key in the current simulator, otherwise an empty string is returned.
   * For avatars, the returned name is the legacy name
   */
  export function Key2Name(id: uuid): string

  /** Starts an asychronous transaction the request the number of keys in the data store. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will the the number of keys in the system. */
  export function KeyCountKeyValue(): uuid

  /**
   * Starts an asychronous transaction the request a number of keys from the data store. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. The error XP_ERROR_KEY_NOT_FOUND is returned if First is greater than or equal to the number of keys in the data store. In the success case the subsequent items will be the keys requested. The number of keys returned may be less than requested if the return value is too large or if there is not enough keys remaining. The order keys are returned is not guaranteed but is stable between subsequent calls as long as no keys are added or removed. Because the keys are returned in a comma-delimited list it is not recommended to use commas in key names if this function is used.
   * @indexArg first
   */
  export function KeysKeyValue(first: number, count: number): uuid

  /** Converts a color from the linear colorspace to sRGB. */
  export function Linear2sRGB(color: vector): vector

  /**
   * Adjusts the volume (0.0 - 1.0) of the currently playing sound attached to the link.
   * This function has no effect on sounds started with llTriggerSound.
   */
  export function LinkAdjustSoundVolume(linkNumber: number, volume: number): void

  /**
   * Creates a particle system in prim LinkNumber based on Rules. An empty list removes a particle system from object.
   * List format is [ rule-1, data-1, rule-2, data-2 ... rule-n, data-n ].
   * This is identical to llParticleSystem except that it applies to a specified linked prim and not just the prim the script is in.
   */
  export function LinkParticleSystem(linkNumber: number, rules: list): void

  /**
   * Plays Sound, once or looping, at Volume (0.0 - 1.0). The sound may be attached to the link or triggered at its location.
   * Only one sound may be attached to an object at a time, and attaching a new sound or calling llStopSound will stop the previously attached sound.
   */
  export function LinkPlaySound(
    linkNumber: number,
    sound: string,
    volume: number,
    flags: number,
  ): void

  /** Limits radius for audibility of scripted sounds (both attached and triggered) to distance Radius around the link. */
  export function LinkSetSoundQueueing(linkNumber: number, queueEnable: number): void

  /** Limits radius for audibility of scripted sounds (both attached and triggered) to distance Radius around the link. */
  export function LinkSetSoundRadius(linkNumber: number, radius: number): void

  /**
   * Set the sit location for the linked prim(s). If Offset == <0,0,0> clear it.
   * Set the sit location for the linked prim(s). The sit location is relative to the prim's position and rotation.
   */
  export function LinkSitTarget(linkNumber: number, offset: vector, rotation: quaternion): void

  /** Stops playback of the currently attached sound on a link. */
  export function LinkStopSound(linkNumber: number): void

  /** Returns the number of bytes remaining in the linkset's datastore. */
  export function LinksetDataAvailable(): number

  /** Returns the number of keys matching the regular expression passed in the search parameter. */
  export function LinksetDataCountFound(search: string): number

  /** Returns the number of keys in the linkset's datastore. */
  export function LinksetDataCountKeys(): number

  /** Deletes a name:value pair from the linkset's datastore. */
  export function LinksetDataDelete(name: string): number

  /** Deletes all key value pairs in the linkset data where the key matches the regular expression in search. Returns a list consisting of [ #deleted, #not deleted ]. */
  export function LinksetDataDeleteFound(search: string, pass: string): number[]

  /** Deletes a name:value pair from the linkset's datastore. */
  export function LinksetDataDeleteProtected(name: string, pass: string): number

  /**
   * Returns a list of keys from the linkset's data store matching the search parameter.
   * @indexArg start
   */
  export function LinksetDataFindKeys(search: string, start: number, count: number): string[]

  /**
   * Returns a list of all keys in the linkset datastore.
   * @indexArg start
   */
  export function LinksetDataListKeys(start: number, count: number): string[]

  /** Returns the value stored for a key in the linkset. */
  export function LinksetDataRead(name: string): string

  /** Returns the value stored for a key in the linkset. */
  export function LinksetDataReadProtected(name: string, pass: string): string

  /** Resets the linkset's data store, erasing all key-value pairs. */
  export function LinksetDataReset(): void

  /** Sets a name:value pair in the linkset's datastore */
  export function LinksetDataWrite(name: string, value: string): number

  /** Sets a name:value pair in the linkset's datastore */
  export function LinksetDataWriteProtected(name: string, value: string, pass: string): number

  /**
   * Creates a string of comma separated values from the list.
   * Create a string of comma separated values from the specified list.
   */
  export function List2CSV(listVariable: list): string

  /**
   * Copies the float at Index in the list.
   * Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to a float, then zero is returned.
   * @indexArg index
   */
  export function List2Float(listVariable: list, index: number): number

  /**
   * Copies the integer at Index in the list.
   * Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to an integer, then zero is returned.
   * @indexArg index
   */
  export function List2Integer(listVariable: list, index: number): number

  /**
   * Converts either a strided list of key:value pairs to a JSON_OBJECT, or a list of values to a JSON_ARRAY.
   * @deprecated Use 'lljson.encode' instead.
   */
  export function List2Json(jsonType: string, values: list): string

  /**
   * Copies the key at Index in the list.
   * Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to a key, then null string is returned.
   * @indexArg index
   */
  export function List2Key(listVariable: list, index: number): uuid

  /**
   * Returns a subset of entries from ListVariable, in a range specified by the Start and End indicies (inclusive).
   * Using negative numbers for Start and/or End causes the index to count backwards from the length of the string, so 0, -1 would capture the entire string.
   * If Start is greater than End, the sub string is the exclusion of the entries.
   * @indexArg start
   * @indexArg end
   */
  export function List2List(listVariable: T[], start: number, end: number): T[]

  /**
   * Returns a subset of entries from ListVariable, in a range specified by Start and End indices (inclusive) return the slice_index element of each stride.
   *  Using negative numbers for Start and/or End causes the index to count backwards from the length of the list. (e.g. 0, -1 captures entire list)
   * If slice_index is less than 0, it is counted backwards from the end of the stride.
   *  Stride must be a positive integer > 0 or an empy list is returned.  If slice_index falls outside range of stride, an empty list is returned. slice_index is zero-based. (e.g. A stride of 2 has valid indices 0,1)
   * @indexArg start
   * @indexArg end
   * @indexArg sliceIndex
   */
  export function List2ListSlice(
    listVariable: T[],
    start: number,
    end: number,
    stride: number,
    sliceIndex: number,
  ): T[]

  /**
   * Copies the strided slice of the list from Start to End.
   * Returns a copy of the strided slice of the specified list from Start to End.
   * @indexArg start
   * @indexArg end
   */
  export function List2ListStrided(
    listVariable: T[],
    start: number,
    end: number,
    stride: number,
  ): T[]

  /**
   * Copies the rotation at Index in the list.
   * Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to rotation, thenZERO_ROTATION is returned.
   * @indexArg index
   */
  export function List2Rot(listVariable: list, index: number): quaternion

  /**
   * Copies the string at Index in the list.
   * Returns the value at Index in the specified list as a string. If Index describes a location not in the list then null string is returned.
   * @indexArg index
   */
  export function List2String(listVariable: list, index: number): string

  /**
   * Copies the vector at Index in the list.
   * Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to a vector, then ZERO_VECTOR is returned.
   * @indexArg index
   */
  export function List2Vector(listVariable: list, index: number): vector

  /**
   * Returns the first index where Find appears in ListVariable. Returns -1 if not found.
   * @indexReturn
   */
  export function ListFindList(listVariable: list, find: list): number | undefined

  /**
   * Returns the nth index where Find appears in ListVariable. Returns -1 if not found.
   * @indexArg instance
   * @indexReturn
   */
  export function ListFindListNext(
    listVariable: list,
    find: list,
    instance: number,
  ): number | undefined

  /**
   * Returns the first index (where Start <= index <= End) where Find appears in ListVariable. Steps through ListVariable by Stride.  Returns -1 if not found.
   * @indexArg start
   * @indexArg end
   * @indexReturn
   */
  export function ListFindStrided(
    listVariable: list,
    find: list,
    start: number,
    end: number,
    stride: number,
  ): number | undefined

  /**
   * Returns a list that contains all the elements from Target but with the elements from ListVariable inserted at Position start.
   * Returns a new list, created by inserting ListVariable into the Target list at Position. Note this does not alter the Target.
   * @indexArg position
   */
  export function ListInsertList(target: T[], listVariable: T[], position: number): T[]

  /**
   * Returns a version of the input ListVariable which has been randomized by blocks of size Stride.
   * If the remainder from the length of the list, divided by the stride is non-zero, this function does not randomize the list.
   */
  export function ListRandomize(listVariable: T[], stride: number): T[]

  /**
   * Returns a list that is Target with Start through End removed and ListVariable inserted at Start.
   * Returns a list replacing the slice of the Target list from Start to End with the specified ListVariable. Start and End are inclusive, so 0, 1 would replace the first two entries and 0, 0 would replace only the first list entry.
   * @indexArg start
   * @indexArg end
   */
  export function ListReplaceList(target: T[], listVariable: T[], start: number, end: number): T[]

  /** Returns the specified list, sorted into blocks of stride in ascending order (if Ascending is TRUE, otherwise descending). Note that sort only works if the first entry of each block is the same datatype. */
  export function ListSort(listVariable: T[], stride: number, ascending: number): T[]

  /**
   * Returns the specified list, sorted by the specified element into blocks of stride in ascending order (if Ascending is TRUE, otherwise descending). Note that sort only works if the first entry of each block is the same datatype.
   * @indexArg sortkey
   */
  export function ListSortStrided(
    listVariable: T[],
    stride: number,
    sortkey: number,
    ascending: number,
  ): T[]

  /**
   * Performs a statistical aggregate function, specified by a LIST_STAT_* constant, on ListVariables.
   * This function allows a script to perform a statistical operation as defined by operation on a list composed of integers and floats.
   */
  export function ListStatistics(operation: number, listVariable: list): number

  /**
   * Creates a listen callback for Text on Channel from SpeakersName and SpeakersID (SpeakersName, SpeakersID, and/or Text can be empty) and returns an identifier that can be used to deactivate or remove the listen.
   * Non-empty values for SpeakersName, SpeakersID, and Text will filter the results accordingly, while empty strings and NULL_KEY will not filter the results, for string and key parameters respectively.
   * PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
   */
  export function Listen(
    channel: number,
    speakersName: string,
    speakersId: uuid,
    text: string,
  ): number

  /**
   * Makes a listen event callback active or inactive. Pass in the value returned from llListen to the iChannelHandle parameter to specify which listener you are controlling.
   * Use boolean values to specify Active
   */
  export function ListenControl(channelHandle: number, active: number): void

  /** Removes a listen event callback. Pass in the value returned from llListen to the iChannelHandle parameter to specify which listener to remove. */
  export function ListenRemove(channelHandle: number): void

  /**
   * Shows dialog to avatar AvatarID offering to load web page at URL.	If user clicks yes, launches their web browser.
   * llLoadURL displays a dialogue box to the user, offering to load the specified web page using the default web browser.
   */
  export function LoadURL(avatarId: uuid, text: string, url: string): void

  /**
   * Returns the natural logarithm of Value. Returns zero if Value <= 0.
   * Returns the base e (natural) logarithm of the specified Value.
   */
  export function Log(value: number): number

  /**
   * Returns the base 10 logarithm of Value. Returns zero if Value <= 0.
   * Returns the base 10 (common) logarithm of the specified Value.
   */
  export function Log10(value: number): number

  /**
   * Cause object name to point its forward axis towards Target, at a force controlled by Strength and Damping.
   * Good Strength values are around half the mass of the object and good Damping values are less than 1/10th of the Strength.
   * Asymmetrical shapes require smaller Damping. A Strength of 0.0 cancels the look at.
   */
  export function LookAt(target: vector, strength: number, damping: number): void

  /**
   * Plays specified Sound, looping indefinitely, at Volume (0.0 - 1.0).
   * Only one sound may be attached to an object at a time.
   * A second call to llLoopSound with the same key will not restart the sound, but the new volume will be used. This allows control over the volume of already playing sounds.
   * Setting the volume to 0 is not the same as calling llStopSound; a sound with 0 volume will continue to loop.
   * To restart the sound from the beginning, call llStopSound before calling llLoopSound again.
   */
  export function LoopSound(sound: string, volume: number): void

  /**
   * Plays attached Sound, looping at volume (0.0 - 1.0), and declares it a sync master.
   * Behaviour is identical to llLoopSound, with the addition of marking the source as a "Sync Master", causing "Slave" sounds to sync to it. If there are multiple masters within a viewers interest area, the most audible one (a function of both distance and volume) will win out as the master.
   * The use of multiple masters within a small area is unlikely to produce the desired effect.
   */
  export function LoopSoundMaster(sound: string, volume: number): void

  /**
   * Plays attached sound looping at volume (0.0 - 1.0), synced to most audible sync master.
   * Behaviour is identical to llLoopSound, unless there is a "Sync Master" present.
   * If a Sync Master is already playing the Slave sound will begin playing from the same point the master is in its loop synchronizing the loop points of both sounds.
   * If a Sync Master is started when the Slave is already playing, the Slave will skip to the correct position to sync with the Master.
   */
  export function LoopSoundSlave(sound: string, volume: number): void

  /**
   * Returns a string of 32 hex characters that is an RSA Data Security Inc., MD5 Message-Digest Algorithm of Text with Nonce used as the salt.
   * Returns a 32-character hex string. (128-bit in binary.)
   */
  export function MD5String(text: string, nonce: number): string

  /**
   * Make a round explosion of particles. Deprecated: Use llParticleSystem instead.
   * Make a round explosion of particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
   */
  export function MakeExplosion(
    particles: number,
    scale: number,
    velocity: number,
    lifetime: number,
    arc: number,
    texture: string,
    offset: vector,
  ): void

  /**
   * Make fire like particles. Deprecated: Use llParticleSystem instead.
   * Make fire particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
   */
  export function MakeFire(
    particles: number,
    scale: number,
    velocity: number,
    lifetime: number,
    arc: number,
    texture: string,
    offset: vector,
  ): void

  /**
   * Make a fountain of particles. Deprecated: Use llParticleSystem instead.
   * Make a fountain of particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
   */
  export function MakeFountain(
    particles: number,
    scale: number,
    velocity: number,
    lifetime: number,
    arc: number,
    bounce: number,
    texture: string,
    offset: vector,
    bounceOffset: number,
  ): void

  /**
   * Make smoke like particles. Deprecated: Use llParticleSystem instead.
   * Make smoky particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
   */
  export function MakeSmoke(
    particles: number,
    scale: number,
    velocity: number,
    lifetime: number,
    arc: number,
    texture: string,
    offset: vector,
  ): void

  /**
   * Adds or removes agents from the estate's agent access or ban lists, or groups to the estate's group access list. Action is one of the ESTATE_ACCESS_ALLOWED_* operations to perform.
   * Returns an integer representing a boolean, TRUE if the call was successful; FALSE if throttled, invalid action, invalid or null id or object owner is not allowed to manage the estate.
   * The object owner is notified of any changes, unless PERMISSION_SILENT_ESTATE_MANAGEMENT has been granted to the script.
   */
  export function ManageEstateAccess(action: number, avatarId: uuid): number

  /** Displays an in world beacon and optionally opens world map for avatar who touched the object or is wearing the script, centered on RegionName with Position highlighted. Only works for scripts attached to avatar, or during touch events. */
  export function MapBeacon(regionName: string, position: vector, options: list): void

  /**
   * Opens world map for avatar who touched it or is wearing the script, centred on RegionName with Position highlighted. Only works for scripts attached to avatar, or during touch events.
   * Direction currently has no effect.
   */
  export function MapDestination(regionName: string, position: vector, direction: vector): void

  /**
   * Sends Number, Text, and ID to members of the link set identified by LinkNumber.
   * LinkNumber is either a linked number (available through llGetLinkNumber) or a LINK_* constant.
   */
  export function MessageLinked(
    linkNumber: number,
    number: number,
    text: string | uuid,
    id: string | uuid,
  ): void

  /** Set the minimum time between events being handled. */
  export function MinEventDelay(delay: number): void

  /**
   * Returns a Value raised to the Power, mod Modulus. ((a**b)%c) b is capped at 0xFFFF (16 bits).
   * Returns (Value ^ Power) % Modulus. (Value raised to the Power, Modulus). Value is capped at 0xFFFF (16 bits).
   */
  export function ModPow(value: number, power: number, modulus: number): number

  /** Modify land with action (LAND_LEVEL, LAND_RAISE, LAND_LOWER, LAND_SMOOTH, LAND_NOISE, LAND_REVERT) on size (0, 1, 2, corresponding to 2m x 2m, 4m x 4m, 8m x 8m). */
  export function ModifyLand(action: number, area: number): void

  /**
   * Critically damp to Target in Tau seconds (if the script is physical).
   * Critically damp to position target in tau-seconds if the script is physical. Good tau-values are greater than 0.2. A tau of 0.0 stops the critical damping.
   */
  export function MoveToTarget(target: vector, tau: number): void

  /** Look up Agent ID for the named agent in the region. */
  export function Name2Key(name: string): uuid

  /**
   * Navigate to destination.
   * Directs an object to travel to a defined position in the region or adjacent regions.
   */
  export function NavigateTo(location: vector, options: list): void

  /**
   * Sets the texture S and T offsets for the chosen Face.
   * If Face is ALL_SIDES this function sets the texture offsets for all faces.
   */
  export function OffsetTexture(offsetS: number, offsetT: number, face: number): void

  /**
   * Returns the value for header for request_id.
   * Returns a string that is the value of the Header for HTTPRequestID.
   */
  export function OpenFloater(floaterName: string, url: string, params: list): number

  /** This function is deprecated. */
  export function OpenRemoteDataChannel(): void

  /**
   * Returns the unicode value of the indicated character in the string.
   * @indexArg index
   */
  export function Ord(value: string, index: number): number

  /**
   * Returns TRUE if id ID over land owned by the script owner, otherwise FALSE.
   * Returns TRUE if key ID is over land owned by the object owner, FALSE otherwise.
   */
  export function OverMyLand(id: uuid): number

  /**
   * says Text to owner only (if owner is in region).
   * Says Text to the owner of the object running the script, if the owner has been within the object's simulator since logging into Second Life, regardless of where they may be in-world.
   */
  export function OwnerSay(text: string): void

  /** Controls the playback of multimedia resources on a parcel or for an agent, via one or more PARCEL_MEDIA_COMMAND_* arguments specified in CommandList. */
  export function ParcelMediaCommandList(commandList: list): void

  /**
   * Queries the media properties of the parcel containing the script, via one or more PARCEL_MEDIA_COMMAND_* arguments specified in CommandList.
   * This function will only work if the script is contained within an object owned by the land-owner (or if the land is owned by a group, only if the object has been deeded to the group).
   */
  export function ParcelMediaQuery(queryList: number[]): list

  /**
   * Converts Text into a list, discarding Separators, keeping Spacers (Separators and Spacers must be lists of strings, maximum of 8 each).
   * Separators and Spacers are lists of strings with a maximum of 8 entries each.
   */
  export function ParseString2List(text: string, separators: string[], spacers: string[]): string[]

  /**
   * Breaks Text into a list, discarding separators, keeping spacers, keeping any null values generated. (separators and spacers must be lists of strings, maximum of 8 each).
   * llParseStringKeepNulls works almost exactly like llParseString2List, except that if a null is found it will add a null-string instead of discarding it like llParseString2List does.
   */
  export function ParseStringKeepNulls(
    text: string,
    separators: string[],
    spacers: string[],
  ): string[]

  /**
   * Creates a particle system in the prim the script is attached to, based on Parameters. An empty list removes a particle system from object.
   * List format is [ rule-1, data-1, rule-2, data-2 ... rule-n, data-n ].
   */
  export function ParticleSystem(parameters: list): void

  /**
   * Configures how collision events are passed to scripts in the linkset.
   * If Pass == TRUE, collisions involving collision-handling scripted child prims are also passed on to the root prim. If Pass == FALSE (default behavior), such collisions will only trigger events in the affected child prim.
   */
  export function PassCollisions(pass: number): void

  /**
   * Configures how touch events are passed to scripts in the linkset.
   * If Pass == TRUE, touches involving touch-handling scripted child prims are also passed on to the root prim. If Pass == FALSE (default behavior), such touches will only trigger events in the affected child prim.
   */
  export function PassTouches(pass: number): void

  /**
   * Patrol a list of points.
   * Sets the points for a character (llCreateCharacter) to patrol along.
   */
  export function PatrolPoints(points: vector[], options: list): void

  /**
   * Plays Sound once, at Volume (0.0 - 1.0) and attached to the object.
   * Only one sound may be attached to an object at a time, and attaching a new sound or calling llStopSound will stop the previously attached sound.
   * A second call to llPlaySound with the same sound will not restart the sound, but the new volume will be used, which allows control over the volume of already playing sounds.
   * To restart the sound from the beginning, call llStopSound before calling llPlaySound again.
   */
  export function PlaySound(sound: string, volume: number): void

  /**
   * Plays attached Sound once, at Volume (0.0 - 1.0), synced to next loop of most audible sync master.
   * Behaviour is identical to llPlaySound, unless there is a "Sync Master" present. If a Sync Master is already playing, the Slave sound will not be played until the Master hits its loop point and returns to the beginning.
   * llPlaySoundSlave will play the sound exactly once; if it is desired to have the sound play every time the Master loops, either use llLoopSoundSlave with extra silence padded on the end of the sound or ensure that llPlaySoundSlave is called at least once per loop of the Master.
   */
  export function PlaySoundSlave(sound: string, volume: number): void

  export function PointAt(point: vector): void

  /**
   * Returns the Value raised to the power Exponent, or returns 0 and triggers Math Error for imaginary results.
   * Returns the Value raised to the Exponent.
   */
  export function Pow(value: number, exponent: number): number

  /**
   * Causes nearby viewers to preload the Sound from the object's inventory.
   * This is intended to prevent delays in starting new sounds when called upon.
   */
  export function PreloadSound(sound: string): void

  /**
   * Chase after a target.
   * Causes the character (llCharacter) to pursue the target defined by TargetID.
   */
  export function Pursue(targetId: uuid, options: list): void

  /**
   * Applies Impulse and AngularImpulse to ObjectID.
   * Applies the supplied impulse and angular impulse to the object specified.
   */
  export function PushObject(
    objectId: uuid,
    impulse: vector,
    angularImpulse: vector,
    local: number,
  ): void

  /** Starts an asychronous transaction to retrieve the value associated with the key given. Will fail with XP_ERROR_KEY_NOT_FOUND if the key does not exist. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value associated with the key. */
  export function ReadKeyValue(key: string): uuid

  /** Reloads the web page shown on the sides of the object. */
  export function RefreshPrimURL(): void

  /** Broadcasts Text to entire region on Channel (except for channel 0). */
  export function RegionSay(channel: number, text: string): void

  /**
   * Says Text, on Channel, to avatar or object indicated by TargetID (if within region).
   * If TargetID is an avatar and Channel is nonzero, Text can be heard by any attachment on the avatar.
   */
  export function RegionSayTo(targetId: uuid, channel: number, text: string): void

  /**
   * Return camera to agent.
   * Deprecated: Use llClearCameraParams instead.
   */
  export function ReleaseCamera(avatarId: uuid): void

  /**
   * Stop taking inputs.
   * Stop taking inputs from the avatar.
   */
  export function ReleaseControls(): void

  /** Releases the specified URL, which was previously obtained using llRequestURL.  Once released, the URL will no longer be usable. */
  export function ReleaseURL(url: string): void

  /** This function is deprecated. */
  export function RemoteDataReply(
    channelId: uuid,
    messageId: uuid,
    sData: string,
    iData: number,
  ): void

  /** This function is deprecated. */
  export function RemoteDataSetRegion(): void

  export function RemoteLoadScript(
    target: uuid,
    scriptName: string,
    unknown1: number,
    unknown2: number,
  ): void

  /** If the owner of the object containing this script can modify the object identified by the specified object key, and if the PIN matches the PIN previously set using llSetRemoteScriptAccessPin (on the target prim), then the script will be copied into target. Running is a boolean specifying whether the script should be enabled once copied into the target object. */
  export function RemoteLoadScriptPin(
    objectId: uuid,
    scriptName: string,
    pin: number,
    running: number,
    startParameter: number,
  ): void

  /**
   * Remove avatar from the land ban list.
   * Remove specified avatar from the land parcel ban list.
   */
  export function RemoveFromLandBanList(avatarId: uuid): void

  /**
   * Remove avatar from the land pass list.
   * Remove specified avatar from the land parcel pass list.
   */
  export function RemoveFromLandPassList(avatarId: uuid): void

  /**
   * Remove the named inventory item.
   * Remove the named inventory item from the object inventory.
   */
  export function RemoveInventory(inventoryItem: string): void

  /**
   * Removes the enabled bits in 'flags'.
   * Sets the vehicle flags to FALSE. Valid parameters can be found in the vehicle flags constants section.
   */
  export function RemoveVehicleFlags(vehiclelags: number): void

  /** Replaces the entire environment for an agent. Must be used as part of an experience. */
  export function ReplaceAgentEnvironment(
    agentId: uuid,
    transition: number,
    environment: string,
  ): number

  /** Replaces the environment for a parcel or region. */
  export function ReplaceEnvironment(
    position: vector,
    environment: string,
    trackNo: number,
    dayLength: number,
    dayOffset: number,
  ): number

  /** Searches InitialString and replaces instances of SubString with NewSubString. Zero Count means "replace all". Positive Count moves left to right. Negative moves right to left. */
  export function ReplaceSubString(
    initialString: string,
    subString: string,
    newSubString: string,
    count: number,
  ): string

  /**
   * Requests data about AvatarID. When data is available the dataserver event will be raised.
   * This function requests data about an avatar. If and when the information is collected, the dataserver event is triggered with the key returned from this function passed in the requested parameter. See the agent data constants (DATA_*) for details about valid values of data and what each will return in the dataserver event.
   */
  export function RequestAgentData(avatarId: uuid, data: number): uuid

  /**
   * Requests the display name of the agent. When the display name is available the dataserver event will be raised.
   * The avatar identified does not need to be in the same region or online at the time of the request.
   * Returns a key that is used to identify the dataserver event when it is raised.
   */
  export function RequestDisplayName(avatarId: uuid): uuid

  /** Ask the agent for permission to participate in an experience. This request is similar to llRequestPermissions with the following permissions: PERMISSION_TAKE_CONTROLS, PERMISSION_TRIGGER_ANIMATION, PERMISSION_ATTACH, PERMISSION_TRACK_CAMERA, PERMISSION_CONTROL_CAMERA and PERMISSION_TELEPORT. However, unlike llRequestPermissions the decision to allow or block the request is persistent and applies to all scripts using the experience grid wide. Subsequent calls to llRequestExperiencePermissions from scripts in the experience will receive the same response automatically with no user interaction. One of experience_permissions or experience_permissions_denied will be generated in response to this call. Outstanding permission requests will be lost if the script is derezzed, moved to another region or reset. */
  export function RequestExperiencePermissions(agentId: uuid, unused: string): void

  /**
   * Requests data for the named InventoryItem.
   * When data is available, the dataserver event will be raised with the key returned from this function in the requested parameter.
   * The only request currently implemented is to request data from landmarks, where the data returned is in the form "<float, float, float>" which can be cast to a vector. This position is in region local coordinates.
   */
  export function RequestInventoryData(inventoryItem: string): uuid

  /**
   * Ask AvatarID to allow the script to perform certain actions, specified in the PermissionMask bitmask. PermissionMask should be one or more PERMISSION_* constants. Multiple permissions can be requested simultaneously by ORing the constants together. Many of the permissions requests can only go to object owner.
   * This call will not stop script execution. If the avatar grants the requested permissions, the run_time_permissions event will be called.
   */
  export function RequestPermissions(avatarId: uuid, permissionMask: number): void

  /**
   * Requests one HTTPS:// (SSL) URL for use by this object. The http_request event is triggered with results.
   * Returns a key that is the handle used for identifying the request in the http_request event.
   */
  export function RequestSecureURL(): uuid

  /**
   * Requests the specified Data about RegionName. When the specified data is available, the dataserver event is raised.
   * Data should use one of the DATA_SIM_* constants.
   * Returns a dataserver query ID and triggers the dataserver event when data is found.
   */
  export function RequestSimulatorData(regionName: string, data: number): uuid

  /**
   * Requests one HTTP:// URL for use by this script. The http_request event is triggered with the result of the request.
   * Returns a key that is the handle used for identifying the result in the http_request event.
   */
  export function RequestURL(): uuid

  /** Look up Agent ID for the named agent using a historical name. */
  export function RequestUserKey(name: string): uuid

  /**
   * Requests single-word user-name of an avatar. When data is available the dataserver event will be raised.
   * Requests the user-name of the identified agent. When the user-name is available the dataserver event is raised.
   * The agent identified does not need to be in the same region or online at the time of the request.
   * Returns a key that is used to identify the dataserver event when it is raised.
   */
  export function RequestUsername(avatarId: uuid): uuid

  /**
   * Resets the animation of the specified animation state to the default value.
   * If animation state equals "ALL", then all animation states are reset.
   * Requires the PERMISSION_OVERRIDE_ANIMATIONS permission (automatically granted to attached objects).
   */
  export function ResetAnimationOverride(animationState: string): void

  /** Removes all residents from the land ban list. */
  export function ResetLandBanList(): void

  /** Removes all residents from the land access/pass list. */
  export function ResetLandPassList(): void

  /** Resets the named script. */
  export function ResetOtherScript(scriptName: string): void

  /** Resets the script. */
  export function ResetScript(): void

  /**
   * Return objects using their UUIDs.
   * Requires the PERMISSION_RETURN_OBJECTS permission and that the script owner owns the parcel the returned objects are in, or is an estate manager or region owner.
   */
  export function ReturnObjectsByID(objectIDs: uuid[]): number

  /**
   * Return objects based upon their owner and a scope of parcel, parcel owner, or region.
   * Requires the PERMISSION_RETURN_OBJECTS permission and that the script owner owns the parcel the returned objects are in, or is an estate manager or region owner.
   */
  export function ReturnObjectsByOwner(id: uuid, scope: number): number

  /**
   * Instantiate owner's InventoryItem at Position with Velocity, Rotation and with StartParameter. The last selected root object's location will be set to Position.
   * Creates object's inventory item at the given Position, with Velocity, Rotation, and StartParameter.
   */
  export function RezAtRoot(
    inventoryItem: string,
    position: vector,
    velocity: vector,
    rotation: quaternion,
    startParameter: number,
  ): void

  /**
   * Instantiate owners InventoryItem at Position with Velocity, Rotation and with start StartParameter.
   * Creates object's inventory item at Position with Velocity and Rotation supplied. The StartParameter value will be available to the newly created object in the on_rez event or through the llGetStartParameter function.
   * The Velocity parameter is ignored if the rezzed object is not physical.
   */
  export function RezObject(
    inventoryItem: string,
    position: vector,
    velocity: vector,
    rotation: quaternion,
    startParameter: number,
  ): void

  /** Instantiate owner's InventoryItem with the given parameters. */
  export function RezObjectWithParams(inventoryItem: string, params: list): uuid

  /**
   * Returns the rotation angle represented by Rotation.
   * Returns the angle represented by the Rotation.
   */
  export function Rot2Angle(rotation: quaternion): number

  /**
   * Returns the rotation axis represented by Rotation.
   * Returns the axis represented by the Rotation.
   */
  export function Rot2Axis(rotation: quaternion): vector

  /**
   * Returns the Euler representation (roll, pitch, yaw) of Rotation.
   * Returns the Euler Angle representation of the Rotation.
   */
  export function Rot2Euler(rotation: quaternion): vector

  /**
   * Returns the forward vector defined by Rotation.
   * Returns the forward axis represented by the Rotation.
   */
  export function Rot2Fwd(rotation: quaternion): vector

  /**
   * Returns the left vector defined by Rotation.
   * Returns the left axis represented by the Rotation.
   */
  export function Rot2Left(rotation: quaternion): vector

  /**
   * Returns the up vector defined by Rotation.
   * Returns the up axis represented by the Rotation.
   */
  export function Rot2Up(rotation: quaternion): vector

  /**
   * Returns the rotation to rotate Vector1 to Vector2.
   * Returns the rotation needed to rotate Vector1 to Vector2.
   */
  export function RotBetween(vector1: vector, vector2: vector): quaternion

  /**
   * Cause object to rotate to Rotation, with a force function defined by Strength and Damping parameters. Good strength values are around half the mass of the object and good damping values are less than 1/10th of the strength.
   * Asymmetrical shapes require smaller damping.
   * A strength of 0.0 cancels the look at.
   */
  export function RotLookAt(rotation: quaternion, strength: number, damping: number): void

  /**
   * Set rotations with error of LeeWay radians as a rotational target, and return an ID for the rotational target.
   * The returned number is a handle that can be used in at_rot_target and llRotTargetRemove.
   */
  export function RotTarget(rotation: quaternion, leeWay: number): number

  /**
   * Removes rotational target number.
   * Remove rotational target indicated by the handle.
   */
  export function RotTargetRemove(handle: number): void

  /**
   * Sets the texture rotation for the specified Face to angle Radians.
   * If Face is ALL_SIDES, rotates the texture of all sides.
   */
  export function RotateTexture(radians: number, face: number): void

  /**
   * Returns Value rounded to the nearest integer.
   * Returns the Value rounded to the nearest integer.
   */
  export function Round(value: number): number

  /** Returns a string of 40 hex characters that is the SHA1 security hash of text. */
  export function SHA1String(text: string): string

  /** Returns a string of 64 hex characters that is the SHA256 security hash of text. */
  export function SHA256String(text: string): string

  /**
   * Returns TRUE if avatar ID is in the same region and has the same active group, otherwise FALSE.
   * Returns TRUE if the object or agent identified is in the same simulator and has the same active group as this object. Otherwise, returns FALSE.
   */
  export function SameGroup(id: uuid): number

  /**
   * Says Text on Channel.
   * This chat method has a range of 20m radius.
   * PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
   */
  export function Say(channel: number, text: string): void

  /**
   * Attempts to resize the entire object by ScalingFactor, maintaining the size-position ratios of the prims.
   *
   * Resizing is subject to prim scale limits and linkability limits. This function can not resize the object if the linkset is physical, a pathfinding character, in a keyframed motion, or if resizing would cause the parcel to overflow.
   * Returns a boolean (an integer) TRUE if it succeeds, FALSE if it fails.
   */
  export function ScaleByFactor(scalingFactor: number): number

  /**
   * Sets the diffuse texture Horizontal and Vertical repeats on Face of the prim the script is attached to.
   * If Face == ALL_SIDES, all sides are set in one call.
   * Negative values for horizontal and vertical will flip the texture.
   */
  export function ScaleTexture(horizontal: number, vertical: number, face: number): void

  /**
   * Returns TRUE if Position is over public land, sandbox land, land that doesn't allow everyone to edit and build, or land that doesn't allow outside scripts.
   * Returns true if the position is over public land, land that doesn't allow everyone to edit and build, or land that doesn't allow outside scripts.
   */
  export function ScriptDanger(position: vector): number

  /**
   * Enables or disables script profiling options. Currently only supports PROFILE_SCRIPT_MEMORY (Mono only) and PROFILE_NONE.
   * May significantly reduce script performance.
   */
  export function ScriptProfiler(state: number): void

  /** This function is deprecated. */
  export function SendRemoteData(
    channelId: uuid,
    destination: string,
    value: number,
    text: string,
  ): uuid

  /**
   * Performs a single scan for Name and ID with Type (AGENT, ACTIVE, PASSIVE, and/or SCRIPTED) within Range meters and Arc radians of forward vector.
   * Specifying a blank Name, 0 Type, or NULL_KEY ID will prevent filtering results based on that parameter. A range of 0.0 does not perform a scan.
   * Results are returned in the sensor and no_sensor events.
   */
  export function Sensor(name: string, id: uuid, type: number, range: number, arc: number): void

  /**
   * removes sensor.
   * Removes the sensor set by llSensorRepeat.
   */
  export function SensorRemove(): void

  /**
   * Initiates a periodic scan every Rate seconds, for Name and ID with Type (AGENT, ACTIVE, PASSIVE, and/or SCRIPTED) within Range meters and Arc radians of forward vector.
   * Specifying a blank Name, 0 Type, or NULL_KEY ID will prevent filtering results based on that parameter. A range of 0.0 does not perform a scan.
   * Results are returned in the sensor and no_sensor events.
   */
  export function SensorRepeat(
    name: string,
    id: uuid,
    type: number,
    range: number,
    arc: number,
    rate: number,
  ): void

  /** Sets an agent's environmental values to the specified values. Must be used as part of an experience. */
  export function SetAgentEnvironment(agentId: uuid, transition: number, settings: list): number

  /** Sets the avatar rotation to the given value. */
  export function SetAgentRot(rot: quaternion, flags: number): void

  /**
   * Sets the alpha (opacity) of Face.
   * Sets the alpha (opacity) value for Face. If Face is ALL_SIDES, sets the alpha for all faces. The alpha value is interpreted as an opacity percentage (1.0 is fully opaque, and 0.2 is mostly transparent). This function will clamp alpha values less than 0.1 to 0.1 and greater than 1.0 to 1.
   */
  export function SetAlpha(opacity: number, face: number): void

  /**
   * Sets an object's angular velocity to AngVel, in local coordinates if Local == TRUE (if the script is physical).
   * Has no effect on non-physical objects.
   */
  export function SetAngularVelocity(angVel: vector, local: number): void

  /**
   * Sets the animation (in object inventory) that will play for the given animation state.
   * To use this function the script must obtain the PERMISSION_OVERRIDE_ANIMATIONS permission.
   */
  export function SetAnimationOverride(animationState: string, animationName: string): void

  /**
   * Set the tasks buoyancy (0 is none, < 1.0 sinks, 1.0 floats, > 1.0 rises).
   * Set the object buoyancy. A value of 0 is none, less than 1.0 sinks, 1.0 floats, and greater than 1.0 rises.
   */
  export function SetBuoyancy(buoyancy: number): void

  /**
   * Sets the camera used in this object, at offset, if an avatar sits on it.
   * Sets the offset that an avatar's camera will be moved to if the avatar sits on the object.
   */
  export function SetCameraAtOffset(offset: vector): void

  /** Sets the camera eye offset used in this object if an avatar sits on it. */
  export function SetCameraEyeOffset(offset: vector): void

  /**
   * Sets multiple camera parameters at once. List format is [ rule-1, data-1, rule-2, data-2 . . . rule-n, data-n ].
   * Requires the PERMISSION_CONTROL_CAMERA runtime permission (automatically granted to attached or sat on objects).
   */
  export function SetCameraParams(parameters: list): void

  /** Sets the action performed when a prim is clicked upon. */
  export function SetClickAction(action: number): void

  /**
   * Sets the color, for the face.
   * Sets the color of the side specified. If Face is ALL_SIDES, sets the color on all faces.
   */
  export function SetColor(color: vector, face: number): void

  /**
   * Set the media type of an LSL HTTP server response to ContentType.
   * HTTPRequestID must be a valid http_request ID. ContentType must be one of the CONTENT_TYPE_* constants.
   */
  export function SetContentType(httpRequestId: uuid, contentType: number): void

  /**
   * Sets the amount of damage that will be done to an avatar that this task hits.	Task will be killed.
   * Sets the amount of damage that will be done to an avatar that this object hits. This object will be destroyed on damaging an avatar, and no collision event is triggered.
   */
  export function SetDamage(damage: number): void

  /** Returns a string with the requested data about the region. */
  export function SetEnvironment(position: vector, envParams: list): number

  export function SetExperienceKey(experienceId: uuid): number

  /**
   * Sets Force on object, in object-local coordinates if Local == TRUE (otherwise, the region reference frame is used).
   * Only works on physical objects.
   */
  export function SetForce(force: vector, local: number): void

  /**
   * Sets the Force and Torque of object, in object-local coordinates if Local == TRUE (otherwise, the region reference frame is used).
   * Only works on physical objects.
   */
  export function SetForceAndTorque(force: vector, torque: vector, local: number): void

  /** Changes terrain texture properties in the region. */
  export function SetGroundTexture(changes: list): number

  /**
   * Critically damps a physical object to a Height (either above ground level or above the higher of land and water if water == TRUE).
   * Do not use with vehicles. Use llStopHover to stop hovering.
   */
  export function SetHoverHeight(height: number, water: number, tau: number): void

  /** Sets the given permission mask to the new value on the inventory item. */
  export function SetInventoryPermMask(
    inventoryItem: string,
    permissionFlag: number,
    permissionMask: number,
  ): void

  /**
   * Requests that a non-physical object be key-framed according to key-frame list.
   * Specify a list of times, positions, and orientations to be followed by an object. The object will be smoothly moved between key-frames by the simulator. Collisions with other non-physical or key-framed objects will be ignored (no script events will fire and collision processing will not occur). Collisions with physical objects will be computed and reported, but the key-framed object will be unaffected by those collisions.
   * Keyframes is a strided list containing positional, rotational, and time data for each step in the motion.  Options is a list containing optional arguments and parameters (specified by KFM_* constants).
   */
  export function SetKeyframedMotion(keyframes: list, options: list): void

  /**
   * If a prim exists in the link chain at LinkNumber, set Face to Opacity.
   * Sets the Face, on the linked prim specified, to the Opacity.
   */
  export function SetLinkAlpha(linkNumber: number, opacity: number, face: number): void

  /** Sets the camera eye offset, and the offset that camera is looking at, for avatars that sit on the linked prim. */
  export function SetLinkCamera(linkNumber: number, eyeOffset: vector, lookOffset: vector): void

  /**
   * If a task exists in the link chain at LinkNumber, set the Face to color.
   * Sets the color of the linked child's side, specified by LinkNumber.
   */
  export function SetLinkColor(linkNumber: number, color: vector, face: number): void

  /** Sets or changes GLTF Overrides set on the selected faces. */
  export function SetLinkGLTFOverrides(link: number, face: number, options: list): void

  /**
   * Set the media parameters for a particular face on linked prim, specified by Link. Returns an integer that is a STATUS_* flag which details the success/failure of the operation(s).
   * MediaParameters is a set of name/value pairs in no particular order. Parameters not specified are unchanged, or if new media is added then set to the default specified.
   */
  export function SetLinkMedia(link: number, face: number, parameters: list): number

  /** Deprecated: Use llSetLinkPrimitiveParamsFast instead. */
  export function SetLinkPrimitiveParams(linkNumber: number, parameters: list): void

  /**
   * Set primitive parameters for LinkNumber based on Parameters, without a delay.
   * Set parameters for link number, from the list of Parameters, with no built-in script sleep. This function is identical to llSetLinkPrimitiveParams, except without the delay.
   */
  export function SetLinkPrimitiveParamsFast(linkNumber: number, parameters: list): void

  /** Sets the Render Material of Face on a linked prim, specified by LinkNumber. Render Material may be a UUID or name of a material in prim inventory. */
  export function SetLinkRenderMaterial(
    linkNumber: number,
    renderMaterial: string,
    face: number,
  ): void

  /** Sets the sit flags for the specified prim in a linkset. */
  export function SetLinkSitFlags(linkNumber: number, flags: number): void

  /** Sets the Texture of Face on a linked prim, specified by LinkNumber. Texture may be a UUID or name of a texture in prim inventory. */
  export function SetLinkTexture(linkNumber: number, texture: string, face: number): void

  /**
   * Animates a texture on the prim specified by LinkNumber, by setting the texture scale and offset.
   * Mode is a bitmask of animation options.
   * Face specifies which object face to animate.
   * SizeX and SizeY specify the number of horizontal and vertical frames.Start specifes the animation start point.
   * Length specifies the animation duration.
   * Rate specifies the animation playback rate.
   */
  export function SetLinkTextureAnim(
    linkNumber: number,
    mode: number,
    face: number,
    sizeX: number,
    sizeY: number,
    start: number,
    length: number,
    rate: number,
  ): void

  /** Sets the rotation of a child prim relative to the root prim. */
  export function SetLocalRot(rotation: quaternion): void

  /**
   * Sets the description of the prim to Description.
   * The description field is limited to 127 characters.
   */
  export function SetObjectDesc(description: string): void

  /** Sets the prim's name to Name. */
  export function SetObjectName(name: string): void

  /** Sets the specified PermissionFlag permission to the value specified by PermissionMask on the object the script is attached to. */
  export function SetObjectPermMask(permissionFlag: number, permissionMask: number): void

  /**
   * Sets the parcel the object is on for sale.
   * ForSale is a boolean, if TRUE the parcel is put up for sale. Options is a list of options to set for the sale, such as price, authorized buyer, and whether to include objects on the parcel.
   *  Setting ForSale to FALSE will remove the parcel from sale and clear any options that were set.
   * Requires the PERMISSION_PRIVILEGED_LAND_ACCESS permission.
   */
  export function SetParcelForSale(forSale: number, options: list): number

  /**
   * Sets the streaming audio URL for the parcel the object is on.
   * The object must be owned by the owner of the parcel; if the parcel is group owned the object must be owned by that group.
   */
  export function SetParcelMusicURL(url: string): void

  /**
   * Sets the default amount when someone chooses to pay this object.
   * Price is the default price shown in the text input field.  QuickButtons specifies the 4 payment values shown in the payment dialog's buttons.
   * Input field and buttons may be hidden with PAY_HIDE constant, and may be set to their default values using PAY_DEFAULT.
   */
  export function SetPayPrice(price: number, quickButtons: number[]): void

  /**
   * Sets the selected parameters of the object's physics behavior.
   * MaterialBits is a bitmask specifying which of the parameters in the other arguments should be applied to the object. GravityMultiplier, Restitution, Friction, and Density are the possible parameters to manipulate.
   */
  export function SetPhysicsMaterial(
    materialBits: number,
    gravityMultiplier: number,
    restitution: number,
    friction: number,
    density: number,
  ): void

  /**
   * If the object is not physical, this function sets the position of the prim.
   * If the script is in a child prim, Position is treated as root relative and the link-set is adjusted.
   * If the prim is the root prim, the entire object is moved (up to 10m) to Position in region coordinates.
   */
  export function SetPos(position: vector): void

  /**
   * Sets the MediaParameters for a particular Face on the prim. Returns an integer that is a STATUS_* flag which details the success/failure of the operation(s).
   * MediaParameters is a set of name/value pairs in no particular order. Parameters not specified are unchanged, or if new media is added then set to the default specified.
   */
  export function SetPrimMediaParams(face: number, mediaParameters: list): number

  /** Deprecated: Use llSetPrimMediaParams instead. */
  export function SetPrimURL(url: string): void

  /** Deprecated: Use llSetLinkPrimitiveParamsFast instead. */
  export function SetPrimitiveParams(parameters: list): void

  /**
   * Attempts to move the object so that the root prim is within 0.1m of Position.
   * Returns an integer boolean, TRUE if the object is successfully placed within 0.1 m of Position, FALSE otherwise.
   * Position may be any location within the region or up to 10m across a region border.
   * If the position is below ground, it will be set to the ground level at that x,y location.
   */
  export function SetRegionPos(position: vector): number

  /** If PIN is set to a non-zero number, the task will accept remote script loads via llRemoteLoadScriptPin() if it passes in the correct PIN. Othersise, llRemoteLoadScriptPin() is ignored. */
  export function SetRemoteScriptAccessPin(pin: number): void

  /**
   * Applies Render Material to Face of prim.
   * Render Material may be a UUID or name of a material in prim inventory.
   * If Face is ALL_SIDES, set the render material on all faces.
   */
  export function SetRenderMaterial(material: string, face: number): void

  /**
   * If the object is not physical, this function sets the rotation of the prim.
   * If the script is in a child prim, Rotation is treated as root relative and the link-set is adjusted.
   * If the prim is the root prim, the entire object is rotated to Rotation in the global reference frame.
   */
  export function SetRot(rotation: quaternion): void

  /** Sets the prim's scale (size) to Scale. */
  export function SetScale(scale: vector): void

  /** Enable or disable the script Running state of Script in the prim. */
  export function SetScriptState(scriptName: string, running: number): void

  /** Displays Text rather than 'Sit' in the viewer's context menu. */
  export function SetSitText(text: string): void

  /**
   * Sets whether successive calls to llPlaySound, llLoopSound, etc., (attached sounds) interrupt the currently playing sound.
   * The default for objects is FALSE. Setting this value to TRUE will make the sound wait until the current playing sound reaches its end. The queue is one level deep.
   */
  export function SetSoundQueueing(queueEnable: number): void

  /** Limits radius for audibility of scripted sounds (both attached and triggered) to distance Radius. */
  export function SetSoundRadius(radius: number): void

  /**
   * Sets object status specified in Status bitmask (e.g. STATUS_PHYSICS|STATUS_PHANTOM) to boolean Value.
   * For a full list of STATUS_* constants, see wiki documentation.
   */
  export function SetStatus(status: number, value: number): void

  /** Causes Text to float above the prim, using the specified Color and Opacity. */
  export function SetText(text: string, color: vector, opacity: number): void

  /**
   * Applies Texture to Face of prim.
   * Texture may be a UUID or name of a texture in prim inventory.
   * If Face is ALL_SIDES, set the texture on all faces.
   */
  export function SetTexture(texture: string, face: number): void

  /**
   * Animates a texture by setting the texture scale and offset.
   * Mode is a bitmask of animation options.
   * Face specifies which object face to animate.
   * SizeX and SizeY specify the number of horizontal and vertical frames.Start specifes the animation start point.
   * Length specifies the animation duration.
   * Rate specifies the animation playback rate.
   */
  export function SetTextureAnim(
    mode: number,
    face: number,
    sizeX: number,
    sizeY: number,
    start: number,
    length: number,
    rate: number,
  ): void

  /**
   * Sets the Torque acting on the script's object, in object-local coordinates if Local == TRUE (otherwise, the region reference frame is used).
   * Only works on physical objects.
   */
  export function SetTorque(torque: vector, local: number): void

  /** Displays Text in the viewer context menu that acts on a touch. */
  export function SetTouchText(text: string): void

  /**
   * Enables the vehicle flags specified in the Flags bitmask.
   * Valid parameters can be found in the wiki documentation.
   */
  export function SetVehicleFlags(flags: number): void

  /**
   * Sets a vehicle float parameter.
   * Valid parameters can be found in the wiki documentation.
   */
  export function SetVehicleFloatParam(parameterName: number, parameterValue: number): void

  /**
   * Sets a vehicle rotation parameter.
   * Valid parameters can be found in the wiki documentation.
   */
  export function SetVehicleRotationParam(parameterName: number, parameterValue: quaternion): void

  /**
   * Activates the vehicle action on the object with vehicle preset Type.
   * Valid Types and an explanation of their characteristics can be found in wiki documentation.
   */
  export function SetVehicleType(type: number): void

  /**
   * Sets a vehicle vector parameter.
   * Valid parameters can be found in the wiki documentation.
   */
  export function SetVehicleVectorParam(parameterName: number, parameterValue: vector): void

  /**
   * If the object is physics-enabled, sets the object's linear velocity to Velocity.
   * If Local==TRUE, Velocity is treated as a local directional vector; otherwise, Velocity is treated as a global directional vector.
   */
  export function SetVelocity(velocity: vector, local: number): void

  /**
   * Shouts Text on Channel.
   * This chat method has a range of 100m radius.
   * PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
   */
  export function Shout(channel: number, text: string): void

  /** Returns the base64-encoded RSA signature of Message using PEM-formatted PrivateKey and digest Algorithm (sha1, sha224, sha256, sha384, sha512). */
  export function SignRSA(privateKey: string, message: string, algorithm: string): string

  /** Returns the sine of Theta (Theta in radians). */
  export function Sin(theta: number): number

  /** If agent identified by AvatarID is participating in the experience, sit them on the specified link's sit target. */
  export function SitOnLink(avatarId: uuid, linkId: number): number

  /** Set the sit location for this object. If offset == ZERO_VECTOR, clears the sit target. */
  export function SitTarget(offset: vector, rotation: quaternion): void

  /** Put script to sleep for Time seconds. */
  export function Sleep(time: number): void

  /**
   * Deprecated: Use llPlaySound instead.
   * Plays Sound at Volume and specifies whether the sound should loop and/or be enqueued.
   */
  export function Sound(sound: string, volume: number, queue: number, loop: number): void

  /**
   * Deprecated: Use llPreloadSound instead.
   * Preloads a sound on viewers within range.
   */
  export function SoundPreload(sound: string): void

  /**
   * Returns the square root of Value.
   * Triggers a math runtime error for imaginary results (if Value < 0.0).
   */
  export function Sqrt(value: number): number

  /**
   * This function plays the specified animation from playing on the avatar who received the script's most recent permissions request.
   * Animation may be an animation in task inventory or a built-in animation.
   * Requires the PERMISSION_TRIGGER_ANIMATION runtime permission (automatically granted to attached or sat on objects).
   */
  export function StartAnimation(animation: string): void

  /**
   * This function plays the specified animation on the rigged mesh object associated with the current script.
   * Animation may be an animation in task inventory or a built-in animation.
   */
  export function StartObjectAnimation(animation: string): void

  /**
   * This function stops the specified animation on the avatar who received the script's most recent permissions request.
   * Animation may be an animation in task inventory, a built-in animation, or the uuid of an animation.
   * Requires the PERMISSION_TRIGGER_ANIMATION runtime permission (automatically granted to attached or sat on objects).
   */
  export function StopAnimation(animation: string): void

  /** Stop hovering to a height (due to llSetHoverHeight()). */
  export function StopHover(): void

  /** Stop causing object to point at a target (due to llLookAt() or llRotLookAt()). */
  export function StopLookAt(): void

  /** Stops critically damped motion (due to llMoveToTarget()). */
  export function StopMoveToTarget(): void

  /**
   * This function stops the specified animation on the rigged mesh object associated with the current script.
   * Animation may be an animation in task inventory, a built-in animation, or the uuid of an animation.
   */
  export function StopObjectAnimation(animation: string): void

  export function StopPointAt(): void

  /** Stops playback of the currently attached sound. */
  export function StopSound(): void

  /** Returns an integer that is the number of characters in Text (not counting the null). */
  export function StringLength(text: string): number

  /** Returns the string Base64 representation of the input string. */
  export function StringToBase64(text: string): string

  /**
   * Outputs a string, eliminating white-space from the start and/or end of the input string Text.
   * Valid options for TrimType:
   * STRING_TRIM_HEAD: trim all leading spaces in Text
   * STRING_TRIM_TAIL: trim all trailing spaces in Text
   * STRING_TRIM: trim all leading and trailing spaces in Text.
   */
  export function StringTrim(text: string, trimType: number): string

  /**
   * Returns the first index where Sequence appears in Text. Returns -1 if not found.
   * @indexReturn
   */
  export function SubStringIndex(text: string, sequence: string): number | undefined

  /** Deprecated: Use llSetCameraParams instead. */
  export function TakeCamera(avatarId: uuid): void

  /**
   * Take controls from the agent the script has permissions for.
   * If (Accept == (Controls & input)), send input to the script.  PassOn determines whether Controls also perform their normal functions.
   * Requires the PERMISSION_TAKE_CONTROLS runtime permission (automatically granted to attached or sat on objects).
   */
  export function TakeControls(controls: number, accept: number, passOn: number): void

  /** Returns the tangent of Theta (Theta in radians). */
  export function Tan(theta: number): number

  /**
   * This function is to have the script know when it has reached a position.
   * It registers a Position with a Range that triggers at_target and not_at_target events continuously until unregistered.
   */
  export function Target(position: vector, range: number): number

  /**
   * Attempt to spin at SpinRate with strength Gain on Axis.
   * A spin rate of 0.0 cancels the spin. This function always works in object-local coordinates.
   */
  export function TargetOmega(axis: vector, spinRate: number, gain: number): void

  /** Removes positional target Handle registered with llTarget. */
  export function TargetRemove(target: number): void

  /** Sends an email with Subject and Message to the owner or creator of an object. */
  export function TargetedEmail(target: number, subject: string, text: string): void

  /**
   * Requests a teleport of avatar to a landmark stored in the object's inventory. If no landmark is provided (an empty string), the avatar is teleported to the location position in the current region. In either case, the avatar is turned to face the position given by look_at in local coordinates.
   * Requires the PERMISSION_TELEPORT runtime permission.
   * This function can only teleport the owner of the object.
   */
  export function TeleportAgent(
    avatarId: uuid,
    landmarkName: string,
    position: vector,
    lookAtPoint: vector,
  ): void

  /**
   * Teleports an agent to the RegionPosition local coordinates within a region which is specified by the GlobalPosition global coordinates. The agent lands facing the position defined by LookAtPoint local coordinates.
   * Requires the PERMISSION_TELEPORT runtime permission.
   * This function can only teleport the owner of the object.
   */
  export function TeleportAgentGlobalCoords(
    avatarId: uuid,
    globalPosition: vector,
    regionPosition: vector,
    lookAtPoint: vector,
  ): void

  /** Teleport agent over the owner's land to agent's home location. */
  export function TeleportAgentHome(avatarId: uuid): void

  /** Opens a dialog for the specified avatar with message Text, which contains a text box for input. Any text that is entered is said on the specified Channel (as if by the avatar) when the "OK" button is clicked. */
  export function TextBox(avatarId: uuid, text: string, channel: number): void

  /** Returns a string that is Text with all lower-case characters. */
  export function ToLower(text: string): string

  /** Returns a string that is Text with all upper-case characters. */
  export function ToUpper(text: string): string

  /**
   * Transfer Amount of linden dollars (L$) from script owner to AvatarID. Returns a key to a corresponding transaction_result event for the success of the transfer.
   * Attempts to send the amount of money to the specified avatar, and trigger a transaction_result event identified by the returned key. Requires the PERMISSION_DEBIT runtime permission.
   */
  export function TransferLindenDollars(avatarId: uuid, amount: number): uuid

  /** Transfers ownership of an object, or a copy of the object to a new agent. */
  export function TransferOwnership(agentId: uuid, flags: number, params: list): number

  /**
   * Plays Sound at Volume (0.0 - 1.0), centered at but not attached to object.
   * There is no limit to the number of triggered sounds which can be generated by an object, and calling llTriggerSound does not affect the attached sounds created by llPlaySound and llLoopSound. This is very useful for things like collision noises, explosions, etc. There is no way to stop or alter the volume of a sound triggered by this function.
   */
  export function TriggerSound(sound: string, volume: number): void

  /**
   * Plays Sound at Volume (0.0 - 1.0), centered at but not attached to object, limited to axis-aligned bounding box defined by vectors top-north-east (TNE) and bottom-south-west (BSW).
   * There is no limit to the number of triggered sounds which can be generated by an object, and calling llTriggerSound does not affect the attached sounds created by llPlaySound and llLoopSound. This is very useful for things like collision noises, explosions, etc. There is no way to stop or alter the volume of a sound triggered by this function.
   */
  export function TriggerSoundLimited(sound: string, volume: number, tne: vector, bsw: vector): void

  /** If agent identified by AvatarID is sitting on the object the script is attached to or is over land owned by the object's owner, the agent is forced to stand up. */
  export function UnSit(avatarId: uuid): void

  /**
   * Returns the string that is the URL unescaped, replacing "%20" with spaces, etc., version of URL.
   * This function can output raw UTF-8 strings.
   */
  export function UnescapeURL(url: string): string

  /** Updates settings for a pathfinding character. */
  export function UpdateCharacter(options: list): void

  /** Starts an asychronous transaction to update the value associated with the key given. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value associated with the key. If Checked is 1 the existing value in the data store must match the OriginalValue passed or XP_ERROR_RETRY_UPDATE will be returned. If Checked is 0 the key will be created if necessary. */
  export function UpdateKeyValue(
    key: string,
    value: string,
    checked: number,
    originalValue: string,
  ): uuid

  /** Returns the distance between Location1 and Location2. */
  export function VecDist(location1: vector, location2: vector): number

  /** Returns the magnitude of the vector. */
  export function VecMag(vector: vector): number

  /** Returns normalized vector. */
  export function VecNorm(vector: vector): vector

  /** Returns TRUE if PublicKey, Message, and Algorithm produce the same base64-formatted Signature. */
  export function VerifyRSA(
    publicKey: string,
    message: string,
    signature: string,
    algorithm: string,
  ): number

  /**
   * If DetectEnabled = TRUE, object becomes phantom but triggers collision_start and collision_end events when other objects start and stop interpenetrating.
   * If another object (including avatars) interpenetrates it, it will get a collision_start event.
   * When an object stops interpenetrating, a collision_end event is generated. While the other is inter-penetrating, collision events are NOT generated.
   */
  export function VolumeDetect(detectEnabled: number): void

  /**
   * Wander within a specified volume.
   * Sets a character to wander about a central spot within a specified area.
   */
  export function WanderWithin(origin: vector, area: vector, options: list): void

  /** Returns the water height below the object position + Offset. */
  export function Water(offset: vector): number

  /**
   * Whispers Text on Channel.
   * This chat method has a range of 10m radius.
   * PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
   */
  export function Whisper(channel: number, text: string): void

  /** Returns the wind velocity at the object position + Offset. */
  export function Wind(offset: vector): vector

  /** Returns the local position that would put the origin of a HUD object directly over world_pos as viewed by the current camera. Requires the PERMISSION_TRACK_CAMERA runtime permission (else will return zero vector). */
  export function WorldPosToHUD(worldPos: vector): vector

  /** Performs an exclusive OR on two Base64 strings and returns a Base64 string. Text2 repeats if it is shorter than Text1. */
  export function XorBase64(text1: string, text2: string): string

  /**
   * Deprecated: Please use llXorBase64 instead.
   * Incorrectly performs an exclusive OR on two Base64 strings and returns a Base64 string. Text2 repeats if it is shorter than Text1.
   * Retained for backwards compatibility.
   */
  export function XorBase64Strings(text1: string, text2: string): string

  /**
   * Deprecated: Please use llXorBase64 instead.
   * Correctly (unless nulls are present) performs an exclusive OR on two Base64 strings and returns a Base64 string.
   * Text2 repeats if it is shorter than Text1.
   */
  export function XorBase64StringsCorrect(text1: string, text2: string): string

  /** Converts a color from the sRGB to the linear colorspace. */
  export function sRGB2Linear(srgb: vector): vector
}

/** Objects in world that are running a script or currently physically moving. */
declare const ACTIVE: number
/** Objects in world that are agents. */
declare const AGENT: number
declare const AGENT_ALWAYS_RUN: number
/** The agent has attachments. */
declare const AGENT_ATTACHMENTS: number
/** The agent has been identified as a scripted agent */
declare const AGENT_AUTOMATED: number
declare const AGENT_AUTOPILOT: number
declare const AGENT_AWAY: number
declare const AGENT_BUSY: number
declare const AGENT_BY_LEGACY_NAME: number
declare const AGENT_BY_USERNAME: number
declare const AGENT_CROUCHING: number
/** The agent is floating via scripted attachment. */
declare const AGENT_FLOATING_VIA_SCRIPTED_ATTACHMENT: number
/** The agent is flying. */
declare const AGENT_FLYING: number
declare const AGENT_IN_AIR: number
/** Agents on the same parcel where the script is running. */
declare const AGENT_LIST_PARCEL: number
/** Agents on any parcel in the region where the parcel owner is the same as the owner of the parcel under the scripted object. */
declare const AGENT_LIST_PARCEL_OWNER: number
/** All agents in the region. */
declare const AGENT_LIST_REGION: number
declare const AGENT_MOUSELOOK: number
declare const AGENT_ON_OBJECT: number
/** The agent has scripted attachments. */
declare const AGENT_SCRIPTED: number
declare const AGENT_SITTING: number
declare const AGENT_TYPING: number
declare const AGENT_WALKING: number
declare const ALL_SIDES: number
/** Texture animation is on. */
declare const ANIM_ON: number
/** Filtering for any HUD attachment. */
declare const ATTACH_ANY_HUD: number
/** Attach to the avatar's geometric centre. */
declare const ATTACH_AVATAR_CENTER: number
/** Attach to the avatar's back. */
declare const ATTACH_BACK: number
/** Attach to the avatar's belly. */
declare const ATTACH_BELLY: number
/** Attach to the avatar's chest. */
declare const ATTACH_CHEST: number
/** Attach to the avatar's chin. */
declare const ATTACH_CHIN: number
/** Attach to the avatar's jaw. */
declare const ATTACH_FACE_JAW: number
/** Attach to the avatar's left ear (extended). */
declare const ATTACH_FACE_LEAR: number
/** Attach to the avatar's left eye (extended). */
declare const ATTACH_FACE_LEYE: number
/** Attach to the avatar's right ear (extended). */
declare const ATTACH_FACE_REAR: number
/** Attach to the avatar's right eye (extended). */
declare const ATTACH_FACE_REYE: number
/** Attach to the avatar's tongue. */
declare const ATTACH_FACE_TONGUE: number
/** Attach to the avatar's groin. */
declare const ATTACH_GROIN: number
/** Attach to the avatar's head. */
declare const ATTACH_HEAD: number
/** Attach to the avatar's left hind foot. */
declare const ATTACH_HIND_LFOOT: number
/** Attach to the avatar's right hind foot. */
declare const ATTACH_HIND_RFOOT: number
declare const ATTACH_HUD_BOTTOM: number
declare const ATTACH_HUD_BOTTOM_LEFT: number
declare const ATTACH_HUD_BOTTOM_RIGHT: number
declare const ATTACH_HUD_CENTER_1: number
declare const ATTACH_HUD_CENTER_2: number
declare const ATTACH_HUD_TOP_CENTER: number
declare const ATTACH_HUD_TOP_LEFT: number
declare const ATTACH_HUD_TOP_RIGHT: number
/** Attach to the avatar's left ear. */
declare const ATTACH_LEAR: number
/** Attach to the avatar's left pectoral. */
declare const ATTACH_LEFT_PEC: number
/** Attach to the avatar's left eye. */
declare const ATTACH_LEYE: number
/** Attach to the avatar's left foot. */
declare const ATTACH_LFOOT: number
/** Attach to the avatar's left hand. */
declare const ATTACH_LHAND: number
/** Attach to the avatar's left ring finger. */
declare const ATTACH_LHAND_RING1: number
/** Attach to the avatar's left hip. */
declare const ATTACH_LHIP: number
/** Attach to the avatar's left lower arm. */
declare const ATTACH_LLARM: number
/** Attach to the avatar's lower left leg. */
declare const ATTACH_LLLEG: number
/** Attach to the avatar's right pectoral. (Deprecated, use ATTACH_RIGHT_PEC) */
declare const ATTACH_LPEC: number
/** Attach to the avatar's left shoulder. */
declare const ATTACH_LSHOULDER: number
/** Attach to the avatar's left upper arm. */
declare const ATTACH_LUARM: number
/** Attach to the avatar's lower upper leg. */
declare const ATTACH_LULEG: number
/** Attach to the avatar's left wing. */
declare const ATTACH_LWING: number
/** Attach to the avatar's mouth. */
declare const ATTACH_MOUTH: number
/** Attach to the avatar's neck. */
declare const ATTACH_NECK: number
/** Attach to the avatar's nose. */
declare const ATTACH_NOSE: number
/** Attach to the avatar's pelvis. */
declare const ATTACH_PELVIS: number
/** Attach to the avatar's right ear. */
declare const ATTACH_REAR: number
/** Attach to the avatar's right eye. */
declare const ATTACH_REYE: number
/** Attach to the avatar's right foot. */
declare const ATTACH_RFOOT: number
/** Attach to the avatar's right hand. */
declare const ATTACH_RHAND: number
/** Attach to the avatar's right ring finger. */
declare const ATTACH_RHAND_RING1: number
/** Attach to the avatar's right hip. */
declare const ATTACH_RHIP: number
/** Attach to the avatar's right pectoral. */
declare const ATTACH_RIGHT_PEC: number
/** Attach to the avatar's right lower arm. */
declare const ATTACH_RLARM: number
/** Attach to the avatar's right lower leg. */
declare const ATTACH_RLLEG: number
/** Attach to the avatar's left pectoral. (deprecated, use ATTACH_LEFT_PEC) */
declare const ATTACH_RPEC: number
/** Attach to the avatar's right shoulder. */
declare const ATTACH_RSHOULDER: number
/** Attach to the avatar's right upper arm. */
declare const ATTACH_RUARM: number
/** Attach to the avatar's right upper leg. */
declare const ATTACH_RULEG: number
/** Attach to the avatar's right wing. */
declare const ATTACH_RWING: number
/** Attach to the avatar's tail base. */
declare const ATTACH_TAIL_BASE: number
/** Attach to the avatar's tail tip. */
declare const ATTACH_TAIL_TIP: number
declare const AVOID_CHARACTERS: number
declare const AVOID_DYNAMIC_OBSTACLES: number
declare const AVOID_NONE: number
/** Cause llMapBeacon to optionally display and focus the world map on the avatar's viewer. */
declare const BEACON_MAP: number
declare const CAMERA_ACTIVE: number
declare const CAMERA_BEHINDNESS_ANGLE: number
declare const CAMERA_BEHINDNESS_LAG: number
declare const CAMERA_DISTANCE: number
declare const CAMERA_FOCUS: number
declare const CAMERA_FOCUS_LAG: number
declare const CAMERA_FOCUS_LOCKED: number
declare const CAMERA_FOCUS_OFFSET: number
declare const CAMERA_FOCUS_THRESHOLD: number
declare const CAMERA_PITCH: number
declare const CAMERA_POSITION: number
declare const CAMERA_POSITION_LAG: number
declare const CAMERA_POSITION_LOCKED: number
declare const CAMERA_POSITION_THRESHOLD: number
/** The object inventory has changed because an item was added through the llAllowInventoryDrop interface. */
declare const CHANGED_ALLOWED_DROP: number
/** The object color has changed. */
declare const CHANGED_COLOR: number
/** The object inventory has changed. */
declare const CHANGED_INVENTORY: number
/** The object has linked or its links were broken. */
declare const CHANGED_LINK: number
declare const CHANGED_MEDIA: number
/** The object has changed ownership. */
declare const CHANGED_OWNER: number
/** The object has changed region. */
declare const CHANGED_REGION: number
/** The region this object is in has just come online. */
declare const CHANGED_REGION_START: number
/** The render material has changed. */
declare const CHANGED_RENDER_MATERIAL: number
/** The object scale (size) has changed. */
declare const CHANGED_SCALE: number
/** The object base shape has changed, e.g., a box to a cylinder. */
declare const CHANGED_SHAPE: number
/** The avatar to whom this object is attached has teleported. */
declare const CHANGED_TELEPORT: number
/** The texture offset, scale rotation, or simply the object texture has changed. */
declare const CHANGED_TEXTURE: number
/** If set to false, character will not attempt to catch up on lost time when pathfinding performance is low, potentially providing more reliable movement (albeit while potentially appearing to be more stuttery). Default is true to match pre-existing behavior. */
declare const CHARACTER_ACCOUNT_FOR_SKIPPED_FRAMES: number
/** Allows you to specify that a character should not try to avoid other characters, should not try to avoid dynamic obstacles (relatively fast moving objects and avatars), or both. */
declare const CHARACTER_AVOIDANCE_MODE: number
/** Makes the character jump. Requires an additional parameter, the height to jump, between 0.1m and 2.0m. This must be provided as the first element of the llExecCharacterCmd option list. */
declare const CHARACTER_CMD_JUMP: number
declare const CHARACTER_CMD_SMOOTH_STOP: number
/** Stops any current pathfinding operation. */
declare const CHARACTER_CMD_STOP: number
/** Speed of pursuit in meters per second. */
declare const CHARACTER_DESIRED_SPEED: number
/** The character's maximum speed while turning about the Z axis. - Note that this is only loosely enforced. */
declare const CHARACTER_DESIRED_TURN_SPEED: number
/** Set collision capsule length - cannot be less than two times the radius. */
declare const CHARACTER_LENGTH: number
/** The character's maximum acceleration rate. */
declare const CHARACTER_MAX_ACCEL: number
/** The character's maximum deceleration rate. */
declare const CHARACTER_MAX_DECEL: number
/** The character's maximum speed. */
declare const CHARACTER_MAX_SPEED: number
/** The character's turn radius when travelling at CHARACTER_MAX_TURN_SPEED. */
declare const CHARACTER_MAX_TURN_RADIUS: number
/** Valid options are: VERTICAL, HORIZONTAL. */
declare const CHARACTER_ORIENTATION: number
/** Set collision capsule radius. */
declare const CHARACTER_RADIUS: number
/**
 * Determines whether a character can leave its starting parcel.
 * Takes a boolean parameter. If TRUE, the character cannot voluntarilly leave the parcel, but can return to it.
 */
declare const CHARACTER_STAY_WITHIN_PARCEL: number
/** Specifies which walk-ability coefficient will be used by this character. */
declare const CHARACTER_TYPE: number
declare const CHARACTER_TYPE_A: number
declare const CHARACTER_TYPE_B: number
declare const CHARACTER_TYPE_C: number
declare const CHARACTER_TYPE_D: number
declare const CHARACTER_TYPE_NONE: number
/** When the prim is clicked, the buy dialog is opened. */
declare const CLICK_ACTION_BUY: number
/** No click action. No touches detected or passed. */
declare const CLICK_ACTION_DISABLED: number
/** No click action. Object is invisible to the mouse. */
declare const CLICK_ACTION_IGNORE: number
/** Performs the default action: when the prim is clicked, touch events are triggered. */
declare const CLICK_ACTION_NONE: number
/** When the prim is clicked, the object inventory dialog is opened. */
declare const CLICK_ACTION_OPEN: number
/** When the prim is touched, the web media dialog is opened. */
declare const CLICK_ACTION_OPEN_MEDIA: number
/** When the prim is clicked, the pay dialog is opened. */
declare const CLICK_ACTION_PAY: number
/** When the prim is clicked, html-on-a-prim is enabled? */
declare const CLICK_ACTION_PLAY: number
/** When the prim is clicked, the avatar sits upon it. */
declare const CLICK_ACTION_SIT: number
/** When the prim is clicked, touch events are triggered. */
declare const CLICK_ACTION_TOUCH: number
/** Zoom in on object when clicked. */
declare const CLICK_ACTION_ZOOM: number
/** COMBAT_CHANNEL is an integer constant that, when passed to llRegionSay will add the message to the combat log. A script with a chat listen active on COMBAT_CHANNEL may also monitor the combat log. */
declare const COMBAT_CHANNEL: number
/**
 * Messages from the region to the COMBAT_CHANNEL will all be from this ID.
 *  Scripts may filter llListen calls on this ID to receive only system generated combat log messages.
 */
declare const COMBAT_LOG_ID: uuid
/** "application/atom+xml" */
declare const CONTENT_TYPE_ATOM: number
/** "application/x-www-form-urlencoded" */
declare const CONTENT_TYPE_FORM: number
/** "text/html", only valid for embedded browsers on content owned by the person viewing. Falls back to "text/plain" otherwise. */
declare const CONTENT_TYPE_HTML: number
/** "application/json" */
declare const CONTENT_TYPE_JSON: number
/** "application/llsd+xml" */
declare const CONTENT_TYPE_LLSD: number
/** "application/rss+xml" */
declare const CONTENT_TYPE_RSS: number
/** "text/plain" */
declare const CONTENT_TYPE_TEXT: number
/** "application/xhtml+xml" */
declare const CONTENT_TYPE_XHTML: number
/** "application/xml" */
declare const CONTENT_TYPE_XML: number
/** Test for the avatar move back control. */
declare const CONTROL_BACK: number
/** Test for the avatar move down control. */
declare const CONTROL_DOWN: number
/** Test for the avatar move forward control. */
declare const CONTROL_FWD: number
/** Test for the avatar left button control. */
declare const CONTROL_LBUTTON: number
/** Test for the avatar move left control. */
declare const CONTROL_LEFT: number
/** Test for the avatar left button control while in mouse look. */
declare const CONTROL_ML_LBUTTON: number
/** Test for the avatar move right control. */
declare const CONTROL_RIGHT: number
/** Test for the avatar rotate left control. */
declare const CONTROL_ROT_LEFT: number
/** Test for the avatar rotate right control. */
declare const CONTROL_ROT_RIGHT: number
/** Test for the avatar move up control. */
declare const CONTROL_UP: number
/** Objects in world that are able to process damage. */
declare const DAMAGEABLE: number
/** Damage caused by a caustic substance, such as acid */
declare const DAMAGE_TYPE_ACID: number
/** Damage caused by a blunt object, such as a club. */
declare const DAMAGE_TYPE_BLUDGEONING: number
/** Damage inflicted by exposure to extreme cold */
declare const DAMAGE_TYPE_COLD: number
/** Damage caused by electricity. */
declare const DAMAGE_TYPE_ELECTRIC: number
declare const DAMAGE_TYPE_EMOTIONAL: number
/** Damage inflicted by exposure to heat or flames. */
declare const DAMAGE_TYPE_FIRE: number
/** Damage inflicted by a great force or impact. */
declare const DAMAGE_TYPE_FORCE: number
/** Generic or legacy damage. */
declare const DAMAGE_TYPE_GENERIC: number
/** System damage generated by impact with land or a prim. */
declare const DAMAGE_TYPE_IMPACT: number
/** Damage caused by a direct assault on life-force */
declare const DAMAGE_TYPE_NECROTIC: number
/** Damage caused by a piercing object such as a bullet, spear, or arrow. */
declare const DAMAGE_TYPE_PIERCING: number
/** Damage caused by poison. */
declare const DAMAGE_TYPE_POISON: number
/** Damage caused by a direct assault on the mind. */
declare const DAMAGE_TYPE_PSYCHIC: number
/** Damage caused by radiation or extreme light. */
declare const DAMAGE_TYPE_RADIANT: number
/** Damage caused by a slashing object such as a sword or axe. */
declare const DAMAGE_TYPE_SLASHING: number
/** Damage caused by loud noises, like a Crash Worship concert. */
declare const DAMAGE_TYPE_SONIC: number
/** The date the agent was born, returned in ISO 8601 format of YYYY-MM-DD. */
declare const DATA_BORN: number
/** The name of the agent. */
declare const DATA_NAME: number
/** TRUE for online, FALSE for offline. */
declare const DATA_ONLINE: number
declare const DATA_PAYINFO: number
/** Returns the agent ratings as a comma separated string of six integers. They are:1) Positive rated behaviour2) Negative rated behaviour3) Positive rated appearance4) Negative rated appearance5) Positive rated building6) Negative rated building */
declare const DATA_RATING: number
/** Reserved for Linden use. */
declare const DATA_RESERVED_0: number
declare const DATA_SIM_POS: number
declare const DATA_SIM_RATING: number
declare const DATA_SIM_STATUS: number
/** DEBUG_CHANNEL is an integer constant that, when passed to llSay, llWhisper, or llShout as a channel parameter, will print text to the Script Warning/Error Window. */
declare const DEBUG_CHANNEL: number
/** 0.017453293 - Number of radians per degree.You can use this to convert degrees to radians by multiplying the degrees by this number. */
declare const DEG_TO_RAD: number
/** Used with llSetPhysicsMaterial to enable the density value. Must be between 1.0 and 22587.0 (in Kg/m^3 -- see if you can figure out what 22587 represents) */
declare const DENSITY: number
/** Causes the object to immediately die. */
declare const DEREZ_DIE: number
/** The object is made temporary and will be cleaned up at some later timer. */
declare const DEREZ_MAKE_TEMP: number
/** The object is returned to the inventory of the rezzer. */
declare const DEREZ_TO_INVENTORY: number
/** Day length, offset and progression. */
declare const ENVIRONMENT_DAYINFO: number
/** Could not find agent with the specified ID */
declare const ENV_INVALID_AGENT: number
/** Attempted to change an unknown property. */
declare const ENV_INVALID_RULE: number
/** Attempt to change environments outside an experience. */
declare const ENV_NOT_EXPERIENCE: number
/** Could not find environmental settings in object inventory. */
declare const ENV_NO_ENVIRONMENT: number
/** The experience has not been enabled on this land. */
declare const ENV_NO_EXPERIENCE_LAND: number
/** Agent has not granted permission to change environments. */
declare const ENV_NO_EXPERIENCE_PERMISSION: number
/** Script does not have permission to modify environment. */
declare const ENV_NO_PERMISSIONS: number
/** Could not validate values for environment. */
declare const ENV_THROTTLE: number
/** Could not validate values for environment. */
declare const ENV_VALIDATION_FAIL: number
/** Indicates the last line of a notecard was read. */
declare const EOF: string
declare const ERR_GENERIC: number
declare const ERR_MALFORMED_PARAMS: number
declare const ERR_PARCEL_PERMISSIONS: number
declare const ERR_RUNTIME_PERMISSIONS: number
declare const ERR_THROTTLED: number
/** Add the agent to this estate's Allowed Residents list. */
declare const ESTATE_ACCESS_ALLOWED_AGENT_ADD: number
/** Remove the agent from this estate's Allowed Residents list. */
declare const ESTATE_ACCESS_ALLOWED_AGENT_REMOVE: number
/** Add the group to this estate's Allowed groups list. */
declare const ESTATE_ACCESS_ALLOWED_GROUP_ADD: number
/** Remove the group from this estate's Allowed groups list. */
declare const ESTATE_ACCESS_ALLOWED_GROUP_REMOVE: number
/** Add the agent to this estate's Banned residents list. */
declare const ESTATE_ACCESS_BANNED_AGENT_ADD: number
/** Remove the agent from this estate's Banned residents list. */
declare const ESTATE_ACCESS_BANNED_AGENT_REMOVE: number
/** Flags to control returned attachments. */
declare const FILTER_FLAGS: number
/** Include HUDs with matching experience. */
declare const FILTER_FLAG_HUDS: number
/** Include attachment point. */
declare const FILTER_INCLUDE: number
/** Makes character navigate in a straight line toward position. May be set to TRUE or FALSE. */
declare const FORCE_DIRECT_PATH: number
/** Used with llSetPhysicsMaterial to enable the friction value. Must be between 0.0 and 255.0 */
declare const FRICTION: number
declare const GAME_CONTROL_AXIS_LEFTX: number
declare const GAME_CONTROL_AXIS_LEFTY: number
declare const GAME_CONTROL_AXIS_RIGHTX: number
declare const GAME_CONTROL_AXIS_RIGHTY: number
declare const GAME_CONTROL_AXIS_TRIGGERLEFT: number
declare const GAME_CONTROL_AXIS_TRIGGERRIGHT: number
declare const GAME_CONTROL_BUTTON_A: number
declare const GAME_CONTROL_BUTTON_B: number
declare const GAME_CONTROL_BUTTON_BACK: number
declare const GAME_CONTROL_BUTTON_DPAD_DOWN: number
declare const GAME_CONTROL_BUTTON_DPAD_LEFT: number
declare const GAME_CONTROL_BUTTON_DPAD_RIGHT: number
declare const GAME_CONTROL_BUTTON_DPAD_UP: number
declare const GAME_CONTROL_BUTTON_GUIDE: number
declare const GAME_CONTROL_BUTTON_LEFTSHOULDER: number
declare const GAME_CONTROL_BUTTON_LEFTSTICK: number
declare const GAME_CONTROL_BUTTON_MISC1: number
declare const GAME_CONTROL_BUTTON_PADDLE1: number
declare const GAME_CONTROL_BUTTON_PADDLE2: number
declare const GAME_CONTROL_BUTTON_PADDLE3: number
declare const GAME_CONTROL_BUTTON_PADDLE4: number
declare const GAME_CONTROL_BUTTON_RIGHTSHOULDER: number
declare const GAME_CONTROL_BUTTON_RIGHTSTICK: number
declare const GAME_CONTROL_BUTTON_START: number
declare const GAME_CONTROL_BUTTON_TOUCHPAD: number
declare const GAME_CONTROL_BUTTON_X: number
declare const GAME_CONTROL_BUTTON_Y: number
declare const GCNP_GET_WALKABILITY: number
declare const GCNP_RADIUS: number
declare const GCNP_STATIC: number
/** Used with llSetPhysicsMaterial to enable the gravity multiplier value. Must be between -1.0 and +28.0 */
declare const GRAVITY_MULTIPLIER: number
declare const HORIZONTAL: number
/** Provide a string value to be included in the HTTPaccepts header value. This replaces the default Second Life HTTP accepts header. */
declare const HTTP_ACCEPT: number
declare const HTTP_BODY_MAXLENGTH: number
declare const HTTP_BODY_TRUNCATED: number
/** Add an extra custom HTTP header to the request. The first string is the name of the parameter to change, e.g. "Pragma", and the second string is the value, e.g. "no-cache". Up to 8 custom headers may be configured per request. Note that certain headers, such as the default headers, are blocked for security reasons. */
declare const HTTP_CUSTOM_HEADER: number
/** Report extended error information through http_response event. */
declare const HTTP_EXTENDED_ERROR: number
declare const HTTP_METHOD: number
declare const HTTP_MIMETYPE: number
/**
 * Allows enabling/disabling of the "Pragma: no-cache" header.
 * Usage: [HTTP_PRAGMA_NO_CACHE, integer SendHeader]. When SendHeader is TRUE, the "Pragma: no-cache" header is sent by the script. This matches the default behavior. When SendHeader is FALSE, no "Pragma" header is sent by the script.
 */
declare const HTTP_PRAGMA_NO_CACHE: number
/** Provide a string value to be included in the HTTPUser-Agent header value. This is appended to the default value. */
declare const HTTP_USER_AGENT: number
declare const HTTP_VERBOSE_THROTTLE: number
declare const HTTP_VERIFY_CERT: number
declare const IMG_USE_BAKED_AUX1: uuid
declare const IMG_USE_BAKED_AUX2: uuid
declare const IMG_USE_BAKED_AUX3: uuid
declare const IMG_USE_BAKED_EYES: uuid
declare const IMG_USE_BAKED_HAIR: uuid
declare const IMG_USE_BAKED_HEAD: uuid
declare const IMG_USE_BAKED_LEFTARM: uuid
declare const IMG_USE_BAKED_LEFTLEG: uuid
declare const IMG_USE_BAKED_LOWER: uuid
declare const IMG_USE_BAKED_SKIRT: uuid
declare const IMG_USE_BAKED_UPPER: uuid
declare const INVENTORY_ALL: number
declare const INVENTORY_ANIMATION: number
declare const INVENTORY_BODYPART: number
declare const INVENTORY_CLOTHING: number
declare const INVENTORY_GESTURE: number
declare const INVENTORY_LANDMARK: number
declare const INVENTORY_MATERIAL: number
declare const INVENTORY_NONE: number
declare const INVENTORY_NOTECARD: number
declare const INVENTORY_OBJECT: number
declare const INVENTORY_SCRIPT: number
declare const INVENTORY_SETTING: number
declare const INVENTORY_SOUND: number
declare const INVENTORY_TEXTURE: number
/** @deprecated Use 'lljson.decode' and 'table.insert' instead. */
declare const JSON_APPEND: number
/** @deprecated Use 'lljson.array_mt' instead. */
declare const JSON_ARRAY: string
/** @deprecated Use 'nil' instead. */
declare const JSON_DELETE: string
/** @deprecated Use 'false' instead. */
declare const JSON_FALSE: string
/** @deprecated Use 'pcall' instead. */
declare const JSON_INVALID: string
/** @deprecated Use 'lljson.null' instead. */
declare const JSON_NULL: string
/** @deprecated Use 'typeof' instead. */
declare const JSON_NUMBER: string
/** @deprecated Use 'lljson.object_mt' instead. */
declare const JSON_OBJECT: string
/** @deprecated Use 'typeof' instead. */
declare const JSON_STRING: string
/** @deprecated Use 'true' instead. */
declare const JSON_TRUE: string
/** For use with KFM_COMMAND. */
declare const KFM_CMD_PAUSE: number
/** For use with KFM_COMMAND. */
declare const KFM_CMD_PLAY: number
/** For use with KFM_COMMAND. */
declare const KFM_CMD_STOP: number
declare const KFM_COMMAND: number
declare const KFM_DATA: number
/** For use with KFM_MODE. */
declare const KFM_FORWARD: number
/** For use with KFM_MODE. */
declare const KFM_LOOP: number
declare const KFM_MODE: number
/** For use with KFM_MODE. */
declare const KFM_PING_PONG: number
/** For use with KFM_MODE. */
declare const KFM_REVERSE: number
/** For use with KFM_DATA. */
declare const KFM_ROTATION: number
/** For use with KFM_DATA. */
declare const KFM_TRANSLATION: number
/**
 * Use a large brush size.
 * NOTE: This value is incorrect, a large brush should be 2.
 */
declare const LAND_LARGE_BRUSH: number
/** Action to level the land. */
declare const LAND_LEVEL: number
/** Action to lower the land. */
declare const LAND_LOWER: number
/**
 * Use a medium brush size.
 * NOTE: This value is incorrect, a medium brush should be 1.
 */
declare const LAND_MEDIUM_BRUSH: number
declare const LAND_NOISE: number
/** Action to raise the land. */
declare const LAND_RAISE: number
declare const LAND_REVERT: number
/**
 * Use a small brush size.
 * NOTE: This value is incorrect, a small brush should be 0.
 */
declare const LAND_SMALL_BRUSH: number
declare const LAND_SMOOTH: number
declare const LEGACY_MASS_FACTOR: number
/** A name:value pair has been removed from the linkset datastore. */
declare const LINKSETDATA_DELETE: number
/** A name:value pair was too large to write to the linkset datastore. */
declare const LINKSETDATA_EMEMORY: number
/** The key supplied was empty. */
declare const LINKSETDATA_ENOKEY: number
/** The name:value pair has been protected from overwrite in the linkset datastore. */
declare const LINKSETDATA_EPROTECTED: number
/** A CSV list of names removed from the linkset datastore. */
declare const LINKSETDATA_MULTIDELETE: number
/** The named key was not found in the datastore. */
declare const LINKSETDATA_NOTFOUND: number
/** The value written to a name in the keystore is the same as the value already there. */
declare const LINKSETDATA_NOUPDATE: number
/** The name:value pair was written to the datastore. */
declare const LINKSETDATA_OK: number
/** The linkset datastore has been reset. */
declare const LINKSETDATA_RESET: number
/** A name:value pair in the linkset datastore has been changed or created. */
declare const LINKSETDATA_UPDATE: number
/** This targets every object except the root in the linked set. */
declare const LINK_ALL_CHILDREN: number
/** This targets every object in the linked set except the object with the script. */
declare const LINK_ALL_OTHERS: number
/** This targets the root of the linked set. */
declare const LINK_ROOT: number
/** This targets every object in the linked set. */
declare const LINK_SET: number
/** The link number of the prim containing the script. */
declare const LINK_THIS: number
declare const LIST_STAT_GEOMETRIC_MEAN: number
declare const LIST_STAT_MAX: number
declare const LIST_STAT_MEAN: number
declare const LIST_STAT_MEDIAN: number
declare const LIST_STAT_MIN: number
declare const LIST_STAT_NUM_COUNT: number
declare const LIST_STAT_RANGE: number
declare const LIST_STAT_STD_DEV: number
declare const LIST_STAT_SUM: number
declare const LIST_STAT_SUM_SQUARES: number
/** Loop the texture animation. */
declare const LOOP: number
declare const MASK_BASE: number
/** Fold permissions for object inventory into results. */
declare const MASK_COMBINED: number
declare const MASK_EVERYONE: number
declare const MASK_GROUP: number
declare const MASK_NEXT: number
declare const MASK_OWNER: number
/** Indicates a notecard read was attempted and the notecard was not yet cached on the server. */
declare const NAK: string
declare const NAVIGATE_TO_GOAL_REACHED_DIST: number
declare const NULL_KEY: uuid
/**
 * Retrieves the account level of an avatar.
 * Returns 0 when the avatar has a basic account,
 *  1 when the avatar has a premium account,
 *  10 when the avatar has a premium plus account,
 *  or -1 if the object is not an avatar.
 */
declare const OBJECT_ACCOUNT_LEVEL: number
/** This is a flag used with llGetObjectDetails to get the number of associated animated objects */
declare const OBJECT_ANIMATED_COUNT: number
/** This is a flag used with llGetObjectDetails to get the number of additional animated object attachments allowed. */
declare const OBJECT_ANIMATED_SLOTS_AVAILABLE: number
/**
 * Gets the attachment point to which the object is attached.
 * Returns 0 if the object is not an attachment (or is an avatar, etc).
 */
declare const OBJECT_ATTACHED_POINT: number
/**
 * Returns the number of attachment slots available.
 * Returns 0 if the object is not an avatar or none are available.
 */
declare const OBJECT_ATTACHED_SLOTS_AVAILABLE: number
/**
 * This is a flag used with llGetObjectDetails to get the body type of the avatar, based on shape data.
 * If no data is available, -1.0 is returned.
 * This is normally between 0 and 1.0, with 0.5 and larger considered 'male'
 */
declare const OBJECT_BODY_SHAPE_TYPE: number
/** Units in seconds */
declare const OBJECT_CHARACTER_TIME: number
/**
 * This is a flag used with llGetObjectDetails to get the click action.
 * The default is 0
 */
declare const OBJECT_CLICK_ACTION: number
/** This is a flag used with llGetObjectDetails to get the time this object was created */
declare const OBJECT_CREATION_TIME: number
/** Gets the object's creator key. If id is an avatar, a NULL_KEY is returned. */
declare const OBJECT_CREATOR: number
/** Gets the damage value assigned to this object. */
declare const OBJECT_DAMAGE: number
/** Gets the damage type, if any, assigned to this object. */
declare const OBJECT_DAMAGE_TYPE: number
/** Gets the object's description. If id is an avatar, an empty string is returned. */
declare const OBJECT_DESC: number
/** Gets the prims's group key. If id is an avatar, a NULL_KEY is returned. */
declare const OBJECT_GROUP: number
/** Gets the agent's current group role tag. If id is an object, an empty is returned. */
declare const OBJECT_GROUP_TAG: number
/** Gets current health value for the object. */
declare const OBJECT_HEALTH: number
/**
 * This is a flag used with llGetObjectDetails to get hover height of the avatar
 * If no data is available, 0.0 is returned.
 */
declare const OBJECT_HOVER_HEIGHT: number
/** Gets the object's last owner ID. */
declare const OBJECT_LAST_OWNER_ID: number
/** Gets the object's link number or 0 if unlinked. */
declare const OBJECT_LINK_NUMBER: number
/** Get the object's mass */
declare const OBJECT_MASS: number
/** Get an object's material setting. */
declare const OBJECT_MATERIAL: number
/** Gets the object's name. */
declare const OBJECT_NAME: number
/** Gets an object's angular velocity. */
declare const OBJECT_OMEGA: number
/** Gets an object's owner's key. If id is group owned, a NULL_KEY is returned. */
declare const OBJECT_OWNER: number
/** Returns the pathfinding setting of any object in the region. It returns an integer matching one of the OPT_* constants. */
declare const OBJECT_PATHFINDING_TYPE: number
/** Gets the objects permissions */
declare const OBJECT_PERMS: number
/** Gets the object's permissions including any inventory. */
declare const OBJECT_PERMS_COMBINED: number
/**
 * Returns boolean, detailing if phantom is enabled or disabled on the object.
 * If id is an avatar or attachment, 0 is returned.
 */
declare const OBJECT_PHANTOM: number
/**
 * Returns boolean, detailing if physics is enabled or disabled on the object.
 * If id is an avatar or attachment, 0 is returned.
 */
declare const OBJECT_PHYSICS: number
declare const OBJECT_PHYSICS_COST: number
/** Gets the object's position in region coordinates. */
declare const OBJECT_POS: number
/** Gets the prim count of the object.  The script and target object  must be owned by the same owner */
declare const OBJECT_PRIM_COUNT: number
declare const OBJECT_PRIM_EQUIVALENCE: number
/**
 * This is a flag used with llGetObjectDetails to get the Avatar_Rendering_Cost of an avatar, based on values reported by nearby viewers.
 * If no data is available, -1 is returned.
 * The maximum render weight stored by the simulator is 500000. When called against an object, 0 is returned.
 */
declare const OBJECT_RENDER_WEIGHT: number
declare const OBJECT_RETURN_PARCEL: number
declare const OBJECT_RETURN_PARCEL_OWNER: number
declare const OBJECT_RETURN_REGION: number
declare const OBJECT_REZZER_KEY: number
/** Get the time when an object was rezzed. */
declare const OBJECT_REZ_TIME: number
/**
 * Gets the id of the root prim of the object requested.
 * If id is an avatar, return the id of the root prim of the linkset the avatar is sitting on (or the avatar's own id if the avatar is not sitting on an object within the region).
 */
declare const OBJECT_ROOT: number
/** Gets the object's rotation. */
declare const OBJECT_ROT: number
declare const OBJECT_RUNNING_SCRIPT_COUNT: number
/** Gets the object's size. */
declare const OBJECT_SCALE: number
declare const OBJECT_SCRIPT_MEMORY: number
declare const OBJECT_SCRIPT_TIME: number
/** This is a flag used with llGetObjectDetails to get the number of avatars selecting any part of the object */
declare const OBJECT_SELECT_COUNT: number
declare const OBJECT_SERVER_COST: number
/** This is a flag used with llGetObjectDetails to get the number of avatars sitting on the object */
declare const OBJECT_SIT_COUNT: number
declare const OBJECT_STREAMING_COST: number
/** Returns boolean, indicating if object is a temp attachment. */
declare const OBJECT_TEMP_ATTACHED: number
/** Returns boolean, detailing if temporary is enabled or disabled on the object. */
declare const OBJECT_TEMP_ON_REZ: number
/** Gets an objects hover text. */
declare const OBJECT_TEXT: number
/** Gets the alpha of an objects hover text. */
declare const OBJECT_TEXT_ALPHA: number
/** Gets the color of an objects hover text. */
declare const OBJECT_TEXT_COLOR: number
/** Gets the total inventory count of the object.  The script and target object must be owned by the same owner */
declare const OBJECT_TOTAL_INVENTORY_COUNT: number
declare const OBJECT_TOTAL_SCRIPT_COUNT: number
declare const OBJECT_UNKNOWN_DETAIL: number
/** Gets the object's velocity. */
declare const OBJECT_VELOCITY: number
/** Returned for avatars. */
declare const OPT_AVATAR: number
/** Returned for pathfinding characters. */
declare const OPT_CHARACTER: number
/** Returned for exclusion volumes. */
declare const OPT_EXCLUSION_VOLUME: number
/** Returned for movable obstacles, movable phantoms, physical, and volumedetect objects. */
declare const OPT_LEGACY_LINKSET: number
/** Returned for material volumes. */
declare const OPT_MATERIAL_VOLUME: number
/** Returned for attachments, Linden trees, and grass. */
declare const OPT_OTHER: number
/** Returned for static obstacles. */
declare const OPT_STATIC_OBSTACLE: number
/** Returned for walkable objects. */
declare const OPT_WALKABLE: number
declare const OVERRIDE_GLTF_BASE_ALPHA: number
declare const OVERRIDE_GLTF_BASE_ALPHA_MASK: number
declare const OVERRIDE_GLTF_BASE_ALPHA_MODE: number
declare const OVERRIDE_GLTF_BASE_COLOR_FACTOR: number
declare const OVERRIDE_GLTF_BASE_DOUBLE_SIDED: number
declare const OVERRIDE_GLTF_EMISSIVE_FACTOR: number
declare const OVERRIDE_GLTF_METALLIC_FACTOR: number
declare const OVERRIDE_GLTF_ROUGHNESS_FACTOR: number
declare const PARCEL_COUNT_GROUP: number
declare const PARCEL_COUNT_OTHER: number
declare const PARCEL_COUNT_OWNER: number
declare const PARCEL_COUNT_SELECTED: number
declare const PARCEL_COUNT_TEMP: number
declare const PARCEL_COUNT_TOTAL: number
/** The parcel's area, in square meters. (5 chars.). */
declare const PARCEL_DETAILS_AREA: number
/** The description of the parcel. (127 chars). */
declare const PARCEL_DETAILS_DESC: number
/** Flags set on the parcel */
declare const PARCEL_DETAILS_FLAGS: number
/** The parcel group's key. (36 chars.). */
declare const PARCEL_DETAILS_GROUP: number
/** The parcel's key. (36 chars.). */
declare const PARCEL_DETAILS_ID: number
/** Lookat vector set for teleport routing. */
declare const PARCEL_DETAILS_LANDING_LOOKAT: number
/** The parcel's landing point, if any. */
declare const PARCEL_DETAILS_LANDING_POINT: number
/** The name of the parcel. (63 chars.). */
declare const PARCEL_DETAILS_NAME: number
/** The parcel owner's key. (36 chars.). */
declare const PARCEL_DETAILS_OWNER: number
/** The parcel's prim capacity. */
declare const PARCEL_DETAILS_PRIM_CAPACITY: number
/** The number of prims used on this parcel. */
declare const PARCEL_DETAILS_PRIM_USED: number
/** There are restrictions on this parcel that may impact script execution. */
declare const PARCEL_DETAILS_SCRIPT_DANGER: number
/** The parcel's avatar visibility setting. (1 char.). */
declare const PARCEL_DETAILS_SEE_AVATARS: number
/** Parcel's teleport routing setting. */
declare const PARCEL_DETAILS_TP_ROUTING: number
declare const PARCEL_FLAG_ALLOW_ALL_OBJECT_ENTRY: number
declare const PARCEL_FLAG_ALLOW_CREATE_GROUP_OBJECTS: number
declare const PARCEL_FLAG_ALLOW_CREATE_OBJECTS: number
declare const PARCEL_FLAG_ALLOW_DAMAGE: number
declare const PARCEL_FLAG_ALLOW_FLY: number
declare const PARCEL_FLAG_ALLOW_GROUP_OBJECT_ENTRY: number
declare const PARCEL_FLAG_ALLOW_GROUP_SCRIPTS: number
declare const PARCEL_FLAG_ALLOW_LANDMARK: number
declare const PARCEL_FLAG_ALLOW_SCRIPTS: number
declare const PARCEL_FLAG_ALLOW_TERRAFORM: number
declare const PARCEL_FLAG_LINDEN_HOMES: number
declare const PARCEL_FLAG_LOCAL_SOUND_ONLY: number
declare const PARCEL_FLAG_RESTRICT_PUSHOBJECT: number
declare const PARCEL_FLAG_USE_ACCESS_GROUP: number
declare const PARCEL_FLAG_USE_ACCESS_LIST: number
declare const PARCEL_FLAG_USE_BAN_LIST: number
declare const PARCEL_FLAG_USE_LAND_PASS_LIST: number
declare const PARCEL_MEDIA_COMMAND_AGENT: number
declare const PARCEL_MEDIA_COMMAND_AUTO_ALIGN: number
/** Use this to get or set the parcel media description. */
declare const PARCEL_MEDIA_COMMAND_DESC: number
declare const PARCEL_MEDIA_COMMAND_LOOP: number
/** Used to get or set the parcel's media looping variable. */
declare const PARCEL_MEDIA_COMMAND_LOOP_SET: number
declare const PARCEL_MEDIA_COMMAND_PAUSE: number
declare const PARCEL_MEDIA_COMMAND_PLAY: number
/** Use this to get or set the parcel media pixel resolution. */
declare const PARCEL_MEDIA_COMMAND_SIZE: number
declare const PARCEL_MEDIA_COMMAND_STOP: number
declare const PARCEL_MEDIA_COMMAND_TEXTURE: number
declare const PARCEL_MEDIA_COMMAND_TIME: number
/** Use this to get or set the parcel media MIME type (e.g. "text/html"). */
declare const PARCEL_MEDIA_COMMAND_TYPE: number
declare const PARCEL_MEDIA_COMMAND_UNLOAD: number
declare const PARCEL_MEDIA_COMMAND_URL: number
/** The agent authorized to purchase the parcel. */
declare const PARCEL_SALE_AGENT: number
/** Are the objects on the parcel included in the sale? */
declare const PARCEL_SALE_OBJECTS: number
/** The price of the parcel. If no authorized agent is set, must be greater than 0. */
declare const PARCEL_SALE_PRICE: number
/** The sale information was successfully set. */
declare const PARCEL_SALE_OK: number
/** The parcel could not be found. */
declare const PARCEL_SALE_ERROR_NO_PARCEL: number
/** The script does not have the required permissions to set the sale information. */
declare const PARCEL_SALE_ERROR_NO_PERMISSIONS: number
/** The parcel is currently in escrow and cannot be set for sale. */
declare const PARCEL_SALE_ERROR_IN_ESCROW: number
/** The price set for the parcel is invalid (e.g., less than or equal to 0). */
declare const PARCEL_SALE_ERROR_INVALID_PRICE: number
/** The parameters provided to set the sale information are invalid. */
declare const PARCEL_SALE_ERROR_BAD_PARAMS: number
/** Static in-world objects. */
declare const PASSIVE: number
/** Always pass the event. */
declare const PASS_ALWAYS: number
/** Pass the event if there is no script handling the event in the prim. */
declare const PASS_IF_NOT_HANDLED: number
/** Always pass the event. */
declare const PASS_NEVER: number
declare const PATROL_PAUSE_AT_WAYPOINTS: number
declare const PAYMENT_INFO_ON_FILE: number
declare const PAYMENT_INFO_USED: number
declare const PAY_DEFAULT: number
declare const PAY_HIDE: number
/** If this permission is enabled, the object can successfully call llGiveMoney or llTransferLindenDollars to debit the owners account. */
declare const PERMISSION_DEBIT: number
/** If this permission enabled, the object can successfully call the llTakeControls library call. */
declare const PERMISSION_TAKE_CONTROLS: number
/** (not yet implemented) */
declare const PERMISSION_REMAP_CONTROLS: number
/** If this permission is enabled, the object can successfully call llStartAnimation for the avatar that owns this. */
declare const PERMISSION_TRIGGER_ANIMATION: number
/** If this permission is enabled, the object can successfully call llAttachToAvatar to attach to the given avatar. */
declare const PERMISSION_ATTACH: number
/** (not yet implemented) */
declare const PERMISSION_RELEASE_OWNERSHIP: number
/** If this permission is enabled, the object can successfully call llCreateLink, llBreakLink, and llBreakAllLinks to change links to other objects. */
declare const PERMISSION_CHANGE_LINKS: number
/** (not yet implemented) */
declare const PERMISSION_CHANGE_JOINTS: number
/** (not yet implemented) */
declare const PERMISSION_CHANGE_PERMISSIONS: number
declare const PERMISSION_TRACK_CAMERA: number
declare const PERMISSION_CONTROL_CAMERA: number
declare const PERMISSION_TELEPORT: number
/** A script with this permission does not notify the object owner when it modifies estate access rules via llManageEstateAccess. */
declare const PERMISSION_SILENT_ESTATE_MANAGEMENT: number
/** Permission to override default animations. */
declare const PERMISSION_OVERRIDE_ANIMATIONS: number
declare const PERMISSION_RETURN_OBJECTS: number
/** Grants the script privileged access to land parcel functions, such as parcel sale. */
declare const PERMISSION_PRIVILEGED_LAND_ACCESS: number
declare const PERM_ALL: number
declare const PERM_COPY: number
declare const PERM_MODIFY: number
declare const PERM_MOVE: number
declare const PERM_TRANSFER: number
/** 3.14159265 - The number of radians in a semi-circle. */
declare const PI: number
/** Play animation going forwards, then backwards. */
declare const PING_PONG: number
/** 1.57079633 - The number of radians in a quarter circle. */
declare const PI_BY_TWO: number
/**
 * Prim parameter for restricting manual standing for seated avatars in an experience.
 * Ignored if the avatar was not seated via a call to llSitOnLink.
 */
declare const PRIM_ALLOW_UNSIT: number
/**
 * Prim parameter for materials using integer face, integer alpha_mode, integer alpha_cutoff.
 * Defines how the alpha channel of the diffuse texture should be rendered.
 * Valid options for alpha_mode are PRIM_ALPHA_MODE_BLEND, _NONE, _MASK, and _EMISSIVE.
 * alpha_cutoff is used only for PRIM_ALPHA_MODE_MASK.
 */
declare const PRIM_ALPHA_MODE: number
/**
 * Prim parameter setting for PRIM_ALPHA_MODE.
 * Indicates that the diffuse texture's alpha channel should be rendered as alpha-blended.
 */
declare const PRIM_ALPHA_MODE_BLEND: number
/**
 * Prim parameter setting for PRIM_ALPHA_MODE.
 * Indicates that the diffuse texture's alpha channel should be rendered as an emissivity mask.
 */
declare const PRIM_ALPHA_MODE_EMISSIVE: number
/**
 * Prim parameter setting for PRIM_ALPHA_MODE.
 * Indicates that the diffuse texture's alpha channel should be rendered as fully opaque for alpha values above alpha_cutoff and fully transparent otherwise.
 */
declare const PRIM_ALPHA_MODE_MASK: number
/**
 * Prim parameter setting for PRIM_ALPHA_MODE.
 * Indicates that the diffuse texture's alpha channel should be ignored.
 */
declare const PRIM_ALPHA_MODE_NONE: number
declare const PRIM_BUMP_BARK: number
declare const PRIM_BUMP_BLOBS: number
declare const PRIM_BUMP_BRICKS: number
declare const PRIM_BUMP_BRIGHT: number
declare const PRIM_BUMP_CHECKER: number
declare const PRIM_BUMP_CONCRETE: number
declare const PRIM_BUMP_DARK: number
declare const PRIM_BUMP_DISKS: number
declare const PRIM_BUMP_GRAVEL: number
declare const PRIM_BUMP_LARGETILE: number
declare const PRIM_BUMP_NONE: number
declare const PRIM_BUMP_SHINY: number
declare const PRIM_BUMP_SIDING: number
declare const PRIM_BUMP_STONE: number
declare const PRIM_BUMP_STUCCO: number
declare const PRIM_BUMP_SUCTION: number
declare const PRIM_BUMP_TILE: number
declare const PRIM_BUMP_WEAVE: number
declare const PRIM_BUMP_WOOD: number
declare const PRIM_CAST_SHADOWS: number
/** [PRIM_CLICK_ACTION, integer CLICK_ACTION_*] */
declare const PRIM_CLICK_ACTION: number
/** Collision sound uuid and volume for this prim */
declare const PRIM_COLLISION_SOUND: number
/** [PRIM_COLOR, integer face, vector color, float alpha]integer face – face number or ALL_SIDESvector color – color in RGB <R, G, B> (<0.0, 0.0, 0.0> = black, <1.0, 1.0, 1.0> = white)float alpha – from 0.0 (clear) to 1.0 (solid) (0.0 <= alpha <= 1.0) */
declare const PRIM_COLOR: number
/** Damage and damage type assigned to this prim. */
declare const PRIM_DAMAGE: number
/** [PRIM_DESC, string description] */
declare const PRIM_DESC: number
/** [ PRIM_FLEXIBLE, integer boolean, integer softness, float gravity, float friction, float wind, float tension, vector force ]integer boolean – TRUE enables, FALSE disablesinteger softness – ranges from 0 to 3float gravity – ranges from -10.0 to 10.0float friction – ranges from 0.0 to 10.0float wind – ranges from 0.0 to 10.0float tension – ranges from 0.0 to 10.0vector force */
declare const PRIM_FLEXIBLE: number
/** [ PRIM_FULLBRIGHT, integer face, integer boolean ] */
declare const PRIM_FULLBRIGHT: number
/**
 * PRIM_GLOW is used to get or set the glow status of the face.
 * [ PRIM_GLOW, integer face, float intensity ]
 */
declare const PRIM_GLOW: number
/** Prim parameter setting for PRIM_GLTF_BASE_COLOR alpha mode "BLEND". */
declare const PRIM_GLTF_ALPHA_MODE_BLEND: number
/** Prim parameter setting for PRIM_GLTF_BASE_COLOR alpha mode "MASK". */
declare const PRIM_GLTF_ALPHA_MODE_MASK: number
/** Prim parameter setting for PRIM_GLTF_BASE_COLOR alpha mode "OPAQUE". */
declare const PRIM_GLTF_ALPHA_MODE_OPAQUE: number
/**
 * Prim parameter for materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color, integer alpha_mode, float alpha_cutoff, boolean double_sided.
 * Valid options for alpha_mode are PRIM_ALPHA_MODE_BLEND, _NONE, and _MASK.
 * alpha_cutoff is used only for PRIM_ALPHA_MODE_MASK.
 */
declare const PRIM_GLTF_BASE_COLOR: number
/** Prim parameter for GLTF materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color */
declare const PRIM_GLTF_EMISSIVE: number
/** Prim parameter for GLTF materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, float metallic_factor, float roughness_factor */
declare const PRIM_GLTF_METALLIC_ROUGHNESS: number
/** Prim parameter for GLTF materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians */
declare const PRIM_GLTF_NORMAL: number
/** Health value for this prim */
declare const PRIM_HEALTH: number
declare const PRIM_HOLE_CIRCLE: number
declare const PRIM_HOLE_DEFAULT: number
declare const PRIM_HOLE_SQUARE: number
declare const PRIM_HOLE_TRIANGLE: number
/** [ PRIM_LINK_TARGET, integer link_target ]Used to get or set multiple links with a single PrimParameters call. */
declare const PRIM_LINK_TARGET: number
/** [ PRIM_MATERIAL, integer PRIM_MATERIAL_* ] */
declare const PRIM_MATERIAL: number
declare const PRIM_MATERIAL_DENSITY: number
declare const PRIM_MATERIAL_FLESH: number
declare const PRIM_MATERIAL_FRICTION: number
declare const PRIM_MATERIAL_GLASS: number
declare const PRIM_MATERIAL_GRAVITY_MULTIPLIER: number
declare const PRIM_MATERIAL_LIGHT: number
declare const PRIM_MATERIAL_METAL: number
declare const PRIM_MATERIAL_PLASTIC: number
declare const PRIM_MATERIAL_RESTITUTION: number
declare const PRIM_MATERIAL_RUBBER: number
declare const PRIM_MATERIAL_STONE: number
declare const PRIM_MATERIAL_WOOD: number
/** Boolean. Gets/Sets the default image state (the image that the user sees before a piece of media is active) for the chosen face. The default image is specified by Second Life's server for that media type. */
declare const PRIM_MEDIA_ALT_IMAGE_ENABLE: number
/** Boolean. Gets/Sets whether auto-looping is enabled. */
declare const PRIM_MEDIA_AUTO_LOOP: number
/** Boolean. Gets/Sets whether the media auto-plays when a Resident can view it. */
declare const PRIM_MEDIA_AUTO_PLAY: number
/** Boolean. Gets/Sets whether auto-scaling is enabled. Auto-scaling forces the media to the full size of the texture. */
declare const PRIM_MEDIA_AUTO_SCALE: number
/** Boolean. Gets/Sets whether clicking the media triggers auto-zoom and auto-focus on the media. */
declare const PRIM_MEDIA_AUTO_ZOOM: number
/** Integer. Gets/Sets the style of controls. Can be either PRIM_MEDIA_CONTROLS_STANDARD or PRIM_MEDIA_CONTROLS_MINI. */
declare const PRIM_MEDIA_CONTROLS: number
/** Mini web navigation controls; does not include an address bar. */
declare const PRIM_MEDIA_CONTROLS_MINI: number
/** Standard web navigation controls. */
declare const PRIM_MEDIA_CONTROLS_STANDARD: number
/** String. Gets/Sets the current url displayed on the chosen face. Changing this URL causes navigation. 1024 characters Maximum. */
declare const PRIM_MEDIA_CURRENT_URL: number
/** Boolean. Gets/Sets whether the first click interaction is enabled. */
declare const PRIM_MEDIA_FIRST_CLICK_INTERACT: number
/** Integer. Gets/Sets the height of the media in pixels. */
declare const PRIM_MEDIA_HEIGHT_PIXELS: number
/** String. Gets/Sets the home URL for the chosen face. 1024 characters maximum. */
declare const PRIM_MEDIA_HOME_URL: number
declare const PRIM_MEDIA_MAX_HEIGHT_PIXELS: number
declare const PRIM_MEDIA_MAX_URL_LENGTH: number
declare const PRIM_MEDIA_MAX_WHITELIST_COUNT: number
declare const PRIM_MEDIA_MAX_WHITELIST_SIZE: number
declare const PRIM_MEDIA_MAX_WIDTH_PIXELS: number
declare const PRIM_MEDIA_PARAM_MAX: number
/** Integer. Gets/Sets the permissions mask that control who can see the media control bar above the object:: PRIM_MEDIA_PERM_ANYONE, PRIM_MEDIA_PERM_GROUP, PRIM_MEDIA_PERM_NONE, PRIM_MEDIA_PERM_OWNER */
declare const PRIM_MEDIA_PERMS_CONTROL: number
/** Integer. Gets/Sets the permissions mask that control who can interact with the object: PRIM_MEDIA_PERM_ANYONE, PRIM_MEDIA_PERM_GROUP, PRIM_MEDIA_PERM_NONE, PRIM_MEDIA_PERM_OWNER */
declare const PRIM_MEDIA_PERMS_INTERACT: number
declare const PRIM_MEDIA_PERM_ANYONE: number
declare const PRIM_MEDIA_PERM_GROUP: number
declare const PRIM_MEDIA_PERM_NONE: number
declare const PRIM_MEDIA_PERM_OWNER: number
/** String. Gets/Sets the white-list as a string of escaped, comma-separated URLs. This string can hold up to 64 URLs or 1024 characters, whichever comes first. */
declare const PRIM_MEDIA_WHITELIST: number
/** Boolean. Gets/Sets whether navigation is restricted to URLs in PRIM_MEDIA_WHITELIST. */
declare const PRIM_MEDIA_WHITELIST_ENABLE: number
/** Integer. Gets/Sets the width of the media in pixels. */
declare const PRIM_MEDIA_WIDTH_PIXELS: number
/** [ PRIM_NAME, string name ] */
declare const PRIM_NAME: number
/** Prim parameter for materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians */
declare const PRIM_NORMAL: number
/** [ PRIM_OMEGA, vector axis, float spinrate, float gain ]vector axis – arbitrary axis to rotate the object aroundfloat spinrate – rate of rotation in radians per secondfloat gain – also modulates the final spinrate and disables the rotation behavior if zero */
declare const PRIM_OMEGA: number
/** [ PRIM_PHANTOM, integer boolean ] */
declare const PRIM_PHANTOM: number
/** [ PRIM_PHYSICS, integer boolean ] */
declare const PRIM_PHYSICS: number
/** Use the convex hull of the prim shape for physics (this is the default for mesh objects). */
declare const PRIM_PHYSICS_SHAPE_CONVEX: number
/** Ignore this prim in the physics shape. NB: This cannot be applied to the root prim. */
declare const PRIM_PHYSICS_SHAPE_NONE: number
/** Use the normal prim shape for physics (this is the default for all non-mesh objects). */
declare const PRIM_PHYSICS_SHAPE_PRIM: number
/** Allows you to set the physics shape type of a prim via lsl. Permitted values are:PRIM_PHYSICS_SHAPE_NONE, PRIM_PHYSICS_SHAPE_PRIM, PRIM_PHYSICS_SHAPE_CONVEX */
declare const PRIM_PHYSICS_SHAPE_TYPE: number
/** [ PRIM_POINT_LIGHT, integer boolean, vector linear_color, float intensity, float radius, float falloff ]integer boolean – TRUE enables, FALSE disablesvector linear_color – linear color in RGB <R, G, B&> (<0.0, 0.0, 0.0> = black, <1.0, 1.0, 1.0> = white)float intensity – ranges from 0.0 to 1.0float radius – ranges from 0.1 to 20.0float falloff – ranges from 0.01 to 2.0 */
declare const PRIM_POINT_LIGHT: number
/** [ PRIM_POSITION, vector position ]vector position – position in region or local coordinates depending upon the situation */
declare const PRIM_POSITION: number
/** [ PRIM_POS_LOCAL, vector position ]vector position - position in local coordinates */
declare const PRIM_POS_LOCAL: number
/** [ PRIM_PROJECTOR, string texture, float fov, float focus, float ambiance ] */
declare const PRIM_PROJECTOR: number
/** Allows you to configure the object as a custom-placed reflection probe, for image-based lighting (IBL). Only objects in the influence volume of the reflection probe object are affected. */
declare const PRIM_REFLECTION_PROBE: number
/** This is a flag option used with llGetPrimitiveParams and related functions when the parameter is PRIM_REFLECTION_PROBE. When set, the reflection probe is a box. When unset, the reflection probe is a sphere. */
declare const PRIM_REFLECTION_PROBE_BOX: number
/** This is a flag option used with llGetPrimitiveParams and related functions when the parameter is PRIM_REFLECTION_PROBE. When set, the reflection probe includes avatars in IBL effects. When unset, the reflection probe excludes avatars. */
declare const PRIM_REFLECTION_PROBE_DYNAMIC: number
/** This is a flag option used with llGetPrimitiveParams and related functions when the parameter is PRIM_REFLECTION_PROBE. When set, the reflection probe acts as a mirror. */
declare const PRIM_REFLECTION_PROBE_MIRROR: number
/** [ PRIM_RENDER_MATERIAL, integer face, string material ] */
declare const PRIM_RENDER_MATERIAL: number
/** [ PRIM_ROT_LOCAL, rotation global_rot ] */
declare const PRIM_ROTATION: number
/** [ PRIM_ROT_LOCAL, rotation local_rot ] */
declare const PRIM_ROT_LOCAL: number
/**
 * Prim parameter for restricting manual sitting on this prim.
 * Sitting must be initiated via call to llSitOnLink.
 */
declare const PRIM_SCRIPTED_SIT_ONLY: number
/** Mesh is animated. */
declare const PRIM_SCULPT_FLAG_ANIMESH: number
/** Render inside out (inverts the normals). */
declare const PRIM_SCULPT_FLAG_INVERT: number
/** Render an X axis mirror of the sculpty. */
declare const PRIM_SCULPT_FLAG_MIRROR: number
declare const PRIM_SCULPT_TYPE_CYLINDER: number
declare const PRIM_SCULPT_TYPE_MASK: number
declare const PRIM_SCULPT_TYPE_MESH: number
declare const PRIM_SCULPT_TYPE_PLANE: number
declare const PRIM_SCULPT_TYPE_SPHERE: number
declare const PRIM_SCULPT_TYPE_TORUS: number
declare const PRIM_SHINY_HIGH: number
declare const PRIM_SHINY_LOW: number
declare const PRIM_SHINY_MEDIUM: number
declare const PRIM_SHINY_NONE: number
declare const PRIM_SIT_FLAGS: number
/** [ PRIM_SIT_TARGET, integer boolean, vector offset, rotation rot ] */
declare const PRIM_SIT_TARGET: number
/** [ PRIM_SIZE, vector size ] */
declare const PRIM_SIZE: number
/** [ PRIM_SLICE, vector slice ] */
declare const PRIM_SLICE: number
/** Prim parameter for materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color, integer glossy, integer environment */
declare const PRIM_SPECULAR: number
declare const PRIM_TEMP_ON_REZ: number
/** [ PRIM_TEXGEN, integer face, PRIM_TEXGEN_* ] */
declare const PRIM_TEXGEN: number
declare const PRIM_TEXGEN_DEFAULT: number
declare const PRIM_TEXGEN_PLANAR: number
/** [ PRIM_TEXT, string text, vector color, float alpha ] */
declare const PRIM_TEXT: number
/** [ PRIM_TEXTURE, integer face, string texture, vector repeats, vector offsets, float rotation_in_radians ] */
declare const PRIM_TEXTURE: number
declare const PRIM_TYPE: number
declare const PRIM_TYPE_BOX: number
declare const PRIM_TYPE_CYLINDER: number
declare const PRIM_TYPE_PRISM: number
declare const PRIM_TYPE_RING: number
declare const PRIM_TYPE_SCULPT: number
declare const PRIM_TYPE_SPHERE: number
declare const PRIM_TYPE_TORUS: number
declare const PRIM_TYPE_TUBE: number
/** Disables profiling */
declare const PROFILE_NONE: number
/** Enables memory profiling */
declare const PROFILE_SCRIPT_MEMORY: number
declare const PSYS_PART_BF_DEST_COLOR: number
declare const PSYS_PART_BF_ONE: number
declare const PSYS_PART_BF_ONE_MINUS_DEST_COLOR: number
declare const PSYS_PART_BF_ONE_MINUS_SOURCE_ALPHA: number
declare const PSYS_PART_BF_ONE_MINUS_SOURCE_COLOR: number
declare const PSYS_PART_BF_SOURCE_ALPHA: number
declare const PSYS_PART_BF_SOURCE_COLOR: number
declare const PSYS_PART_BF_ZERO: number
declare const PSYS_PART_BLEND_FUNC_DEST: number
declare const PSYS_PART_BLEND_FUNC_SOURCE: number
/** Particles bounce off of a plane at the objects Z height. */
declare const PSYS_PART_BOUNCE_MASK: number
/** The particle glows. */
declare const PSYS_PART_EMISSIVE_MASK: number
/** A float which determines the ending alpha of the object. */
declare const PSYS_PART_END_ALPHA: number
/** A vector <r, g, b> which determines the ending color of the object. */
declare const PSYS_PART_END_COLOR: number
declare const PSYS_PART_END_GLOW: number
/** A vector <sx, sy, z>, which is the ending size of the particle billboard in meters (z is ignored). */
declare const PSYS_PART_END_SCALE: number
/** Each particle that is emitted by the particle system is simulated based on the following flags. To use multiple flags, bitwise or (|) them together. */
declare const PSYS_PART_FLAGS: number
/** The particle position is relative to the source objects position. */
declare const PSYS_PART_FOLLOW_SRC_MASK: number
/** The particle orientation is rotated so the vertical axis faces towards the particle velocity. */
declare const PSYS_PART_FOLLOW_VELOCITY_MASK: number
/** Interpolate both the color and alpha from the start value to the end value. */
declare const PSYS_PART_INTERP_COLOR_MASK: number
/** Interpolate the particle scale from the start value to the end value. */
declare const PSYS_PART_INTERP_SCALE_MASK: number
/** Age in seconds of a particle at which it dies. */
declare const PSYS_PART_MAX_AGE: number
declare const PSYS_PART_RIBBON_MASK: number
/** A float which determines the starting alpha of the object. */
declare const PSYS_PART_START_ALPHA: number
/** A vector <r, g, b> which determines the starting color of the object. */
declare const PSYS_PART_START_COLOR: number
declare const PSYS_PART_START_GLOW: number
/** A vector <sx, sy, z>, which is the starting size of the particle billboard in meters (z is ignored). */
declare const PSYS_PART_START_SCALE: number
declare const PSYS_PART_TARGET_LINEAR_MASK: number
/** The particle heads towards the location of the target object as defined by PSYS_SRC_TARGET_KEY. */
declare const PSYS_PART_TARGET_POS_MASK: number
/** Particles have their velocity damped towards the wind velocity. */
declare const PSYS_PART_WIND_MASK: number
/** A vector <x, y, z> which is the acceleration to apply on particles. */
declare const PSYS_SRC_ACCEL: number
/** Area in radians specifying where particles will NOT be created (for ANGLE patterns) */
declare const PSYS_SRC_ANGLE_BEGIN: number
/** Area in radians filled with particles (for ANGLE patterns) (if lower than PSYS_SRC_ANGLE_BEGIN, acts as PSYS_SRC_ANGLE_BEGIN itself, and PSYS_SRC_ANGLE_BEGIN acts as PSYS_SRC_ANGLE_END). */
declare const PSYS_SRC_ANGLE_END: number
/** How many particles to release in a burst. */
declare const PSYS_SRC_BURST_PART_COUNT: number
/** What distance from the center of the object to create the particles. */
declare const PSYS_SRC_BURST_RADIUS: number
/** How often to release a particle burst (float seconds). */
declare const PSYS_SRC_BURST_RATE: number
/** Maximum speed that a particle should be moving. */
declare const PSYS_SRC_BURST_SPEED_MAX: number
/** Minimum speed that a particle should be moving. */
declare const PSYS_SRC_BURST_SPEED_MIN: number
/** Specifies the inner angle of the arc created by the PSYS_SRC_PATTERN_ANGLE or PSYS_SRC_PATTERN_ANGLE_CONE source pattern.The area specified will NOT have particles in it. */
declare const PSYS_SRC_INNERANGLE: number
/** How long this particle system should last, 0.0 means forever. */
declare const PSYS_SRC_MAX_AGE: number
declare const PSYS_SRC_OBJ_REL_MASK: number
/** Sets the angular velocity to rotate the axis that SRC_PATTERN_ANGLE and SRC_PATTERN_ANGLE_CONE use. */
declare const PSYS_SRC_OMEGA: number
/** Specifies the outer angle of the arc created by the PSYS_SRC_PATTERN_ANGLE or PSYS_SRC_PATTERN_ANGLE_CONE source pattern.The area between the outer and inner angle will be filled with particles. */
declare const PSYS_SRC_OUTERANGLE: number
/** The pattern which is used to generate particles.Use one of the following values: PSYS_SRC_PATTERN Values. */
declare const PSYS_SRC_PATTERN: number
/** Shoot particles across a 2 dimensional area defined by the arc created from PSYS_SRC_OUTERANGLE. There will be an open area defined by PSYS_SRC_INNERANGLE within the larger arc. */
declare const PSYS_SRC_PATTERN_ANGLE: number
/** Shoot particles out in a 3 dimensional cone with an outer arc of PSYS_SRC_OUTERANGLE and an inner open area defined by PSYS_SRC_INNERANGLE. */
declare const PSYS_SRC_PATTERN_ANGLE_CONE: number
declare const PSYS_SRC_PATTERN_ANGLE_CONE_EMPTY: number
/** Drop particles at the source position. */
declare const PSYS_SRC_PATTERN_DROP: number
/** Shoot particles out in all directions, using the burst parameters. */
declare const PSYS_SRC_PATTERN_EXPLODE: number
/** The key of a target object to move towards if PSYS_PART_TARGET_POS_MASK is enabled. */
declare const PSYS_SRC_TARGET_KEY: number
/** An asset name for the texture to use for the particles. */
declare const PSYS_SRC_TEXTURE: number
/** PUBLIC_CHANNEL is an integer constant that, when passed to llSay, llWhisper, or llShout as a channel parameter, will print text to the publicly heard chat channel. */
declare const PUBLIC_CHANNEL: number
/** Selects a random destination near the offset. */
declare const PURSUIT_FUZZ_FACTOR: number
declare const PURSUIT_GOAL_TOLERANCE: number
/** Define whether the character attempts to predict the target's location. */
declare const PURSUIT_INTERCEPT: number
/** Go to a position offset from the target. */
declare const PURSUIT_OFFSET: number
/** Triggered when an llEvade character thinks it has hidden from its pursuer. */
declare const PU_EVADE_HIDDEN: number
/** Triggered when an llEvade character switches from hiding to running */
declare const PU_EVADE_SPOTTED: number
declare const PU_FAILURE_DYNAMIC_PATHFINDING_DISABLED: number
/** Goal is not on the navigation-mesh and cannot be reached. */
declare const PU_FAILURE_INVALID_GOAL: number
/** Character cannot navigate from the current location - e.g., the character is off the navmesh or too high above it. */
declare const PU_FAILURE_INVALID_START: number
/** This is a fatal error reported to a character when there is no navmesh for the region. This usually indicates a server failure and users should file a bug report and include the time and region in which they received this message. */
declare const PU_FAILURE_NO_NAVMESH: number
/** There is no good place for the character to go - e.g., it is patrolling and all the patrol points are now unreachable. */
declare const PU_FAILURE_NO_VALID_DESTINATION: number
declare const PU_FAILURE_OTHER: number
declare const PU_FAILURE_PARCEL_UNREACHABLE: number
/** Target (for llPursue or llEvade) can no longer be tracked - e.g., it left the region or is an avatar that is now more than about 30m outside the region. */
declare const PU_FAILURE_TARGET_GONE: number
/** Goal is no longer reachable for some reason - e.g., an obstacle blocks the path. */
declare const PU_FAILURE_UNREACHABLE: number
/** Character has reached the goal and will stop or choose a new goal (if wandering). */
declare const PU_GOAL_REACHED: number
/** Character is near current goal. */
declare const PU_SLOWDOWN_DISTANCE_REACHED: number
/** 57.2957795 - Number of degrees per radian. You can use this number to convert radians to degrees by multiplying the radians by this number. */
declare const RAD_TO_DEG: number
declare const RCERR_CAST_TIME_EXCEEDED: number
declare const RCERR_SIM_PERF_LOW: number
declare const RCERR_UNKNOWN: number
declare const RC_DATA_FLAGS: number
declare const RC_DETECT_PHANTOM: number
declare const RC_GET_LINK_NUM: number
declare const RC_GET_NORMAL: number
declare const RC_GET_ROOT_KEY: number
declare const RC_MAX_HITS: number
declare const RC_REJECT_AGENTS: number
declare const RC_REJECT_LAND: number
declare const RC_REJECT_NONPHYSICAL: number
declare const RC_REJECT_PHYSICAL: number
declare const RC_REJECT_TYPES: number
declare const REGION_FLAG_ALLOW_DAMAGE: number
declare const REGION_FLAG_ALLOW_DIRECT_TELEPORT: number
declare const REGION_FLAG_BLOCK_FLY: number
declare const REGION_FLAG_BLOCK_FLYOVER: number
declare const REGION_FLAG_BLOCK_TERRAFORM: number
declare const REGION_FLAG_DISABLE_COLLISIONS: number
declare const REGION_FLAG_DISABLE_PHYSICS: number
declare const REGION_FLAG_FIXED_SUN: number
declare const REGION_FLAG_RESTRICT_PUSHOBJECT: number
declare const REGION_FLAG_SANDBOX: number
declare const REMOTE_DATA_CHANNEL: number
declare const REMOTE_DATA_REPLY: number
declare const REMOTE_DATA_REQUEST: number
/** Define whether the character needs a line-of-sight to give chase. */
declare const REQUIRE_LINE_OF_SIGHT: number
/** Used with llSetPhysicsMaterial to enable the density value. Must be between 0.0 and 1.0 */
declare const RESTITUTION: number
/** Play animation in reverse direction. */
declare const REVERSE: number
/** Acceleration forced applied to the rezzed object. [vector force, integer rel] */
declare const REZ_ACCEL: number
/** Damage applied by the object when it collides with an agent. [float damage] */
declare const REZ_DAMAGE: number
/** Set the damage type applied when this object collides. [integer damage_type] */
declare const REZ_DAMAGE_TYPE: number
/** Rez flags to set on the newly rezzed object. [integer flags] */
declare const REZ_FLAGS: number
/** Prevent grabbing the object. */
declare const REZ_FLAG_BLOCK_GRAB_OBJECT: number
/** Object will die after its first collision. */
declare const REZ_FLAG_DIE_ON_COLLIDE: number
/** Object will die if it attempts to enter a parcel that it can not. */
declare const REZ_FLAG_DIE_ON_NOENTRY: number
/** Object will not trigger collision events with other objects created by the same rezzer. */
declare const REZ_FLAG_NO_COLLIDE_FAMILY: number
/** Object will not trigger collision events with its owner. */
declare const REZ_FLAG_NO_COLLIDE_OWNER: number
/** Make the object phantom on rez. */
declare const REZ_FLAG_PHANTOM: number
/** Make the object physical on rez. */
declare const REZ_FLAG_PHYSICAL: number
/** Flag the object as temp on rez. */
declare const REZ_FLAG_TEMP: number
/** Prevent the object from rotating around some axes. [vector locks] */
declare const REZ_LOCK_AXES: number
/** Omega applied to the rezzed object. [vector axis, integer rel, float spin, float gain] */
declare const REZ_OMEGA: number
/** Integer value to pass to the object as its rez parameter. [integer param] */
declare const REZ_PARAM: number
/** A string value to pass to the object as its rez parameter. [string param] */
declare const REZ_PARAM_STRING: number
/** Position at which to rez the new object. [vector position, integer rel, integer atroot] */
declare const REZ_POS: number
/** Rotation applied to newly rezzed object. [rotation rot, integer rel] */
declare const REZ_ROT: number
/** Sound attached to the rezzed object. [string name, float volume, integer loop] */
declare const REZ_SOUND: number
/** Sound played by the object on a collision. [string name, float volume] */
declare const REZ_SOUND_COLLIDE: number
declare const REZ_TORQUE: number
/** Initial velocity of rezzed object. [vector vel, integer rel, integer inherit] */
declare const REZ_VEL: number
/** Animate texture rotation. */
declare const ROTATE: number
/** Animate the texture scale. */
declare const SCALE: number
/** Scripted in-world objects. */
declare const SCRIPTED: number
/** Number of active scripts. */
declare const SIM_STAT_ACTIVE_SCRIPT_COUNT: number
/** Number of agents in region. */
declare const SIM_STAT_AGENT_COUNT: number
/** Time spent in 'agent' segment of simulation frame. */
declare const SIM_STAT_AGENT_MS: number
/** Agent updates per second. */
declare const SIM_STAT_AGENT_UPDATES: number
/** Time spent on AI step. */
declare const SIM_STAT_AI_MS: number
/** Pending asset download count. */
declare const SIM_STAT_ASSET_DOWNLOADS: number
/** Pending asset upload count. */
declare const SIM_STAT_ASSET_UPLOADS: number
/** Number of child agents in region. */
declare const SIM_STAT_CHILD_AGENT_COUNT: number
/** Total frame time. */
declare const SIM_STAT_FRAME_MS: number
/** Time spent in 'image' segment of simulation frame. */
declare const SIM_STAT_IMAGE_MS: number
/** Pump IO time. */
declare const SIM_STAT_IO_PUMP_MS: number
/** Time spent in 'network' segment of simulation frame. */
declare const SIM_STAT_NET_MS: number
/** Time spent in 'other' segment of simulation frame. */
declare const SIM_STAT_OTHER_MS: number
/** Packets in per second. */
declare const SIM_STAT_PACKETS_IN: number
/** Packets out per second. */
declare const SIM_STAT_PACKETS_OUT: number
/**
 * Returns the % of pathfinding characters skipped each frame, averaged over the last minute.
 * The returned value corresponds to the "Characters Updated" stat in the viewer's Statistics Bar.
 */
declare const SIM_STAT_PCT_CHARS_STEPPED: number
/** Physics simulation FPS. */
declare const SIM_STAT_PHYSICS_FPS: number
/** Time spent in 'physics' segment of simulation frame. */
declare const SIM_STAT_PHYSICS_MS: number
/** Physics other time. */
declare const SIM_STAT_PHYSICS_OTHER_MS: number
/** Physics shape update time. */
declare const SIM_STAT_PHYSICS_SHAPE_MS: number
/** Physics step time. */
declare const SIM_STAT_PHYSICS_STEP_MS: number
/** Script events per second. */
declare const SIM_STAT_SCRIPT_EPS: number
/** Time spent in 'script' segment of simulation frame. */
declare const SIM_STAT_SCRIPT_MS: number
/** Percent of scripts run during frame. */
declare const SIM_STAT_SCRIPT_RUN_PCT: number
/** Time spent sleeping. */
declare const SIM_STAT_SLEEP_MS: number
/** Spare time left after frame. */
declare const SIM_STAT_SPARE_MS: number
/** Total unacknowledged bytes. */
declare const SIM_STAT_UNACKED_BYTES: number
/** The prim allows a seated avatar to stand up. */
declare const SIT_FLAG_ALLOW_UNSIT: number
/** The seated avatar's hit box is disabled when seated on this prim. */
declare const SIT_FLAG_NO_COLLIDE: number
/** Damage will not be forwarded to an avatar seated on this prim. */
declare const SIT_FLAG_NO_DAMAGE: number
/** An avatar may not manually sit on this prim. */
declare const SIT_FLAG_SCRIPTED_ONLY: number
/** The prim has an explicitly set sit target. */
declare const SIT_FLAG_SIT_TARGET: number
/** Avatar ID did not specify a valid avatar. */
declare const SIT_INVALID_AGENT: number
/** Link ID did not specify a valid prim in the linkset or resolved to multiple prims. */
declare const SIT_INVALID_LINK: number
/** Attempt to force an avatar to sit on an attachment or other invalid target. */
declare const SIT_INVALID_OBJECT: number
/** Attempt to force an avatar to sit outside an experience. */
declare const SIT_NOT_EXPERIENCE: number
/** Avatar does not have access to the parcel containing the target linkset of the forced sit. */
declare const SIT_NO_ACCESS: number
/** Avatar has not granted permission to force sits. */
declare const SIT_NO_EXPERIENCE_PERMISSION: number
/** No available sit target in linkset for forced sit. */
declare const SIT_NO_SIT_TARGET: number
declare const SKY_ABSORPTION_CONFIG: number
/** The ambient color of the environment */
declare const SKY_AMBIENT: number
/** Blue settings for environment */
declare const SKY_BLUE: number
/** Settings controlling cloud density and configuration */
declare const SKY_CLOUDS: number
/** Texture ID used by clouds */
declare const SKY_CLOUD_TEXTURE: number
/** Counts for density profiles of each type. */
declare const SKY_DENSITY_PROFILE_COUNTS: number
/** Sky dome information. */
declare const SKY_DOME: number
/** The gamma value applied to the scene. */
declare const SKY_GAMMA: number
/** Glow color applied to the sun and moon. */
declare const SKY_GLOW: number
/** Haze settings for environment */
declare const SKY_HAZE: number
/** Miscellaneous lighting values. */
declare const SKY_LIGHT: number
/** MIE scatting profile parameters. */
declare const SKY_MIE_CONFIG: number
/** Environmental moon details. */
declare const SKY_MOON: number
/** Environmental moon texture. */
declare const SKY_MOON_TEXTURE: number
/** Planet information used in rendering the sky. */
declare const SKY_PLANET: number
/** Rayleigh scatting profile parameters. */
declare const SKY_RAYLEIGH_CONFIG: number
/** Settings the ambience of the reflection probe. */
declare const SKY_REFLECTION_PROBE_AMBIANCE: number
/** Sky refraction parameters for rainbows and optical effects. */
declare const SKY_REFRACTION: number
/** Brightness value for the stars. */
declare const SKY_STAR_BRIGHTNESS: number
/** Detailed sun information */
declare const SKY_SUN: number
/** Environmental sun texture */
declare const SKY_SUN_TEXTURE: number
/** Is the environment using the default textures. */
declare const SKY_TEXTURE_DEFAULTS: number
/** Track elevations for this region. */
declare const SKY_TRACKS: number
/** Slide in the X direction, instead of playing separate frames. */
declare const SMOOTH: number
/** Sound will loop until stopped. */
declare const SOUND_LOOP: number
/** Sound will play normally. */
declare const SOUND_PLAY: number
/** Sound will be synchronized with the nearest master. */
declare const SOUND_SYNC: number
/** Sound will be triggered at the prim's location and not attached. */
declare const SOUND_TRIGGER: number
/** 1.41421356 - The square root of 2. */
declare const SQRT2: number
/**
 * Controls whether the object can be grabbed.
 * A grab is the default action when in third person, and is available as the hand tool in build mode. This is useful for physical objects that you don't want other people to be able to trivially disturb. The default is FALSE
 */
declare const STATUS_BLOCK_GRAB: number
/** Prevent click-and-drag movement on all prims in the object. */
declare const STATUS_BLOCK_GRAB_OBJECT: number
/** Argument(s) passed to function had a bounds error. */
declare const STATUS_BOUNDS_ERROR: number
declare const STATUS_CAST_SHADOWS: number
/**
 * Controls whether the object is returned to the owner's inventory if it wanders off the edge of the world.
 * It is useful to set this status TRUE for things like bullets or rockets. The default is TRUE
 */
declare const STATUS_DIE_AT_EDGE: number
/**
 * Controls whether the object dies if it attempts to enter a parcel that does not allow object entry or does not have enough capacity.
 * It is useful to set this status TRUE for things like bullets or rockets. The default is FALSE
 */
declare const STATUS_DIE_AT_NO_ENTRY: number
/** An internal error occurred. */
declare const STATUS_INTERNAL_ERROR: number
/** Function was called with malformed parameters. */
declare const STATUS_MALFORMED_PARAMS: number
/** Object or other item was not found. */
declare const STATUS_NOT_FOUND: number
/** Feature not supported. */
declare const STATUS_NOT_SUPPORTED: number
/** Result of function call was a success. */
declare const STATUS_OK: number
/**
 * Controls/indicates whether the object collides or not.
 * Setting the value to TRUE makes the object non-colliding with all objects. It is a good idea to use this for most objects that move or rotate, but are non-physical. It is also useful for simulating volumetric lighting. The default is FALSE.
 */
declare const STATUS_PHANTOM: number
/**
 * Controls/indicates whether the object moves physically.
 * This controls the same flag that the UI check-box for Physical controls. The default is FALSE.
 */
declare const STATUS_PHYSICS: number
declare const STATUS_RETURN_AT_EDGE: number
declare const STATUS_ROTATE_X: number
declare const STATUS_ROTATE_Y: number
/** Controls/indicates whether the object can physically rotate aroundthe specific axis or not. This flag has no meaningfor non-physical objects. Set the value to FALSEif you want to disable rotation around that axis. Thedefault is TRUE for a physical object.A useful example to think about when visualizingthe effect is a sit-and-spin device. They spin around theZ axis (up) but not around the X or Y axis. */
declare const STATUS_ROTATE_Z: number
/** Controls/indicates whether the object can cross region boundariesand move more than 20 meters from its creationpoint. The default if FALSE. */
declare const STATUS_SANDBOX: number
/** Argument(s) passed to function had a type mismatch. */
declare const STATUS_TYPE_MISMATCH: number
/** Whitelist Failed. */
declare const STATUS_WHITELIST_FAILED: number
declare const STRING_TRIM: number
declare const STRING_TRIM_HEAD: number
declare const STRING_TRIM_TAIL: number
/** Send email to the owner of the object */
declare const TARGETED_EMAIL_OBJECT_OWNER: number
/** Send email to the creator of the root object */
declare const TARGETED_EMAIL_ROOT_CREATOR: number
declare const TERRAIN_DETAIL_1: number
declare const TERRAIN_DETAIL_2: number
declare const TERRAIN_DETAIL_3: number
declare const TERRAIN_DETAIL_4: number
declare const TERRAIN_HEIGHT_RANGE_NE: number
declare const TERRAIN_HEIGHT_RANGE_NW: number
declare const TERRAIN_HEIGHT_RANGE_SE: number
declare const TERRAIN_HEIGHT_RANGE_SW: number
declare const TERRAIN_PBR_OFFSET_1: number
declare const TERRAIN_PBR_OFFSET_2: number
declare const TERRAIN_PBR_OFFSET_3: number
declare const TERRAIN_PBR_OFFSET_4: number
declare const TERRAIN_PBR_ROTATION_1: number
declare const TERRAIN_PBR_ROTATION_2: number
declare const TERRAIN_PBR_ROTATION_3: number
declare const TERRAIN_PBR_ROTATION_4: number
declare const TERRAIN_PBR_SCALE_1: number
declare const TERRAIN_PBR_SCALE_2: number
declare const TERRAIN_PBR_SCALE_3: number
declare const TERRAIN_PBR_SCALE_4: number
declare const TEXTURE_BLANK: uuid
declare const TEXTURE_DEFAULT: uuid
declare const TEXTURE_MEDIA: uuid
declare const TEXTURE_PLYWOOD: uuid
declare const TEXTURE_TRANSPARENT: uuid
declare const TOUCH_INVALID_FACE: number
declare const TOUCH_INVALID_TEXCOORD: vector
declare const TOUCH_INVALID_VECTOR: vector
/** Direct teleporting is blocked on this parcel. */
declare const TP_ROUTING_BLOCKED: number
/** Teleports are unrestricted on this parcel. */
declare const TP_ROUTING_FREE: number
/** Teleports are routed to a landing point if set on this parcel. */
declare const TP_ROUTING_LANDINGP: number
/** Invalid inventory options. */
declare const TRANSFER_BAD_OPTS: number
/** The root path specified in TRANSFER_DEST contained an invalid directory or was reduced to nothing. */
declare const TRANSFER_BAD_ROOT: number
/** The root folder to transfer inventory into. */
declare const TRANSFER_DEST: number
/** Flags to control the behavior of inventory transfer. */
declare const TRANSFER_FLAGS: number
/** Gives a copy of the object being transfered. Implies TRANSFER_FLAG_TAKE. */
declare const TRANSFER_FLAG_COPY: number
/** Reserved for future expansion. */
declare const TRANSFER_FLAG_RESERVED: number
/** On a successful transfer, automatically takes the object into inventory. */
declare const TRANSFER_FLAG_TAKE: number
/** Can not transfer ownership of an attached object. */
declare const TRANSFER_NO_ATTACHMENT: number
/** No items in the inventory list are eligible for transfer. */
declare const TRANSFER_NO_ITEMS: number
/** The object does not have transfer permissions. */
declare const TRANSFER_NO_PERMS: number
/** Could not find the receiver in the current region. */
declare const TRANSFER_NO_TARGET: number
/** Inventory transfer offer was successfully made. */
declare const TRANSFER_OK: number
/** Inventory throttle hit. */
declare const TRANSFER_THROTTLE: number
/** One of TRAVERSAL_TYPE_FAST, TRAVERSAL_TYPE_SLOW, and TRAVERSAL_TYPE_NONE. */
declare const TRAVERSAL_TYPE: number
declare const TRAVERSAL_TYPE_FAST: number
declare const TRAVERSAL_TYPE_NONE: number
declare const TRAVERSAL_TYPE_SLOW: number
/** 6.28318530 - The radians of a circle. */
declare const TWO_PI: number
/** The list entry is a float. */
declare const TYPE_FLOAT: number
/** The list entry is an integer. */
declare const TYPE_INTEGER: number
/** The list entry is invalid. */
declare const TYPE_INVALID: number
/** The list entry is a key. */
declare const TYPE_KEY: number
/** The list entry is a rotation. */
declare const TYPE_ROTATION: number
/** The list entry is a string. */
declare const TYPE_STRING: number
/** The list entry is a vector. */
declare const TYPE_VECTOR: number
declare const URL_REQUEST_DENIED: string
declare const URL_REQUEST_GRANTED: string
/** A slider between minimum (0.0) and maximum (1.0) deflection of angular orientation. That is, its a simple scalar for modulating the strength of angular deflection such that the vehicles preferred axis of motion points toward its real velocity. */
declare const VEHICLE_ANGULAR_DEFLECTION_EFFICIENCY: number
/** The time-scale for exponential success of linear deflection deflection. Its another way to specify the strength of the vehicles tendency to reorient itself so that its preferred axis of motion agrees with its true velocity. */
declare const VEHICLE_ANGULAR_DEFLECTION_TIMESCALE: number
/** A vector of timescales for exponential decay of the vehicle's angular velocity about its preferred axes of motion (at, left, up).Range = [0.07, inf) seconds for each element of the vector. */
declare const VEHICLE_ANGULAR_FRICTION_TIMESCALE: number
/** The timescale for exponential decay of the angular motors magnitude. */
declare const VEHICLE_ANGULAR_MOTOR_DECAY_TIMESCALE: number
/** The direction and magnitude (in preferred frame) of the vehicle's angular motor. The vehicle will accelerate (or decelerate if necessary) to match its velocity to its motor. */
declare const VEHICLE_ANGULAR_MOTOR_DIRECTION: number
/** The timescale for exponential approach to full angular motor velocity. */
declare const VEHICLE_ANGULAR_MOTOR_TIMESCALE: number
/** A slider between anti (-1.0), none (0.0), and maxmum (1.0) banking strength. */
declare const VEHICLE_BANKING_EFFICIENCY: number
/** A slider between static (0.0) and dynamic (1.0) banking. "Static" means the banking scales only with the angle of roll, whereas "dynamic" is a term that also scales with the vehicles linear speed. */
declare const VEHICLE_BANKING_MIX: number
/** The timescale for banking to exponentially approach its maximum effect. This is another way to scale the strength of the banking effect, however it affects the term that is proportional to the difference between what the banking behavior is trying to do, and what the vehicle is actually doing. */
declare const VEHICLE_BANKING_TIMESCALE: number
/** A slider between minimum (0.0) and maximum anti-gravity (1.0). */
declare const VEHICLE_BUOYANCY: number
/** Prevent other scripts from pushing vehicle. */
declare const VEHICLE_FLAG_BLOCK_INTERFERENCE: number
declare const VEHICLE_FLAG_CAMERA_DECOUPLED: number
/** Hover at global height. */
declare const VEHICLE_FLAG_HOVER_GLOBAL_HEIGHT: number
/** Ignore water height when hovering. */
declare const VEHICLE_FLAG_HOVER_TERRAIN_ONLY: number
/** Hover does not push down. Use this flag for hovering vehicles that should be able to jump above their hover height. */
declare const VEHICLE_FLAG_HOVER_UP_ONLY: number
/** Ignore terrain height when hovering. */
declare const VEHICLE_FLAG_HOVER_WATER_ONLY: number
/** Prevents ground vehicles from motoring into the sky. */
declare const VEHICLE_FLAG_LIMIT_MOTOR_UP: number
/** For vehicles with vertical attractor that want to be able to climb/dive, for instance, aeroplanes that want to use the banking feature. */
declare const VEHICLE_FLAG_LIMIT_ROLL_ONLY: number
declare const VEHICLE_FLAG_MOUSELOOK_BANK: number
declare const VEHICLE_FLAG_MOUSELOOK_STEER: number
/** This flag prevents linear deflection parallel to world z-axis. This is useful for preventing ground vehicles with large linear deflection, like bumper cars, from climbing their linear deflection into the sky. */
declare const VEHICLE_FLAG_NO_DEFLECTION_UP: number
/** Old, changed to VEHICLE_FLAG_NO_DEFLECTION_UP */
declare const VEHICLE_FLAG_NO_FLY_UP: number
/** A slider between minimum (0.0 = bouncy) and maximum (1.0 = fast as possible) damped motion of the hover behavior. */
declare const VEHICLE_HOVER_EFFICIENCY: number
/** The height (above the terrain or water, or global) at which the vehicle will try to hover. */
declare const VEHICLE_HOVER_HEIGHT: number
/** Period of time (in seconds) for the vehicle to achieve its hover height. */
declare const VEHICLE_HOVER_TIMESCALE: number
/** A slider between minimum (0.0) and maximum (1.0) deflection of linear velocity. That is, its a simple scalar for modulating the strength of linear deflection. */
declare const VEHICLE_LINEAR_DEFLECTION_EFFICIENCY: number
/** The timescale for exponential success of linear deflection deflection. It is another way to specify how much time it takes for the vehicle's linear velocity to be redirected to its preferred axis of motion. */
declare const VEHICLE_LINEAR_DEFLECTION_TIMESCALE: number
/** A vector of timescales for exponential decay of the vehicle's linear velocity along its preferred axes of motion (at, left, up).Range = [0.07, inf) seconds for each element of the vector. */
declare const VEHICLE_LINEAR_FRICTION_TIMESCALE: number
/** The timescale for exponential decay of the linear motors magnitude. */
declare const VEHICLE_LINEAR_MOTOR_DECAY_TIMESCALE: number
/** The direction and magnitude (in preferred frame) of the vehicle's linear motor. The vehicle will accelerate (or decelerate if necessary) to match its velocity to its motor.Range of magnitude = [0, 30] meters/second. */
declare const VEHICLE_LINEAR_MOTOR_DIRECTION: number
declare const VEHICLE_LINEAR_MOTOR_OFFSET: number
/** The timescale for exponential approach to full linear motor velocity. */
declare const VEHICLE_LINEAR_MOTOR_TIMESCALE: number
/** A rotation of the vehicle's preferred axes of motion and orientation (at, left, up) with respect to the vehicle's local frame (x, y, z). */
declare const VEHICLE_REFERENCE_FRAME: number
/**
 * Uses linear deflection for lift, no hover, and banking to turn.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_AIRPLANE
 */
declare const VEHICLE_TYPE_AIRPLANE: number
/**
 * Hover, and friction, but no deflection.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_BALLOON
 */
declare const VEHICLE_TYPE_BALLOON: number
/**
 * Hovers over water with lots of friction and some anglar deflection.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_BOAT
 */
declare const VEHICLE_TYPE_BOAT: number
/**
 * Another vehicle that bounces along the ground but needs the motors to be driven from external controls or timer events.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_CAR
 */
declare const VEHICLE_TYPE_CAR: number
declare const VEHICLE_TYPE_NONE: number
/**
 * Simple vehicle that bumps along the ground, and likes to move along its local x-axis.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_SLED
 */
declare const VEHICLE_TYPE_SLED: number
/** A slider between minimum (0.0 = wobbly) and maximum (1.0 = firm as possible) stability of the vehicle to keep itself upright. */
declare const VEHICLE_VERTICAL_ATTRACTION_EFFICIENCY: number
/** The period of wobble, or timescale for exponential approach, of the vehicle to rotate such that its preferred "up" axis is oriented along the world's "up" axis. */
declare const VEHICLE_VERTICAL_ATTRACTION_TIMESCALE: number
declare const VERTICAL: number
declare const WANDER_PAUSE_AT_WAYPOINTS: number
/** Blur factor. */
declare const WATER_BLUR_MULTIPLIER: number
/** Fog properties when underwater. */
declare const WATER_FOG: number
/** Fresnel scattering applied to the surface of the water. */
declare const WATER_FRESNEL: number
/** Scaling applied to the water normal map. */
declare const WATER_NORMAL_SCALE: number
/** Normal map used for environmental waves. */
declare const WATER_NORMAL_TEXTURE: number
/** Refraction factors when looking through the surface of the water. */
declare const WATER_REFRACTION: number
/** Is the environment using the default wave map. */
declare const WATER_TEXTURE_DEFAULTS: number
/** Vectors for the directions of the waves. */
declare const WATER_WAVE_DIRECTION: number
/** The region currently has experiences disabled. */
declare const XP_ERROR_EXPERIENCES_DISABLED: number
/** The experience owner has temporarily disabled the experience. */
declare const XP_ERROR_EXPERIENCE_DISABLED: number
/** The experience has been suspended by Linden Customer Support. */
declare const XP_ERROR_EXPERIENCE_SUSPENDED: number
/** The script is associated with an experience that no longer exists. */
declare const XP_ERROR_INVALID_EXPERIENCE: number
/** One of the string arguments was too big to fit in the key-value store. */
declare const XP_ERROR_INVALID_PARAMETERS: number
/** The requested key does not exist. */
declare const XP_ERROR_KEY_NOT_FOUND: number
/** The content rating of the experience exceeds that of the region. */
declare const XP_ERROR_MATURITY_EXCEEDED: number
/** No error was detected. */
declare const XP_ERROR_NONE: number
/** The sim was unable to verify the validity of the experience. Retrying after a short wait is advised. */
declare const XP_ERROR_NOT_FOUND: number
/** This experience is not allowed to run by the requested agent. */
declare const XP_ERROR_NOT_PERMITTED: number
/** This experience is not allowed to run on the current region. */
declare const XP_ERROR_NOT_PERMITTED_LAND: number
/** This script is not associated with an experience. */
declare const XP_ERROR_NO_EXPERIENCE: number
/** An attempted write data to the key-value store failed due to the data quota being met. */
declare const XP_ERROR_QUOTA_EXCEEDED: number
/** Request timed out; permissions not modified. */
declare const XP_ERROR_REQUEST_PERM_TIMEOUT: number
/** A checked update failed due to an out of date request. */
declare const XP_ERROR_RETRY_UPDATE: number
/** Unable to communicate with the key-value store. */
declare const XP_ERROR_STORAGE_EXCEPTION: number
/** The key-value store is currently disabled on this region. */
declare const XP_ERROR_STORE_DISABLED: number
/** The call failed due to too many recent calls. */
declare const XP_ERROR_THROTTLED: number
/** Other unknown error. */
declare const XP_ERROR_UNKNOWN_ERROR: number
declare const ZERO_ROTATION: quaternion
declare const ZERO_VECTOR: vector
