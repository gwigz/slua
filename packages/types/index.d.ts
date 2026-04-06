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
  add: LuaAdditionMethod<Quaternion, Quaternion>
  sub: LuaSubtractionMethod<Quaternion, Quaternion>
  mul: LuaMultiplicationMethod<Quaternion, Quaternion>
  div: LuaDivisionMethod<Quaternion, Quaternion>
  neg: LuaNegationMethod<Quaternion>
}

/**
 * A 128‑bit unique identifier formatted as 36 hexadecimal characters (8‑4‑4‑4‑12), e.g. "A822FF2B-FF02-461D-B45D-DCD10A2DE0C2".
 * @customConstructor uuid.create
 */
declare class UUID {
  constructor(value: string | undefined | buffer | UUID)
  /** Returns true if the UUID is not the null UUID (all zeros) */
  readonly istruthy: boolean
  /** Returns the raw 16-byte binary string of the UUID, or nil if the UUID is not in a compressed state */
  readonly bytes: string
}

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
  add: LuaAdditionMethod<Vector, Vector>
  /** Native component-wise subtraction */
  sub: LuaSubtractionMethod<Vector, Vector>
  /** Unary negation */
  neg: LuaNegationMethod<Vector>
  /** Multiplication: vector * vector / number -> vector (Scale), vector * quaternion -> vector (Rotation) */
  mul: LuaMultiplicationMethod<number, Vector> &
    LuaMultiplicationMethod<Vector, Vector> &
    LuaMultiplicationMethod<Quaternion, Vector>
  /** Division: vector / number -> vector (Scale), vector / quaternion -> vector (Rotation by inverse) */
  div: LuaDivisionMethod<number, Vector> &
    LuaDivisionMethod<Vector, Vector> &
    LuaDivisionMethod<Quaternion, Vector>
  /** LSL-style modulo: vector % vector -> vector (Cross Product) */
  mod: LuaModuloMethod<Vector, Vector>
}

/** Event detection class providing access to detected object/avatar information */
declare interface DetectedEvent {
  readonly index: number
  readonly valid: boolean
  readonly canAdjustDamage: boolean
  /** Changes the amount of damage to be delivered by this damage event. */
  adjustDamage(damage: number): void
  /** Returns a list containing the current damage for the event, the damage type and the original damage delivered. */
  getDamage(): DamageDetails
  /**
   * Returns the grab offset of a user touching the object.
   * Returns <0.0, 0.0, 0.0> if Number is not a valid object.
   */
  getGrab(): Vector
  /**
   * Returns TRUE if detected object or agent Number has the same user group active as this object.
   * It will return FALSE if the object or agent is in the group, but the group is not active.
   */
  getGroup(): number
  /**
   * Returns the key of detected object or avatar number.
   * Returns NULL_KEY if Number is not a valid index.
   */
  getKey(): UUID
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
  getOwner(): UUID
  /**
   * Returns the position of detected object or avatar number.
   * Returns <0.0, 0.0, 0.0> if Number is not a valid index.
   */
  getPos(): Vector
  /** Returns the key for the rezzer of the detected object. */
  getRezzer(): UUID
  /**
   * Returns the rotation of detected object or avatar number.
   * Returns <0.0, 0.0, 0.0, 1.0> if Number is not a valid offset.
   */
  getRot(): Quaternion
  /**
   * Returns the surface bi-normal for a triggered touch event.
   * Returns a vector that is the surface bi-normal (tangent to the surface) where the touch event was triggered.
   */
  getTouchBinormal(): Vector
  /** Returns the index of the face where the avatar clicked in a triggered touch event. */
  getTouchFace(): number
  /**
   * Returns the surface normal for a triggered touch event.
   * Returns a vector that is the surface normal (perpendicular to the surface) where the touch event was triggered.
   */
  getTouchNormal(): Vector
  /**
   * Returns the position, in region coordinates, where the object was touched in a triggered touch event.
   * Unless it is a HUD, in which case it returns the position relative to the attach point.
   */
  getTouchPos(): Vector
  /**
   * Returns a vector that is the surface coordinates where the prim was touched.
   * The X and Y vector positions contain the horizontal (S) and vertical (T) face coordinates respectively.
   * Each component is in the interval [0.0, 1.0].
   * TOUCH_INVALID_TEXCOORD is returned if the surface coordinates cannot be determined (e.g. when the viewer does not support this function).
   */
  getTouchST(): Vector
  /**
   * Returns a vector that is the texture coordinates for where the prim was touched.
   * The X and Y vector positions contain the U and V face coordinates respectively.
   * TOUCH_INVALID_TEXCOORD is returned if the touch UV coordinates cannot be determined (e.g. when the viewer does not support this function).
   */
  getTouchUV(): Vector
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
  getVel(): Vector
}

/** @noSelf */
declare interface LLEventMap {
  /** This event is triggered when a script comes within a defined angle of a target rotation. The range and rotation are set by a call to llRotTarget. */
  at_rot_target: (
    targetNumber: number,
    targetRotation: Quaternion,
    currentRotation: Quaternion,
  ) => void
  /** This event is triggered when the scripted object comes within a defined range of the target position, defined by the llTarget function call. */
  at_target: (targetNumber: number, targetPosition: Vector, currentPosition: Vector) => void
  /** This event is triggered whenever an object is attached or detached from an avatar. If it is attached, the key of the avatar it is attached to is passed in, otherwise NULL_KEY is. */
  attach: (avatarId: UUID) => void
  /** Triggered when various events change the object. The change argument will be a bit-field of CHANGED_* constants. */
  changed: (changed: number) => void
  /** This event is raised while another object, or avatar, is colliding with the object the script is attached to.The number of detected objects is passed to the script. Information on those objects may be gathered via the llDetected* functions. */
  collision: (detected: DetectedEvent[]) => void
  /** This event is raised when another object, or avatar, stops colliding with the object the script is attached to.The number of detected objects is passed to the script. Information on those objects may be gathered via the llDetected* library functions. */
  collision_end: (detected: DetectedEvent[]) => void
  /** This event is raised when another object, or avatar, starts colliding with the object the script is attached to.The number of detected objects is passed to the script. Information on those objects may be gathered via the llDetected* library functions. */
  collision_start: (detected: DetectedEvent[]) => void
  /** Once a script has the ability to grab control inputs from the avatar, this event will be used to pass the commands into the script.The levels and edges are bit-fields of control constants. */
  control: (avatarId: UUID, levels: number, edges: number) => void
  /** This event is triggered when the requested data is returned to the script.Data may be requested by the llRequestAgentData, llRequestInventoryData, and llGetNotecardLine function calls, for example. */
  dataserver: (requestId: UUID, data: string) => void
  /** This event is triggered when an email sent to this script arrives.The number remaining tells how many more emails are known to be still pending. */
  email: (
    time: string,
    address: string,
    subject: string,
    body: string,
    numberRemaining: number,
  ) => void
  /** Triggered when an agent has approved an experience permissions request. */
  experience_permissions: (agentId: UUID) => void
  /** Describes why the Experience permissions were denied for the agent. */
  experience_permissions_denied: (agentId: UUID, reason: number) => void
  /** Triggered as damage is applied to an avatar or task, after all on_damage events have been processed. */
  final_damage: (detected: DetectedEvent[]) => void
  /** This event is raised when game controller input changes. */
  game_control: (id: UUID, buttons: number, axes: number[]) => void
  /** Triggered when task receives an HTTP request. */
  http_request: (httpRequestId: UUID, httpMethod: string, body: string) => void
  /** This event handler is invoked when an HTTP response is received for a pending llHTTPRequest request or if a pending request fails or times out. */
  http_response: (httpRequestId: UUID, status: number, metadata: list, body: string) => void
  /** This event is raised when the object the script is attached to is colliding with the ground. */
  land_collision: (position: Vector) => void
  /** This event is raised when the object the script is attached to stops colliding with the ground. */
  land_collision_end: (position: Vector) => void
  /** This event is raised when the object the script is attached to begins to collide with the ground. */
  land_collision_start: (position: Vector) => void
  /** Triggered when object receives a link message via llMessageLinked function call. */
  link_message: (sendersLink: number, value: number, text: string, id: string) => void
  /** Triggered when a script modifies the linkset datastore. */
  linkset_data: (action: number, name: string, value: string) => void
  /** This event is raised whenever a chat message matching the constraints set in the llListen command is received. The name and ID of the speaker, as well as the message, are passed in as parameters.Channel 0 is the public chat channel that all avatars see as chat text. Channels 1 through 2,147,483,648 are private channels that are not sent to avatars but other scripts can listen on those channels. */
  listen: (channel: number, name: string, id: UUID, text: string) => void
  /** This event is triggered when a resident has given an amount of Linden dollars to the object. */
  money: (payer: UUID, amount: number) => void
  /** Triggered whenever an object with this script stops moving. */
  moving_end: () => void
  /** Triggered whenever an object with this script starts moving. */
  moving_start: () => void
  /** This event is raised when sensors are active, via the llSensor function call, but are not sensing anything. */
  no_sensor: () => void
  /** When a target is set via the llRotTarget function call, but the script is outside the specified angle this event is raised. */
  not_at_rot_target: () => void
  /** When a target is set via the llTarget library call, but the script is outside the specified range this event is raised. */
  not_at_target: () => void
  /** Triggered when an object rezzes another object from its inventory via the llRezObject, or similar, functions. The id is the globally unique key for the object rezzed. */
  object_rez: (rezzedObjectsId: UUID) => void
  /** Triggered when an avatar or object receives damage. */
  on_damage: (detected: DetectedEvent[]) => void
  /** Triggered when an avatar reaches 0 health. */
  on_death: () => void
  /** Triggered whenever an object is rezzed from inventory or by another object. The start parameter is passed in from the llRezObject call, or zero if from inventory. */
  on_rez: (startParameter: number) => void
  /** This event is called to inform the script of changes within the object's path-finding status. */
  path_update: (type: number, reserved: list) => void
  /**
   * This event is deprecated.
   * @deprecated
   */
  remote_data: (
    eventType: number,
    channelId: UUID,
    messageId: UUID,
    sender: string,
    iData: number,
    sData: string,
  ) => void
  /** Scripts need permission from either the owner or the avatar they wish to act on before they may perform certain functions, such as debiting money from their owners account, triggering an animation on an avatar, or capturing control inputs. The llRequestPermissions library function is used to request these permissions and the various permissions integer constants can be supplied.The integer returned to this event handler contains the current set of permissions flags, so if permissions equal 0 then no permissions are set. */
  run_time_permissions: (permissionFlags: number) => void
  /** This event is raised whenever objects matching the constraints of the llSensor command are detected.The number of detected objects is passed to the script in the parameter. Information on those objects may be gathered via the llDetected* functions. */
  sensor: (detected: DetectedEvent[]) => void
  /**
   * This event is raised at regular intervals set by the llSetTimerEvent library function.
   * @deprecated Use 'LLTimers' instead.
   */
  timer: () => void
  /** This event is raised while a user is touching the object the script is attached to.The number of touching objects is passed to the script in the parameter.Information on those objects may be gathered via the llDetected* library functions. */
  touch: (detected: DetectedEvent[]) => void
  /** This event is raised when a user stops touching the object the script is attached to. The number of touches is passed to the script in the parameter.Information on those objects may be gathered via the llDetected* library functions. */
  touch_end: (detected: DetectedEvent[]) => void
  /** This event is raised when a user first touches the object the script is attached to. The number of touches is passed to the script in the parameter.Information on those objects may be gathered via the llDetected() library functions. */
  touch_start: (detected: DetectedEvent[]) => void
  /** Triggered by llTransferLindenDollars() function. */
  transaction_result: (requestId: UUID, success: boolean, message: string) => void
}

/** 'rotation' is an alias for 'quaternion' */
declare type rotation = Quaternion
declare type list = (string | number | Vector | UUID | Quaternion | boolean)[]
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
declare function touuid(val: string | undefined | buffer | UUID): UUID | undefined
/**
 * Converts a string to a vector, returns nil if invalid
 * @noSelf
 */
declare function tovector(val: string | undefined | Vector): Vector | undefined
/**
 * Converts a string to a quaternion, returns nil if invalid
 * @noSelf
 */
declare function toquaternion(val: string | undefined | Quaternion): Quaternion | undefined
/**
 * Converts a string to a rotation (quaternion), returns nil if invalid
 * @noSelf
 */
declare function torotation(val: string | undefined | Quaternion): Quaternion | undefined
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

  /**
   * Sets the seed for the random number generator.
   * @deprecated Disabled in SLua.
   */
  export function randomseed(...args: never[]): void

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
  export function create(x: number, y: number, z: number, s: number): Quaternion

  /** Computes the normalized version (unit quaternion) of the quaternion. */
  export function normalize(q: Quaternion): Quaternion

  /** Computes the magnitude of the quaternion. */
  export function magnitude(q: Quaternion): number

  /** Computes the dot product of two quaternions. */
  export function dot(a: Quaternion, b: Quaternion): number

  /** Spherical linear interpolation from a to b using factor t. */
  export function slerp(a: Quaternion, b: Quaternion, t: number): Quaternion

  /** Computes the conjugate of the quaternion. */
  export function conjugate(q: Quaternion): Quaternion

  /** Computes the forward vector from the quaternion. */
  export function tofwd(q: Quaternion): Vector

  /** Computes the left vector from the quaternion. */
  export function toleft(q: Quaternion): Vector

  /** Computes the up vector from the quaternion. */
  export function toup(q: Quaternion): Vector

  /** Identity quaternion constant. */
  export const identity: Quaternion
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
  export function shrink<V>(t: V[], shrinkSparse?: boolean): V[]

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
  export function create(value: string | undefined | buffer | UUID): UUID
}

/** Vector manipuluation library. */
/** @noSelf */
declare namespace Vector {
  /** Creates a new vector with the given component values. */
  export function create(x: number, y: number, z?: number): Vector

  /** Computes the magnitude of the vector. */
  export function magnitude(v: Vector): number

  /** Computes the normalized version (unit vector) of the vector. */
  export function normalize(v: Vector): Vector

  /** Computes the cross product of two vectors. */
  export function cross(a: Vector, b: Vector): Vector

  /** Computes the dot product of two vectors. */
  export function dot(a: Vector, b: Vector): number

  /** Computes the angle between two vectors in radians. The axis, if specified, is used to determine the sign of the angle. */
  export function angle(a: Vector, b: Vector, axis?: Vector): number

  /** Applies math.floor to each component of the vector. */
  export function floor(v: Vector): Vector

  /** Applies math.ceil to each component of the vector. */
  export function ceil(v: Vector): Vector

  /** Applies math.abs to each component of the vector. */
  export function abs(v: Vector): Vector

  /** Applies math.sign to each component of the vector. */
  export function sign(v: Vector): Vector

  /** Clamps each component of the vector between min and max values. */
  export function clamp(v: Vector, min: Vector, max: Vector): Vector

  /** Applies math.max to each component of the vectors. */
  export function max(v: Vector, ...args: Vector[]): Vector

  /** Applies math.max to each component of the vectors. */
  export function min(v: Vector, ...args: Vector[]): Vector

  /** Linearly interpolates between a and b using factor t. */
  export function lerp(a: Vector, b: Vector, t: number): Vector

  /** Constant vector with all components set to 0. */
  export const zero: Vector
  /** Constant vector with all components set to 1. */
  export const one: Vector
}

/** @noSelf */
declare namespace ll {
  /**
   * Returns the absolute (positive) version of Value.
   * @deprecated Use 'math.abs' instead. Double precision; fastcall.
   */
  export function Abs(value: number): number

  /**
   * Returns the arc-cosine of Value, in radians.
   * @deprecated Use 'math.acos' instead. Double precision; fastcall.
   */
  export function Acos(value: number): number

  /**
   * Add avatar ID to the parcel ban list for the specified number of Hours.
   * A value of 0 for Hours will add the agent indefinitely.
   * The smallest value that Hours will accept is 0.01; anything smaller will be seen as 0.
   * When values that small are used, it seems the function bans in approximately 30 second increments (Probably 36 second increments, as 0.01 of an hour is 36 seconds).
   * Residents teleporting to a parcel where they are banned will be redirected to a neighbouring parcel.
   */
  export function AddToLandBanList(id: UUID, hours: number): void

  /** Add avatar ID to the land pass list, for a duration of Hours. */
  export function AddToLandPassList(id: UUID, hours: number): void

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
  export function AgentInExperience(agentId: UUID): boolean

  /** If Flag == TRUE, users without object modify permissions can still drop inventory items into the object. */
  export function AllowInventoryDrop(flag: boolean): void

  /** Returns the angle, in radians, between rotations Rot1 and Rot2. */
  export function AngleBetween(rot1: Quaternion, rot2: Quaternion): number

  /**
   * Applies impulse to the object.
   * If Local == TRUE, apply the Force in local coordinates; otherwise, apply the Force in global coordinates.
   * This function only works on physical objects.
   */
  export function ApplyImpulse(force: Vector, local: boolean): void

  /**
   * Applies rotational impulse to the object.
   * If Local == TRUE, apply the Force in local coordinates; otherwise, apply the Force in global coordinates.
   * This function only works on physical objects.
   */
  export function ApplyRotationalImpulse(force: Vector, local: boolean): void

  /**
   * Returns the arc-sine, in radians, of Value.
   * @deprecated Use 'math.asin' instead. Double precision; fastcall.
   */
  export function Asin(value: number): number

  /**
   * Returns the arc-tangent2 of y, x.
   * @deprecated Use 'math.atan2' instead. Double precision; fastcall.
   */
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
  export function AvatarOnLinkSitTarget(linkNumber: number): UUID

  /**
   * If an avatar is seated on the sit target, returns the avatar's key, otherwise NULL_KEY.
   * This only will detect avatars sitting on sit targets defined with llSitTarget.
   */
  export function AvatarOnSitTarget(): UUID

  /** Returns the rotation represented by coordinate axes Forward, Left, and Up. */
  export function Axes2Rot(forward: Vector, left: Vector, up: Vector): Quaternion

  /** Returns the rotation that is a generated Angle about Axis. */
  export function AxisAngle2Rot(axis: Vector, angle: number): Quaternion

  /**
   * Returns an integer that is the Text, Base64 decoded as a big endian integer.
   * Returns zero if Text is longer then 8 characters. If Text contains fewer then 6 characters, the return value is unpredictable.
   * @deprecated Use 'llbase64.decode' and 'string.unpack' or 'buffer.readi32' instead.
   */
  export function Base64ToInteger(text: string): number

  /**
   * Converts a Base64 string to a conventional string.
   * If the conversion creates any unprintable characters, they are converted to question marks.
   * @deprecated Use 'llbase64.decode' instead.
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
  export function CastRay<const T extends readonly unknown[]>(
    start: Vector,
    end: Vector,
    options: T & ParseCastRayParams<T>,
  ): list

  /**
   * Returns smallest integer value >= Value.
   * @deprecated Use 'math.ceil' instead. Double precision; fastcall.
   */
  export function Ceil(value: number): number

  /** Returns a single character string that is the representation of the unicode value. */
  export function Char(value: number): string

  /**
   * Resets all camera parameters to default values and turns off scripted camera control.
   * Requires the PERMISSION_CONTROL_CAMERA runtime permission (automatically granted to attached or sat on objects).
   */
  export function ClearCameraParams(): void

  /** @deprecated */
  export function ClearExperience(agentId: UUID, experienceId: UUID): void

  /** @deprecated */
  export function ClearExperiencePermissions(agentId: UUID): void

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

  /**
   * This function is deprecated.
   * @deprecated
   */
  export function CloseRemoteDataChannel(channelId: UUID): void

  /**
   * Returns the cloud density at the object's position + Offset.
   * @deprecated
   */
  export function Cloud(offset: Vector): number

  /** Specify an empty string or NULL_KEY for Accept, to not filter on the corresponding parameter. */
  export function CollisionFilter(objectName: string, objectId: UUID, accept: boolean): void

  /**
   * Suppress default collision sounds, replace default impact sounds with ImpactSound.
   * The ImpactSound must be in the object inventory.
   * Supply an empty string to suppress collision sounds.
   */
  export function CollisionSound(impactSound: string, impactVolume: number): void

  /**
   * Suppress default collision sprites, replace default impact sprite with ImpactSprite; found in the object inventory (empty string to just suppress).
   * @deprecated
   */
  export function CollisionSprite(impactSprite: string): void

  /** Returns hex-encoded Hash string of Message using digest Algorithm. */
  export function ComputeHash(message: string, algorithm: string): string

  /**
   * Returns the cosine of Theta (Theta in radians).
   * @deprecated Use 'math.cos' instead. Double precision; fastcall.
   */
  export function Cos(theta: number): number

  /**
   * Convert link-set to AI/Physics character.
   * Creates a path-finding entity, known as a "character", from the object containing the script. Required to activate use of path-finding functions.
   * Options is a list of key/value pairs.
   */
  export function CreateCharacter<const T extends readonly unknown[]>(
    options: T & ParseCharacterParams<T>,
  ): void

  /** Starts an asychronous transaction to create a key-value pair. Will fail with XP_ERROR_STORAGE_EXCEPTION if the key already exists. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value passed to the function. */
  export function CreateKeyValue(key: string, value: string): UUID

  /**
   * Attempt to link the object the script is in, to target.
   * Requires the PERMISSION_CHANGE_LINKS runtime permission.
   */
  export function CreateLink(targetPrim: UUID, parent: boolean): void

  /** Generates a damage event on the targeted agent or task. */
  export function Damage(target: UUID, damage: number, type: number): void

  /** Starts an asychronous transaction the request the used and total amount of data allocated for the Experience. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the the amount in use and the third item will be the total available. */
  export function DataSizeKeyValue(): UUID

  /**
   * Convert link-set from AI/Physics character to Physics object.
   * Convert the current link-set back to a standard object, removing all path-finding properties.
   */
  export function DeleteCharacter(): void

  /** Starts an asychronous transaction to delete a key-value pair. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value associated with the key. */
  export function DeleteKeyValue(key: string): UUID

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
  export function DerezObject(id: UUID, flags: number): boolean

  /**
   * Remove the object containing the script from the avatar.
   * Requires the PERMISSION_ATTACH runtime permission (automatically granted to attached objects).
   */
  export function DetachFromAvatar(): void

  /**
   * Returns a list containing the current damage for the event, the damage type and the original damage delivered.
   * @indexArg number
   */
  export function DetectedDamage(number: number): DamageDetails

  /**
   * Returns the grab offset of a user touching the object.
   * Returns <0.0, 0.0, 0.0> if Number is not a valid object.
   * @indexArg number
   */
  export function DetectedGrab(number: number): Vector

  /**
   * Returns TRUE if detected object or agent Number has the same user group active as this object.
   * It will return FALSE if the object or agent is in the group, but the group is not active.
   * @indexArg number
   */
  export function DetectedGroup(number: number): boolean

  /**
   * Returns the key of detected object or avatar number.
   * Returns NULL_KEY if Number is not a valid index.
   * @indexArg number
   */
  export function DetectedKey(number: number): UUID

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
  export function DetectedOwner(number: number): UUID

  /**
   * Returns the position of detected object or avatar number.
   * Returns <0.0, 0.0, 0.0> if Number is not a valid index.
   * @indexArg number
   */
  export function DetectedPos(number: number): Vector

  /**
   * Returns the key for the rezzer of the detected object.
   * @indexArg number
   */
  export function DetectedRezzer(number: number): UUID

  /**
   * Returns the rotation of detected object or avatar number.
   * Returns <0.0, 0.0, 0.0, 1.0> if Number is not a valid offset.
   * @indexArg number
   */
  export function DetectedRot(number: number): Quaternion

  /**
   * Returns the surface bi-normal for a triggered touch event.
   * Returns a vector that is the surface bi-normal (tangent to the surface) where the touch event was triggered.
   * @indexArg index
   */
  export function DetectedTouchBinormal(index: number): Vector

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
  export function DetectedTouchNormal(index: number): Vector

  /**
   * Returns the position, in region coordinates, where the object was touched in a triggered touch event.
   * Unless it is a HUD, in which case it returns the position relative to the attach point.
   * @indexArg index
   */
  export function DetectedTouchPos(index: number): Vector

  /**
   * Returns a vector that is the surface coordinates where the prim was touched.
   * The X and Y vector positions contain the horizontal (S) and vertical (T) face coordinates respectively.
   * Each component is in the interval [0.0, 1.0].
   * TOUCH_INVALID_TEXCOORD is returned if the surface coordinates cannot be determined (e.g. when the viewer does not support this function).
   * @indexArg index
   */
  export function DetectedTouchST(index: number): Vector

  /**
   * Returns a vector that is the texture coordinates for where the prim was touched.
   * The X and Y vector positions contain the U and V face coordinates respectively.
   * TOUCH_INVALID_TEXCOORD is returned if the touch UV coordinates cannot be determined (e.g. when the viewer does not support this function).
   * @indexArg index
   */
  export function DetectedTouchUV(index: number): Vector

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
  export function DetectedVel(number: number): Vector

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
  export function Dialog(avatarId: UUID, text: string, buttons: string[], channel: number): void

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
  export function EdgeOfWorld(position: Vector, direction: Vector): boolean

  /**
   * Ejects AvatarID from land that you own.
   * Ejects AvatarID from land that the object owner (group or resident) owns.
   */
  export function EjectFromLand(avatarId: UUID): void

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
  export function Euler2Rot(vector: Vector): Quaternion

  /**
   * Evade a specified target.
   * Characters will (roughly) try to hide from their pursuers if there is a good hiding spot along their fleeing path. Hiding means no direct line of sight from the head of the character (centre of the top of its physics bounding box) to the head of its pursuer and no direct path between the two on the navigation-mesh.
   */
  export function Evade(targetId: UUID, options: list): void

  /**
   * Execute a character command.
   * Send a command to the path system.
   * Currently only supports stopping the current path-finding operation or causing the character to jump.
   */
  export function ExecCharacterCmd(command: number, options: list): void

  /**
   * Returns the positive version of Value.
   * Returns the absolute value of Value.
   * @deprecated Use 'math.abs' instead. Double precision; fastcall.
   */
  export function Fabs(value: number): number

  /** Searches the text of a cached notecard for lines containing the given pattern and returns the number of matches found through a dataserver event. */
  export function FindNotecardTextCount(notecardName: string, pattern: string, options: list): UUID

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
  export function FleeFrom(source: Vector, distance: number, options: list): void

  /**
   * Returns largest integer value <= Value.
   * @deprecated Use 'math.floor' instead. Double precision; fastcall.
   */
  export function Floor(value: number): number

  /**
   * If Enable is TRUE any avatar that sits on this object is forced into mouse-look mode.
   * After calling this function with Enable set to TRUE, any agent sitting down on the prim will be forced into mouse-look.
   * Just like llSitTarget, this changes a permanent property of the prim (not the object) and needs to be reset by calling this function with Enable set to FALSE in order to disable it.
   */
  export function ForceMouselook(enable: boolean): void

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
  export function GenerateKey(): UUID

  /**
   * Returns the acceleration of the object relative to the region's axes.
   * Gets the acceleration of the object.
   */
  export function GetAccel(): Vector

  /**
   * Returns an integer bit-field containing the agent information about id.
   * Returns AGENT_FLYING, AGENT_ATTACHMENTS, AGENT_SCRIPTED, AGENT_SITTING, AGENT_ON_OBJECT, AGENT_MOUSELOOK, AGENT_AWAY, AGENT_BUSY, AGENT_TYPING, AGENT_CROUCHING, AGENT_ALWAYS_RUN, AGENT_WALKING, AGENT_IN_AIR and/or AGENT_FLOATING_VIA_SCRIPTED_ATTACHMENT.
   * Returns information about the given agent ID as a bit-field of agent info constants.
   */
  export function GetAgentInfo(avatarId: UUID): number

  /**
   * Returns the language code of the preferred interface language of the avatar.
   * Returns a string that is the language code of the preferred interface language of the resident.
   */
  export function GetAgentLanguage(avatarId: UUID): string

  /**
   * Requests a list of agents currently in the region, limited by the scope parameter.
   * Returns a list [key UUID-0, key UUID-1, ..., key UUID-n] or [string error_msg] - returns avatar keys for all agents in the region limited to the area(s) specified by scope
   */
  export function GetAgentList(scope: number, options: list): UUID[]

  /**
   * If the avatar is in the same region, returns the size of the bounding box of the requested avatar by id, otherwise returns ZERO_VECTOR.
   * If the agent is in the same region as the object, returns the size of the avatar.
   */
  export function GetAgentSize(avatarId: UUID): Vector

  /**
   * Returns the alpha value of Face.
   * Returns the 'alpha' of the given face. If face is ALL_SIDES the value returned is the mean average of all faces.
   */
  export function GetAlpha(face: number): number

  /**
   * Returns the name of the currently playing locomotion animation for the avatar id.
   * Returns the currently playing animation for the specified avatar ID.
   */
  export function GetAnimation(avatarId: UUID): string

  /**
   * Returns a list of keys of playing animations for an avatar.
   * Returns a list of keys of all playing animations for the specified avatar ID.
   */
  export function GetAnimationList(avatarId: UUID): UUID[]

  /**
   * Returns a string that is the name of the animation that is used for the specified animation state.
   * Requires the PERMISSION_OVERRIDE_ANIMATIONS or PERMISSION_TRIGGER_ANIMATION runtime permission (automatically granted to attached objects).
   */
  export function GetAnimationOverride(animationState: string): string

  /** Returns the object's attachment point, or 0 if not attached. */
  export function GetAttached(): number

  /** Returns a list of keys of all visible (not HUD) attachments on the avatar identified by the ID argument */
  export function GetAttachedList(id: UUID): UUID[]

  /** Retrieves a list of attachments on an avatar. */
  export function GetAttachedListFiltered(agentId: UUID, options: list): UUID[]

  /** Returns the bounding box around the object (including any linked prims) relative to its root prim, as a list in the format [ (vector) min_corner, (vector) max_corner ]. */
  export function GetBoundingBox(id: UUID): Vector[]

  /** Returns the current camera aspect ratio (width / height) of the agent who has granted the scripted object PERMISSION_TRACK_CAMERA permissions. If no permissions have been granted: it returns zero. */
  export function GetCameraAspect(): number

  /** Returns the current camera field of view of the agent who has granted the scripted object PERMISSION_TRACK_CAMERA permissions. If no permissions have been granted: it returns zero. */
  export function GetCameraFOV(): number

  /**
   * Returns the current camera position for the agent the task has permissions for.
   * Returns the position of the camera, of the user that granted the script PERMISSION_TRACK_CAMERA. If no user has granted the permission, it returns ZERO_VECTOR.
   */
  export function GetCameraPos(): Vector

  /** Returns the current camera orientation for the agent the task has permissions for. If no user has granted the PERMISSION_TRACK_CAMERA permission, returns ZERO_ROTATION. */
  export function GetCameraRot(): Quaternion

  /** Returns the prim's centre of mass (unless called from the root prim, where it returns the object's centre of mass). */
  export function GetCenterOfMass(): Vector

  /**
   * Get the closest navigable point to the point provided.
   * The function accepts a point in region-local space (like all the other path-finding methods) and returns either an empty list or a list containing a single vector which is the closest point on the navigation-mesh to the point provided.
   */
  export function GetClosestNavPoint(point: Vector, options: list): Vector[]

  /**
   * Returns the color on Face.
   * Returns the color of Face as a vector of red, green, and blue values between 0 and 1. If face is ALL_SIDES the color returned is the mean average of each channel.
   */
  export function GetColor(face: number): Vector

  /**
   * Returns a key for the creator of the prim.
   * Returns the key of the object's original creator. Similar to llGetOwner.
   */
  export function GetCreator(): UUID

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
  export function GetDisplayName(avatarId: UUID): string

  /** Returns how much energy is in the object as a percentage of maximum. */
  export function GetEnergy(): number

  /** Returns a string with the requested data about the region. */
  export function GetEnv(dataRequest: string): string

  /**
   * Returns a string with the requested data about the region.
   */
  export function GetEnvironment<const T extends readonly EnvironmentParamFlag[]>(
    position: Vector,
    envParams: T,
  ): MapEnvironmentParam<T> | []

  /** Returns a list with the following Experience properties: [Experience Name, Owner ID, Group ID, Experience ID, State, State Message]. State is an integer corresponding to one of the constants XP_ERROR_... and State Message is the string returned by llGetExperienceErrorMessage for that integer. */
  export function GetExperienceDetails(experienceId: UUID): ExperienceDetails

  /** Returns a string describing the error code passed or the string corresponding with XP_ERROR_UNKNOWN_ERROR if the value is not a valid Experience error code. */
  export function GetExperienceErrorMessage(error: number): string

  /** @deprecated */
  export function GetExperienceList(agentId: UUID): UUID[]

  /**
   * Returns the force (if the script is physical).
   * Returns the current force if the script is physical.
   */
  export function GetForce(): Vector

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
  export function GetGeometricCenter(): Vector

  /**
   * Returns the value for header for request_id.
   * Returns a string that is the value of the Header for HTTPRequestID.
   */
  export function GetHTTPHeader(httpRequestId: UUID, header: string): string

  /** Returns the current health of an avatar or object in the region. */
  export function GetHealth(id: UUID): number

  /** Returns the time at which the item was placed into this prim's inventory as a timestamp. */
  export function GetInventoryAcquireTime(inventoryItem: string): string

  /**
   * Returns a key for the creator of the inventory item.
   * This function returns the UUID of the creator of item. If item is not found in inventory, the object says "No item named 'name'".
   */
  export function GetInventoryCreator(inventoryItem: string): UUID

  /** Returns the item description of the item in inventory. If item is not found in inventory, the object says "No item named 'name'" to the debug channel and returns an empty string. */
  export function GetInventoryDesc(inventoryItem: string): string

  /**
   * Returns the key that is the UUID of the inventory named.
   * Returns the key of the inventory named.
   */
  export function GetInventoryKey(inventoryItem: string): UUID

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
  export function GetKey(): UUID

  /**
   * Returns the key of the land owner, returns NULL_KEY if public.
   * Returns the key of the land owner at Position, or NULL_KEY if public.
   */
  export function GetLandOwnerAt(position: Vector): UUID

  /**
   * Returns the key of the linked prim LinkNumber.
   * Returns the key of LinkNumber in the link set.
   */
  export function GetLinkKey(linkNumber: number): UUID

  /**
   * Get the media parameters for a particular face on linked prim, given the desired list of parameter names. Returns a list of values in the order requested.	Returns an empty list if no media exists on the face.
   */
  export function GetLinkMedia<const T extends readonly MediaParamFlag[]>(
    linkNumber: number,
    face: number,
    parameters: T,
  ): MapMediaParam<T> | []

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
  export function GetLinkPrimitiveParams<const T extends readonly unknown[]>(
    linkNumber: number,
    parameters: T & ParsePrimParamGets<T>,
  ): MapPrimParamGet<T> | []

  /** Returns the sit flags set on the specified prim in a linkset. */
  export function GetLinkSitFlags(linkNumber: number): number

  /**
   * Returns the type of the index entry in the list (TYPE_INTEGER, TYPE_FLOAT, TYPE_STRING, TYPE_KEY, TYPE_VECTOR, TYPE_ROTATION, or TYPE_INVALID if index is off list).
   * Returns the type of the variable at Index in ListVariable.
   * @deprecated Use 'typeof' instead.
   * @indexArg index
   */
  export function GetListEntryType(listVariable: list, index: number): number

  /**
   * Returns the number of elements in the list.
   * Returns the number of elements in ListVariable.
   * @deprecated Use '#' or 'rawlen' instead. Metatable support.
   */
  export function GetListLength(listVariable: list): number

  /**
   * Returns the position relative to the root.
   * Returns the local position of a child object relative to the root.
   */
  export function GetLocalPos(): Vector

  /**
   * Returns the rotation local to the root.
   * Returns the local rotation of a child object relative to the root.
   */
  export function GetLocalRot(): Quaternion

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
  export function GetMoonDirection(): Vector

  /** Returns the rotation applied to the moon in the parcel. */
  export function GetMoonRotation(): Quaternion

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
  export function GetNotecardLine(notecardName: string, lineNumber: number): UUID

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
  export function GetNumberOfNotecardLines(notecardName: string): UUID

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
  export function GetObjectDetails<const T extends readonly ObjectDetailFlag[]>(
    id: UUID,
    parameters: T,
  ): MapObjectDetail<T> | []

  /**
   * Returns the key of the linked prim link_no in a linkset.
   * Returns the key of link_no in the link set specified by id.
   */
  export function GetObjectLinkKey(id: UUID, linkNo: number): UUID

  /**
   * Returns the mass of the avatar or object in the region.
   * Gets the mass of the object or avatar corresponding to ID.
   */
  export function GetObjectMass(id: UUID): number

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
  export function GetObjectPrimCount(objectId: UUID): number

  /**
   * Returns the rotation velocity in radians per second.
   * Returns a vector that is the rotation velocity of the object in radians per second.
   */
  export function GetOmega(): Vector

  /**
   * Returns the object owner's UUID.
   * Returns the key for the owner of the object.
   */
  export function GetOwner(): UUID

  /**
   * Returns the owner of ObjectID.
   * Returns the key for the owner of object ObjectID.
   */
  export function GetOwnerKey(objectId: UUID): UUID

  /**
   * Returns a list of parcel details specified in the ParcelDetails list for the parcel at Position.
   * Parameters is one or more of: PARCEL_DETAILS_NAME, _DESC, _OWNER, _GROUP, _AREA, _ID, _SEE_AVATARS.
   * Returns a list that is the parcel details specified in ParcelDetails (in the same order) for the parcel at Position.
   */
  export function GetParcelDetails<const T extends readonly ParcelDetailFlag[]>(
    position: Vector,
    parcelDetails: T,
  ): MapParcelDetail<T> | []

  /**
   * Returns a mask of the parcel flags (PARCEL_FLAG_*) for the parcel that includes the point Position.
   * Returns a bit-field specifying the parcel flags (PARCEL_FLAG_*) for the parcel at Position.
   */
  export function GetParcelFlags(position: Vector): number

  /**
   * Returns the maximum number of prims allowed on the parcel at Position for a given scope.
   * The scope may be set to an individual parcel or the combined resources of all parcels with the same ownership in the region.
   */
  export function GetParcelMaxPrims(position: Vector, simWide: boolean): number

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
  export function GetParcelPrimCount(position: Vector, category: number, simWide: boolean): number

  /**
   * Returns a list of up to 100 residents who own objects on the parcel at Position, with per-owner land impact totals.
   * Requires owner-like permissions for the parcel, and for the script owner to be present in the region.
   * The list is formatted as [ key agentKey1, integer agentLI1, key agentKey2, integer agentLI2, ... ], sorted by agent key.
   * The integers are the combined land impacts of the objects owned by the corresponding agents.
   */
  export function GetParcelPrimOwners(position: Vector): ParcelPrimOwners

  /** Returns an integer bitmask of the permissions that have been granted to the script.  Individual permissions can be determined using a bit-wise "and" operation against the PERMISSION_* constants */
  export function GetPermissions(): number

  /**
   * Returns the key of the avatar that last granted or declined permissions to the script.
   * Returns NULL_KEY if permissions were never granted or declined.
   */
  export function GetPermissionsKey(): UUID

  /** Returns a list of the form [float gravity_multiplier, float restitution, float friction, float density]. */
  export function GetPhysicsMaterial(): PhysicsMaterial

  /**
   * Returns the position of the task in region coordinates.
   * Returns the vector position of the task in region coordinates.
   */
  export function GetPos(): Vector

  /**
   * Returns the media parameters for a particular face on an object, given the desired list of parameter names, in the order requested. Returns an empty list if no media exists on the face.
   */
  export function GetPrimMediaParams<const T extends readonly MediaParamFlag[]>(
    face: number,
    parameters: T,
  ): MapMediaParam<T> | []

  /**
   * Returns the primitive parameters specified in the parameters list.
   * Returns primitive parameters specified in the Parameters list.
   */
  export function GetPrimitiveParams<const T extends readonly unknown[]>(
    parameters: T & ParsePrimParamGets<T>,
  ): MapPrimParamGet<T> | []

  /**
   * Returns the number of avatars in the region.
   * Returns an integer that is the number of avatars in the region.
   */
  export function GetRegionAgentCount(): number

  /**
   * Returns a vector, in meters, that is the global location of the south-west corner of the region which the object is in.
   * Returns the Region-Corner of the simulator containing the task. The region-corner is a vector (values in meters) representing distance from the first region.
   */
  export function GetRegionCorner(): Vector

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
  export function GetRegionMoonDirection(): Vector

  /** Returns the rotation applied to the moon in the region. */
  export function GetRegionMoonRotation(): Quaternion

  /** Returns the current region name. */
  export function GetRegionName(): string

  /**
   * Returns a normalized vector of the direction of the sun in the region.
   * Returns the sun's direction on the simulator.
   */
  export function GetRegionSunDirection(): Vector

  /** Returns the rotation applied to the sun in the region. */
  export function GetRegionSunRotation(): Quaternion

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
  export function GetRootPosition(): Vector

  /**
   * Returns the rotation (relative to the region) of the root prim of the object which the script is attached to.
   * Gets the global rotation of the root object of the object script is attached to.
   */
  export function GetRootRotation(): Quaternion

  /**
   * Returns the rotation relative to the region's axes.
   * Returns the rotation.
   */
  export function GetRot(): Quaternion

  /**
   * Returns the maximum used memory for the current script. Only valid after using PROFILE_SCRIPT_MEMORY. Non-mono scripts always use 16k.
   * Returns the integer of the most bytes used while llScriptProfiler was last active.
   */
  export function GetSPMaxMemory(): number

  /**
   * Returns the scale of the prim.
   * Returns a vector that is the scale (dimensions) of the prim.
   */
  export function GetScale(): Vector

  /**
   * Returns the name of the script that this function is used in.
   * Returns the name of this script.
   */
  export function GetScriptName(): string

  /**
   * Returns TRUE if the script named is running.
   * Returns TRUE if ScriptName is running.
   */
  export function GetScriptState(scriptName: string): boolean

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

  export function GetStaticPath(start: Vector, end: Vector, radius: number, parameters: list): list

  /** Returns boolean value of the specified status (e.g. STATUS_PHANTOM) of the object the script is attached to. */
  export function GetStatus(statusFlag: number): boolean

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
  export function GetSunDirection(): Vector

  /** Returns the rotation applied to the sun in the parcel. */
  export function GetSunRotation(): Quaternion

  /**
   * Returns a string that is the texture on face (the inventory name if it is a texture in the prim's inventory, otherwise the key).
   * Returns the texture of a face, if it is found in object inventory, its key otherwise.
   */
  export function GetTexture(face: number): string

  /** Returns the texture offset of face in the x and y components of a vector. */
  export function GetTextureOffset(face: number): Vector

  /** Returns the texture rotation of side. */
  export function GetTextureRot(face: number): number

  /**
   * Returns the texture scale of side in the x and y components of a vector.
   * Returns the texture scale of a side in the x and y components of a vector.
   */
  export function GetTextureScale(face: number): Vector

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
  export function GetTorque(): Vector

  /** Returns the number of seconds elapsed since 00:00 hours, Jan 1, 1970 UTC from the system clock. */
  export function GetUnixTime(): number

  /**
   * Returns the current used memory for the current script. Non-mono scripts always use 16K.
   * Returns the integer of the number of bytes of memory currently in use by the script. Non-mono scripts always use 16K.
   */
  export function GetUsedMemory(): number

  /** Returns the username of an avatar, if the avatar is connected to the current region, or if the name has been cached.  Otherwise, returns an empty string. Use llRequestUsername if the avatar may be absent from the region. */
  export function GetUsername(avatarId: UUID): string

  /**
   * Returns the velocity of the object.
   * Returns a vector that is the velocity of the object.
   */
  export function GetVel(): Vector

  /** Returns a list of the current value for each requested visual parameter. */
  export function GetVisualParams(id: UUID, parameters: (number | string)[]): (number | "")[]

  /**
   * Returns the time in seconds since midnight California Pacific time (PST/PDT).
   * Returns the time in seconds since simulator's time-zone midnight (Pacific Time).
   */
  export function GetWallclock(): number

  /** Give InventoryItems to the specified agent as a new folder of items, as permitted by the permissions system. The target must be an agent. */
  export function GiveAgentInventory(
    agentId: UUID,
    folderName: string,
    inventoryItems: string[],
    options: list,
  ): number

  /**
   * Give InventoryItem to destination represented by TargetID, as permitted by the permissions system.
   * TargetID may be any agent or an object in the same region.
   */
  export function GiveInventory(targetId: UUID, inventoryItem: string): void

  /**
   * Give InventoryItems to destination (represented by TargetID) as a new folder of items, as permitted by the permissions system.
   * TargetID may be any agent or an object in the same region. If TargetID is an object, the items are passed directly to the object inventory (no folder is created).
   */
  export function GiveInventoryList(
    targetId: UUID,
    folderName: string,
    inventoryItems: string[],
  ): void

  /**
   * Transfers Amount of L$ from script owner to AvatarID.
   * This call will silently fail if PERMISSION_DEBIT has not been granted.
   */
  export function GiveMoney(avatarId: UUID, amount: number): number

  /** Rez directly off of a UUID if owner has god-bit set. */
  export function GodLikeRezObject(inventoryItemId: UUID, position: Vector): void

  /**
   * Returns the ground height at the object position + offset.
   * Returns the ground height at the object's position + Offset.
   */
  export function Ground(offset: Vector): number

  /**
   * Returns the ground contour direction below the object position + Offset.
   * Returns the ground contour at the object's position + Offset.
   */
  export function GroundContour(offset: Vector): Vector

  /**
   * Returns the ground normal below the object position + offset.
   * Returns the ground contour at the object's position + Offset.
   */
  export function GroundNormal(offset: Vector): Vector

  /**
   * Critically damps to height if within height * 0.5 of level (either above ground level or above the higher of land and water if water == TRUE).
   * Critically damps to fHeight if within fHeight * 0.5 of ground or water level.
   * The height is above ground level if iWater is FALSE or above the higher of land and water if iWater is TRUE.
   * Do not use with vehicles. Only works in physics-enabled objects.
   */
  export function GroundRepel(height: number, water: boolean, tau: number): void

  /**
   * Returns the ground slope below the object position + Offset.
   * Returns the ground slope at the object position + Offset.
   */
  export function GroundSlope(offset: Vector): Vector

  /** Returns the base64-encoded hashed message authentication code (HMAC), of Message using PEM-formatted Key and digest Algorithm (md5, sha1, sha224, sha256, sha384, sha512). */
  export function HMAC(key: string, message: string, algorithm: string): string

  /**
   * Sends an HTTP request to the specified URL with the Body of the request and Parameters.
   * Returns a key that is a handle identifying the HTTP request made.
   */
  export function HTTPRequest<const T extends readonly unknown[]>(
    url: string,
    parameters: T & ParseHttpParams<T>,
    body: string,
  ): UUID

  /** Responds to an incoming HTTP request which was triggerd by an http_request event within the script. HTTPRequestID specifies the request to respond to (this ID is supplied in the http_request event handler).  Status and Body specify the status code and message to respond with. */
  export function HTTPResponse(httpRequestId: UUID, status: number, body: string): void

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
  export function InstantMessage(avatarId: UUID, text: string): void

  /**
   * Returns a string that is a Base64 big endian encode of Value.
   * Encodes the Value as an 8-character Base64 string.
   */
  export function IntegerToBase64(value: number): string

  /** Returns TRUE if avatar ID is a friend of the script owner. */
  export function IsFriend(agentId: UUID): boolean

  /** Checks the face for a PBR render material. */
  export function IsLinkGLTFMaterial(link: number, face: number): boolean

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
  export function Key2Name(id: UUID): string

  /** Starts an asychronous transaction the request the number of keys in the data store. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will the the number of keys in the system. */
  export function KeyCountKeyValue(): UUID

  /**
   * Starts an asychronous transaction the request a number of keys from the data store. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. The error XP_ERROR_KEY_NOT_FOUND is returned if First is greater than or equal to the number of keys in the data store. In the success case the subsequent items will be the keys requested. The number of keys returned may be less than requested if the return value is too large or if there is not enough keys remaining. The order keys are returned is not guaranteed but is stable between subsequent calls as long as no keys are added or removed. Because the keys are returned in a comma-delimited list it is not recommended to use commas in key names if this function is used.
   * @indexArg first
   */
  export function KeysKeyValue(first: number, count: number): UUID

  /** Converts a color from the linear colorspace to sRGB. */
  export function Linear2sRGB(color: Vector): Vector

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
  export function LinkParticleSystem<const T extends readonly unknown[]>(
    linkNumber: number,
    rules: T & ParseParticleSystemParams<T>,
  ): void

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
  export function LinkSetSoundQueueing(linkNumber: number, queueEnable: boolean): void

  /** Limits radius for audibility of scripted sounds (both attached and triggered) to distance Radius around the link. */
  export function LinkSetSoundRadius(linkNumber: number, radius: number): void

  /**
   * Set the sit location for the linked prim(s). If Offset == <0,0,0> clear it.
   * Set the sit location for the linked prim(s). The sit location is relative to the prim's position and rotation.
   */
  export function LinkSitTarget(linkNumber: number, offset: Vector, rotation: Quaternion): void

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
   * @deprecated Use '[]' and 'tonumber' instead.
   * @indexArg index
   */
  export function List2Float(listVariable: list, index: number): number

  /**
   * Copies the integer at Index in the list.
   * Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to an integer, then zero is returned.
   * @deprecated Use '[]', 'tonumber', and 'math.modf' instead.
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
   * @deprecated Use '[]' and 'touuid' instead.
   * @indexArg index
   */
  export function List2Key(listVariable: list, index: number): UUID

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
   * @deprecated Use '[]' instead.
   * @indexArg index
   */
  export function List2Rot(listVariable: list, index: number): Quaternion

  /**
   * Copies the string at Index in the list.
   * Returns the value at Index in the specified list as a string. If Index describes a location not in the list then null string is returned.
   * @deprecated Use '[]' and 'tostring' instead.
   * @indexArg index
   */
  export function List2String(listVariable: list, index: number): string

  /**
   * Copies the vector at Index in the list.
   * Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to a vector, then ZERO_VECTOR is returned.
   * @deprecated Use '[]' instead.
   * @indexArg index
   */
  export function List2Vector(listVariable: list, index: number): Vector

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
  export function ListSort(listVariable: T[], stride: number, ascending: boolean): T[]

  /**
   * Returns the specified list, sorted by the specified element into blocks of stride in ascending order (if Ascending is TRUE, otherwise descending). Note that sort only works if the first entry of each block is the same datatype.
   * @indexArg sortkey
   */
  export function ListSortStrided(
    listVariable: T[],
    stride: number,
    sortkey: number,
    ascending: boolean,
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
    speakersId: UUID,
    text: string,
  ): number

  /**
   * Makes a listen event callback active or inactive. Pass in the value returned from llListen to the iChannelHandle parameter to specify which listener you are controlling.
   * Use boolean values to specify Active
   */
  export function ListenControl(channelHandle: number, active: boolean): void

  /** Removes a listen event callback. Pass in the value returned from llListen to the iChannelHandle parameter to specify which listener to remove. */
  export function ListenRemove(channelHandle: number): void

  /**
   * Shows dialog to avatar AvatarID offering to load web page at URL.	If user clicks yes, launches their web browser.
   * llLoadURL displays a dialogue box to the user, offering to load the specified web page using the default web browser.
   */
  export function LoadURL(avatarId: UUID, text: string, url: string): void

  /**
   * Returns the natural logarithm of Value. Returns zero if Value <= 0.
   * Returns the base e (natural) logarithm of the specified Value.
   * @deprecated Use 'math.log' instead. It's a fastcall.
   */
  export function Log(value: number): number

  /**
   * Returns the base 10 logarithm of Value. Returns zero if Value <= 0.
   * Returns the base 10 (common) logarithm of the specified Value.
   * @deprecated Use 'math.log10' instead. It's a fastcall.
   */
  export function Log10(value: number): number

  /**
   * Cause object name to point its forward axis towards Target, at a force controlled by Strength and Damping.
   * Good Strength values are around half the mass of the object and good Damping values are less than 1/10th of the Strength.
   * Asymmetrical shapes require smaller Damping. A Strength of 0.0 cancels the look at.
   */
  export function LookAt(target: Vector, strength: number, damping: number): void

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
   * @deprecated Use 'll.ParticleSystem' instead.
   */
  export function MakeExplosion(
    particles: number,
    scale: number,
    velocity: number,
    lifetime: number,
    arc: number,
    texture: string,
    offset: Vector,
  ): void

  /**
   * Make fire like particles. Deprecated: Use llParticleSystem instead.
   * Make fire particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
   * @deprecated Use 'll.ParticleSystem' instead.
   */
  export function MakeFire(
    particles: number,
    scale: number,
    velocity: number,
    lifetime: number,
    arc: number,
    texture: string,
    offset: Vector,
  ): void

  /**
   * Make a fountain of particles. Deprecated: Use llParticleSystem instead.
   * Make a fountain of particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
   * @deprecated Use 'll.ParticleSystem' instead.
   */
  export function MakeFountain(
    particles: number,
    scale: number,
    velocity: number,
    lifetime: number,
    arc: number,
    bounce: number,
    texture: string,
    offset: Vector,
    bounceOffset: number,
  ): void

  /**
   * Make smoke like particles. Deprecated: Use llParticleSystem instead.
   * Make smoky particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
   * @deprecated Use 'll.ParticleSystem' instead.
   */
  export function MakeSmoke(
    particles: number,
    scale: number,
    velocity: number,
    lifetime: number,
    arc: number,
    texture: string,
    offset: Vector,
  ): void

  /**
   * Adds or removes agents from the estate's agent access or ban lists, or groups to the estate's group access list. Action is one of the ESTATE_ACCESS_ALLOWED_* operations to perform.
   * Returns an integer representing a boolean, TRUE if the call was successful; FALSE if throttled, invalid action, invalid or null id or object owner is not allowed to manage the estate.
   * The object owner is notified of any changes, unless PERMISSION_SILENT_ESTATE_MANAGEMENT has been granted to the script.
   */
  export function ManageEstateAccess(action: number, avatarId: UUID): boolean

  /** Displays an in world beacon and optionally opens world map for avatar who touched the object or is wearing the script, centered on RegionName with Position highlighted. Only works for scripts attached to avatar, or during touch events. */
  export function MapBeacon(regionName: string, position: Vector, options: list): void

  /**
   * Opens world map for avatar who touched it or is wearing the script, centred on RegionName with Position highlighted. Only works for scripts attached to avatar, or during touch events.
   * Direction currently has no effect.
   */
  export function MapDestination(regionName: string, position: Vector, direction: Vector): void

  /**
   * Sends Number, Text, and ID to members of the link set identified by LinkNumber.
   * LinkNumber is either a linked number (available through llGetLinkNumber) or a LINK_* constant.
   */
  export function MessageLinked(
    linkNumber: number,
    number: number,
    text: string | UUID,
    id: string | UUID,
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
  export function MoveToTarget(target: Vector, tau: number): void

  /** Look up Agent ID for the named agent in the region. */
  export function Name2Key(name: string): UUID

  /**
   * Navigate to destination.
   * Directs an object to travel to a defined position in the region or adjacent regions.
   */
  export function NavigateTo(location: Vector, options: list): void

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

  /**
   * This function is deprecated.
   * @deprecated
   */
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
  export function OverMyLand(id: UUID): boolean

  /**
   * says Text to owner only (if owner is in region).
   * Says Text to the owner of the object running the script, if the owner has been within the object's simulator since logging into Second Life, regardless of where they may be in-world.
   * @deprecated Use 'print' instead.
   */
  export function OwnerSay(text: string): void

  /** Controls the playback of multimedia resources on a parcel or for an agent, via one or more PARCEL_MEDIA_COMMAND_* arguments specified in CommandList. */
  export function ParcelMediaCommandList(commandList: list): void

  /**
   * Queries the media properties of the parcel containing the script, via one or more PARCEL_MEDIA_COMMAND_* arguments specified in CommandList.
   * This function will only work if the script is contained within an object owned by the land-owner (or if the land is owned by a group, only if the object has been deeded to the group).
   */
  export function ParcelMediaQuery<const T extends readonly ParcelMediaQueryFlag[]>(
    queryList: T,
  ): MapParcelMediaQuery<T> | []

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
  export function ParticleSystem<const T extends readonly unknown[]>(
    parameters: T & ParseParticleSystemParams<T>,
  ): void

  /**
   * Configures how collision events are passed to scripts in the linkset.
   * If Pass == TRUE, collisions involving collision-handling scripted child prims are also passed on to the root prim. If Pass == FALSE (default behavior), such collisions will only trigger events in the affected child prim.
   */
  export function PassCollisions(pass: boolean): void

  /**
   * Configures how touch events are passed to scripts in the linkset.
   * If Pass == TRUE, touches involving touch-handling scripted child prims are also passed on to the root prim. If Pass == FALSE (default behavior), such touches will only trigger events in the affected child prim.
   */
  export function PassTouches(pass: boolean): void

  /**
   * Patrol a list of points.
   * Sets the points for a character (llCreateCharacter) to patrol along.
   */
  export function PatrolPoints(points: Vector[], options: list): void

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

  /** @deprecated */
  export function PointAt(point: Vector): void

  /**
   * Returns the Value raised to the power Exponent, or returns 0 and triggers Math Error for imaginary results.
   * Returns the Value raised to the Exponent.
   * @deprecated Use '^' instead. It's a fastcall.
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
  export function Pursue(targetId: UUID, options: list): void

  /**
   * Applies Impulse and AngularImpulse to ObjectID.
   * Applies the supplied impulse and angular impulse to the object specified.
   */
  export function PushObject(
    objectId: UUID,
    impulse: Vector,
    angularImpulse: Vector,
    local: boolean,
  ): void

  /** Starts an asychronous transaction to retrieve the value associated with the key given. Will fail with XP_ERROR_KEY_NOT_FOUND if the key does not exist. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value associated with the key. */
  export function ReadKeyValue(key: string): UUID

  /**
   * Reloads the web page shown on the sides of the object.
   * @deprecated Use 'll.SetPrimMediaParams' instead.
   */
  export function RefreshPrimURL(): void

  /** Broadcasts Text to entire region on Channel (except for channel 0). */
  export function RegionSay(channel: number, text: string): void

  /**
   * Says Text, on Channel, to avatar or object indicated by TargetID (if within region).
   * If TargetID is an avatar and Channel is nonzero, Text can be heard by any attachment on the avatar.
   */
  export function RegionSayTo(targetId: UUID, channel: number, text: string): void

  /**
   * Return camera to agent.
   * Deprecated: Use llClearCameraParams instead.
   * @deprecated Use 'll.ClearCameraParams' instead.
   */
  export function ReleaseCamera(avatarId: UUID): void

  /**
   * Stop taking inputs.
   * Stop taking inputs from the avatar.
   */
  export function ReleaseControls(): void

  /** Releases the specified URL, which was previously obtained using llRequestURL.  Once released, the URL will no longer be usable. */
  export function ReleaseURL(url: string): void

  /**
   * This function is deprecated.
   * @deprecated
   */
  export function RemoteDataReply(
    channelId: UUID,
    messageId: UUID,
    sData: string,
    iData: number,
  ): void

  /**
   * This function is deprecated.
   * @deprecated
   */
  export function RemoteDataSetRegion(): void

  /** @deprecated */
  export function RemoteLoadScript(
    target: UUID,
    scriptName: string,
    unknown1: number,
    unknown2: number,
  ): void

  /** If the owner of the object containing this script can modify the object identified by the specified object key, and if the PIN matches the PIN previously set using llSetRemoteScriptAccessPin (on the target prim), then the script will be copied into target. Running is a boolean specifying whether the script should be enabled once copied into the target object. */
  export function RemoteLoadScriptPin(
    objectId: UUID,
    scriptName: string,
    pin: number,
    running: boolean,
    startParameter: number,
  ): void

  /**
   * Remove avatar from the land ban list.
   * Remove specified avatar from the land parcel ban list.
   */
  export function RemoveFromLandBanList(avatarId: UUID): void

  /**
   * Remove avatar from the land pass list.
   * Remove specified avatar from the land parcel pass list.
   */
  export function RemoveFromLandPassList(avatarId: UUID): void

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
    agentId: UUID,
    transition: number,
    environment: string,
  ): number

  /** Replaces the environment for a parcel or region. */
  export function ReplaceEnvironment(
    position: Vector,
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
  export function RequestAgentData(avatarId: UUID, data: number): UUID

  /**
   * Requests the display name of the agent. When the display name is available the dataserver event will be raised.
   * The avatar identified does not need to be in the same region or online at the time of the request.
   * Returns a key that is used to identify the dataserver event when it is raised.
   */
  export function RequestDisplayName(avatarId: UUID): UUID

  /** Ask the agent for permission to participate in an experience. This request is similar to llRequestPermissions with the following permissions: PERMISSION_TAKE_CONTROLS, PERMISSION_TRIGGER_ANIMATION, PERMISSION_ATTACH, PERMISSION_TRACK_CAMERA, PERMISSION_CONTROL_CAMERA and PERMISSION_TELEPORT. However, unlike llRequestPermissions the decision to allow or block the request is persistent and applies to all scripts using the experience grid wide. Subsequent calls to llRequestExperiencePermissions from scripts in the experience will receive the same response automatically with no user interaction. One of experience_permissions or experience_permissions_denied will be generated in response to this call. Outstanding permission requests will be lost if the script is derezzed, moved to another region or reset. */
  export function RequestExperiencePermissions(agentId: UUID, unused: string): void

  /**
   * Requests data for the named InventoryItem.
   * When data is available, the dataserver event will be raised with the key returned from this function in the requested parameter.
   * The only request currently implemented is to request data from landmarks, where the data returned is in the form "<float, float, float>" which can be cast to a vector. This position is in region local coordinates.
   */
  export function RequestInventoryData(inventoryItem: string): UUID

  /**
   * Ask AvatarID to allow the script to perform certain actions, specified in the PermissionMask bitmask. PermissionMask should be one or more PERMISSION_* constants. Multiple permissions can be requested simultaneously by ORing the constants together. Many of the permissions requests can only go to object owner.
   * This call will not stop script execution. If the avatar grants the requested permissions, the run_time_permissions event will be called.
   */
  export function RequestPermissions(avatarId: UUID, permissionMask: number): void

  /**
   * Requests one HTTPS:// (SSL) URL for use by this object. The http_request event is triggered with results.
   * Returns a key that is the handle used for identifying the request in the http_request event.
   */
  export function RequestSecureURL(): UUID

  /**
   * Requests the specified Data about RegionName. When the specified data is available, the dataserver event is raised.
   * Data should use one of the DATA_SIM_* constants.
   * Returns a dataserver query ID and triggers the dataserver event when data is found.
   */
  export function RequestSimulatorData(regionName: string, data: number): UUID

  /**
   * Requests one HTTP:// URL for use by this script. The http_request event is triggered with the result of the request.
   * Returns a key that is the handle used for identifying the result in the http_request event.
   */
  export function RequestURL(): UUID

  /** Look up Agent ID for the named agent using a historical name. */
  export function RequestUserKey(name: string): UUID

  /**
   * Requests single-word user-name of an avatar. When data is available the dataserver event will be raised.
   * Requests the user-name of the identified agent. When the user-name is available the dataserver event is raised.
   * The agent identified does not need to be in the same region or online at the time of the request.
   * Returns a key that is used to identify the dataserver event when it is raised.
   */
  export function RequestUsername(avatarId: UUID): UUID

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
  export function ReturnObjectsByID(objectIDs: UUID[]): number

  /**
   * Return objects based upon their owner and a scope of parcel, parcel owner, or region.
   * Requires the PERMISSION_RETURN_OBJECTS permission and that the script owner owns the parcel the returned objects are in, or is an estate manager or region owner.
   */
  export function ReturnObjectsByOwner(id: UUID, scope: number): number

  /**
   * Instantiate owner's InventoryItem at Position with Velocity, Rotation and with StartParameter. The last selected root object's location will be set to Position.
   * Creates object's inventory item at the given Position, with Velocity, Rotation, and StartParameter.
   */
  export function RezAtRoot(
    inventoryItem: string,
    position: Vector,
    velocity: Vector,
    rotation: Quaternion,
    startParameter: number,
  ): void

  /**
   * Instantiate owners InventoryItem at Position with Velocity, Rotation and with start StartParameter.
   * Creates object's inventory item at Position with Velocity and Rotation supplied. The StartParameter value will be available to the newly created object in the on_rez event or through the llGetStartParameter function.
   * The Velocity parameter is ignored if the rezzed object is not physical.
   */
  export function RezObject(
    inventoryItem: string,
    position: Vector,
    velocity: Vector,
    rotation: Quaternion,
    startParameter: number,
  ): void

  /**
   * Instantiate owner's InventoryItem with the given parameters.
   */
  export function RezObjectWithParams<const T extends readonly unknown[]>(
    inventoryItem: string,
    params: T & ParseRezParams<T>,
  ): UUID

  /**
   * Returns the rotation angle represented by Rotation.
   * Returns the angle represented by the Rotation.
   */
  export function Rot2Angle(rotation: Quaternion): number

  /**
   * Returns the rotation axis represented by Rotation.
   * Returns the axis represented by the Rotation.
   */
  export function Rot2Axis(rotation: Quaternion): Vector

  /**
   * Returns the Euler representation (roll, pitch, yaw) of Rotation.
   * Returns the Euler Angle representation of the Rotation.
   */
  export function Rot2Euler(rotation: Quaternion): Vector

  /**
   * Returns the forward vector defined by Rotation.
   * Returns the forward axis represented by the Rotation.
   */
  export function Rot2Fwd(rotation: Quaternion): Vector

  /**
   * Returns the left vector defined by Rotation.
   * Returns the left axis represented by the Rotation.
   */
  export function Rot2Left(rotation: Quaternion): Vector

  /**
   * Returns the up vector defined by Rotation.
   * Returns the up axis represented by the Rotation.
   */
  export function Rot2Up(rotation: Quaternion): Vector

  /**
   * Returns the rotation to rotate Vector1 to Vector2.
   * Returns the rotation needed to rotate Vector1 to Vector2.
   */
  export function RotBetween(vector1: Vector, vector2: Vector): Quaternion

  /**
   * Cause object to rotate to Rotation, with a force function defined by Strength and Damping parameters. Good strength values are around half the mass of the object and good damping values are less than 1/10th of the strength.
   * Asymmetrical shapes require smaller damping.
   * A strength of 0.0 cancels the look at.
   */
  export function RotLookAt(rotation: Quaternion, strength: number, damping: number): void

  /**
   * Set rotations with error of LeeWay radians as a rotational target, and return an ID for the rotational target.
   * The returned number is a handle that can be used in at_rot_target and llRotTargetRemove.
   */
  export function RotTarget(rotation: Quaternion, leeWay: number): number

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
   * @deprecated Use 'math.round' instead. It's a fastcall.
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
  export function SameGroup(id: UUID): boolean

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
  export function ScaleByFactor(scalingFactor: number): boolean

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
  export function ScriptDanger(position: Vector): boolean

  /**
   * Enables or disables script profiling options. Currently only supports PROFILE_SCRIPT_MEMORY (Mono only) and PROFILE_NONE.
   * May significantly reduce script performance.
   */
  export function ScriptProfiler(state: number): void

  /**
   * This function is deprecated.
   * @deprecated
   */
  export function SendRemoteData(
    channelId: UUID,
    destination: string,
    value: number,
    text: string,
  ): UUID

  /**
   * Performs a single scan for Name and ID with Type (AGENT, ACTIVE, PASSIVE, and/or SCRIPTED) within Range meters and Arc radians of forward vector.
   * Specifying a blank Name, 0 Type, or NULL_KEY ID will prevent filtering results based on that parameter. A range of 0.0 does not perform a scan.
   * Results are returned in the sensor and no_sensor events.
   */
  export function Sensor(name: string, id: UUID, type: number, range: number, arc: number): void

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
    id: UUID,
    type: number,
    range: number,
    arc: number,
    rate: number,
  ): void

  /** Sets an agent's environmental values to the specified values. Must be used as part of an experience. */
  export function SetAgentEnvironment(agentId: UUID, transition: number, settings: list): number

  /** Sets the avatar rotation to the given value. */
  export function SetAgentRot(rot: Quaternion, flags: number): void

  /**
   * Sets the alpha (opacity) of Face.
   * Sets the alpha (opacity) value for Face. If Face is ALL_SIDES, sets the alpha for all faces. The alpha value is interpreted as an opacity percentage (1.0 is fully opaque, and 0.2 is mostly transparent). This function will clamp alpha values less than 0.1 to 0.1 and greater than 1.0 to 1.
   */
  export function SetAlpha(opacity: number, face: number): void

  /**
   * Sets an object's angular velocity to AngVel, in local coordinates if Local == TRUE (if the script is physical).
   * Has no effect on non-physical objects.
   */
  export function SetAngularVelocity(angVel: Vector, local: boolean): void

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
  export function SetCameraAtOffset(offset: Vector): void

  /** Sets the camera eye offset used in this object if an avatar sits on it. */
  export function SetCameraEyeOffset(offset: Vector): void

  /**
   * Sets multiple camera parameters at once. List format is [ rule-1, data-1, rule-2, data-2 . . . rule-n, data-n ].
   * Requires the PERMISSION_CONTROL_CAMERA runtime permission (automatically granted to attached or sat on objects).
   */
  export function SetCameraParams<const T extends readonly unknown[]>(
    parameters: T & ParseCameraParams<T>,
  ): void

  /** Sets the action performed when a prim is clicked upon. */
  export function SetClickAction(action: number): void

  /**
   * Sets the color, for the face.
   * Sets the color of the side specified. If Face is ALL_SIDES, sets the color on all faces.
   */
  export function SetColor(color: Vector, face: number): void

  /**
   * Set the media type of an LSL HTTP server response to ContentType.
   * HTTPRequestID must be a valid http_request ID. ContentType must be one of the CONTENT_TYPE_* constants.
   */
  export function SetContentType(httpRequestId: UUID, contentType: number): void

  /**
   * Sets the amount of damage that will be done to an avatar that this task hits.	Task will be killed.
   * Sets the amount of damage that will be done to an avatar that this object hits. This object will be destroyed on damaging an avatar, and no collision event is triggered.
   */
  export function SetDamage(damage: number): void

  /** Returns a string with the requested data about the region. */
  export function SetEnvironment(position: Vector, envParams: list): number

  /** @deprecated */
  export function SetExperienceKey(experienceId: UUID): number

  /**
   * Sets Force on object, in object-local coordinates if Local == TRUE (otherwise, the region reference frame is used).
   * Only works on physical objects.
   */
  export function SetForce(force: Vector, local: boolean): void

  /**
   * Sets the Force and Torque of object, in object-local coordinates if Local == TRUE (otherwise, the region reference frame is used).
   * Only works on physical objects.
   */
  export function SetForceAndTorque(force: Vector, torque: Vector, local: boolean): void

  /** Changes terrain texture properties in the region. */
  export function SetGroundTexture(changes: list): number

  /**
   * Critically damps a physical object to a Height (either above ground level or above the higher of land and water if water == TRUE).
   * Do not use with vehicles. Use llStopHover to stop hovering.
   */
  export function SetHoverHeight(height: number, water: boolean, tau: number): void

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
  export function SetLinkCamera(linkNumber: number, eyeOffset: Vector, lookOffset: Vector): void

  /**
   * If a task exists in the link chain at LinkNumber, set the Face to color.
   * Sets the color of the linked child's side, specified by LinkNumber.
   */
  export function SetLinkColor(linkNumber: number, color: Vector, face: number): void

  /**
   * Sets or changes GLTF Overrides set on the selected faces.
   */
  export function SetLinkGLTFOverrides<const T extends readonly unknown[]>(
    link: number,
    face: number,
    options: T & ParseGltfOverrideParams<T>,
  ): void

  /**
   * Set the media parameters for a particular face on linked prim, specified by Link. Returns an integer that is a STATUS_* flag which details the success/failure of the operation(s).
   * MediaParameters is a set of name/value pairs in no particular order. Parameters not specified are unchanged, or if new media is added then set to the default specified.
   */
  export function SetLinkMedia(link: number, face: number, parameters: list): number

  /**
   * Deprecated: Use llSetLinkPrimitiveParamsFast instead.
   * @deprecated Use 'll.SetLinkPrimitiveParamsFast' instead.
   */
  export function SetLinkPrimitiveParams<const T extends readonly unknown[]>(
    linkNumber: number,
    parameters: T & ParsePrimParams<T>,
  ): void

  /**
   * Set primitive parameters for LinkNumber based on Parameters, without a delay.
   * Set parameters for link number, from the list of Parameters, with no built-in script sleep. This function is identical to llSetLinkPrimitiveParams, except without the delay.
   */
  export function SetLinkPrimitiveParamsFast<const T extends readonly unknown[]>(
    linkNumber: number,
    parameters: T & ParsePrimParams<T>,
  ): void

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
  export function SetLocalRot(rotation: Quaternion): void

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
  export function SetParcelForSale(forSale: boolean, options: list): number

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
  export function SetPos(position: Vector): void

  /**
   * Sets the MediaParameters for a particular Face on the prim. Returns an integer that is a STATUS_* flag which details the success/failure of the operation(s).
   * MediaParameters is a set of name/value pairs in no particular order. Parameters not specified are unchanged, or if new media is added then set to the default specified.
   */
  export function SetPrimMediaParams(face: number, mediaParameters: list): number

  /**
   * Deprecated: Use llSetPrimMediaParams instead.
   * @deprecated Use 'll.SetPrimMediaParams' instead.
   */
  export function SetPrimURL(url: string): void

  /**
   * Deprecated: Use llSetLinkPrimitiveParamsFast instead.
   * @deprecated Use 'll.SetLinkPrimitiveParamsFast' instead.
   */
  export function SetPrimitiveParams<const T extends readonly unknown[]>(
    parameters: T & ParsePrimParams<T>,
  ): void

  /**
   * Attempts to move the object so that the root prim is within 0.1m of Position.
   * Returns an integer boolean, TRUE if the object is successfully placed within 0.1 m of Position, FALSE otherwise.
   * Position may be any location within the region or up to 10m across a region border.
   * If the position is below ground, it will be set to the ground level at that x,y location.
   */
  export function SetRegionPos(position: Vector): boolean

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
  export function SetRot(rotation: Quaternion): void

  /** Sets the prim's scale (size) to Scale. */
  export function SetScale(scale: Vector): void

  /** Enable or disable the script Running state of Script in the prim. */
  export function SetScriptState(scriptName: string, running: boolean): void

  /** Displays Text rather than 'Sit' in the viewer's context menu. */
  export function SetSitText(text: string): void

  /**
   * Sets whether successive calls to llPlaySound, llLoopSound, etc., (attached sounds) interrupt the currently playing sound.
   * The default for objects is FALSE. Setting this value to TRUE will make the sound wait until the current playing sound reaches its end. The queue is one level deep.
   */
  export function SetSoundQueueing(queueEnable: boolean): void

  /** Limits radius for audibility of scripted sounds (both attached and triggered) to distance Radius. */
  export function SetSoundRadius(radius: number): void

  /**
   * Sets object status specified in Status bitmask (e.g. STATUS_PHYSICS|STATUS_PHANTOM) to boolean Value.
   * For a full list of STATUS_* constants, see wiki documentation.
   */
  export function SetStatus(status: number, value: boolean): void

  /** Causes Text to float above the prim, using the specified Color and Opacity. */
  export function SetText(text: string, color: Vector, opacity: number): void

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
  export function SetTorque(torque: Vector, local: boolean): void

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
  export function SetVehicleRotationParam(parameterName: number, parameterValue: Quaternion): void

  /**
   * Activates the vehicle action on the object with vehicle preset Type.
   * Valid Types and an explanation of their characteristics can be found in wiki documentation.
   */
  export function SetVehicleType(type: number): void

  /**
   * Sets a vehicle vector parameter.
   * Valid parameters can be found in the wiki documentation.
   */
  export function SetVehicleVectorParam(parameterName: number, parameterValue: Vector): void

  /**
   * If the object is physics-enabled, sets the object's linear velocity to Velocity.
   * If Local==TRUE, Velocity is treated as a local directional vector; otherwise, Velocity is treated as a global directional vector.
   */
  export function SetVelocity(velocity: Vector, local: boolean): void

  /**
   * Shouts Text on Channel.
   * This chat method has a range of 100m radius.
   * PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
   */
  export function Shout(channel: number, text: string): void

  /** Returns the base64-encoded RSA signature of Message using PEM-formatted PrivateKey and digest Algorithm (sha1, sha224, sha256, sha384, sha512). */
  export function SignRSA(privateKey: string, message: string, algorithm: string): string

  /**
   * Returns the sine of Theta (Theta in radians).
   * @deprecated Use 'math.sin' instead. It's a fastcall.
   */
  export function Sin(theta: number): number

  /** If agent identified by AvatarID is participating in the experience, sit them on the specified link's sit target. */
  export function SitOnLink(avatarId: UUID, linkId: number): number

  /** Set the sit location for this object. If offset == ZERO_VECTOR, clears the sit target. */
  export function SitTarget(offset: Vector, rotation: Quaternion): void

  /** Put script to sleep for Time seconds. */
  export function Sleep(time: number): void

  /**
   * Deprecated: Use llPlaySound instead.
   * Plays Sound at Volume and specifies whether the sound should loop and/or be enqueued.
   * @deprecated Use 'll.PlaySound' instead.
   */
  export function Sound(sound: string, volume: number, queue: boolean, loop: boolean): void

  /**
   * Deprecated: Use llPreloadSound instead.
   * Preloads a sound on viewers within range.
   * @deprecated Use 'll.PreloadSound' instead.
   */
  export function SoundPreload(sound: string): void

  /**
   * Returns the square root of Value.
   * Triggers a math runtime error for imaginary results (if Value < 0.0).
   * @deprecated Use 'math.sqrt' instead. It's a fastcall.
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

  /** @deprecated */
  export function StopPointAt(): void

  /** Stops playback of the currently attached sound. */
  export function StopSound(): void

  /**
   * Returns an integer that is the number of characters in Text (not counting the null).
   * @deprecated Use 'utf8.len' or '#' or 'string.len' instead.
   */
  export function StringLength(text: string): number

  /**
   * Returns the string Base64 representation of the input string.
   * @deprecated Use 'llbase64.encode' instead.
   */
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

  /**
   * Deprecated: Use llSetCameraParams instead.
   * @deprecated Use 'll.SetCameraParams' instead.
   */
  export function TakeCamera(avatarId: UUID): void

  /**
   * Take controls from the agent the script has permissions for.
   * If (Accept == (Controls & input)), send input to the script.  PassOn determines whether Controls also perform their normal functions.
   * Requires the PERMISSION_TAKE_CONTROLS runtime permission (automatically granted to attached or sat on objects).
   */
  export function TakeControls(controls: number, accept: boolean, passOn: boolean): void

  /**
   * Returns the tangent of Theta (Theta in radians).
   * @deprecated Use 'math.tan' instead. It's a fastcall.
   */
  export function Tan(theta: number): number

  /**
   * This function is to have the script know when it has reached a position.
   * It registers a Position with a Range that triggers at_target and not_at_target events continuously until unregistered.
   */
  export function Target(position: Vector, range: number): number

  /**
   * Attempt to spin at SpinRate with strength Gain on Axis.
   * A spin rate of 0.0 cancels the spin. This function always works in object-local coordinates.
   */
  export function TargetOmega(axis: Vector, spinRate: number, gain: number): void

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
    avatarId: UUID,
    landmarkName: string,
    position: Vector,
    lookAtPoint: Vector,
  ): void

  /**
   * Teleports an agent to the RegionPosition local coordinates within a region which is specified by the GlobalPosition global coordinates. The agent lands facing the position defined by LookAtPoint local coordinates.
   * Requires the PERMISSION_TELEPORT runtime permission.
   * This function can only teleport the owner of the object.
   */
  export function TeleportAgentGlobalCoords(
    avatarId: UUID,
    globalPosition: Vector,
    regionPosition: Vector,
    lookAtPoint: Vector,
  ): void

  /** Teleport agent over the owner's land to agent's home location. */
  export function TeleportAgentHome(avatarId: UUID): void

  /** Opens a dialog for the specified avatar with message Text, which contains a text box for input. Any text that is entered is said on the specified Channel (as if by the avatar) when the "OK" button is clicked. */
  export function TextBox(avatarId: UUID, text: string, channel: number): void

  /** Returns a string that is Text with all lower-case characters. */
  export function ToLower(text: string): string

  /** Returns a string that is Text with all upper-case characters. */
  export function ToUpper(text: string): string

  /**
   * Transfer Amount of linden dollars (L$) from script owner to AvatarID. Returns a key to a corresponding transaction_result event for the success of the transfer.
   * Attempts to send the amount of money to the specified avatar, and trigger a transaction_result event identified by the returned key. Requires the PERMISSION_DEBIT runtime permission.
   */
  export function TransferLindenDollars(avatarId: UUID, amount: number): UUID

  /** Transfers ownership of an object, or a copy of the object to a new agent. */
  export function TransferOwnership(agentId: UUID, flags: number, params: list): number

  /**
   * Plays Sound at Volume (0.0 - 1.0), centered at but not attached to object.
   * There is no limit to the number of triggered sounds which can be generated by an object, and calling llTriggerSound does not affect the attached sounds created by llPlaySound and llLoopSound. This is very useful for things like collision noises, explosions, etc. There is no way to stop or alter the volume of a sound triggered by this function.
   */
  export function TriggerSound(sound: string, volume: number): void

  /**
   * Plays Sound at Volume (0.0 - 1.0), centered at but not attached to object, limited to axis-aligned bounding box defined by vectors top-north-east (TNE) and bottom-south-west (BSW).
   * There is no limit to the number of triggered sounds which can be generated by an object, and calling llTriggerSound does not affect the attached sounds created by llPlaySound and llLoopSound. This is very useful for things like collision noises, explosions, etc. There is no way to stop or alter the volume of a sound triggered by this function.
   */
  export function TriggerSoundLimited(sound: string, volume: number, tne: Vector, bsw: Vector): void

  /** If agent identified by AvatarID is sitting on the object the script is attached to or is over land owned by the object's owner, the agent is forced to stand up. */
  export function UnSit(avatarId: UUID): void

  /**
   * Returns the string that is the URL unescaped, replacing "%20" with spaces, etc., version of URL.
   * This function can output raw UTF-8 strings.
   */
  export function UnescapeURL(url: string): string

  /**
   * Updates settings for a pathfinding character.
   */
  export function UpdateCharacter<const T extends readonly unknown[]>(
    options: T & ParseCharacterParams<T>,
  ): void

  /** Starts an asychronous transaction to update the value associated with the key given. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value associated with the key. If Checked is 1 the existing value in the data store must match the OriginalValue passed or XP_ERROR_RETRY_UPDATE will be returned. If Checked is 0 the key will be created if necessary. */
  export function UpdateKeyValue(
    key: string,
    value: string,
    checked: boolean,
    originalValue: string,
  ): UUID

  /** Returns the distance between Location1 and Location2. */
  export function VecDist(location1: Vector, location2: Vector): number

  /** Returns the magnitude of the vector. */
  export function VecMag(vector: Vector): number

  /** Returns normalized vector. */
  export function VecNorm(vector: Vector): Vector

  /** Returns TRUE if PublicKey, Message, and Algorithm produce the same base64-formatted Signature. */
  export function VerifyRSA(
    publicKey: string,
    message: string,
    signature: string,
    algorithm: string,
  ): boolean

  /**
   * If DetectEnabled = TRUE, object becomes phantom but triggers collision_start and collision_end events when other objects start and stop interpenetrating.
   * If another object (including avatars) interpenetrates it, it will get a collision_start event.
   * When an object stops interpenetrating, a collision_end event is generated. While the other is inter-penetrating, collision events are NOT generated.
   */
  export function VolumeDetect(detectEnabled: boolean): void

  /**
   * Wander within a specified volume.
   * Sets a character to wander about a central spot within a specified area.
   */
  export function WanderWithin(origin: Vector, area: Vector, options: list): void

  /** Returns the water height below the object position + Offset. */
  export function Water(offset: Vector): number

  /**
   * Whispers Text on Channel.
   * This chat method has a range of 10m radius.
   * PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
   */
  export function Whisper(channel: number, text: string): void

  /** Returns the wind velocity at the object position + Offset. */
  export function Wind(offset: Vector): Vector

  /** Returns the local position that would put the origin of a HUD object directly over world_pos as viewed by the current camera. Requires the PERMISSION_TRACK_CAMERA runtime permission (else will return zero vector). */
  export function WorldPosToHUD(worldPos: Vector): Vector

  /** Performs an exclusive OR on two Base64 strings and returns a Base64 string. Text2 repeats if it is shorter than Text1. */
  export function XorBase64(text1: string, text2: string): string

  /**
   * Deprecated: Please use llXorBase64 instead.
   * Incorrectly performs an exclusive OR on two Base64 strings and returns a Base64 string. Text2 repeats if it is shorter than Text1.
   * Retained for backwards compatibility.
   * @deprecated Use 'll.XorBase64' instead.
   */
  export function XorBase64Strings(text1: string, text2: string): string

  /**
   * Deprecated: Please use llXorBase64 instead.
   * Correctly (unless nulls are present) performs an exclusive OR on two Base64 strings and returns a Base64 string.
   * Text2 repeats if it is shorter than Text1.
   * @deprecated Use 'll.XorBase64' instead.
   */
  export function XorBase64StringsCorrect(text1: string, text2: string): string

  /** Converts a color from the sRGB to the linear colorspace. */
  export function sRGB2Linear(srgb: Vector): Vector
}

/** Objects in world that are running a script or currently physically moving. */
declare const ACTIVE: 2
/** Objects in world that are agents. */
declare const AGENT: 1
declare const AGENT_ALWAYS_RUN: 4096
/** The agent has attachments. */
declare const AGENT_ATTACHMENTS: 2
/** The agent has been identified as a scripted agent */
declare const AGENT_AUTOMATED: 16384
declare const AGENT_AUTOPILOT: 8192
declare const AGENT_AWAY: 64
declare const AGENT_BUSY: 2048
declare const AGENT_BY_LEGACY_NAME: 1
declare const AGENT_BY_USERNAME: 16
declare const AGENT_CROUCHING: 1024
/** The agent is floating via scripted attachment. */
declare const AGENT_FLOATING_VIA_SCRIPTED_ATTACHMENT: 32768
/** The agent is flying. */
declare const AGENT_FLYING: 1
declare const AGENT_IN_AIR: 256
/** Agents on the same parcel where the script is running. */
declare const AGENT_LIST_PARCEL: 1
/** Agents on any parcel in the region where the parcel owner is the same as the owner of the parcel under the scripted object. */
declare const AGENT_LIST_PARCEL_OWNER: 2
/** All agents in the region. */
declare const AGENT_LIST_REGION: 4
declare const AGENT_MOUSELOOK: 8
declare const AGENT_ON_OBJECT: 32
/** The agent has scripted attachments. */
declare const AGENT_SCRIPTED: 4
declare const AGENT_SITTING: 16
declare const AGENT_TYPING: 512
declare const AGENT_WALKING: 128
declare const ALL_SIDES: -1
/** Texture animation is on. */
declare const ANIM_ON: 1
/** Filtering for any HUD attachment. */
declare const ATTACH_ANY_HUD: -1
/** Attach to the avatar's geometric centre. */
declare const ATTACH_AVATAR_CENTER: 40
/** Attach to the avatar's back. */
declare const ATTACH_BACK: 9
/** Attach to the avatar's belly. */
declare const ATTACH_BELLY: 28
/** Attach to the avatar's chest. */
declare const ATTACH_CHEST: 1
/** Attach to the avatar's chin. */
declare const ATTACH_CHIN: 12
/** Attach to the avatar's jaw. */
declare const ATTACH_FACE_JAW: 47
/** Attach to the avatar's left ear (extended). */
declare const ATTACH_FACE_LEAR: 48
/** Attach to the avatar's left eye (extended). */
declare const ATTACH_FACE_LEYE: 50
/** Attach to the avatar's right ear (extended). */
declare const ATTACH_FACE_REAR: 49
/** Attach to the avatar's right eye (extended). */
declare const ATTACH_FACE_REYE: 51
/** Attach to the avatar's tongue. */
declare const ATTACH_FACE_TONGUE: 52
/** Attach to the avatar's groin. */
declare const ATTACH_GROIN: 53
/** Attach to the avatar's head. */
declare const ATTACH_HEAD: 2
/** Attach to the avatar's left hind foot. */
declare const ATTACH_HIND_LFOOT: 54
/** Attach to the avatar's right hind foot. */
declare const ATTACH_HIND_RFOOT: 55
declare const ATTACH_HUD_BOTTOM: 37
declare const ATTACH_HUD_BOTTOM_LEFT: 36
declare const ATTACH_HUD_BOTTOM_RIGHT: 38
declare const ATTACH_HUD_CENTER_1: 35
declare const ATTACH_HUD_CENTER_2: 31
declare const ATTACH_HUD_TOP_CENTER: 33
declare const ATTACH_HUD_TOP_LEFT: 34
declare const ATTACH_HUD_TOP_RIGHT: 32
/** Attach to the avatar's left ear. */
declare const ATTACH_LEAR: 13
/** Attach to the avatar's left pectoral. */
declare const ATTACH_LEFT_PEC: 29
/** Attach to the avatar's left eye. */
declare const ATTACH_LEYE: 15
/** Attach to the avatar's left foot. */
declare const ATTACH_LFOOT: 7
/** Attach to the avatar's left hand. */
declare const ATTACH_LHAND: 5
/** Attach to the avatar's left ring finger. */
declare const ATTACH_LHAND_RING1: 41
/** Attach to the avatar's left hip. */
declare const ATTACH_LHIP: 25
/** Attach to the avatar's left lower arm. */
declare const ATTACH_LLARM: 21
/** Attach to the avatar's lower left leg. */
declare const ATTACH_LLLEG: 27
/**
 * Attach to the avatar's right pectoral. (Deprecated, use ATTACH_RIGHT_PEC)
 * @deprecated Use 'ATTACH_RIGHT_PEC' instead.
 */
declare const ATTACH_LPEC: 30
/** Attach to the avatar's left shoulder. */
declare const ATTACH_LSHOULDER: 3
/** Attach to the avatar's left upper arm. */
declare const ATTACH_LUARM: 20
/** Attach to the avatar's lower upper leg. */
declare const ATTACH_LULEG: 26
/** Attach to the avatar's left wing. */
declare const ATTACH_LWING: 45
/** Attach to the avatar's mouth. */
declare const ATTACH_MOUTH: 11
/** Attach to the avatar's neck. */
declare const ATTACH_NECK: 39
/** Attach to the avatar's nose. */
declare const ATTACH_NOSE: 17
/** Attach to the avatar's pelvis. */
declare const ATTACH_PELVIS: 10
/** Attach to the avatar's right ear. */
declare const ATTACH_REAR: 14
/** Attach to the avatar's right eye. */
declare const ATTACH_REYE: 16
/** Attach to the avatar's right foot. */
declare const ATTACH_RFOOT: 8
/** Attach to the avatar's right hand. */
declare const ATTACH_RHAND: 6
/** Attach to the avatar's right ring finger. */
declare const ATTACH_RHAND_RING1: 42
/** Attach to the avatar's right hip. */
declare const ATTACH_RHIP: 22
/** Attach to the avatar's right pectoral. */
declare const ATTACH_RIGHT_PEC: 30
/** Attach to the avatar's right lower arm. */
declare const ATTACH_RLARM: 19
/** Attach to the avatar's right lower leg. */
declare const ATTACH_RLLEG: 24
/**
 * Attach to the avatar's left pectoral. (deprecated, use ATTACH_LEFT_PEC)
 * @deprecated Use 'ATTACH_LEFT_PEC' instead.
 */
declare const ATTACH_RPEC: 29
/** Attach to the avatar's right shoulder. */
declare const ATTACH_RSHOULDER: 4
/** Attach to the avatar's right upper arm. */
declare const ATTACH_RUARM: 18
/** Attach to the avatar's right upper leg. */
declare const ATTACH_RULEG: 23
/** Attach to the avatar's right wing. */
declare const ATTACH_RWING: 46
/** Attach to the avatar's tail base. */
declare const ATTACH_TAIL_BASE: 43
/** Attach to the avatar's tail tip. */
declare const ATTACH_TAIL_TIP: 44
declare const AVOID_CHARACTERS: 1
declare const AVOID_DYNAMIC_OBSTACLES: 2
declare const AVOID_NONE: 0
/** Cause llMapBeacon to optionally display and focus the world map on the avatar's viewer. */
declare const BEACON_MAP: 1
declare const CAMERA_ACTIVE: 12
declare const CAMERA_BEHINDNESS_ANGLE: 8
declare const CAMERA_BEHINDNESS_LAG: 9
declare const CAMERA_DISTANCE: 7
declare const CAMERA_FOCUS: 17
declare const CAMERA_FOCUS_LAG: 6
declare const CAMERA_FOCUS_LOCKED: 22
declare const CAMERA_FOCUS_OFFSET: 1
declare const CAMERA_FOCUS_THRESHOLD: 11
declare const CAMERA_PITCH: 0
declare const CAMERA_POSITION: 13
declare const CAMERA_POSITION_LAG: 5
declare const CAMERA_POSITION_LOCKED: 21
declare const CAMERA_POSITION_THRESHOLD: 10
/** The object inventory has changed because an item was added through the llAllowInventoryDrop interface. */
declare const CHANGED_ALLOWED_DROP: 64
/** The object color has changed. */
declare const CHANGED_COLOR: 2
/** The object inventory has changed. */
declare const CHANGED_INVENTORY: 1
/** The object has linked or its links were broken. */
declare const CHANGED_LINK: 32
declare const CHANGED_MEDIA: 2048
/** The object has changed ownership. */
declare const CHANGED_OWNER: 128
/** The object has changed region. */
declare const CHANGED_REGION: 256
/** The region this object is in has just come online. */
declare const CHANGED_REGION_START: 1024
/** The render material has changed. */
declare const CHANGED_RENDER_MATERIAL: 4096
/** The object scale (size) has changed. */
declare const CHANGED_SCALE: 8
/** The object base shape has changed, e.g., a box to a cylinder. */
declare const CHANGED_SHAPE: 4
/** The avatar to whom this object is attached has teleported. */
declare const CHANGED_TELEPORT: 512
/** The texture offset, scale rotation, or simply the object texture has changed. */
declare const CHANGED_TEXTURE: 16
/** If set to false, character will not attempt to catch up on lost time when pathfinding performance is low, potentially providing more reliable movement (albeit while potentially appearing to be more stuttery). Default is true to match pre-existing behavior. */
declare const CHARACTER_ACCOUNT_FOR_SKIPPED_FRAMES: 14
/** Allows you to specify that a character should not try to avoid other characters, should not try to avoid dynamic obstacles (relatively fast moving objects and avatars), or both. */
declare const CHARACTER_AVOIDANCE_MODE: 5
/** Makes the character jump. Requires an additional parameter, the height to jump, between 0.1m and 2.0m. This must be provided as the first element of the llExecCharacterCmd option list. */
declare const CHARACTER_CMD_JUMP: 1
declare const CHARACTER_CMD_SMOOTH_STOP: 2
/** Stops any current pathfinding operation. */
declare const CHARACTER_CMD_STOP: 0
/** Speed of pursuit in meters per second. */
declare const CHARACTER_DESIRED_SPEED: 1
/** The character's maximum speed while turning about the Z axis. - Note that this is only loosely enforced. */
declare const CHARACTER_DESIRED_TURN_SPEED: 12
/** Set collision capsule length - cannot be less than two times the radius. */
declare const CHARACTER_LENGTH: 3
/** The character's maximum acceleration rate. */
declare const CHARACTER_MAX_ACCEL: 8
/** The character's maximum deceleration rate. */
declare const CHARACTER_MAX_DECEL: 9
/** The character's maximum speed. */
declare const CHARACTER_MAX_SPEED: 13
/** The character's turn radius when travelling at CHARACTER_MAX_TURN_SPEED. */
declare const CHARACTER_MAX_TURN_RADIUS: 10
/** Valid options are: VERTICAL, HORIZONTAL. */
declare const CHARACTER_ORIENTATION: 4
/** Set collision capsule radius. */
declare const CHARACTER_RADIUS: 2
/**
 * Determines whether a character can leave its starting parcel.
 * Takes a boolean parameter. If TRUE, the character cannot voluntarilly leave the parcel, but can return to it.
 */
declare const CHARACTER_STAY_WITHIN_PARCEL: 15
/** Specifies which walk-ability coefficient will be used by this character. */
declare const CHARACTER_TYPE: 6
declare const CHARACTER_TYPE_A: 0
declare const CHARACTER_TYPE_B: 1
declare const CHARACTER_TYPE_C: 2
declare const CHARACTER_TYPE_D: 3
declare const CHARACTER_TYPE_NONE: 4
/** When the prim is clicked, the buy dialog is opened. */
declare const CLICK_ACTION_BUY: 2
/** No click action. No touches detected or passed. */
declare const CLICK_ACTION_DISABLED: 8
/** No click action. Object is invisible to the mouse. */
declare const CLICK_ACTION_IGNORE: 9
/** Performs the default action: when the prim is clicked, touch events are triggered. */
declare const CLICK_ACTION_NONE: 0
/** When the prim is clicked, the object inventory dialog is opened. */
declare const CLICK_ACTION_OPEN: 4
/** When the prim is touched, the web media dialog is opened. */
declare const CLICK_ACTION_OPEN_MEDIA: 6
/** When the prim is clicked, the pay dialog is opened. */
declare const CLICK_ACTION_PAY: 3
/** When the prim is clicked, html-on-a-prim is enabled? */
declare const CLICK_ACTION_PLAY: 5
/** When the prim is clicked, the avatar sits upon it. */
declare const CLICK_ACTION_SIT: 1
/** When the prim is clicked, touch events are triggered. */
declare const CLICK_ACTION_TOUCH: 0
/** Zoom in on object when clicked. */
declare const CLICK_ACTION_ZOOM: 7
/** COMBAT_CHANNEL is an integer constant that, when passed to llRegionSay will add the message to the combat log. A script with a chat listen active on COMBAT_CHANNEL may also monitor the combat log. */
declare const COMBAT_CHANNEL: 2147483646
/**
 * Messages from the region to the COMBAT_CHANNEL will all be from this ID.
 *  Scripts may filter llListen calls on this ID to receive only system generated combat log messages.
 */
declare const COMBAT_LOG_ID: UUID
/** "application/atom+xml" */
declare const CONTENT_TYPE_ATOM: 4
/** "application/x-www-form-urlencoded" */
declare const CONTENT_TYPE_FORM: 7
/** "text/html", only valid for embedded browsers on content owned by the person viewing. Falls back to "text/plain" otherwise. */
declare const CONTENT_TYPE_HTML: 1
/** "application/json" */
declare const CONTENT_TYPE_JSON: 5
/** "application/llsd+xml" */
declare const CONTENT_TYPE_LLSD: 6
/** "application/rss+xml" */
declare const CONTENT_TYPE_RSS: 8
/** "text/plain" */
declare const CONTENT_TYPE_TEXT: 0
/** "application/xhtml+xml" */
declare const CONTENT_TYPE_XHTML: 3
/** "application/xml" */
declare const CONTENT_TYPE_XML: 2
/** Test for the avatar move back control. */
declare const CONTROL_BACK: 2
/** Test for the avatar move down control. */
declare const CONTROL_DOWN: 32
/** Test for the avatar move forward control. */
declare const CONTROL_FWD: 1
/** Test for the avatar left button control. */
declare const CONTROL_LBUTTON: 268435456
/** Test for the avatar move left control. */
declare const CONTROL_LEFT: 4
/** Test for the avatar left button control while in mouse look. */
declare const CONTROL_ML_LBUTTON: 1073741824
/** Test for the avatar move right control. */
declare const CONTROL_RIGHT: 8
/** Test for the avatar rotate left control. */
declare const CONTROL_ROT_LEFT: 256
/** Test for the avatar rotate right control. */
declare const CONTROL_ROT_RIGHT: 512
/** Test for the avatar move up control. */
declare const CONTROL_UP: 16
/** Objects in world that are able to process damage. */
declare const DAMAGEABLE: 32
/** Damage caused by a caustic substance, such as acid */
declare const DAMAGE_TYPE_ACID: 1
/** Damage caused by a blunt object, such as a club. */
declare const DAMAGE_TYPE_BLUDGEONING: 2
/** Damage inflicted by exposure to extreme cold */
declare const DAMAGE_TYPE_COLD: 3
/** Damage caused by electricity. */
declare const DAMAGE_TYPE_ELECTRIC: 4
declare const DAMAGE_TYPE_EMOTIONAL: 14
/** Damage inflicted by exposure to heat or flames. */
declare const DAMAGE_TYPE_FIRE: 5
/** Damage inflicted by a great force or impact. */
declare const DAMAGE_TYPE_FORCE: 6
/** Generic or legacy damage. */
declare const DAMAGE_TYPE_GENERIC: 0
/** System damage generated by impact with land or a prim. */
declare const DAMAGE_TYPE_IMPACT: -1
/** Damage caused by a direct assault on life-force */
declare const DAMAGE_TYPE_NECROTIC: 7
/** Damage caused by a piercing object such as a bullet, spear, or arrow. */
declare const DAMAGE_TYPE_PIERCING: 8
/** Damage caused by poison. */
declare const DAMAGE_TYPE_POISON: 9
/** Damage caused by a direct assault on the mind. */
declare const DAMAGE_TYPE_PSYCHIC: 10
/** Damage caused by radiation or extreme light. */
declare const DAMAGE_TYPE_RADIANT: 11
/** Damage caused by a slashing object such as a sword or axe. */
declare const DAMAGE_TYPE_SLASHING: 12
/** Damage caused by loud noises, like a Crash Worship concert. */
declare const DAMAGE_TYPE_SONIC: 13
/** The date the agent was born, returned in ISO 8601 format of YYYY-MM-DD. */
declare const DATA_BORN: 3
/** The name of the agent. */
declare const DATA_NAME: 2
/** TRUE for online, FALSE for offline. */
declare const DATA_ONLINE: 1
declare const DATA_PAYINFO: 8
/** Returns the agent ratings as a comma separated string of six integers. They are:1) Positive rated behaviour2) Negative rated behaviour3) Positive rated appearance4) Negative rated appearance5) Positive rated building6) Negative rated building */
declare const DATA_RATING: 4
/** Reserved for Linden use. */
declare const DATA_RESERVED_0: 9
declare const DATA_SIM_POS: 5
declare const DATA_SIM_RATING: 7
declare const DATA_SIM_STATUS: 6
/** DEBUG_CHANNEL is an integer constant that, when passed to llSay, llWhisper, or llShout as a channel parameter, will print text to the Script Warning/Error Window. */
declare const DEBUG_CHANNEL: 2147483647
/** 0.017453293 - Number of radians per degree.You can use this to convert degrees to radians by multiplying the degrees by this number. */
declare const DEG_TO_RAD: number
/** Used with llSetPhysicsMaterial to enable the density value. Must be between 1.0 and 22587.0 (in Kg/m^3 -- see if you can figure out what 22587 represents) */
declare const DENSITY: 1
/** Causes the object to immediately die. */
declare const DEREZ_DIE: 0
/** The object is made temporary and will be cleaned up at some later timer. */
declare const DEREZ_MAKE_TEMP: 1
/** The object is returned to the inventory of the rezzer. */
declare const DEREZ_TO_INVENTORY: 2
/** Day length, offset and progression. */
declare const ENVIRONMENT_DAYINFO: 200
/** Could not find agent with the specified ID */
declare const ENV_INVALID_AGENT: -4
/** Attempted to change an unknown property. */
declare const ENV_INVALID_RULE: -5
/** Attempt to change environments outside an experience. */
declare const ENV_NOT_EXPERIENCE: -1
/** Could not find environmental settings in object inventory. */
declare const ENV_NO_ENVIRONMENT: -3
/** The experience has not been enabled on this land. */
declare const ENV_NO_EXPERIENCE_LAND: -7
/** Agent has not granted permission to change environments. */
declare const ENV_NO_EXPERIENCE_PERMISSION: -2
/** Script does not have permission to modify environment. */
declare const ENV_NO_PERMISSIONS: -9
/** Could not validate values for environment. */
declare const ENV_THROTTLE: -8
/** Could not validate values for environment. */
declare const ENV_VALIDATION_FAIL: -6
/** Indicates the last line of a notecard was read. */
declare const EOF: string
declare const ERR_GENERIC: -1
declare const ERR_MALFORMED_PARAMS: -3
declare const ERR_PARCEL_PERMISSIONS: -2
declare const ERR_RUNTIME_PERMISSIONS: -4
declare const ERR_THROTTLED: -5
/** Add the agent to this estate's Allowed Residents list. */
declare const ESTATE_ACCESS_ALLOWED_AGENT_ADD: 4
/** Remove the agent from this estate's Allowed Residents list. */
declare const ESTATE_ACCESS_ALLOWED_AGENT_REMOVE: 8
/** Add the group to this estate's Allowed groups list. */
declare const ESTATE_ACCESS_ALLOWED_GROUP_ADD: 16
/** Remove the group from this estate's Allowed groups list. */
declare const ESTATE_ACCESS_ALLOWED_GROUP_REMOVE: 32
/** Add the agent to this estate's Banned residents list. */
declare const ESTATE_ACCESS_BANNED_AGENT_ADD: 64
/** Remove the agent from this estate's Banned residents list. */
declare const ESTATE_ACCESS_BANNED_AGENT_REMOVE: 128
/** Flags to control returned attachments. */
declare const FILTER_FLAGS: 2
/** Include HUDs with matching experience. */
declare const FILTER_FLAG_HUDS: 1
/** Include attachment point. */
declare const FILTER_INCLUDE: 1
/** Makes character navigate in a straight line toward position. May be set to TRUE or FALSE. */
declare const FORCE_DIRECT_PATH: 1
/** Used with llSetPhysicsMaterial to enable the friction value. Must be between 0.0 and 255.0 */
declare const FRICTION: 2
declare const GAME_CONTROL_AXIS_LEFTX: 0
declare const GAME_CONTROL_AXIS_LEFTY: 1
declare const GAME_CONTROL_AXIS_RIGHTX: 2
declare const GAME_CONTROL_AXIS_RIGHTY: 3
declare const GAME_CONTROL_AXIS_TRIGGERLEFT: 4
declare const GAME_CONTROL_AXIS_TRIGGERRIGHT: 5
declare const GAME_CONTROL_BUTTON_A: 1
declare const GAME_CONTROL_BUTTON_B: 2
declare const GAME_CONTROL_BUTTON_BACK: 16
declare const GAME_CONTROL_BUTTON_DPAD_DOWN: 4096
declare const GAME_CONTROL_BUTTON_DPAD_LEFT: 8192
declare const GAME_CONTROL_BUTTON_DPAD_RIGHT: 16384
declare const GAME_CONTROL_BUTTON_DPAD_UP: 2048
declare const GAME_CONTROL_BUTTON_GUIDE: 32
declare const GAME_CONTROL_BUTTON_LEFTSHOULDER: 512
declare const GAME_CONTROL_BUTTON_LEFTSTICK: 128
declare const GAME_CONTROL_BUTTON_MISC1: 32768
declare const GAME_CONTROL_BUTTON_PADDLE1: 65536
declare const GAME_CONTROL_BUTTON_PADDLE2: 131072
declare const GAME_CONTROL_BUTTON_PADDLE3: 262144
declare const GAME_CONTROL_BUTTON_PADDLE4: 524288
declare const GAME_CONTROL_BUTTON_RIGHTSHOULDER: 1024
declare const GAME_CONTROL_BUTTON_RIGHTSTICK: 256
declare const GAME_CONTROL_BUTTON_START: 64
declare const GAME_CONTROL_BUTTON_TOUCHPAD: 1048576
declare const GAME_CONTROL_BUTTON_X: 4
declare const GAME_CONTROL_BUTTON_Y: 8
declare const GCNP_GET_WALKABILITY: 2
declare const GCNP_RADIUS: 0
declare const GCNP_STATIC: 1
/** Used with llSetPhysicsMaterial to enable the gravity multiplier value. Must be between -1.0 and +28.0 */
declare const GRAVITY_MULTIPLIER: 8
declare const HORIZONTAL: 1
/** Provide a string value to be included in the HTTPaccepts header value. This replaces the default Second Life HTTP accepts header. */
declare const HTTP_ACCEPT: 8
declare const HTTP_BODY_MAXLENGTH: 2
declare const HTTP_BODY_TRUNCATED: 0
/** Add an extra custom HTTP header to the request. The first string is the name of the parameter to change, e.g. "Pragma", and the second string is the value, e.g. "no-cache". Up to 8 custom headers may be configured per request. Note that certain headers, such as the default headers, are blocked for security reasons. */
declare const HTTP_CUSTOM_HEADER: 5
/** Report extended error information through http_response event. */
declare const HTTP_EXTENDED_ERROR: 9
declare const HTTP_METHOD: 0
declare const HTTP_MIMETYPE: 1
/**
 * Allows enabling/disabling of the "Pragma: no-cache" header.
 * Usage: [HTTP_PRAGMA_NO_CACHE, integer SendHeader]. When SendHeader is TRUE, the "Pragma: no-cache" header is sent by the script. This matches the default behavior. When SendHeader is FALSE, no "Pragma" header is sent by the script.
 */
declare const HTTP_PRAGMA_NO_CACHE: 6
/** Provide a string value to be included in the HTTPUser-Agent header value. This is appended to the default value. */
declare const HTTP_USER_AGENT: 7
declare const HTTP_VERBOSE_THROTTLE: 4
declare const HTTP_VERIFY_CERT: 3
declare const IMG_USE_BAKED_AUX1: UUID
declare const IMG_USE_BAKED_AUX2: UUID
declare const IMG_USE_BAKED_AUX3: UUID
declare const IMG_USE_BAKED_EYES: UUID
declare const IMG_USE_BAKED_HAIR: UUID
declare const IMG_USE_BAKED_HEAD: UUID
declare const IMG_USE_BAKED_LEFTARM: UUID
declare const IMG_USE_BAKED_LEFTLEG: UUID
declare const IMG_USE_BAKED_LOWER: UUID
declare const IMG_USE_BAKED_SKIRT: UUID
declare const IMG_USE_BAKED_UPPER: UUID
declare const INVENTORY_ALL: -1
declare const INVENTORY_ANIMATION: 20
declare const INVENTORY_BODYPART: 13
declare const INVENTORY_CLOTHING: 5
declare const INVENTORY_GESTURE: 21
declare const INVENTORY_LANDMARK: 3
declare const INVENTORY_MATERIAL: 57
declare const INVENTORY_NONE: -1
declare const INVENTORY_NOTECARD: 7
declare const INVENTORY_OBJECT: 6
declare const INVENTORY_SCRIPT: 10
declare const INVENTORY_SETTING: 56
declare const INVENTORY_SOUND: 1
declare const INVENTORY_TEXTURE: 0
/** @deprecated Use 'lljson.decode' and 'table.insert' instead. */
declare const JSON_APPEND: -1
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
declare const KFM_CMD_PAUSE: 2
/** For use with KFM_COMMAND. */
declare const KFM_CMD_PLAY: 0
/** For use with KFM_COMMAND. */
declare const KFM_CMD_STOP: 1
declare const KFM_COMMAND: 0
declare const KFM_DATA: 2
/** For use with KFM_MODE. */
declare const KFM_FORWARD: 0
/** For use with KFM_MODE. */
declare const KFM_LOOP: 1
declare const KFM_MODE: 1
/** For use with KFM_MODE. */
declare const KFM_PING_PONG: 2
/** For use with KFM_MODE. */
declare const KFM_REVERSE: 3
/** For use with KFM_DATA. */
declare const KFM_ROTATION: 1
/** For use with KFM_DATA. */
declare const KFM_TRANSLATION: 2
/**
 * Use a large brush size.
 * NOTE: This value is incorrect, a large brush should be 2.
 */
declare const LAND_LARGE_BRUSH: 3
/** Action to level the land. */
declare const LAND_LEVEL: 0
/** Action to lower the land. */
declare const LAND_LOWER: 2
/**
 * Use a medium brush size.
 * NOTE: This value is incorrect, a medium brush should be 1.
 */
declare const LAND_MEDIUM_BRUSH: 2
declare const LAND_NOISE: 4
/** Action to raise the land. */
declare const LAND_RAISE: 1
declare const LAND_REVERT: 5
/**
 * Use a small brush size.
 * NOTE: This value is incorrect, a small brush should be 0.
 */
declare const LAND_SMALL_BRUSH: 1
declare const LAND_SMOOTH: 3
declare const LEGACY_MASS_FACTOR: number
/** A name:value pair has been removed from the linkset datastore. */
declare const LINKSETDATA_DELETE: 2
/** A name:value pair was too large to write to the linkset datastore. */
declare const LINKSETDATA_EMEMORY: 1
/** The key supplied was empty. */
declare const LINKSETDATA_ENOKEY: 2
/** The name:value pair has been protected from overwrite in the linkset datastore. */
declare const LINKSETDATA_EPROTECTED: 3
/** A CSV list of names removed from the linkset datastore. */
declare const LINKSETDATA_MULTIDELETE: 3
/** The named key was not found in the datastore. */
declare const LINKSETDATA_NOTFOUND: 4
/** The value written to a name in the keystore is the same as the value already there. */
declare const LINKSETDATA_NOUPDATE: 5
/** The name:value pair was written to the datastore. */
declare const LINKSETDATA_OK: 0
/** The linkset datastore has been reset. */
declare const LINKSETDATA_RESET: 0
/** A name:value pair in the linkset datastore has been changed or created. */
declare const LINKSETDATA_UPDATE: 1
/** This targets every object except the root in the linked set. */
declare const LINK_ALL_CHILDREN: -3
/** This targets every object in the linked set except the object with the script. */
declare const LINK_ALL_OTHERS: -2
/** This targets the root of the linked set. */
declare const LINK_ROOT: 1
/** This targets every object in the linked set. */
declare const LINK_SET: -1
/** The link number of the prim containing the script. */
declare const LINK_THIS: -4
declare const LIST_STAT_GEOMETRIC_MEAN: 9
declare const LIST_STAT_MAX: 2
declare const LIST_STAT_MEAN: 3
declare const LIST_STAT_MEDIAN: 4
declare const LIST_STAT_MIN: 1
declare const LIST_STAT_NUM_COUNT: 8
declare const LIST_STAT_RANGE: 0
declare const LIST_STAT_STD_DEV: 5
declare const LIST_STAT_SUM: 6
declare const LIST_STAT_SUM_SQUARES: 7
/** Loop the texture animation. */
declare const LOOP: 2
declare const MASK_BASE: 0
/** Fold permissions for object inventory into results. */
declare const MASK_COMBINED: 16
declare const MASK_EVERYONE: 3
declare const MASK_GROUP: 2
declare const MASK_NEXT: 4
declare const MASK_OWNER: 1
/** Indicates a notecard read was attempted and the notecard was not yet cached on the server. */
declare const NAK: string
declare const NAVIGATE_TO_GOAL_REACHED_DIST: 2
declare const NULL_KEY: UUID
/**
 * Retrieves the account level of an avatar.
 * Returns 0 when the avatar has a basic account,
 *  1 when the avatar has a premium account,
 *  10 when the avatar has a premium plus account,
 *  or -1 if the object is not an avatar.
 */
declare const OBJECT_ACCOUNT_LEVEL: 41
/** This is a flag used with llGetObjectDetails to get the number of associated animated objects */
declare const OBJECT_ANIMATED_COUNT: 39
/** This is a flag used with llGetObjectDetails to get the number of additional animated object attachments allowed. */
declare const OBJECT_ANIMATED_SLOTS_AVAILABLE: 40
/**
 * Gets the attachment point to which the object is attached.
 * Returns 0 if the object is not an attachment (or is an avatar, etc).
 */
declare const OBJECT_ATTACHED_POINT: 19
/**
 * Returns the number of attachment slots available.
 * Returns 0 if the object is not an avatar or none are available.
 */
declare const OBJECT_ATTACHED_SLOTS_AVAILABLE: 35
/**
 * This is a flag used with llGetObjectDetails to get the body type of the avatar, based on shape data.
 * If no data is available, -1.0 is returned.
 * This is normally between 0 and 1.0, with 0.5 and larger considered 'male'
 */
declare const OBJECT_BODY_SHAPE_TYPE: 26
/** Units in seconds */
declare const OBJECT_CHARACTER_TIME: 17
/**
 * This is a flag used with llGetObjectDetails to get the click action.
 * The default is 0
 */
declare const OBJECT_CLICK_ACTION: 28
/** This is a flag used with llGetObjectDetails to get the time this object was created */
declare const OBJECT_CREATION_TIME: 36
/** Gets the object's creator key. If id is an avatar, a NULL_KEY is returned. */
declare const OBJECT_CREATOR: 8
/** Gets the damage value assigned to this object. */
declare const OBJECT_DAMAGE: 51
/** Gets the damage type, if any, assigned to this object. */
declare const OBJECT_DAMAGE_TYPE: 52
/** Gets the object's description. If id is an avatar, an empty string is returned. */
declare const OBJECT_DESC: 2
/** Gets the prims's group key. If id is an avatar, a NULL_KEY is returned. */
declare const OBJECT_GROUP: 7
/** Gets the agent's current group role tag. If id is an object, an empty is returned. */
declare const OBJECT_GROUP_TAG: 33
/** Gets current health value for the object. */
declare const OBJECT_HEALTH: 50
/**
 * This is a flag used with llGetObjectDetails to get hover height of the avatar
 * If no data is available, 0.0 is returned.
 */
declare const OBJECT_HOVER_HEIGHT: 25
/** Gets the object's last owner ID. */
declare const OBJECT_LAST_OWNER_ID: 27
/** Gets the object's link number or 0 if unlinked. */
declare const OBJECT_LINK_NUMBER: 46
/** Get the object's mass */
declare const OBJECT_MASS: 43
/** Get an object's material setting. */
declare const OBJECT_MATERIAL: 42
/** Gets the object's name. */
declare const OBJECT_NAME: 1
/** Gets an object's angular velocity. */
declare const OBJECT_OMEGA: 29
/** Gets an object's owner's key. If id is group owned, a NULL_KEY is returned. */
declare const OBJECT_OWNER: 6
/** Returns the pathfinding setting of any object in the region. It returns an integer matching one of the OPT_* constants. */
declare const OBJECT_PATHFINDING_TYPE: 20
/** Gets the objects permissions */
declare const OBJECT_PERMS: 53
/** Gets the object's permissions including any inventory. */
declare const OBJECT_PERMS_COMBINED: 54
/**
 * Returns boolean, detailing if phantom is enabled or disabled on the object.
 * If id is an avatar or attachment, 0 is returned.
 */
declare const OBJECT_PHANTOM: 22
/**
 * Returns boolean, detailing if physics is enabled or disabled on the object.
 * If id is an avatar or attachment, 0 is returned.
 */
declare const OBJECT_PHYSICS: 21
declare const OBJECT_PHYSICS_COST: 16
/** Gets the object's position in region coordinates. */
declare const OBJECT_POS: 3
/** Gets the prim count of the object.  The script and target object  must be owned by the same owner */
declare const OBJECT_PRIM_COUNT: 30
declare const OBJECT_PRIM_EQUIVALENCE: 13
/**
 * This is a flag used with llGetObjectDetails to get the Avatar_Rendering_Cost of an avatar, based on values reported by nearby viewers.
 * If no data is available, -1 is returned.
 * The maximum render weight stored by the simulator is 500000. When called against an object, 0 is returned.
 */
declare const OBJECT_RENDER_WEIGHT: 24
declare const OBJECT_RETURN_PARCEL: 1
declare const OBJECT_RETURN_PARCEL_OWNER: 2
declare const OBJECT_RETURN_REGION: 4
declare const OBJECT_REZZER_KEY: 32
/** Get the time when an object was rezzed. */
declare const OBJECT_REZ_TIME: 45
/**
 * Gets the id of the root prim of the object requested.
 * If id is an avatar, return the id of the root prim of the linkset the avatar is sitting on (or the avatar's own id if the avatar is not sitting on an object within the region).
 */
declare const OBJECT_ROOT: 18
/** Gets the object's rotation. */
declare const OBJECT_ROT: 4
declare const OBJECT_RUNNING_SCRIPT_COUNT: 9
/** Gets the object's size. */
declare const OBJECT_SCALE: 47
declare const OBJECT_SCRIPT_MEMORY: 11
declare const OBJECT_SCRIPT_TIME: 12
/** This is a flag used with llGetObjectDetails to get the number of avatars selecting any part of the object */
declare const OBJECT_SELECT_COUNT: 37
declare const OBJECT_SERVER_COST: 14
/** This is a flag used with llGetObjectDetails to get the number of avatars sitting on the object */
declare const OBJECT_SIT_COUNT: 38
declare const OBJECT_STREAMING_COST: 15
/** Returns boolean, indicating if object is a temp attachment. */
declare const OBJECT_TEMP_ATTACHED: 34
/** Returns boolean, detailing if temporary is enabled or disabled on the object. */
declare const OBJECT_TEMP_ON_REZ: 23
/** Gets an objects hover text. */
declare const OBJECT_TEXT: 44
/** Gets the alpha of an objects hover text. */
declare const OBJECT_TEXT_ALPHA: 49
/** Gets the color of an objects hover text. */
declare const OBJECT_TEXT_COLOR: 48
/** Gets the total inventory count of the object.  The script and target object must be owned by the same owner */
declare const OBJECT_TOTAL_INVENTORY_COUNT: 31
declare const OBJECT_TOTAL_SCRIPT_COUNT: 10
declare const OBJECT_UNKNOWN_DETAIL: -1
/** Gets the object's velocity. */
declare const OBJECT_VELOCITY: 5
/** Returned for avatars. */
declare const OPT_AVATAR: 1
/** Returned for pathfinding characters. */
declare const OPT_CHARACTER: 2
/** Returned for exclusion volumes. */
declare const OPT_EXCLUSION_VOLUME: 6
/** Returned for movable obstacles, movable phantoms, physical, and volumedetect objects. */
declare const OPT_LEGACY_LINKSET: 0
/** Returned for material volumes. */
declare const OPT_MATERIAL_VOLUME: 5
/** Returned for attachments, Linden trees, and grass. */
declare const OPT_OTHER: -1
/** Returned for static obstacles. */
declare const OPT_STATIC_OBSTACLE: 4
/** Returned for walkable objects. */
declare const OPT_WALKABLE: 3
declare const OVERRIDE_GLTF_BASE_ALPHA: 2
declare const OVERRIDE_GLTF_BASE_ALPHA_MASK: 4
declare const OVERRIDE_GLTF_BASE_ALPHA_MODE: 3
declare const OVERRIDE_GLTF_BASE_COLOR_FACTOR: 1
declare const OVERRIDE_GLTF_BASE_DOUBLE_SIDED: 5
declare const OVERRIDE_GLTF_EMISSIVE_FACTOR: 8
declare const OVERRIDE_GLTF_METALLIC_FACTOR: 6
declare const OVERRIDE_GLTF_ROUGHNESS_FACTOR: 7
declare const PARCEL_COUNT_GROUP: 2
declare const PARCEL_COUNT_OTHER: 3
declare const PARCEL_COUNT_OWNER: 1
declare const PARCEL_COUNT_SELECTED: 4
declare const PARCEL_COUNT_TEMP: 5
declare const PARCEL_COUNT_TOTAL: 0
/** The parcel's area, in square meters. (5 chars.). */
declare const PARCEL_DETAILS_AREA: 4
/** The description of the parcel. (127 chars). */
declare const PARCEL_DETAILS_DESC: 1
/** Flags set on the parcel */
declare const PARCEL_DETAILS_FLAGS: 12
/** The parcel group's key. (36 chars.). */
declare const PARCEL_DETAILS_GROUP: 3
/** The parcel's key. (36 chars.). */
declare const PARCEL_DETAILS_ID: 5
/** Lookat vector set for teleport routing. */
declare const PARCEL_DETAILS_LANDING_LOOKAT: 10
/** The parcel's landing point, if any. */
declare const PARCEL_DETAILS_LANDING_POINT: 9
/** The name of the parcel. (63 chars.). */
declare const PARCEL_DETAILS_NAME: 0
/** The parcel owner's key. (36 chars.). */
declare const PARCEL_DETAILS_OWNER: 2
/** The parcel's prim capacity. */
declare const PARCEL_DETAILS_PRIM_CAPACITY: 7
/** The number of prims used on this parcel. */
declare const PARCEL_DETAILS_PRIM_USED: 8
/** There are restrictions on this parcel that may impact script execution. */
declare const PARCEL_DETAILS_SCRIPT_DANGER: 13
/** The parcel's avatar visibility setting. (1 char.). */
declare const PARCEL_DETAILS_SEE_AVATARS: 6
/** Parcel's teleport routing setting. */
declare const PARCEL_DETAILS_TP_ROUTING: 11
declare const PARCEL_FLAG_ALLOW_ALL_OBJECT_ENTRY: 134217728
declare const PARCEL_FLAG_ALLOW_CREATE_GROUP_OBJECTS: 67108864
declare const PARCEL_FLAG_ALLOW_CREATE_OBJECTS: 64
declare const PARCEL_FLAG_ALLOW_DAMAGE: 32
declare const PARCEL_FLAG_ALLOW_FLY: 1
declare const PARCEL_FLAG_ALLOW_GROUP_OBJECT_ENTRY: 268435456
declare const PARCEL_FLAG_ALLOW_GROUP_SCRIPTS: 33554432
declare const PARCEL_FLAG_ALLOW_LANDMARK: 8
declare const PARCEL_FLAG_ALLOW_SCRIPTS: 2
declare const PARCEL_FLAG_ALLOW_TERRAFORM: 16
declare const PARCEL_FLAG_LINDEN_HOMES: 8388608
declare const PARCEL_FLAG_LOCAL_SOUND_ONLY: 32768
declare const PARCEL_FLAG_RESTRICT_PUSHOBJECT: 2097152
declare const PARCEL_FLAG_USE_ACCESS_GROUP: 256
declare const PARCEL_FLAG_USE_ACCESS_LIST: 512
declare const PARCEL_FLAG_USE_BAN_LIST: 1024
declare const PARCEL_FLAG_USE_LAND_PASS_LIST: 2048
declare const PARCEL_MEDIA_COMMAND_AGENT: 7
declare const PARCEL_MEDIA_COMMAND_AUTO_ALIGN: 9
/** Use this to get or set the parcel media description. */
declare const PARCEL_MEDIA_COMMAND_DESC: 12
declare const PARCEL_MEDIA_COMMAND_LOOP: 3
/** Used to get or set the parcel's media looping variable. */
declare const PARCEL_MEDIA_COMMAND_LOOP_SET: 13
declare const PARCEL_MEDIA_COMMAND_PAUSE: 1
declare const PARCEL_MEDIA_COMMAND_PLAY: 2
/** Use this to get or set the parcel media pixel resolution. */
declare const PARCEL_MEDIA_COMMAND_SIZE: 11
declare const PARCEL_MEDIA_COMMAND_STOP: 0
declare const PARCEL_MEDIA_COMMAND_TEXTURE: 4
declare const PARCEL_MEDIA_COMMAND_TIME: 6
/** Use this to get or set the parcel media MIME type (e.g. "text/html"). */
declare const PARCEL_MEDIA_COMMAND_TYPE: 10
declare const PARCEL_MEDIA_COMMAND_UNLOAD: 8
declare const PARCEL_MEDIA_COMMAND_URL: 5
/** The agent authorized to purchase the parcel. */
declare const PARCEL_SALE_AGENT: 2
/** Are the objects on the parcel included in the sale? */
declare const PARCEL_SALE_OBJECTS: 3
/** The price of the parcel. If no authorized agent is set, must be greater than 0. */
declare const PARCEL_SALE_PRICE: 1
/** The sale information was successfully set. */
declare const PARCEL_SALE_OK: 0
/** The parcel could not be found. */
declare const PARCEL_SALE_ERROR_NO_PARCEL: 1
/** The script does not have the required permissions to set the sale information. */
declare const PARCEL_SALE_ERROR_NO_PERMISSIONS: 2
/** The parcel is currently in escrow and cannot be set for sale. */
declare const PARCEL_SALE_ERROR_IN_ESCROW: 3
/** The price set for the parcel is invalid (e.g., less than or equal to 0). */
declare const PARCEL_SALE_ERROR_INVALID_PRICE: 4
/** The parameters provided to set the sale information are invalid. */
declare const PARCEL_SALE_ERROR_BAD_PARAMS: 5
/** Static in-world objects. */
declare const PASSIVE: 4
/** Always pass the event. */
declare const PASS_ALWAYS: 1
/** Pass the event if there is no script handling the event in the prim. */
declare const PASS_IF_NOT_HANDLED: 0
/** Always pass the event. */
declare const PASS_NEVER: 2
declare const PATROL_PAUSE_AT_WAYPOINTS: 0
declare const PAYMENT_INFO_ON_FILE: 1
declare const PAYMENT_INFO_USED: 2
declare const PAY_DEFAULT: -2
declare const PAY_HIDE: -1
/** If this permission is enabled, the object can successfully call llGiveMoney or llTransferLindenDollars to debit the owners account. */
declare const PERMISSION_DEBIT: 2
/** If this permission enabled, the object can successfully call the llTakeControls library call. */
declare const PERMISSION_TAKE_CONTROLS: 4
/** (not yet implemented) */
declare const PERMISSION_REMAP_CONTROLS: 8
/** If this permission is enabled, the object can successfully call llStartAnimation for the avatar that owns this. */
declare const PERMISSION_TRIGGER_ANIMATION: 16
/** If this permission is enabled, the object can successfully call llAttachToAvatar to attach to the given avatar. */
declare const PERMISSION_ATTACH: 32
/** (not yet implemented) */
declare const PERMISSION_RELEASE_OWNERSHIP: 64
/** If this permission is enabled, the object can successfully call llCreateLink, llBreakLink, and llBreakAllLinks to change links to other objects. */
declare const PERMISSION_CHANGE_LINKS: 128
/** (not yet implemented) */
declare const PERMISSION_CHANGE_JOINTS: 256
/** (not yet implemented) */
declare const PERMISSION_CHANGE_PERMISSIONS: 512
declare const PERMISSION_TRACK_CAMERA: 1024
declare const PERMISSION_CONTROL_CAMERA: 2048
declare const PERMISSION_TELEPORT: 4096
/** A script with this permission does not notify the object owner when it modifies estate access rules via llManageEstateAccess. */
declare const PERMISSION_SILENT_ESTATE_MANAGEMENT: 16384
/** Permission to override default animations. */
declare const PERMISSION_OVERRIDE_ANIMATIONS: 32768
declare const PERMISSION_RETURN_OBJECTS: 65536
/** Grants the script privileged access to land parcel functions, such as parcel sale. */
declare const PERMISSION_PRIVILEGED_LAND_ACCESS: 524288
declare const PERM_ALL: 2147483647
declare const PERM_COPY: 32768
declare const PERM_MODIFY: 16384
declare const PERM_MOVE: 524288
declare const PERM_TRANSFER: 8192
/** 3.14159265 - The number of radians in a semi-circle. */
declare const PI: number
/** Play animation going forwards, then backwards. */
declare const PING_PONG: 8
/** 1.57079633 - The number of radians in a quarter circle. */
declare const PI_BY_TWO: number
/**
 * Prim parameter for restricting manual standing for seated avatars in an experience.
 * Ignored if the avatar was not seated via a call to llSitOnLink.
 */
declare const PRIM_ALLOW_UNSIT: 39
/**
 * Prim parameter for materials using integer face, integer alpha_mode, integer alpha_cutoff.
 * Defines how the alpha channel of the diffuse texture should be rendered.
 * Valid options for alpha_mode are PRIM_ALPHA_MODE_BLEND, _NONE, _MASK, and _EMISSIVE.
 * alpha_cutoff is used only for PRIM_ALPHA_MODE_MASK.
 */
declare const PRIM_ALPHA_MODE: 38
/**
 * Prim parameter setting for PRIM_ALPHA_MODE.
 * Indicates that the diffuse texture's alpha channel should be rendered as alpha-blended.
 */
declare const PRIM_ALPHA_MODE_BLEND: 1
/**
 * Prim parameter setting for PRIM_ALPHA_MODE.
 * Indicates that the diffuse texture's alpha channel should be rendered as an emissivity mask.
 */
declare const PRIM_ALPHA_MODE_EMISSIVE: 3
/**
 * Prim parameter setting for PRIM_ALPHA_MODE.
 * Indicates that the diffuse texture's alpha channel should be rendered as fully opaque for alpha values above alpha_cutoff and fully transparent otherwise.
 */
declare const PRIM_ALPHA_MODE_MASK: 2
/**
 * Prim parameter setting for PRIM_ALPHA_MODE.
 * Indicates that the diffuse texture's alpha channel should be ignored.
 */
declare const PRIM_ALPHA_MODE_NONE: 0
declare const PRIM_BUMP_BARK: 4
declare const PRIM_BUMP_BLOBS: 12
declare const PRIM_BUMP_BRICKS: 5
declare const PRIM_BUMP_BRIGHT: 1
declare const PRIM_BUMP_CHECKER: 6
declare const PRIM_BUMP_CONCRETE: 7
declare const PRIM_BUMP_DARK: 2
declare const PRIM_BUMP_DISKS: 10
declare const PRIM_BUMP_GRAVEL: 11
declare const PRIM_BUMP_LARGETILE: 14
declare const PRIM_BUMP_NONE: 0
declare const PRIM_BUMP_SHINY: 19
declare const PRIM_BUMP_SIDING: 13
declare const PRIM_BUMP_STONE: 9
declare const PRIM_BUMP_STUCCO: 15
declare const PRIM_BUMP_SUCTION: 16
declare const PRIM_BUMP_TILE: 8
declare const PRIM_BUMP_WEAVE: 17
declare const PRIM_BUMP_WOOD: 3
/** @deprecated Not implemented. */
declare const PRIM_CAST_SHADOWS: 24
/** [PRIM_CLICK_ACTION, integer CLICK_ACTION_*] */
declare const PRIM_CLICK_ACTION: 43
/** Collision sound uuid and volume for this prim */
declare const PRIM_COLLISION_SOUND: 53
/** [PRIM_COLOR, integer face, vector color, float alpha]integer face – face number or ALL_SIDESvector color – color in RGB <R, G, B> (<0.0, 0.0, 0.0> = black, <1.0, 1.0, 1.0> = white)float alpha – from 0.0 (clear) to 1.0 (solid) (0.0 <= alpha <= 1.0) */
declare const PRIM_COLOR: 18
/** Damage and damage type assigned to this prim. */
declare const PRIM_DAMAGE: 51
/** [PRIM_DESC, string description] */
declare const PRIM_DESC: 28
/** [ PRIM_FLEXIBLE, integer boolean, integer softness, float gravity, float friction, float wind, float tension, vector force ]integer boolean – TRUE enables, FALSE disablesinteger softness – ranges from 0 to 3float gravity – ranges from -10.0 to 10.0float friction – ranges from 0.0 to 10.0float wind – ranges from 0.0 to 10.0float tension – ranges from 0.0 to 10.0vector force */
declare const PRIM_FLEXIBLE: 21
/** [ PRIM_FULLBRIGHT, integer face, integer boolean ] */
declare const PRIM_FULLBRIGHT: 20
/**
 * PRIM_GLOW is used to get or set the glow status of the face.
 * [ PRIM_GLOW, integer face, float intensity ]
 */
declare const PRIM_GLOW: 25
/** Prim parameter setting for PRIM_GLTF_BASE_COLOR alpha mode "BLEND". */
declare const PRIM_GLTF_ALPHA_MODE_BLEND: 1
/** Prim parameter setting for PRIM_GLTF_BASE_COLOR alpha mode "MASK". */
declare const PRIM_GLTF_ALPHA_MODE_MASK: 2
/** Prim parameter setting for PRIM_GLTF_BASE_COLOR alpha mode "OPAQUE". */
declare const PRIM_GLTF_ALPHA_MODE_OPAQUE: 0
/**
 * Prim parameter for materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color, integer alpha_mode, float alpha_cutoff, boolean double_sided.
 * Valid options for alpha_mode are PRIM_ALPHA_MODE_BLEND, _NONE, and _MASK.
 * alpha_cutoff is used only for PRIM_ALPHA_MODE_MASK.
 */
declare const PRIM_GLTF_BASE_COLOR: 48
/** Prim parameter for GLTF materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color */
declare const PRIM_GLTF_EMISSIVE: 46
/** Prim parameter for GLTF materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, float metallic_factor, float roughness_factor */
declare const PRIM_GLTF_METALLIC_ROUGHNESS: 47
/** Prim parameter for GLTF materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians */
declare const PRIM_GLTF_NORMAL: 45
/** Health value for this prim */
declare const PRIM_HEALTH: 52
declare const PRIM_HOLE_CIRCLE: 16
declare const PRIM_HOLE_DEFAULT: 0
declare const PRIM_HOLE_SQUARE: 32
declare const PRIM_HOLE_TRIANGLE: 48
/** [ PRIM_LINK_TARGET, integer link_target ]Used to get or set multiple links with a single PrimParameters call. */
declare const PRIM_LINK_TARGET: 34
/** [ PRIM_MATERIAL, integer PRIM_MATERIAL_* ] */
declare const PRIM_MATERIAL: 2
declare const PRIM_MATERIAL_DENSITY: 1
declare const PRIM_MATERIAL_FLESH: 4
declare const PRIM_MATERIAL_FRICTION: 2
declare const PRIM_MATERIAL_GLASS: 2
declare const PRIM_MATERIAL_GRAVITY_MULTIPLIER: 8
declare const PRIM_MATERIAL_LIGHT: 7
declare const PRIM_MATERIAL_METAL: 1
declare const PRIM_MATERIAL_PLASTIC: 5
declare const PRIM_MATERIAL_RESTITUTION: 4
declare const PRIM_MATERIAL_RUBBER: 6
declare const PRIM_MATERIAL_STONE: 0
declare const PRIM_MATERIAL_WOOD: 3
/** Boolean. Gets/Sets the default image state (the image that the user sees before a piece of media is active) for the chosen face. The default image is specified by Second Life's server for that media type. */
declare const PRIM_MEDIA_ALT_IMAGE_ENABLE: 0
/** Boolean. Gets/Sets whether auto-looping is enabled. */
declare const PRIM_MEDIA_AUTO_LOOP: 4
/** Boolean. Gets/Sets whether the media auto-plays when a Resident can view it. */
declare const PRIM_MEDIA_AUTO_PLAY: 5
/** Boolean. Gets/Sets whether auto-scaling is enabled. Auto-scaling forces the media to the full size of the texture. */
declare const PRIM_MEDIA_AUTO_SCALE: 6
/** Boolean. Gets/Sets whether clicking the media triggers auto-zoom and auto-focus on the media. */
declare const PRIM_MEDIA_AUTO_ZOOM: 7
/** Integer. Gets/Sets the style of controls. Can be either PRIM_MEDIA_CONTROLS_STANDARD or PRIM_MEDIA_CONTROLS_MINI. */
declare const PRIM_MEDIA_CONTROLS: 1
/** Mini web navigation controls; does not include an address bar. */
declare const PRIM_MEDIA_CONTROLS_MINI: 1
/** Standard web navigation controls. */
declare const PRIM_MEDIA_CONTROLS_STANDARD: 0
/** String. Gets/Sets the current url displayed on the chosen face. Changing this URL causes navigation. 1024 characters Maximum. */
declare const PRIM_MEDIA_CURRENT_URL: 2
/** Boolean. Gets/Sets whether the first click interaction is enabled. */
declare const PRIM_MEDIA_FIRST_CLICK_INTERACT: 8
/** Integer. Gets/Sets the height of the media in pixels. */
declare const PRIM_MEDIA_HEIGHT_PIXELS: 10
/** String. Gets/Sets the home URL for the chosen face. 1024 characters maximum. */
declare const PRIM_MEDIA_HOME_URL: 3
declare const PRIM_MEDIA_MAX_HEIGHT_PIXELS: 2048
declare const PRIM_MEDIA_MAX_URL_LENGTH: 1024
declare const PRIM_MEDIA_MAX_WHITELIST_COUNT: 64
declare const PRIM_MEDIA_MAX_WHITELIST_SIZE: 1024
declare const PRIM_MEDIA_MAX_WIDTH_PIXELS: 2048
declare const PRIM_MEDIA_PARAM_MAX: 14
/** Integer. Gets/Sets the permissions mask that control who can see the media control bar above the object:: PRIM_MEDIA_PERM_ANYONE, PRIM_MEDIA_PERM_GROUP, PRIM_MEDIA_PERM_NONE, PRIM_MEDIA_PERM_OWNER */
declare const PRIM_MEDIA_PERMS_CONTROL: 14
/** Integer. Gets/Sets the permissions mask that control who can interact with the object: PRIM_MEDIA_PERM_ANYONE, PRIM_MEDIA_PERM_GROUP, PRIM_MEDIA_PERM_NONE, PRIM_MEDIA_PERM_OWNER */
declare const PRIM_MEDIA_PERMS_INTERACT: 13
declare const PRIM_MEDIA_PERM_ANYONE: 4
declare const PRIM_MEDIA_PERM_GROUP: 2
declare const PRIM_MEDIA_PERM_NONE: 0
declare const PRIM_MEDIA_PERM_OWNER: 1
/** String. Gets/Sets the white-list as a string of escaped, comma-separated URLs. This string can hold up to 64 URLs or 1024 characters, whichever comes first. */
declare const PRIM_MEDIA_WHITELIST: 12
/** Boolean. Gets/Sets whether navigation is restricted to URLs in PRIM_MEDIA_WHITELIST. */
declare const PRIM_MEDIA_WHITELIST_ENABLE: 11
/** Integer. Gets/Sets the width of the media in pixels. */
declare const PRIM_MEDIA_WIDTH_PIXELS: 9
/** [ PRIM_NAME, string name ] */
declare const PRIM_NAME: 27
/** Prim parameter for materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians */
declare const PRIM_NORMAL: 37
/** [ PRIM_OMEGA, vector axis, float spinrate, float gain ]vector axis – arbitrary axis to rotate the object aroundfloat spinrate – rate of rotation in radians per secondfloat gain – also modulates the final spinrate and disables the rotation behavior if zero */
declare const PRIM_OMEGA: 32
/** [ PRIM_PHANTOM, integer boolean ] */
declare const PRIM_PHANTOM: 5
/** [ PRIM_PHYSICS, integer boolean ] */
declare const PRIM_PHYSICS: 3
/** Use the convex hull of the prim shape for physics (this is the default for mesh objects). */
declare const PRIM_PHYSICS_SHAPE_CONVEX: 2
/** Ignore this prim in the physics shape. NB: This cannot be applied to the root prim. */
declare const PRIM_PHYSICS_SHAPE_NONE: 1
/** Use the normal prim shape for physics (this is the default for all non-mesh objects). */
declare const PRIM_PHYSICS_SHAPE_PRIM: 0
/** Allows you to set the physics shape type of a prim via lsl. Permitted values are:PRIM_PHYSICS_SHAPE_NONE, PRIM_PHYSICS_SHAPE_PRIM, PRIM_PHYSICS_SHAPE_CONVEX */
declare const PRIM_PHYSICS_SHAPE_TYPE: 30
/** [ PRIM_POINT_LIGHT, integer boolean, vector linear_color, float intensity, float radius, float falloff ]integer boolean – TRUE enables, FALSE disablesvector linear_color – linear color in RGB <R, G, B&> (<0.0, 0.0, 0.0> = black, <1.0, 1.0, 1.0> = white)float intensity – ranges from 0.0 to 1.0float radius – ranges from 0.1 to 20.0float falloff – ranges from 0.01 to 2.0 */
declare const PRIM_POINT_LIGHT: 23
/** [ PRIM_POSITION, vector position ]vector position – position in region or local coordinates depending upon the situation */
declare const PRIM_POSITION: 6
/** [ PRIM_POS_LOCAL, vector position ]vector position - position in local coordinates */
declare const PRIM_POS_LOCAL: 33
/** [ PRIM_PROJECTOR, string texture, float fov, float focus, float ambiance ] */
declare const PRIM_PROJECTOR: 42
/** Allows you to configure the object as a custom-placed reflection probe, for image-based lighting (IBL). Only objects in the influence volume of the reflection probe object are affected. */
declare const PRIM_REFLECTION_PROBE: 44
/** This is a flag option used with llGetPrimitiveParams and related functions when the parameter is PRIM_REFLECTION_PROBE. When set, the reflection probe is a box. When unset, the reflection probe is a sphere. */
declare const PRIM_REFLECTION_PROBE_BOX: 1
/** This is a flag option used with llGetPrimitiveParams and related functions when the parameter is PRIM_REFLECTION_PROBE. When set, the reflection probe includes avatars in IBL effects. When unset, the reflection probe excludes avatars. */
declare const PRIM_REFLECTION_PROBE_DYNAMIC: 2
/** This is a flag option used with llGetPrimitiveParams and related functions when the parameter is PRIM_REFLECTION_PROBE. When set, the reflection probe acts as a mirror. */
declare const PRIM_REFLECTION_PROBE_MIRROR: 4
/** [ PRIM_RENDER_MATERIAL, integer face, string material ] */
declare const PRIM_RENDER_MATERIAL: 49
/** [ PRIM_ROT_LOCAL, rotation global_rot ] */
declare const PRIM_ROTATION: 8
/** [ PRIM_ROT_LOCAL, rotation local_rot ] */
declare const PRIM_ROT_LOCAL: 29
/**
 * Prim parameter for restricting manual sitting on this prim.
 * Sitting must be initiated via call to llSitOnLink.
 */
declare const PRIM_SCRIPTED_SIT_ONLY: 40
/** Mesh is animated. */
declare const PRIM_SCULPT_FLAG_ANIMESH: 32
/** Render inside out (inverts the normals). */
declare const PRIM_SCULPT_FLAG_INVERT: 64
/** Render an X axis mirror of the sculpty. */
declare const PRIM_SCULPT_FLAG_MIRROR: 128
declare const PRIM_SCULPT_TYPE_CYLINDER: 4
declare const PRIM_SCULPT_TYPE_MASK: 7
declare const PRIM_SCULPT_TYPE_MESH: 5
declare const PRIM_SCULPT_TYPE_PLANE: 3
declare const PRIM_SCULPT_TYPE_SPHERE: 1
declare const PRIM_SCULPT_TYPE_TORUS: 2
declare const PRIM_SHINY_HIGH: 3
declare const PRIM_SHINY_LOW: 1
declare const PRIM_SHINY_MEDIUM: 2
declare const PRIM_SHINY_NONE: 0
declare const PRIM_SIT_FLAGS: 50
/** [ PRIM_SIT_TARGET, integer boolean, vector offset, rotation rot ] */
declare const PRIM_SIT_TARGET: 41
/** [ PRIM_SIZE, vector size ] */
declare const PRIM_SIZE: 7
/** [ PRIM_SLICE, vector slice ] */
declare const PRIM_SLICE: 35
/** Prim parameter for materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color, integer glossy, integer environment */
declare const PRIM_SPECULAR: 36
declare const PRIM_TEMP_ON_REZ: 4
/** [ PRIM_TEXGEN, integer face, PRIM_TEXGEN_* ] */
declare const PRIM_TEXGEN: 22
declare const PRIM_TEXGEN_DEFAULT: 0
declare const PRIM_TEXGEN_PLANAR: 1
/** [ PRIM_TEXT, string text, vector color, float alpha ] */
declare const PRIM_TEXT: 26
/** [ PRIM_TEXTURE, integer face, string texture, vector repeats, vector offsets, float rotation_in_radians ] */
declare const PRIM_TEXTURE: 17
declare const PRIM_TYPE: 9
declare const PRIM_TYPE_BOX: 0
declare const PRIM_TYPE_CYLINDER: 1
declare const PRIM_TYPE_PRISM: 2
declare const PRIM_TYPE_RING: 6
declare const PRIM_TYPE_SCULPT: 7
declare const PRIM_TYPE_SPHERE: 3
declare const PRIM_TYPE_TORUS: 4
declare const PRIM_TYPE_TUBE: 5
/** Disables profiling */
declare const PROFILE_NONE: 0
/** Enables memory profiling */
declare const PROFILE_SCRIPT_MEMORY: 1
declare const PSYS_PART_BF_DEST_COLOR: 2
declare const PSYS_PART_BF_ONE: 0
declare const PSYS_PART_BF_ONE_MINUS_DEST_COLOR: 4
declare const PSYS_PART_BF_ONE_MINUS_SOURCE_ALPHA: 9
declare const PSYS_PART_BF_ONE_MINUS_SOURCE_COLOR: 5
declare const PSYS_PART_BF_SOURCE_ALPHA: 7
declare const PSYS_PART_BF_SOURCE_COLOR: 3
declare const PSYS_PART_BF_ZERO: 1
declare const PSYS_PART_BLEND_FUNC_DEST: 25
declare const PSYS_PART_BLEND_FUNC_SOURCE: 24
/** Particles bounce off of a plane at the objects Z height. */
declare const PSYS_PART_BOUNCE_MASK: 4
/** The particle glows. */
declare const PSYS_PART_EMISSIVE_MASK: 256
/** A float which determines the ending alpha of the object. */
declare const PSYS_PART_END_ALPHA: 4
/** A vector <r, g, b> which determines the ending color of the object. */
declare const PSYS_PART_END_COLOR: 3
declare const PSYS_PART_END_GLOW: 27
/** A vector <sx, sy, z>, which is the ending size of the particle billboard in meters (z is ignored). */
declare const PSYS_PART_END_SCALE: 6
/** Each particle that is emitted by the particle system is simulated based on the following flags. To use multiple flags, bitwise or (|) them together. */
declare const PSYS_PART_FLAGS: 0
/** The particle position is relative to the source objects position. */
declare const PSYS_PART_FOLLOW_SRC_MASK: 16
/** The particle orientation is rotated so the vertical axis faces towards the particle velocity. */
declare const PSYS_PART_FOLLOW_VELOCITY_MASK: 32
/** Interpolate both the color and alpha from the start value to the end value. */
declare const PSYS_PART_INTERP_COLOR_MASK: 1
/** Interpolate the particle scale from the start value to the end value. */
declare const PSYS_PART_INTERP_SCALE_MASK: 2
/** Age in seconds of a particle at which it dies. */
declare const PSYS_PART_MAX_AGE: 7
declare const PSYS_PART_RIBBON_MASK: 1024
/** A float which determines the starting alpha of the object. */
declare const PSYS_PART_START_ALPHA: 2
/** A vector <r, g, b> which determines the starting color of the object. */
declare const PSYS_PART_START_COLOR: 1
declare const PSYS_PART_START_GLOW: 26
/** A vector <sx, sy, z>, which is the starting size of the particle billboard in meters (z is ignored). */
declare const PSYS_PART_START_SCALE: 5
declare const PSYS_PART_TARGET_LINEAR_MASK: 128
/** The particle heads towards the location of the target object as defined by PSYS_SRC_TARGET_KEY. */
declare const PSYS_PART_TARGET_POS_MASK: 64
/** Particles have their velocity damped towards the wind velocity. */
declare const PSYS_PART_WIND_MASK: 8
/** A vector <x, y, z> which is the acceleration to apply on particles. */
declare const PSYS_SRC_ACCEL: 8
/** Area in radians specifying where particles will NOT be created (for ANGLE patterns) */
declare const PSYS_SRC_ANGLE_BEGIN: 22
/** Area in radians filled with particles (for ANGLE patterns) (if lower than PSYS_SRC_ANGLE_BEGIN, acts as PSYS_SRC_ANGLE_BEGIN itself, and PSYS_SRC_ANGLE_BEGIN acts as PSYS_SRC_ANGLE_END). */
declare const PSYS_SRC_ANGLE_END: 23
/** How many particles to release in a burst. */
declare const PSYS_SRC_BURST_PART_COUNT: 15
/** What distance from the center of the object to create the particles. */
declare const PSYS_SRC_BURST_RADIUS: 16
/** How often to release a particle burst (float seconds). */
declare const PSYS_SRC_BURST_RATE: 13
/** Maximum speed that a particle should be moving. */
declare const PSYS_SRC_BURST_SPEED_MAX: 18
/** Minimum speed that a particle should be moving. */
declare const PSYS_SRC_BURST_SPEED_MIN: 17
/** Specifies the inner angle of the arc created by the PSYS_SRC_PATTERN_ANGLE or PSYS_SRC_PATTERN_ANGLE_CONE source pattern.The area specified will NOT have particles in it. */
declare const PSYS_SRC_INNERANGLE: 10
/** How long this particle system should last, 0.0 means forever. */
declare const PSYS_SRC_MAX_AGE: 19
declare const PSYS_SRC_OBJ_REL_MASK: 1
/** Sets the angular velocity to rotate the axis that SRC_PATTERN_ANGLE and SRC_PATTERN_ANGLE_CONE use. */
declare const PSYS_SRC_OMEGA: 21
/** Specifies the outer angle of the arc created by the PSYS_SRC_PATTERN_ANGLE or PSYS_SRC_PATTERN_ANGLE_CONE source pattern.The area between the outer and inner angle will be filled with particles. */
declare const PSYS_SRC_OUTERANGLE: 11
/** The pattern which is used to generate particles.Use one of the following values: PSYS_SRC_PATTERN Values. */
declare const PSYS_SRC_PATTERN: 9
/** Shoot particles across a 2 dimensional area defined by the arc created from PSYS_SRC_OUTERANGLE. There will be an open area defined by PSYS_SRC_INNERANGLE within the larger arc. */
declare const PSYS_SRC_PATTERN_ANGLE: 4
/** Shoot particles out in a 3 dimensional cone with an outer arc of PSYS_SRC_OUTERANGLE and an inner open area defined by PSYS_SRC_INNERANGLE. */
declare const PSYS_SRC_PATTERN_ANGLE_CONE: 8
declare const PSYS_SRC_PATTERN_ANGLE_CONE_EMPTY: 16
/** Drop particles at the source position. */
declare const PSYS_SRC_PATTERN_DROP: 1
/** Shoot particles out in all directions, using the burst parameters. */
declare const PSYS_SRC_PATTERN_EXPLODE: 2
/** The key of a target object to move towards if PSYS_PART_TARGET_POS_MASK is enabled. */
declare const PSYS_SRC_TARGET_KEY: 20
/** An asset name for the texture to use for the particles. */
declare const PSYS_SRC_TEXTURE: 12
/** PUBLIC_CHANNEL is an integer constant that, when passed to llSay, llWhisper, or llShout as a channel parameter, will print text to the publicly heard chat channel. */
declare const PUBLIC_CHANNEL: 0
/** Selects a random destination near the offset. */
declare const PURSUIT_FUZZ_FACTOR: 3
declare const PURSUIT_GOAL_TOLERANCE: 5
/** Define whether the character attempts to predict the target's location. */
declare const PURSUIT_INTERCEPT: 4
/** Go to a position offset from the target. */
declare const PURSUIT_OFFSET: 1
/** Triggered when an llEvade character thinks it has hidden from its pursuer. */
declare const PU_EVADE_HIDDEN: 7
/** Triggered when an llEvade character switches from hiding to running */
declare const PU_EVADE_SPOTTED: 8
declare const PU_FAILURE_DYNAMIC_PATHFINDING_DISABLED: 10
/** Goal is not on the navigation-mesh and cannot be reached. */
declare const PU_FAILURE_INVALID_GOAL: 3
/** Character cannot navigate from the current location - e.g., the character is off the navmesh or too high above it. */
declare const PU_FAILURE_INVALID_START: 2
/** This is a fatal error reported to a character when there is no navmesh for the region. This usually indicates a server failure and users should file a bug report and include the time and region in which they received this message. */
declare const PU_FAILURE_NO_NAVMESH: 9
/** There is no good place for the character to go - e.g., it is patrolling and all the patrol points are now unreachable. */
declare const PU_FAILURE_NO_VALID_DESTINATION: 6
declare const PU_FAILURE_OTHER: 1000000
declare const PU_FAILURE_PARCEL_UNREACHABLE: 11
/** Target (for llPursue or llEvade) can no longer be tracked - e.g., it left the region or is an avatar that is now more than about 30m outside the region. */
declare const PU_FAILURE_TARGET_GONE: 5
/** Goal is no longer reachable for some reason - e.g., an obstacle blocks the path. */
declare const PU_FAILURE_UNREACHABLE: 4
/** Character has reached the goal and will stop or choose a new goal (if wandering). */
declare const PU_GOAL_REACHED: 1
/** Character is near current goal. */
declare const PU_SLOWDOWN_DISTANCE_REACHED: 0
/** 57.2957795 - Number of degrees per radian. You can use this number to convert radians to degrees by multiplying the radians by this number. */
declare const RAD_TO_DEG: number
declare const RCERR_CAST_TIME_EXCEEDED: -3
declare const RCERR_SIM_PERF_LOW: -2
declare const RCERR_UNKNOWN: -1
declare const RC_DATA_FLAGS: 2
declare const RC_DETECT_PHANTOM: 1
declare const RC_GET_LINK_NUM: 4
declare const RC_GET_NORMAL: 1
declare const RC_GET_ROOT_KEY: 2
declare const RC_MAX_HITS: 3
declare const RC_REJECT_AGENTS: 1
declare const RC_REJECT_LAND: 8
declare const RC_REJECT_NONPHYSICAL: 4
declare const RC_REJECT_PHYSICAL: 2
declare const RC_REJECT_TYPES: 0
declare const REGION_FLAG_ALLOW_DAMAGE: 1
declare const REGION_FLAG_ALLOW_DIRECT_TELEPORT: 1048576
declare const REGION_FLAG_BLOCK_FLY: 524288
declare const REGION_FLAG_BLOCK_FLYOVER: 134217728
declare const REGION_FLAG_BLOCK_TERRAFORM: 64
declare const REGION_FLAG_DISABLE_COLLISIONS: 4096
declare const REGION_FLAG_DISABLE_PHYSICS: 16384
declare const REGION_FLAG_FIXED_SUN: 16
declare const REGION_FLAG_RESTRICT_PUSHOBJECT: 4194304
declare const REGION_FLAG_SANDBOX: 256
/** @deprecated */
declare const REMOTE_DATA_CHANNEL: 1
/** @deprecated */
declare const REMOTE_DATA_REPLY: 3
/** @deprecated */
declare const REMOTE_DATA_REQUEST: 2
/** Define whether the character needs a line-of-sight to give chase. */
declare const REQUIRE_LINE_OF_SIGHT: 2
/** Used with llSetPhysicsMaterial to enable the density value. Must be between 0.0 and 1.0 */
declare const RESTITUTION: 4
/** Play animation in reverse direction. */
declare const REVERSE: 4
/** Acceleration forced applied to the rezzed object. [vector force, integer rel] */
declare const REZ_ACCEL: 5
/** Damage applied by the object when it collides with an agent. [float damage] */
declare const REZ_DAMAGE: 8
/** Set the damage type applied when this object collides. [integer damage_type] */
declare const REZ_DAMAGE_TYPE: 12
/** Rez flags to set on the newly rezzed object. [integer flags] */
declare const REZ_FLAGS: 1
/** Prevent grabbing the object. */
declare const REZ_FLAG_BLOCK_GRAB_OBJECT: 128
/** Object will die after its first collision. */
declare const REZ_FLAG_DIE_ON_COLLIDE: 8
/** Object will die if it attempts to enter a parcel that it can not. */
declare const REZ_FLAG_DIE_ON_NOENTRY: 16
/** Object will not trigger collision events with other objects created by the same rezzer. */
declare const REZ_FLAG_NO_COLLIDE_FAMILY: 64
/** Object will not trigger collision events with its owner. */
declare const REZ_FLAG_NO_COLLIDE_OWNER: 32
/** Make the object phantom on rez. */
declare const REZ_FLAG_PHANTOM: 4
/** Make the object physical on rez. */
declare const REZ_FLAG_PHYSICAL: 2
/** Flag the object as temp on rez. */
declare const REZ_FLAG_TEMP: 1
/** Prevent the object from rotating around some axes. [vector locks] */
declare const REZ_LOCK_AXES: 11
/** Omega applied to the rezzed object. [vector axis, integer rel, float spin, float gain] */
declare const REZ_OMEGA: 7
/** Integer value to pass to the object as its rez parameter. [integer param] */
declare const REZ_PARAM: 0
/** A string value to pass to the object as its rez parameter. [string param] */
declare const REZ_PARAM_STRING: 13
/** Position at which to rez the new object. [vector position, integer rel, integer atroot] */
declare const REZ_POS: 2
/** Rotation applied to newly rezzed object. [rotation rot, integer rel] */
declare const REZ_ROT: 3
/** Sound attached to the rezzed object. [string name, float volume, integer loop] */
declare const REZ_SOUND: 9
/** Sound played by the object on a collision. [string name, float volume] */
declare const REZ_SOUND_COLLIDE: 10
declare const REZ_TORQUE: 6
/** Initial velocity of rezzed object. [vector vel, integer rel, integer inherit] */
declare const REZ_VEL: 4
/** Animate texture rotation. */
declare const ROTATE: 32
/** Animate the texture scale. */
declare const SCALE: 64
/** Scripted in-world objects. */
declare const SCRIPTED: 8
/** Number of active scripts. */
declare const SIM_STAT_ACTIVE_SCRIPT_COUNT: 12
/** Number of agents in region. */
declare const SIM_STAT_AGENT_COUNT: 10
/** Time spent in 'agent' segment of simulation frame. */
declare const SIM_STAT_AGENT_MS: 7
/** Agent updates per second. */
declare const SIM_STAT_AGENT_UPDATES: 2
/** Time spent on AI step. */
declare const SIM_STAT_AI_MS: 26
/** Pending asset download count. */
declare const SIM_STAT_ASSET_DOWNLOADS: 15
/** Pending asset upload count. */
declare const SIM_STAT_ASSET_UPLOADS: 16
/** Number of child agents in region. */
declare const SIM_STAT_CHILD_AGENT_COUNT: 11
/** Total frame time. */
declare const SIM_STAT_FRAME_MS: 3
/** Time spent in 'image' segment of simulation frame. */
declare const SIM_STAT_IMAGE_MS: 8
/** Pump IO time. */
declare const SIM_STAT_IO_PUMP_MS: 24
/** Time spent in 'network' segment of simulation frame. */
declare const SIM_STAT_NET_MS: 4
/** Time spent in 'other' segment of simulation frame. */
declare const SIM_STAT_OTHER_MS: 5
/** Packets in per second. */
declare const SIM_STAT_PACKETS_IN: 13
/** Packets out per second. */
declare const SIM_STAT_PACKETS_OUT: 14
/**
 * Returns the % of pathfinding characters skipped each frame, averaged over the last minute.
 * The returned value corresponds to the "Characters Updated" stat in the viewer's Statistics Bar.
 */
declare const SIM_STAT_PCT_CHARS_STEPPED: 0
/** Physics simulation FPS. */
declare const SIM_STAT_PHYSICS_FPS: 1
/** Time spent in 'physics' segment of simulation frame. */
declare const SIM_STAT_PHYSICS_MS: 6
/** Physics other time. */
declare const SIM_STAT_PHYSICS_OTHER_MS: 20
/** Physics shape update time. */
declare const SIM_STAT_PHYSICS_SHAPE_MS: 19
/** Physics step time. */
declare const SIM_STAT_PHYSICS_STEP_MS: 18
/** Script events per second. */
declare const SIM_STAT_SCRIPT_EPS: 21
/** Time spent in 'script' segment of simulation frame. */
declare const SIM_STAT_SCRIPT_MS: 9
/** Percent of scripts run during frame. */
declare const SIM_STAT_SCRIPT_RUN_PCT: 25
/** Time spent sleeping. */
declare const SIM_STAT_SLEEP_MS: 23
/** Spare time left after frame. */
declare const SIM_STAT_SPARE_MS: 22
/** Total unacknowledged bytes. */
declare const SIM_STAT_UNACKED_BYTES: 17
/** The prim allows a seated avatar to stand up. */
declare const SIT_FLAG_ALLOW_UNSIT: 2
/** The seated avatar's hit box is disabled when seated on this prim. */
declare const SIT_FLAG_NO_COLLIDE: 16
/** Damage will not be forwarded to an avatar seated on this prim. */
declare const SIT_FLAG_NO_DAMAGE: 32
/** An avatar may not manually sit on this prim. */
declare const SIT_FLAG_SCRIPTED_ONLY: 4
/** The prim has an explicitly set sit target. */
declare const SIT_FLAG_SIT_TARGET: 1
/** Avatar ID did not specify a valid avatar. */
declare const SIT_INVALID_AGENT: -4
/** Link ID did not specify a valid prim in the linkset or resolved to multiple prims. */
declare const SIT_INVALID_LINK: -5
/** Attempt to force an avatar to sit on an attachment or other invalid target. */
declare const SIT_INVALID_OBJECT: -7
/** Attempt to force an avatar to sit outside an experience. */
declare const SIT_NOT_EXPERIENCE: -1
/** Avatar does not have access to the parcel containing the target linkset of the forced sit. */
declare const SIT_NO_ACCESS: -6
/** Avatar has not granted permission to force sits. */
declare const SIT_NO_EXPERIENCE_PERMISSION: -2
/** No available sit target in linkset for forced sit. */
declare const SIT_NO_SIT_TARGET: -3
declare const SKY_ABSORPTION_CONFIG: 16
/** The ambient color of the environment */
declare const SKY_AMBIENT: 0
/** Blue settings for environment */
declare const SKY_BLUE: 22
/** Settings controlling cloud density and configuration */
declare const SKY_CLOUDS: 2
/** Texture ID used by clouds */
declare const SKY_CLOUD_TEXTURE: 19
/** Counts for density profiles of each type. */
declare const SKY_DENSITY_PROFILE_COUNTS: 3
/** Sky dome information. */
declare const SKY_DOME: 4
/** The gamma value applied to the scene. */
declare const SKY_GAMMA: 5
/** Glow color applied to the sun and moon. */
declare const SKY_GLOW: 6
/** Haze settings for environment */
declare const SKY_HAZE: 23
/** Miscellaneous lighting values. */
declare const SKY_LIGHT: 8
/** MIE scatting profile parameters. */
declare const SKY_MIE_CONFIG: 17
/** Environmental moon details. */
declare const SKY_MOON: 9
/** Environmental moon texture. */
declare const SKY_MOON_TEXTURE: 20
/** Planet information used in rendering the sky. */
declare const SKY_PLANET: 10
/** Rayleigh scatting profile parameters. */
declare const SKY_RAYLEIGH_CONFIG: 18
/** Settings the ambience of the reflection probe. */
declare const SKY_REFLECTION_PROBE_AMBIANCE: 24
/** Sky refraction parameters for rainbows and optical effects. */
declare const SKY_REFRACTION: 11
/** Brightness value for the stars. */
declare const SKY_STAR_BRIGHTNESS: 13
/** Detailed sun information */
declare const SKY_SUN: 14
/** Environmental sun texture */
declare const SKY_SUN_TEXTURE: 21
/** Is the environment using the default textures. */
declare const SKY_TEXTURE_DEFAULTS: 1
/** Track elevations for this region. */
declare const SKY_TRACKS: 15
/** Slide in the X direction, instead of playing separate frames. */
declare const SMOOTH: 16
/** Sound will loop until stopped. */
declare const SOUND_LOOP: 1
/** Sound will play normally. */
declare const SOUND_PLAY: 0
/** Sound will be synchronized with the nearest master. */
declare const SOUND_SYNC: 4
/** Sound will be triggered at the prim's location and not attached. */
declare const SOUND_TRIGGER: 2
/** 1.41421356 - The square root of 2. */
declare const SQRT2: number
/**
 * Controls whether the object can be grabbed.
 * A grab is the default action when in third person, and is available as the hand tool in build mode. This is useful for physical objects that you don't want other people to be able to trivially disturb. The default is FALSE
 */
declare const STATUS_BLOCK_GRAB: 64
/** Prevent click-and-drag movement on all prims in the object. */
declare const STATUS_BLOCK_GRAB_OBJECT: 1024
/** Argument(s) passed to function had a bounds error. */
declare const STATUS_BOUNDS_ERROR: 1002
declare const STATUS_CAST_SHADOWS: 512
/**
 * Controls whether the object is returned to the owner's inventory if it wanders off the edge of the world.
 * It is useful to set this status TRUE for things like bullets or rockets. The default is TRUE
 */
declare const STATUS_DIE_AT_EDGE: 128
/**
 * Controls whether the object dies if it attempts to enter a parcel that does not allow object entry or does not have enough capacity.
 * It is useful to set this status TRUE for things like bullets or rockets. The default is FALSE
 */
declare const STATUS_DIE_AT_NO_ENTRY: 2048
/** An internal error occurred. */
declare const STATUS_INTERNAL_ERROR: 1999
/** Function was called with malformed parameters. */
declare const STATUS_MALFORMED_PARAMS: 1000
/** Object or other item was not found. */
declare const STATUS_NOT_FOUND: 1003
/** Feature not supported. */
declare const STATUS_NOT_SUPPORTED: 1004
/** Result of function call was a success. */
declare const STATUS_OK: 0
/**
 * Controls/indicates whether the object collides or not.
 * Setting the value to TRUE makes the object non-colliding with all objects. It is a good idea to use this for most objects that move or rotate, but are non-physical. It is also useful for simulating volumetric lighting. The default is FALSE.
 */
declare const STATUS_PHANTOM: 16
/**
 * Controls/indicates whether the object moves physically.
 * This controls the same flag that the UI check-box for Physical controls. The default is FALSE.
 */
declare const STATUS_PHYSICS: 1
declare const STATUS_RETURN_AT_EDGE: 256
declare const STATUS_ROTATE_X: 2
declare const STATUS_ROTATE_Y: 4
/** Controls/indicates whether the object can physically rotate aroundthe specific axis or not. This flag has no meaningfor non-physical objects. Set the value to FALSEif you want to disable rotation around that axis. Thedefault is TRUE for a physical object.A useful example to think about when visualizingthe effect is a sit-and-spin device. They spin around theZ axis (up) but not around the X or Y axis. */
declare const STATUS_ROTATE_Z: 8
/** Controls/indicates whether the object can cross region boundariesand move more than 20 meters from its creationpoint. The default if FALSE. */
declare const STATUS_SANDBOX: 32
/** Argument(s) passed to function had a type mismatch. */
declare const STATUS_TYPE_MISMATCH: 1001
/** Whitelist Failed. */
declare const STATUS_WHITELIST_FAILED: 2001
declare const STRING_TRIM: 3
declare const STRING_TRIM_HEAD: 1
declare const STRING_TRIM_TAIL: 2
/** Send email to the owner of the object */
declare const TARGETED_EMAIL_OBJECT_OWNER: 2
/** Send email to the creator of the root object */
declare const TARGETED_EMAIL_ROOT_CREATOR: 1
declare const TERRAIN_DETAIL_1: 0
declare const TERRAIN_DETAIL_2: 1
declare const TERRAIN_DETAIL_3: 2
declare const TERRAIN_DETAIL_4: 3
declare const TERRAIN_HEIGHT_RANGE_NE: 7
declare const TERRAIN_HEIGHT_RANGE_NW: 6
declare const TERRAIN_HEIGHT_RANGE_SE: 5
declare const TERRAIN_HEIGHT_RANGE_SW: 4
declare const TERRAIN_PBR_OFFSET_1: 16
declare const TERRAIN_PBR_OFFSET_2: 17
declare const TERRAIN_PBR_OFFSET_3: 18
declare const TERRAIN_PBR_OFFSET_4: 19
declare const TERRAIN_PBR_ROTATION_1: 12
declare const TERRAIN_PBR_ROTATION_2: 13
declare const TERRAIN_PBR_ROTATION_3: 14
declare const TERRAIN_PBR_ROTATION_4: 15
declare const TERRAIN_PBR_SCALE_1: 8
declare const TERRAIN_PBR_SCALE_2: 9
declare const TERRAIN_PBR_SCALE_3: 10
declare const TERRAIN_PBR_SCALE_4: 11
declare const TEXTURE_BLANK: UUID
declare const TEXTURE_DEFAULT: UUID
declare const TEXTURE_MEDIA: UUID
declare const TEXTURE_PLYWOOD: UUID
declare const TEXTURE_TRANSPARENT: UUID
declare const TOUCH_INVALID_FACE: -1
declare const TOUCH_INVALID_TEXCOORD: Vector
declare const TOUCH_INVALID_VECTOR: Vector
/** Direct teleporting is blocked on this parcel. */
declare const TP_ROUTING_BLOCKED: 0
/** Teleports are unrestricted on this parcel. */
declare const TP_ROUTING_FREE: 2
/** Teleports are routed to a landing point if set on this parcel. */
declare const TP_ROUTING_LANDINGP: 1
/** Invalid inventory options. */
declare const TRANSFER_BAD_OPTS: -1
/** The root path specified in TRANSFER_DEST contained an invalid directory or was reduced to nothing. */
declare const TRANSFER_BAD_ROOT: -5
/** The root folder to transfer inventory into. */
declare const TRANSFER_DEST: 0
/** Flags to control the behavior of inventory transfer. */
declare const TRANSFER_FLAGS: 1
/** Gives a copy of the object being transfered. Implies TRANSFER_FLAG_TAKE. */
declare const TRANSFER_FLAG_COPY: 4
/** Reserved for future expansion. */
declare const TRANSFER_FLAG_RESERVED: 1
/** On a successful transfer, automatically takes the object into inventory. */
declare const TRANSFER_FLAG_TAKE: 2
/** Can not transfer ownership of an attached object. */
declare const TRANSFER_NO_ATTACHMENT: -7
/** No items in the inventory list are eligible for transfer. */
declare const TRANSFER_NO_ITEMS: -4
/** The object does not have transfer permissions. */
declare const TRANSFER_NO_PERMS: -6
/** Could not find the receiver in the current region. */
declare const TRANSFER_NO_TARGET: -2
/** Inventory transfer offer was successfully made. */
declare const TRANSFER_OK: 0
/** Inventory throttle hit. */
declare const TRANSFER_THROTTLE: -3
/** One of TRAVERSAL_TYPE_FAST, TRAVERSAL_TYPE_SLOW, and TRAVERSAL_TYPE_NONE. */
declare const TRAVERSAL_TYPE: 7
declare const TRAVERSAL_TYPE_FAST: 1
declare const TRAVERSAL_TYPE_NONE: 2
declare const TRAVERSAL_TYPE_SLOW: 0
/** 6.28318530 - The radians of a circle. */
declare const TWO_PI: number
/**
 * The list entry is a float.
 * @deprecated Use '"number"' instead.
 */
declare const TYPE_FLOAT: 2
/**
 * The list entry is an integer.
 * @deprecated Use '"number"' instead.
 */
declare const TYPE_INTEGER: 1
/**
 * The list entry is invalid.
 * @deprecated Use 'nil' instead.
 */
declare const TYPE_INVALID: 0
/**
 * The list entry is a key.
 * @deprecated Use '"uuid"' instead.
 */
declare const TYPE_KEY: 4
/**
 * The list entry is a rotation.
 * @deprecated Use '"quaternion"' instead.
 */
declare const TYPE_ROTATION: 6
/**
 * The list entry is a string.
 * @deprecated Use '"string"' instead.
 */
declare const TYPE_STRING: 3
/**
 * The list entry is a vector.
 * @deprecated Use '"vector"' instead.
 */
declare const TYPE_VECTOR: 5
declare const URL_REQUEST_DENIED: string
declare const URL_REQUEST_GRANTED: string
/** A slider between minimum (0.0) and maximum (1.0) deflection of angular orientation. That is, its a simple scalar for modulating the strength of angular deflection such that the vehicles preferred axis of motion points toward its real velocity. */
declare const VEHICLE_ANGULAR_DEFLECTION_EFFICIENCY: 32
/** The time-scale for exponential success of linear deflection deflection. Its another way to specify the strength of the vehicles tendency to reorient itself so that its preferred axis of motion agrees with its true velocity. */
declare const VEHICLE_ANGULAR_DEFLECTION_TIMESCALE: 33
/** A vector of timescales for exponential decay of the vehicle's angular velocity about its preferred axes of motion (at, left, up).Range = [0.07, inf) seconds for each element of the vector. */
declare const VEHICLE_ANGULAR_FRICTION_TIMESCALE: 17
/** The timescale for exponential decay of the angular motors magnitude. */
declare const VEHICLE_ANGULAR_MOTOR_DECAY_TIMESCALE: 35
/** The direction and magnitude (in preferred frame) of the vehicle's angular motor. The vehicle will accelerate (or decelerate if necessary) to match its velocity to its motor. */
declare const VEHICLE_ANGULAR_MOTOR_DIRECTION: 19
/** The timescale for exponential approach to full angular motor velocity. */
declare const VEHICLE_ANGULAR_MOTOR_TIMESCALE: 34
/** A slider between anti (-1.0), none (0.0), and maxmum (1.0) banking strength. */
declare const VEHICLE_BANKING_EFFICIENCY: 38
/** A slider between static (0.0) and dynamic (1.0) banking. "Static" means the banking scales only with the angle of roll, whereas "dynamic" is a term that also scales with the vehicles linear speed. */
declare const VEHICLE_BANKING_MIX: 39
/** The timescale for banking to exponentially approach its maximum effect. This is another way to scale the strength of the banking effect, however it affects the term that is proportional to the difference between what the banking behavior is trying to do, and what the vehicle is actually doing. */
declare const VEHICLE_BANKING_TIMESCALE: 40
/** A slider between minimum (0.0) and maximum anti-gravity (1.0). */
declare const VEHICLE_BUOYANCY: 27
/** Prevent other scripts from pushing vehicle. */
declare const VEHICLE_FLAG_BLOCK_INTERFERENCE: 1024
declare const VEHICLE_FLAG_CAMERA_DECOUPLED: 512
/** Hover at global height. */
declare const VEHICLE_FLAG_HOVER_GLOBAL_HEIGHT: 16
/** Ignore water height when hovering. */
declare const VEHICLE_FLAG_HOVER_TERRAIN_ONLY: 8
/** Hover does not push down. Use this flag for hovering vehicles that should be able to jump above their hover height. */
declare const VEHICLE_FLAG_HOVER_UP_ONLY: 32
/** Ignore terrain height when hovering. */
declare const VEHICLE_FLAG_HOVER_WATER_ONLY: 4
/** Prevents ground vehicles from motoring into the sky. */
declare const VEHICLE_FLAG_LIMIT_MOTOR_UP: 64
/** For vehicles with vertical attractor that want to be able to climb/dive, for instance, aeroplanes that want to use the banking feature. */
declare const VEHICLE_FLAG_LIMIT_ROLL_ONLY: 2
declare const VEHICLE_FLAG_MOUSELOOK_BANK: 256
declare const VEHICLE_FLAG_MOUSELOOK_STEER: 128
/** This flag prevents linear deflection parallel to world z-axis. This is useful for preventing ground vehicles with large linear deflection, like bumper cars, from climbing their linear deflection into the sky. */
declare const VEHICLE_FLAG_NO_DEFLECTION_UP: 1
/**
 * Old, changed to VEHICLE_FLAG_NO_DEFLECTION_UP
 * @deprecated Use 'VEHICLE_FLAG_NO_DEFLECTION_UP' instead.
 */
declare const VEHICLE_FLAG_NO_FLY_UP: 1
/** A slider between minimum (0.0 = bouncy) and maximum (1.0 = fast as possible) damped motion of the hover behavior. */
declare const VEHICLE_HOVER_EFFICIENCY: 25
/** The height (above the terrain or water, or global) at which the vehicle will try to hover. */
declare const VEHICLE_HOVER_HEIGHT: 24
/** Period of time (in seconds) for the vehicle to achieve its hover height. */
declare const VEHICLE_HOVER_TIMESCALE: 26
/** A slider between minimum (0.0) and maximum (1.0) deflection of linear velocity. That is, its a simple scalar for modulating the strength of linear deflection. */
declare const VEHICLE_LINEAR_DEFLECTION_EFFICIENCY: 28
/** The timescale for exponential success of linear deflection deflection. It is another way to specify how much time it takes for the vehicle's linear velocity to be redirected to its preferred axis of motion. */
declare const VEHICLE_LINEAR_DEFLECTION_TIMESCALE: 29
/** A vector of timescales for exponential decay of the vehicle's linear velocity along its preferred axes of motion (at, left, up).Range = [0.07, inf) seconds for each element of the vector. */
declare const VEHICLE_LINEAR_FRICTION_TIMESCALE: 16
/** The timescale for exponential decay of the linear motors magnitude. */
declare const VEHICLE_LINEAR_MOTOR_DECAY_TIMESCALE: 31
/** The direction and magnitude (in preferred frame) of the vehicle's linear motor. The vehicle will accelerate (or decelerate if necessary) to match its velocity to its motor.Range of magnitude = [0, 30] meters/second. */
declare const VEHICLE_LINEAR_MOTOR_DIRECTION: 18
declare const VEHICLE_LINEAR_MOTOR_OFFSET: 20
/** The timescale for exponential approach to full linear motor velocity. */
declare const VEHICLE_LINEAR_MOTOR_TIMESCALE: 30
/** A rotation of the vehicle's preferred axes of motion and orientation (at, left, up) with respect to the vehicle's local frame (x, y, z). */
declare const VEHICLE_REFERENCE_FRAME: 44
/**
 * Uses linear deflection for lift, no hover, and banking to turn.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_AIRPLANE
 */
declare const VEHICLE_TYPE_AIRPLANE: 4
/**
 * Hover, and friction, but no deflection.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_BALLOON
 */
declare const VEHICLE_TYPE_BALLOON: 5
/**
 * Hovers over water with lots of friction and some anglar deflection.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_BOAT
 */
declare const VEHICLE_TYPE_BOAT: 3
/**
 * Another vehicle that bounces along the ground but needs the motors to be driven from external controls or timer events.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_CAR
 */
declare const VEHICLE_TYPE_CAR: 2
declare const VEHICLE_TYPE_NONE: 0
/**
 * Simple vehicle that bumps along the ground, and likes to move along its local x-axis.
 * See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_SLED
 */
declare const VEHICLE_TYPE_SLED: 1
/** A slider between minimum (0.0 = wobbly) and maximum (1.0 = firm as possible) stability of the vehicle to keep itself upright. */
declare const VEHICLE_VERTICAL_ATTRACTION_EFFICIENCY: 36
/** The period of wobble, or timescale for exponential approach, of the vehicle to rotate such that its preferred "up" axis is oriented along the world's "up" axis. */
declare const VEHICLE_VERTICAL_ATTRACTION_TIMESCALE: 37
declare const VERTICAL: 0
declare const WANDER_PAUSE_AT_WAYPOINTS: 0
/** Blur factor. */
declare const WATER_BLUR_MULTIPLIER: 100
/** Fog properties when underwater. */
declare const WATER_FOG: 101
/** Fresnel scattering applied to the surface of the water. */
declare const WATER_FRESNEL: 102
/** Scaling applied to the water normal map. */
declare const WATER_NORMAL_SCALE: 104
/** Normal map used for environmental waves. */
declare const WATER_NORMAL_TEXTURE: 107
/** Refraction factors when looking through the surface of the water. */
declare const WATER_REFRACTION: 105
/** Is the environment using the default wave map. */
declare const WATER_TEXTURE_DEFAULTS: 103
/** Vectors for the directions of the waves. */
declare const WATER_WAVE_DIRECTION: 106
/** The region currently has experiences disabled. */
declare const XP_ERROR_EXPERIENCES_DISABLED: 2
/** The experience owner has temporarily disabled the experience. */
declare const XP_ERROR_EXPERIENCE_DISABLED: 8
/** The experience has been suspended by Linden Customer Support. */
declare const XP_ERROR_EXPERIENCE_SUSPENDED: 9
/** The script is associated with an experience that no longer exists. */
declare const XP_ERROR_INVALID_EXPERIENCE: 7
/** One of the string arguments was too big to fit in the key-value store. */
declare const XP_ERROR_INVALID_PARAMETERS: 3
/** The requested key does not exist. */
declare const XP_ERROR_KEY_NOT_FOUND: 14
/** The content rating of the experience exceeds that of the region. */
declare const XP_ERROR_MATURITY_EXCEEDED: 16
/** No error was detected. */
declare const XP_ERROR_NONE: 0
/** The sim was unable to verify the validity of the experience. Retrying after a short wait is advised. */
declare const XP_ERROR_NOT_FOUND: 6
/** This experience is not allowed to run by the requested agent. */
declare const XP_ERROR_NOT_PERMITTED: 4
/** This experience is not allowed to run on the current region. */
declare const XP_ERROR_NOT_PERMITTED_LAND: 17
/** This script is not associated with an experience. */
declare const XP_ERROR_NO_EXPERIENCE: 5
/** An attempted write data to the key-value store failed due to the data quota being met. */
declare const XP_ERROR_QUOTA_EXCEEDED: 11
/** Request timed out; permissions not modified. */
declare const XP_ERROR_REQUEST_PERM_TIMEOUT: 18
/** A checked update failed due to an out of date request. */
declare const XP_ERROR_RETRY_UPDATE: 15
/** Unable to communicate with the key-value store. */
declare const XP_ERROR_STORAGE_EXCEPTION: 13
/** The key-value store is currently disabled on this region. */
declare const XP_ERROR_STORE_DISABLED: 12
/** The call failed due to too many recent calls. */
declare const XP_ERROR_THROTTLED: 1
/** Other unknown error. */
declare const XP_ERROR_UNKNOWN_ERROR: 10
declare const ZERO_ROTATION: Quaternion
declare const ZERO_VECTOR: Vector

/** Return type for ll.GetExperienceDetails — always 6 elements. */
type ExperienceDetails = [
  name: string,
  ownerId: UUID,
  experienceId: UUID,
  state: number,
  stateMessage: string,
  groupId: UUID,
]

/** Return type for ll.DetectedDamage — always 3 elements. */
type DamageDetails = [damage: number, damageType: number, originalDamage: number]

/** Return type for ll.GetPhysicsMaterial — always 4 elements. */
type PhysicsMaterial = [
  gravityMultiplier: number,
  restitution: number,
  friction: number,
  density: number,
]

/** Repeating [agent, landImpact] pairs from ll.GetParcelPrimOwners. */
type ParcelPrimOwners = [...ParcelPrimOwnerStride, ...ParcelPrimOwners] | []
type ParcelPrimOwnerStride = [agent: UUID, landImpact: number]

/** Hit stride with no data flags. */
type CastRayHit = [uuid: UUID, pos: Vector]
/** Hit stride with RC_GET_NORMAL. */
type CastRayHitNormal = [uuid: UUID, pos: Vector, normal: Vector]
/** Hit stride with RC_GET_LINK_NUM. */
type CastRayHitLink = [uuid: UUID, pos: Vector, link: number]
/** Hit stride with RC_GET_NORMAL | RC_GET_LINK_NUM. */
type CastRayHitBoth = [uuid: UUID, pos: Vector, normal: Vector, link: number]

/** Repeating hit strides followed by a status code. */
type CastRayHits<Hit extends unknown[]> = [...Hit, ...CastRayHits<Hit>] | [status: number] | []

/** Maps RC_DATA_FLAGS value to the corresponding result type. */
type CastRayResult<Opts extends CastRayParamOptions> = Opts extends { dataFlags: 5 | 7 }
  ? CastRayHits<CastRayHitBoth>
  : Opts extends { dataFlags: 4 | 6 }
    ? CastRayHits<CastRayHitLink>
    : Opts extends { dataFlags: 1 | 3 }
      ? CastRayHits<CastRayHitNormal>
      : CastRayHits<CastRayHit>
/** Branded error type that surfaces a human-readable message in diagnostics. */
type TypedListError<Msg extends string> = { [K in `__error: ${Msg}`]: never }

/** Maps each constant to the tuple of arguments that follow it. */
interface PrimParamMap {
  [PRIM_NAME]: [name: string]
  [PRIM_DESC]: [description: string]
  [PRIM_SLICE]: [slice: Vector]
  [PRIM_PHYSICS_SHAPE_TYPE]: [type: number]
  [PRIM_MATERIAL]: [flag: number]
  [PRIM_PHYSICS]: [enabled: boolean]
  [PRIM_TEMP_ON_REZ]: [enabled: boolean]
  [PRIM_PHANTOM]: [enabled: boolean]
  [PRIM_POSITION]: [position: Vector]
  [PRIM_POS_LOCAL]: [position: Vector]
  [PRIM_ROTATION]: [rot: Quaternion]
  [PRIM_ROT_LOCAL]: [rot: Quaternion]
  [PRIM_SIZE]: [size: Vector]
  [PRIM_TEXTURE]: [
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
  ]
  [PRIM_RENDER_MATERIAL]: [face: number, renderMaterial: string]
  [PRIM_TEXT]: [text: string, color: Vector, alpha: number]
  [PRIM_COLOR]: [face: number, color: Vector, alpha: number]
  [PRIM_BUMP_SHINY]: [face: number, shiny: number, bump: number]
  [PRIM_POINT_LIGHT]: [
    enabled: boolean,
    linearColor: Vector,
    intensity: number,
    radius: number,
    falloff: number,
  ]
  [PRIM_REFLECTION_PROBE]: [enabled: boolean, ambiance: number, clipDistance: number, flags: number]
  [PRIM_FULLBRIGHT]: [face: number, enabled: boolean]
  [PRIM_FLEXIBLE]: [
    enabled: boolean,
    softness: number,
    gravity: number,
    friction: number,
    wind: number,
    tension: number,
    force: Vector,
  ]
  [PRIM_TEXGEN]: [face: number, type: number]
  [PRIM_GLOW]: [face: number, intensity: number]
  [PRIM_OMEGA]: [axis: Vector, spinrate: number, gain: number]
  [PRIM_NORMAL]: [
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
  ]
  [PRIM_SPECULAR]: [
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
    color: Vector,
    glossiness: number,
    environment: number,
  ]
  [PRIM_ALPHA_MODE]: [face: number, alphaMode: number, maskCutoff: number]
  [PRIM_LINK_TARGET]: [linkTarget: number]
  [PRIM_CAST_SHADOWS]: [enabled: boolean]
  [PRIM_ALLOW_UNSIT]: [enabled: boolean]
  [PRIM_SCRIPTED_SIT_ONLY]: [enabled: boolean]
  [PRIM_SIT_TARGET]: [enabled: boolean, offset: Vector, rot: Quaternion]
  [PRIM_PROJECTOR]: [texture: string, fov: number, focus: number, ambiance: number]
  [PRIM_CLICK_ACTION]: [action: number]
  [PRIM_GLTF_BASE_COLOR]: [
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
    linearColor: Vector,
    alpha: number,
    gltfAlphaMode: number,
    alphaMaskCutoff: number,
    doubleSided: number,
  ]
  [PRIM_GLTF_NORMAL]: [
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
  ]
  [PRIM_GLTF_METALLIC_ROUGHNESS]: [
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
    metallicFactor: number,
    roughnessFactor: number,
  ]
  [PRIM_GLTF_EMISSIVE]: [
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
    linearEmissiveTint: Vector,
  ]
  [PRIM_SIT_FLAGS]: [flags: number]
  [PRIM_DAMAGE]: [damage: number, damageType: number]
  [PRIM_HEALTH]: [health: number]
}

/** Reverse map from numeric value to constant name for error messages. */
interface PrimParamNameMap {
  27: "PRIM_NAME"
  28: "PRIM_DESC"
  35: "PRIM_SLICE"
  30: "PRIM_PHYSICS_SHAPE_TYPE"
  2: "PRIM_MATERIAL"
  3: "PRIM_PHYSICS"
  4: "PRIM_TEMP_ON_REZ"
  5: "PRIM_PHANTOM"
  6: "PRIM_POSITION"
  33: "PRIM_POS_LOCAL"
  8: "PRIM_ROTATION"
  29: "PRIM_ROT_LOCAL"
  7: "PRIM_SIZE"
  17: "PRIM_TEXTURE"
  49: "PRIM_RENDER_MATERIAL"
  26: "PRIM_TEXT"
  18: "PRIM_COLOR"
  19: "PRIM_BUMP_SHINY"
  23: "PRIM_POINT_LIGHT"
  44: "PRIM_REFLECTION_PROBE"
  20: "PRIM_FULLBRIGHT"
  21: "PRIM_FLEXIBLE"
  22: "PRIM_TEXGEN"
  25: "PRIM_GLOW"
  32: "PRIM_OMEGA"
  37: "PRIM_NORMAL"
  36: "PRIM_SPECULAR"
  38: "PRIM_ALPHA_MODE"
  34: "PRIM_LINK_TARGET"
  24: "PRIM_CAST_SHADOWS"
  39: "PRIM_ALLOW_UNSIT"
  40: "PRIM_SCRIPTED_SIT_ONLY"
  41: "PRIM_SIT_TARGET"
  42: "PRIM_PROJECTOR"
  43: "PRIM_CLICK_ACTION"
  48: "PRIM_GLTF_BASE_COLOR"
  45: "PRIM_GLTF_NORMAL"
  47: "PRIM_GLTF_METALLIC_ROUGHNESS"
  46: "PRIM_GLTF_EMISSIVE"
  50: "PRIM_SIT_FLAGS"
  51: "PRIM_DAMAGE"
  52: "PRIM_HEALTH"
}

/** Maps each sub-dispatch constant to the tuple of arguments that follow it. */
interface PrimTypeShapeMap {
  [PRIM_TYPE_BOX]: [
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    topSize: Vector,
    topShear: Vector,
  ]
  [PRIM_TYPE_CYLINDER]: [
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    topSize: Vector,
    topShear: Vector,
  ]
  [PRIM_TYPE_PRISM]: [
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    topSize: Vector,
    topShear: Vector,
  ]
  [PRIM_TYPE_SPHERE]: [
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    dimple: Vector,
  ]
  [PRIM_TYPE_TORUS]: [
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    holeSize: Vector,
    topShear: Vector,
    advancedCut: Vector,
    taper: Vector,
    revolutions: number,
    radiusOffset: number,
    skew: number,
  ]
  [PRIM_TYPE_TUBE]: [
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    holeSize: Vector,
    topShear: Vector,
    advancedCut: Vector,
    taper: Vector,
    revolutions: number,
    radiusOffset: number,
    skew: number,
  ]
  [PRIM_TYPE_RING]: [
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    holeSize: Vector,
    topShear: Vector,
    advancedCut: Vector,
    taper: Vector,
    revolutions: number,
    radiusOffset: number,
    skew: number,
  ]
  [PRIM_TYPE_SCULPT]: [map: string, type: number]
}

/** Reverse map from numeric value to constant name for error messages. */
interface PrimTypeShapeNameMap {
  0: "PRIM_TYPE_BOX"
  1: "PRIM_TYPE_CYLINDER"
  2: "PRIM_TYPE_PRISM"
  3: "PRIM_TYPE_SPHERE"
  4: "PRIM_TYPE_TORUS"
  5: "PRIM_TYPE_TUBE"
  6: "PRIM_TYPE_RING"
  7: "PRIM_TYPE_SCULPT"
}

/** Recursive type that validates a flat parameter list for PrimParam constants. */
type ParsePrimParams<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends typeof PRIM_TYPE
      ? Rest extends readonly [infer S, ...infer ShapeRest]
        ? S extends keyof PrimTypeShapeMap
          ? ShapeRest extends readonly [...PrimTypeShapeMap[S], ...infer Remaining]
            ? [flag: K, shape: S, ...PrimTypeShapeMap[S], ...ParsePrimParams<Remaining>]
            : TypedListError<`invalid arguments after ${PrimTypeShapeNameMap[S & keyof PrimTypeShapeNameMap]}`>
          : TypedListError<`unknown shape type ${S & (string | number)}`>
        : never
      : K extends keyof PrimParamMap
        ? Rest extends readonly [...PrimParamMap[K], ...infer Remaining]
          ? [flag: K, ...PrimParamMap[K], ...ParsePrimParams<Remaining>]
          : TypedListError<`invalid arguments after ${PrimParamNameMap[K & keyof PrimParamNameMap]}`>
        : TypedListError<`unknown parameter flag ${K & (string | number)}`>
    : never

/** Maps each constant to the tuple of arguments that follow it. */
interface PrimParamGetMap {
  [PRIM_NAME]: []
  [PRIM_DESC]: []
  [PRIM_TYPE]: []
  [PRIM_SLICE]: []
  [PRIM_PHYSICS_SHAPE_TYPE]: []
  [PRIM_MATERIAL]: []
  [PRIM_PHYSICS]: []
  [PRIM_TEMP_ON_REZ]: []
  [PRIM_PHANTOM]: []
  [PRIM_POSITION]: []
  [PRIM_POS_LOCAL]: []
  [PRIM_ROTATION]: []
  [PRIM_ROT_LOCAL]: []
  [PRIM_SIZE]: []
  [PRIM_TEXTURE]: [face: number]
  [PRIM_RENDER_MATERIAL]: [face: number]
  [PRIM_TEXT]: []
  [PRIM_COLOR]: [face: number]
  [PRIM_BUMP_SHINY]: [face: number]
  [PRIM_FULLBRIGHT]: [face: number]
  [PRIM_FLEXIBLE]: []
  [PRIM_TEXGEN]: [face: number]
  [PRIM_POINT_LIGHT]: []
  [PRIM_REFLECTION_PROBE]: []
  [PRIM_GLOW]: [face: number]
  [PRIM_OMEGA]: []
  [PRIM_NORMAL]: [face: number]
  [PRIM_SPECULAR]: [face: number]
  [PRIM_ALPHA_MODE]: [face: number]
  [PRIM_LINK_TARGET]: [linkTarget: number]
  [PRIM_CAST_SHADOWS]: []
  [PRIM_ALLOW_UNSIT]: []
  [PRIM_SCRIPTED_SIT_ONLY]: []
  [PRIM_SIT_TARGET]: []
  [PRIM_PROJECTOR]: []
  [PRIM_CLICK_ACTION]: []
  [PRIM_GLTF_BASE_COLOR]: [face: number]
  [PRIM_GLTF_NORMAL]: [face: number]
  [PRIM_GLTF_METALLIC_ROUGHNESS]: [face: number]
  [PRIM_GLTF_EMISSIVE]: [face: number]
  [PRIM_SIT_FLAGS]: []
  [PRIM_DAMAGE]: []
  [PRIM_HEALTH]: []
}

/** Reverse map from numeric value to constant name for error messages. */
interface PrimParamGetNameMap {
  27: "PRIM_NAME"
  28: "PRIM_DESC"
  9: "PRIM_TYPE"
  35: "PRIM_SLICE"
  30: "PRIM_PHYSICS_SHAPE_TYPE"
  2: "PRIM_MATERIAL"
  3: "PRIM_PHYSICS"
  4: "PRIM_TEMP_ON_REZ"
  5: "PRIM_PHANTOM"
  6: "PRIM_POSITION"
  33: "PRIM_POS_LOCAL"
  8: "PRIM_ROTATION"
  29: "PRIM_ROT_LOCAL"
  7: "PRIM_SIZE"
  17: "PRIM_TEXTURE"
  49: "PRIM_RENDER_MATERIAL"
  26: "PRIM_TEXT"
  18: "PRIM_COLOR"
  19: "PRIM_BUMP_SHINY"
  20: "PRIM_FULLBRIGHT"
  21: "PRIM_FLEXIBLE"
  22: "PRIM_TEXGEN"
  23: "PRIM_POINT_LIGHT"
  44: "PRIM_REFLECTION_PROBE"
  25: "PRIM_GLOW"
  32: "PRIM_OMEGA"
  37: "PRIM_NORMAL"
  36: "PRIM_SPECULAR"
  38: "PRIM_ALPHA_MODE"
  34: "PRIM_LINK_TARGET"
  24: "PRIM_CAST_SHADOWS"
  39: "PRIM_ALLOW_UNSIT"
  40: "PRIM_SCRIPTED_SIT_ONLY"
  41: "PRIM_SIT_TARGET"
  42: "PRIM_PROJECTOR"
  43: "PRIM_CLICK_ACTION"
  48: "PRIM_GLTF_BASE_COLOR"
  45: "PRIM_GLTF_NORMAL"
  47: "PRIM_GLTF_METALLIC_ROUGHNESS"
  46: "PRIM_GLTF_EMISSIVE"
  50: "PRIM_SIT_FLAGS"
  51: "PRIM_DAMAGE"
  52: "PRIM_HEALTH"
}

/** Recursive type that validates a flat parameter list for PrimParamGet constants. */
type ParsePrimParamGets<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof PrimParamGetMap
      ? Rest extends readonly [...PrimParamGetMap[K], ...infer Remaining]
        ? [flag: K, ...PrimParamGetMap[K], ...ParsePrimParamGets<Remaining>]
        : TypedListError<`invalid arguments after ${PrimParamGetNameMap[K & keyof PrimParamGetNameMap]}`>
      : TypedListError<`unknown parameter flag ${K & (string | number)}`>
    : never

/** Maps each PrimParamGet constant to the tuple of values it returns. */
interface PrimParamGetReturnMap {
  [PRIM_NAME]: [name: string | undefined]
  [PRIM_DESC]: [description: string | undefined]
  [PRIM_TYPE]:
    | [
        type: typeof PRIM_TYPE_BOX,
        holeShape: number | undefined,
        cut: Vector | undefined,
        hollow: number | undefined,
        twist: Vector | undefined,
        topSize: Vector | undefined,
        topShear: Vector | undefined,
      ]
    | [
        type: typeof PRIM_TYPE_CYLINDER,
        holeShape: number | undefined,
        cut: Vector | undefined,
        hollow: number | undefined,
        twist: Vector | undefined,
        topSize: Vector | undefined,
        topShear: Vector | undefined,
      ]
    | [
        type: typeof PRIM_TYPE_PRISM,
        holeShape: number | undefined,
        cut: Vector | undefined,
        hollow: number | undefined,
        twist: Vector | undefined,
        topSize: Vector | undefined,
        topShear: Vector | undefined,
      ]
    | [
        type: typeof PRIM_TYPE_SPHERE,
        holeShape: number | undefined,
        cut: Vector | undefined,
        hollow: number | undefined,
        twist: Vector | undefined,
        dimple: Vector | undefined,
      ]
    | [
        type: typeof PRIM_TYPE_TORUS,
        holeShape: number | undefined,
        cut: Vector | undefined,
        hollow: number | undefined,
        twist: Vector | undefined,
        holeSize: Vector | undefined,
        topShear: Vector | undefined,
        advancedCut: Vector | undefined,
        taper: Vector | undefined,
        revolutions: number | undefined,
        radiusOffset: number | undefined,
        skew: number | undefined,
      ]
    | [
        type: typeof PRIM_TYPE_TUBE,
        holeShape: number | undefined,
        cut: Vector | undefined,
        hollow: number | undefined,
        twist: Vector | undefined,
        holeSize: Vector | undefined,
        topShear: Vector | undefined,
        advancedCut: Vector | undefined,
        taper: Vector | undefined,
        revolutions: number | undefined,
        radiusOffset: number | undefined,
        skew: number | undefined,
      ]
    | [
        type: typeof PRIM_TYPE_RING,
        holeShape: number | undefined,
        cut: Vector | undefined,
        hollow: number | undefined,
        twist: Vector | undefined,
        holeSize: Vector | undefined,
        topShear: Vector | undefined,
        advancedCut: Vector | undefined,
        taper: Vector | undefined,
        revolutions: number | undefined,
        radiusOffset: number | undefined,
        skew: number | undefined,
      ]
    | [type: typeof PRIM_TYPE_SCULPT, map: string | undefined, type: number | undefined]
  [PRIM_SLICE]: [slice: Vector | undefined]
  [PRIM_PHYSICS_SHAPE_TYPE]: [type: number | undefined]
  [PRIM_MATERIAL]: [material: number | undefined]
  [PRIM_PHYSICS]: [enabled: boolean | undefined]
  [PRIM_TEMP_ON_REZ]: [enabled: boolean | undefined]
  [PRIM_PHANTOM]: [enabled: boolean | undefined]
  [PRIM_POSITION]: [position: Vector | undefined]
  [PRIM_POS_LOCAL]: [position: Vector | undefined]
  [PRIM_ROTATION]: [rot: Quaternion | undefined]
  [PRIM_ROT_LOCAL]: [rot: Quaternion | undefined]
  [PRIM_SIZE]: [size: Vector | undefined]
  [PRIM_TEXTURE]: [
    texture: string | undefined,
    repeats: Vector | undefined,
    offsets: Vector | undefined,
    rotationInRadians: number | undefined,
  ]
  [PRIM_RENDER_MATERIAL]: [renderMaterial: string | undefined]
  [PRIM_TEXT]: [text: string | undefined, color: Vector | undefined, alpha: number | undefined]
  [PRIM_COLOR]: [color: Vector | undefined, alpha: number | undefined]
  [PRIM_BUMP_SHINY]: [shiny: number | undefined, bump: number | undefined]
  [PRIM_FULLBRIGHT]: [enabled: boolean | undefined]
  [PRIM_FLEXIBLE]: [
    enabled: boolean | undefined,
    softness: number | undefined,
    gravity: number | undefined,
    friction: number | undefined,
    wind: number | undefined,
    tension: number | undefined,
    force: Vector | undefined,
  ]
  [PRIM_TEXGEN]: [mode: number | undefined]
  [PRIM_POINT_LIGHT]: [
    enabled: boolean | undefined,
    linearColor: Vector | undefined,
    intensity: number | undefined,
    radius: number | undefined,
    falloff: number | undefined,
  ]
  [PRIM_REFLECTION_PROBE]: [
    enabled: boolean | undefined,
    ambiance: number | undefined,
    clipDistance: number | undefined,
    flags: number | undefined,
  ]
  [PRIM_GLOW]: [intensity: number | undefined]
  [PRIM_OMEGA]: [axis: Vector | undefined, spinrate: number | undefined, gain: number | undefined]
  [PRIM_NORMAL]: [
    texture: string | undefined,
    repeats: Vector | undefined,
    offsets: Vector | undefined,
    rotationInRadians: number | undefined,
  ]
  [PRIM_SPECULAR]: [
    texture: string | undefined,
    repeats: Vector | undefined,
    offsets: Vector | undefined,
    rotationInRadians: number | undefined,
    color: Vector | undefined,
    glossiness: number | undefined,
    environment: number | undefined,
  ]
  [PRIM_ALPHA_MODE]: [alphaMode: number | undefined, maskCutoff: number | undefined]
  [PRIM_LINK_TARGET]: []
  [PRIM_CAST_SHADOWS]: [enabled: boolean | undefined]
  [PRIM_ALLOW_UNSIT]: [enabled: boolean | undefined]
  [PRIM_SCRIPTED_SIT_ONLY]: [enabled: boolean | undefined]
  [PRIM_SIT_TARGET]: [
    enabled: boolean | undefined,
    offset: Vector | undefined,
    rot: Quaternion | undefined,
  ]
  [PRIM_PROJECTOR]: [
    texture: string | undefined,
    fov: number | undefined,
    focus: number | undefined,
    ambiance: number | undefined,
  ]
  [PRIM_CLICK_ACTION]: [action: number | undefined]
  [PRIM_GLTF_BASE_COLOR]: [
    texture: string | undefined,
    repeats: Vector | undefined,
    offsets: Vector | undefined,
    rotationInRadians: number | undefined,
    color: Vector | undefined,
    alpha: number | undefined,
    gltfAlphaMode: number | undefined,
    alphaMaskCutoff: number | undefined,
    doubleSided: number | undefined,
  ]
  [PRIM_GLTF_NORMAL]: [
    texture: string | undefined,
    repeats: Vector | undefined,
    offsets: Vector | undefined,
    rotationInRadians: number | undefined,
  ]
  [PRIM_GLTF_METALLIC_ROUGHNESS]: [
    texture: string | undefined,
    repeats: Vector | undefined,
    offsets: Vector | undefined,
    rotationInRadians: number | undefined,
    metallicFactor: number | undefined,
    roughnessFactor: number | undefined,
  ]
  [PRIM_GLTF_EMISSIVE]: [
    texture: string | undefined,
    repeats: Vector | undefined,
    offsets: Vector | undefined,
    rotationInRadians: number | undefined,
    emissiveTint: Vector | undefined,
  ]
  [PRIM_SIT_FLAGS]: [flags: number | undefined]
  [PRIM_DAMAGE]: [damage: number | undefined, damageType: number | undefined]
  [PRIM_HEALTH]: [health: number | undefined]
}

/** Recursively maps a flat PrimParamGet parameter list to the corresponding return types. */
type MapPrimParamGet<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends typeof PRIM_TYPE
      ? Rest extends readonly [infer S, ...infer ShapeRest]
        ? S extends keyof PrimTypeShapeMap
          ? ShapeRest extends readonly [...PrimTypeShapeMap[S], ...infer Remaining]
            ? [
                type: S,
                ...{ [I in keyof PrimTypeShapeMap[S]]: PrimTypeShapeMap[S][I] | undefined },
                ...MapPrimParamGet<Remaining>,
              ]
            : never
          : never
        : never
      : K extends keyof PrimParamGetMap & keyof PrimParamGetReturnMap
        ? Rest extends readonly [...PrimParamGetMap[K], ...infer Remaining]
          ? [...PrimParamGetReturnMap[K], ...MapPrimParamGet<Remaining>]
          : never
        : never
    : unknown[]

/** Maps each constant to the tuple of arguments that follow it. */
interface HttpParamMap {
  [HTTP_METHOD]: [method: string]
  [HTTP_MIMETYPE]: [mimeType: string]
  [HTTP_BODY_MAXLENGTH]: [length: number]
  [HTTP_VERIFY_CERT]: [verify: number]
  [HTTP_VERBOSE_THROTTLE]: [noisy: number]
  [HTTP_CUSTOM_HEADER]: [name: string, value: string]
  [HTTP_PRAGMA_NO_CACHE]: [sendHeader: number]
  [HTTP_USER_AGENT]: [user: string]
  [HTTP_ACCEPT]: [mimeType: string]
  [HTTP_EXTENDED_ERROR]: [extended: number]
}

/** Reverse map from numeric value to constant name for error messages. */
interface HttpParamNameMap {
  0: "HTTP_METHOD"
  1: "HTTP_MIMETYPE"
  2: "HTTP_BODY_MAXLENGTH"
  3: "HTTP_VERIFY_CERT"
  4: "HTTP_VERBOSE_THROTTLE"
  5: "HTTP_CUSTOM_HEADER"
  6: "HTTP_PRAGMA_NO_CACHE"
  7: "HTTP_USER_AGENT"
  8: "HTTP_ACCEPT"
  9: "HTTP_EXTENDED_ERROR"
}

/** Recursive type that validates a flat parameter list for HttpParam constants. */
type ParseHttpParams<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof HttpParamMap
      ? Rest extends readonly [...HttpParamMap[K], ...infer Remaining]
        ? [flag: K, ...HttpParamMap[K], ...ParseHttpParams<Remaining>]
        : TypedListError<`invalid arguments after ${HttpParamNameMap[K & keyof HttpParamNameMap]}`>
      : TypedListError<`unknown parameter flag ${K & (string | number)}`>
    : never

/** Maps each constant to the tuple of arguments that follow it. */
interface ParticleSystemParamMap {
  [PSYS_PART_FLAGS]: [flags: number]
  [PSYS_SRC_PATTERN]: [pattern: number]
  [PSYS_SRC_BURST_RADIUS]: [radius: number]
  [PSYS_SRC_ANGLE_BEGIN]: [angleBegin: number]
  [PSYS_SRC_ANGLE_END]: [angleEnd: number]
  [PSYS_SRC_INNERANGLE]: [angleInner: number]
  [PSYS_SRC_OUTERANGLE]: [angleOuter: number]
  [PSYS_SRC_TARGET_KEY]: [target: UUID]
  [PSYS_PART_START_COLOR]: [colorStart: Vector]
  [PSYS_PART_END_COLOR]: [colorEnd: Vector]
  [PSYS_PART_START_ALPHA]: [alphaStart: number]
  [PSYS_PART_END_ALPHA]: [alphaEnd: number]
  [PSYS_PART_START_SCALE]: [scaleStart: Vector]
  [PSYS_PART_END_SCALE]: [scaleEnd: Vector]
  [PSYS_SRC_TEXTURE]: [texture: string]
  [PSYS_PART_START_GLOW]: [glowStart: number]
  [PSYS_PART_END_GLOW]: [glowEnd: number]
  [PSYS_PART_BLEND_FUNC_SOURCE]: [bfSource: number]
  [PSYS_PART_BLEND_FUNC_DEST]: [bfDest: number]
  [PSYS_SRC_MAX_AGE]: [durationSystem: number]
  [PSYS_PART_MAX_AGE]: [durationParticle: number]
  [PSYS_SRC_BURST_RATE]: [burstSleep: number]
  [PSYS_SRC_BURST_PART_COUNT]: [burstParticleCount: number]
  [PSYS_SRC_ACCEL]: [acceleration: Vector]
  [PSYS_SRC_OMEGA]: [omega: Vector]
  [PSYS_SRC_BURST_SPEED_MIN]: [speedMin: number]
  [PSYS_SRC_BURST_SPEED_MAX]: [speedMax: number]
}

/** Reverse map from numeric value to constant name for error messages. */
interface ParticleSystemParamNameMap {
  0: "PSYS_PART_FLAGS"
  9: "PSYS_SRC_PATTERN"
  16: "PSYS_SRC_BURST_RADIUS"
  22: "PSYS_SRC_ANGLE_BEGIN"
  23: "PSYS_SRC_ANGLE_END"
  10: "PSYS_SRC_INNERANGLE"
  11: "PSYS_SRC_OUTERANGLE"
  20: "PSYS_SRC_TARGET_KEY"
  1: "PSYS_PART_START_COLOR"
  3: "PSYS_PART_END_COLOR"
  2: "PSYS_PART_START_ALPHA"
  4: "PSYS_PART_END_ALPHA"
  5: "PSYS_PART_START_SCALE"
  6: "PSYS_PART_END_SCALE"
  12: "PSYS_SRC_TEXTURE"
  26: "PSYS_PART_START_GLOW"
  27: "PSYS_PART_END_GLOW"
  24: "PSYS_PART_BLEND_FUNC_SOURCE"
  25: "PSYS_PART_BLEND_FUNC_DEST"
  19: "PSYS_SRC_MAX_AGE"
  7: "PSYS_PART_MAX_AGE"
  13: "PSYS_SRC_BURST_RATE"
  15: "PSYS_SRC_BURST_PART_COUNT"
  8: "PSYS_SRC_ACCEL"
  21: "PSYS_SRC_OMEGA"
  17: "PSYS_SRC_BURST_SPEED_MIN"
  18: "PSYS_SRC_BURST_SPEED_MAX"
}

/** Recursive type that validates a flat parameter list for ParticleSystemParam constants. */
type ParseParticleSystemParams<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof ParticleSystemParamMap
      ? Rest extends readonly [...ParticleSystemParamMap[K], ...infer Remaining]
        ? [flag: K, ...ParticleSystemParamMap[K], ...ParseParticleSystemParams<Remaining>]
        : TypedListError<`invalid arguments after ${ParticleSystemParamNameMap[K & keyof ParticleSystemParamNameMap]}`>
      : TypedListError<`unknown parameter flag ${K & (string | number)}`>
    : never

/** Maps each constant to the tuple of arguments that follow it. */
interface CameraParamMap {
  [CAMERA_ACTIVE]: [isActive: boolean]
  [CAMERA_BEHINDNESS_ANGLE]: [degrees: number]
  [CAMERA_BEHINDNESS_LAG]: [seconds: number]
  [CAMERA_DISTANCE]: [meters: number]
  [CAMERA_FOCUS]: [position: Vector]
  [CAMERA_FOCUS_LAG]: [seconds: number]
  [CAMERA_FOCUS_LOCKED]: [isLocked: number]
  [CAMERA_FOCUS_OFFSET]: [meters: Vector]
  [CAMERA_FOCUS_THRESHOLD]: [meters: number]
  [CAMERA_PITCH]: [degrees: number]
  [CAMERA_POSITION]: [position: Vector]
  [CAMERA_POSITION_LAG]: [seconds: number]
  [CAMERA_POSITION_LOCKED]: [isLocked: number]
  [CAMERA_POSITION_THRESHOLD]: [meters: number]
}

/** Reverse map from numeric value to constant name for error messages. */
interface CameraParamNameMap {
  12: "CAMERA_ACTIVE"
  8: "CAMERA_BEHINDNESS_ANGLE"
  9: "CAMERA_BEHINDNESS_LAG"
  7: "CAMERA_DISTANCE"
  17: "CAMERA_FOCUS"
  6: "CAMERA_FOCUS_LAG"
  22: "CAMERA_FOCUS_LOCKED"
  1: "CAMERA_FOCUS_OFFSET"
  11: "CAMERA_FOCUS_THRESHOLD"
  0: "CAMERA_PITCH"
  13: "CAMERA_POSITION"
  5: "CAMERA_POSITION_LAG"
  21: "CAMERA_POSITION_LOCKED"
  10: "CAMERA_POSITION_THRESHOLD"
}

/** Recursive type that validates a flat parameter list for CameraParam constants. */
type ParseCameraParams<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof CameraParamMap
      ? Rest extends readonly [...CameraParamMap[K], ...infer Remaining]
        ? [flag: K, ...CameraParamMap[K], ...ParseCameraParams<Remaining>]
        : TypedListError<`invalid arguments after ${CameraParamNameMap[K & keyof CameraParamNameMap]}`>
      : TypedListError<`unknown parameter flag ${K & (string | number)}`>
    : never

/** Maps each constant to the tuple of arguments that follow it. */
interface CastRayParamMap {
  [RC_REJECT_TYPES]: [filter: number]
  [RC_DATA_FLAGS]: [flags: number]
  [RC_MAX_HITS]: [maxHits: number]
  [RC_DETECT_PHANTOM]: [detectPhantom: number]
}

/** Reverse map from numeric value to constant name for error messages. */
interface CastRayParamNameMap {
  0: "RC_REJECT_TYPES"
  2: "RC_DATA_FLAGS"
  3: "RC_MAX_HITS"
  1: "RC_DETECT_PHANTOM"
}

/** Recursive type that validates a flat parameter list for CastRayParam constants. */
type ParseCastRayParams<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof CastRayParamMap
      ? Rest extends readonly [...CastRayParamMap[K], ...infer Remaining]
        ? [flag: K, ...CastRayParamMap[K], ...ParseCastRayParams<Remaining>]
        : TypedListError<`invalid arguments after ${CastRayParamNameMap[K & keyof CastRayParamNameMap]}`>
      : TypedListError<`unknown parameter flag ${K & (string | number)}`>
    : never

/** Maps each constant to the tuple of arguments that follow it. */
interface CharacterParamMap {
  [CHARACTER_DESIRED_SPEED]: [desiredSpeed: number]
  [CHARACTER_RADIUS]: [radius: number]
  [CHARACTER_LENGTH]: [length: number]
  [CHARACTER_ORIENTATION]: [orientation: number]
  [CHARACTER_TYPE]: [type: number]
  [CHARACTER_AVOIDANCE_MODE]: [avoidanceMode: number]
  [CHARACTER_MAX_ACCEL]: [maxAccel: number]
  [CHARACTER_MAX_DECEL]: [maxDecel: number]
  [CHARACTER_DESIRED_TURN_SPEED]: [desiredTurnSpeed: number]
  [CHARACTER_MAX_TURN_RADIUS]: [maxTurnRadius: number]
  [CHARACTER_MAX_SPEED]: [maxSpeed: number]
  [CHARACTER_ACCOUNT_FOR_SKIPPED_FRAMES]: [accountForSkippedFrames: number]
  [CHARACTER_STAY_WITHIN_PARCEL]: [stayWithinParcel: number]
}

/** Reverse map from numeric value to constant name for error messages. */
interface CharacterParamNameMap {
  1: "CHARACTER_DESIRED_SPEED"
  2: "CHARACTER_RADIUS"
  3: "CHARACTER_LENGTH"
  4: "CHARACTER_ORIENTATION"
  6: "CHARACTER_TYPE"
  5: "CHARACTER_AVOIDANCE_MODE"
  8: "CHARACTER_MAX_ACCEL"
  9: "CHARACTER_MAX_DECEL"
  12: "CHARACTER_DESIRED_TURN_SPEED"
  10: "CHARACTER_MAX_TURN_RADIUS"
  13: "CHARACTER_MAX_SPEED"
  14: "CHARACTER_ACCOUNT_FOR_SKIPPED_FRAMES"
  15: "CHARACTER_STAY_WITHIN_PARCEL"
}

/** Recursive type that validates a flat parameter list for CharacterParam constants. */
type ParseCharacterParams<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof CharacterParamMap
      ? Rest extends readonly [...CharacterParamMap[K], ...infer Remaining]
        ? [flag: K, ...CharacterParamMap[K], ...ParseCharacterParams<Remaining>]
        : TypedListError<`invalid arguments after ${CharacterParamNameMap[K & keyof CharacterParamNameMap]}`>
      : TypedListError<`unknown parameter flag ${K & (string | number)}`>
    : never

/** Maps each constant to the tuple of arguments that follow it. */
interface RezParamMap {
  [REZ_PARAM]: [param: number]
  [REZ_FLAGS]: [flags: number]
  [REZ_POS]: [pos: Vector, relative: number, atRoot: number]
  [REZ_ROT]: [rot: Quaternion, relative: number]
  [REZ_VEL]: [velocity: Vector, local: number, inherit: number]
  [REZ_ACCEL]: [force: Vector, local: number]
  [REZ_OMEGA]: [axis: Vector, local: number, spin: number, gain: number]
  [REZ_DAMAGE]: [damage: number]
  [REZ_SOUND]: [sound: string, volume: number, loop: number]
  [REZ_SOUND_COLLIDE]: [sound: string, volume: number]
  [REZ_LOCK_AXES]: [locks: Vector]
  [REZ_DAMAGE_TYPE]: [damageType: number]
  [REZ_PARAM_STRING]: [startParam: string]
}

/** Reverse map from numeric value to constant name for error messages. */
interface RezParamNameMap {
  0: "REZ_PARAM"
  1: "REZ_FLAGS"
  2: "REZ_POS"
  3: "REZ_ROT"
  4: "REZ_VEL"
  5: "REZ_ACCEL"
  7: "REZ_OMEGA"
  8: "REZ_DAMAGE"
  9: "REZ_SOUND"
  10: "REZ_SOUND_COLLIDE"
  11: "REZ_LOCK_AXES"
  12: "REZ_DAMAGE_TYPE"
  13: "REZ_PARAM_STRING"
}

/** Recursive type that validates a flat parameter list for RezParam constants. */
type ParseRezParams<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof RezParamMap
      ? Rest extends readonly [...RezParamMap[K], ...infer Remaining]
        ? [flag: K, ...RezParamMap[K], ...ParseRezParams<Remaining>]
        : TypedListError<`invalid arguments after ${RezParamNameMap[K & keyof RezParamNameMap]}`>
      : TypedListError<`unknown parameter flag ${K & (string | number)}`>
    : never

/** Valid constants for ObjectDetail functions. */
type ObjectDetailFlag =
  | typeof OBJECT_NAME
  | typeof OBJECT_DESC
  | typeof OBJECT_POS
  | typeof OBJECT_ROT
  | typeof OBJECT_VELOCITY
  | typeof OBJECT_OWNER
  | typeof OBJECT_GROUP
  | typeof OBJECT_CREATOR
  | typeof OBJECT_RUNNING_SCRIPT_COUNT
  | typeof OBJECT_TOTAL_SCRIPT_COUNT
  | typeof OBJECT_SCRIPT_MEMORY
  | typeof OBJECT_SCRIPT_TIME
  | typeof OBJECT_PRIM_EQUIVALENCE
  | typeof OBJECT_SERVER_COST
  | typeof OBJECT_STREAMING_COST
  | typeof OBJECT_PHYSICS_COST
  | typeof OBJECT_CHARACTER_TIME
  | typeof OBJECT_ROOT
  | typeof OBJECT_ATTACHED_POINT
  | typeof OBJECT_PATHFINDING_TYPE
  | typeof OBJECT_PHYSICS
  | typeof OBJECT_PHANTOM
  | typeof OBJECT_TEMP_ON_REZ
  | typeof OBJECT_RENDER_WEIGHT
  | typeof OBJECT_HOVER_HEIGHT
  | typeof OBJECT_BODY_SHAPE_TYPE
  | typeof OBJECT_LAST_OWNER_ID
  | typeof OBJECT_CLICK_ACTION
  | typeof OBJECT_OMEGA
  | typeof OBJECT_PRIM_COUNT
  | typeof OBJECT_TOTAL_INVENTORY_COUNT
  | typeof OBJECT_REZZER_KEY
  | typeof OBJECT_GROUP_TAG
  | typeof OBJECT_TEMP_ATTACHED
  | typeof OBJECT_ATTACHED_SLOTS_AVAILABLE
  | typeof OBJECT_CREATION_TIME
  | typeof OBJECT_SELECT_COUNT
  | typeof OBJECT_SIT_COUNT
  | typeof OBJECT_ANIMATED_COUNT
  | typeof OBJECT_ANIMATED_SLOTS_AVAILABLE
  | typeof OBJECT_ACCOUNT_LEVEL
  | typeof OBJECT_MATERIAL
  | typeof OBJECT_MASS
  | typeof OBJECT_TEXT
  | typeof OBJECT_REZ_TIME
  | typeof OBJECT_LINK_NUMBER
  | typeof OBJECT_SCALE
  | typeof OBJECT_TEXT_COLOR
  | typeof OBJECT_TEXT_ALPHA
  | typeof OBJECT_HEALTH
  | typeof OBJECT_DAMAGE
  | typeof OBJECT_DAMAGE_TYPE
  | typeof OBJECT_PERMS
  | typeof OBJECT_PERMS_COMBINED

/** Maps each ObjectDetail constant to the tuple of values it returns. */
interface ObjectDetailReturnMap {
  [OBJECT_NAME]: [name: string | undefined]
  [OBJECT_DESC]: [desc: string | undefined]
  [OBJECT_POS]: [pos: Vector | undefined]
  [OBJECT_ROT]: [rot: Quaternion | undefined]
  [OBJECT_VELOCITY]: [velocity: Vector | undefined]
  [OBJECT_OWNER]: [owner: UUID | undefined]
  [OBJECT_GROUP]: [group: UUID | undefined]
  [OBJECT_CREATOR]: [creator: UUID | undefined]
  [OBJECT_RUNNING_SCRIPT_COUNT]: [runningScriptCount: number | undefined]
  [OBJECT_TOTAL_SCRIPT_COUNT]: [totalScriptCount: number | undefined]
  [OBJECT_SCRIPT_MEMORY]: [scriptMemory: number | undefined]
  [OBJECT_SCRIPT_TIME]: [scriptTime: number | undefined]
  [OBJECT_PRIM_EQUIVALENCE]: [primEquivalence: number | undefined]
  [OBJECT_SERVER_COST]: [serverCost: number | undefined]
  [OBJECT_STREAMING_COST]: [streamingCost: number | undefined]
  [OBJECT_PHYSICS_COST]: [physicsCost: number | undefined]
  [OBJECT_CHARACTER_TIME]: [characterTime: number | undefined]
  [OBJECT_ROOT]: [root: UUID | undefined]
  [OBJECT_ATTACHED_POINT]: [attachedPoint: number | undefined]
  [OBJECT_PATHFINDING_TYPE]: [pathfindingType: number | undefined]
  [OBJECT_PHYSICS]: [physics: boolean | undefined]
  [OBJECT_PHANTOM]: [phantom: boolean | undefined]
  [OBJECT_TEMP_ON_REZ]: [tempOnRez: boolean | undefined]
  [OBJECT_RENDER_WEIGHT]: [renderWeight: number | undefined]
  [OBJECT_HOVER_HEIGHT]: [hoverHeight: number | undefined]
  [OBJECT_BODY_SHAPE_TYPE]: [bodyShapeType: number | undefined]
  [OBJECT_LAST_OWNER_ID]: [lastOwnerId: UUID | undefined]
  [OBJECT_CLICK_ACTION]: [clickAction: number | undefined]
  [OBJECT_OMEGA]: [omega: Vector | undefined]
  [OBJECT_PRIM_COUNT]: [primCount: number | undefined]
  [OBJECT_TOTAL_INVENTORY_COUNT]: [totalInventoryCount: number | undefined]
  [OBJECT_REZZER_KEY]: [rezzerKey: UUID | undefined]
  [OBJECT_GROUP_TAG]: [groupTag: string | undefined]
  [OBJECT_TEMP_ATTACHED]: [tempAttached: boolean | undefined]
  [OBJECT_ATTACHED_SLOTS_AVAILABLE]: [attachedSlotsAvailable: number | undefined]
  [OBJECT_CREATION_TIME]: [creationTime: string | undefined]
  [OBJECT_SELECT_COUNT]: [selectCount: number | undefined]
  [OBJECT_SIT_COUNT]: [sitCount: number | undefined]
  [OBJECT_ANIMATED_COUNT]: [animatedCount: number | undefined]
  [OBJECT_ANIMATED_SLOTS_AVAILABLE]: [animatedSlotsAvailable: number | undefined]
  [OBJECT_ACCOUNT_LEVEL]: [accountLevel: number | undefined]
  [OBJECT_MATERIAL]: [material: number | undefined]
  [OBJECT_MASS]: [mass: number | undefined]
  [OBJECT_TEXT]: [text: string | undefined]
  [OBJECT_REZ_TIME]: [rezTime: string | undefined]
  [OBJECT_LINK_NUMBER]: [linkNumber: number | undefined]
  [OBJECT_SCALE]: [scale: Vector | undefined]
  [OBJECT_TEXT_COLOR]: [textColor: Vector | undefined]
  [OBJECT_TEXT_ALPHA]: [textAlpha: number | undefined]
  [OBJECT_HEALTH]: [health: number | undefined]
  [OBJECT_DAMAGE]: [damage: number | undefined]
  [OBJECT_DAMAGE_TYPE]: [damageType: number | undefined]
  [OBJECT_PERMS]: [
    base: number | undefined,
    owner: number | undefined,
    group: number | undefined,
    everyone: number | undefined,
    nextOwner: number | undefined,
  ]
  [OBJECT_PERMS_COMBINED]: [
    base: number | undefined,
    owner: number | undefined,
    group: number | undefined,
    everyone: number | undefined,
    nextOwner: number | undefined,
  ]
}

/** Recursively maps a tuple of ObjectDetail flags to their return types. */
type MapObjectDetail<T extends readonly ObjectDetailFlag[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof ObjectDetailReturnMap
      ? Rest extends readonly ObjectDetailFlag[]
        ? [...ObjectDetailReturnMap[K], ...MapObjectDetail<Rest>]
        : never
      : never
    : ObjectDetailReturnMap[ObjectDetailFlag][number][]

/** Valid constants for ParcelDetail functions. */
type ParcelDetailFlag =
  | typeof PARCEL_DETAILS_NAME
  | typeof PARCEL_DETAILS_DESC
  | typeof PARCEL_DETAILS_OWNER
  | typeof PARCEL_DETAILS_GROUP
  | typeof PARCEL_DETAILS_AREA
  | typeof PARCEL_DETAILS_ID
  | typeof PARCEL_DETAILS_SEE_AVATARS
  | typeof PARCEL_DETAILS_PRIM_CAPACITY
  | typeof PARCEL_DETAILS_PRIM_USED
  | typeof PARCEL_DETAILS_LANDING_POINT
  | typeof PARCEL_DETAILS_LANDING_LOOKAT
  | typeof PARCEL_DETAILS_TP_ROUTING
  | typeof PARCEL_DETAILS_FLAGS
  | typeof PARCEL_DETAILS_SCRIPT_DANGER

/** Maps each ParcelDetail constant to the tuple of values it returns. */
interface ParcelDetailReturnMap {
  [PARCEL_DETAILS_NAME]: [name: string | undefined]
  [PARCEL_DETAILS_DESC]: [desc: string | undefined]
  [PARCEL_DETAILS_OWNER]: [owner: UUID | undefined]
  [PARCEL_DETAILS_GROUP]: [group: UUID | undefined]
  [PARCEL_DETAILS_AREA]: [area: number | undefined]
  [PARCEL_DETAILS_ID]: [id: UUID | undefined]
  [PARCEL_DETAILS_SEE_AVATARS]: [seeAvatars: boolean | undefined]
  [PARCEL_DETAILS_PRIM_CAPACITY]: [primCapacity: number | undefined]
  [PARCEL_DETAILS_PRIM_USED]: [primUsed: number | undefined]
  [PARCEL_DETAILS_LANDING_POINT]: [landingPoint: Vector | undefined]
  [PARCEL_DETAILS_LANDING_LOOKAT]: [landingLookat: Vector | undefined]
  [PARCEL_DETAILS_TP_ROUTING]: [tpRouting: number | undefined]
  [PARCEL_DETAILS_FLAGS]: [flags: number | undefined]
  [PARCEL_DETAILS_SCRIPT_DANGER]: [scriptDanger: boolean | undefined]
}

/** Recursively maps a tuple of ParcelDetail flags to their return types. */
type MapParcelDetail<T extends readonly ParcelDetailFlag[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof ParcelDetailReturnMap
      ? Rest extends readonly ParcelDetailFlag[]
        ? [...ParcelDetailReturnMap[K], ...MapParcelDetail<Rest>]
        : never
      : never
    : ParcelDetailReturnMap[ParcelDetailFlag][number][]

/** Maps each constant to the tuple of arguments that follow it. */
interface GltfOverrideParamMap {
  [OVERRIDE_GLTF_BASE_COLOR_FACTOR]: [baseColorFactor: Vector | ""]
  [OVERRIDE_GLTF_BASE_ALPHA]: [baseAlpha: number | ""]
  [OVERRIDE_GLTF_BASE_ALPHA_MODE]: [baseAlphaMode: number | ""]
  [OVERRIDE_GLTF_BASE_ALPHA_MASK]: [baseAlphaMask: number | ""]
  [OVERRIDE_GLTF_BASE_DOUBLE_SIDED]: [baseDoubleSided: number | ""]
  [OVERRIDE_GLTF_METALLIC_FACTOR]: [metallicFactor: number | ""]
  [OVERRIDE_GLTF_ROUGHNESS_FACTOR]: [roughnessFactor: number | ""]
  [OVERRIDE_GLTF_EMISSIVE_FACTOR]: [emissiveFactor: Vector | ""]
}

/** Reverse map from numeric value to constant name for error messages. */
interface GltfOverrideParamNameMap {
  1: "OVERRIDE_GLTF_BASE_COLOR_FACTOR"
  2: "OVERRIDE_GLTF_BASE_ALPHA"
  3: "OVERRIDE_GLTF_BASE_ALPHA_MODE"
  4: "OVERRIDE_GLTF_BASE_ALPHA_MASK"
  5: "OVERRIDE_GLTF_BASE_DOUBLE_SIDED"
  6: "OVERRIDE_GLTF_METALLIC_FACTOR"
  7: "OVERRIDE_GLTF_ROUGHNESS_FACTOR"
  8: "OVERRIDE_GLTF_EMISSIVE_FACTOR"
}

/** Recursive type that validates a flat parameter list for GltfOverrideParam constants. */
type ParseGltfOverrideParams<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof GltfOverrideParamMap
      ? Rest extends readonly [...GltfOverrideParamMap[K], ...infer Remaining]
        ? [flag: K, ...GltfOverrideParamMap[K], ...ParseGltfOverrideParams<Remaining>]
        : TypedListError<`invalid arguments after ${GltfOverrideParamNameMap[K & keyof GltfOverrideParamNameMap]}`>
      : TypedListError<`unknown parameter flag ${K & (string | number)}`>
    : never

/** Valid constants for MediaParam functions. */
type MediaParamFlag =
  | typeof PRIM_MEDIA_ALT_IMAGE_ENABLE
  | typeof PRIM_MEDIA_CONTROLS
  | typeof PRIM_MEDIA_CURRENT_URL
  | typeof PRIM_MEDIA_HOME_URL
  | typeof PRIM_MEDIA_AUTO_LOOP
  | typeof PRIM_MEDIA_AUTO_PLAY
  | typeof PRIM_MEDIA_AUTO_SCALE
  | typeof PRIM_MEDIA_AUTO_ZOOM
  | typeof PRIM_MEDIA_FIRST_CLICK_INTERACT
  | typeof PRIM_MEDIA_WIDTH_PIXELS
  | typeof PRIM_MEDIA_HEIGHT_PIXELS
  | typeof PRIM_MEDIA_WHITELIST_ENABLE
  | typeof PRIM_MEDIA_WHITELIST
  | typeof PRIM_MEDIA_PERMS_INTERACT
  | typeof PRIM_MEDIA_PERMS_CONTROL

/** Maps each MediaParam constant to the tuple of values it returns. */
interface MediaParamReturnMap {
  [PRIM_MEDIA_ALT_IMAGE_ENABLE]: [altImageEnable: boolean | undefined]
  [PRIM_MEDIA_CONTROLS]: [control: number | undefined]
  [PRIM_MEDIA_CURRENT_URL]: [currentUrl: string | undefined]
  [PRIM_MEDIA_HOME_URL]: [homeUrl: string | undefined]
  [PRIM_MEDIA_AUTO_LOOP]: [autoLoop: boolean | undefined]
  [PRIM_MEDIA_AUTO_PLAY]: [autoPlay: boolean | undefined]
  [PRIM_MEDIA_AUTO_SCALE]: [autoScale: boolean | undefined]
  [PRIM_MEDIA_AUTO_ZOOM]: [autoZoom: boolean | undefined]
  [PRIM_MEDIA_FIRST_CLICK_INTERACT]: [firstClickInteract: boolean | undefined]
  [PRIM_MEDIA_WIDTH_PIXELS]: [width: number | undefined]
  [PRIM_MEDIA_HEIGHT_PIXELS]: [height: number | undefined]
  [PRIM_MEDIA_WHITELIST_ENABLE]: [whitelistEnable: boolean | undefined]
  [PRIM_MEDIA_WHITELIST]: [csv: string | undefined]
  [PRIM_MEDIA_PERMS_INTERACT]: [perms: number | undefined]
  [PRIM_MEDIA_PERMS_CONTROL]: [perms: number | undefined]
}

/** Recursively maps a tuple of MediaParam flags to their return types. */
type MapMediaParam<T extends readonly MediaParamFlag[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof MediaParamReturnMap
      ? Rest extends readonly MediaParamFlag[]
        ? [...MediaParamReturnMap[K], ...MapMediaParam<Rest>]
        : never
      : never
    : MediaParamReturnMap[MediaParamFlag][number][]

/** Valid constants for ParcelMediaQuery functions. */
type ParcelMediaQueryFlag =
  | typeof PARCEL_MEDIA_COMMAND_TEXTURE
  | typeof PARCEL_MEDIA_COMMAND_URL
  | typeof PARCEL_MEDIA_COMMAND_TYPE
  | typeof PARCEL_MEDIA_COMMAND_SIZE
  | typeof PARCEL_MEDIA_COMMAND_DESC
  | typeof PARCEL_MEDIA_COMMAND_LOOP_SET

/** Maps each ParcelMediaQuery constant to the tuple of values it returns. */
interface ParcelMediaQueryReturnMap {
  [PARCEL_MEDIA_COMMAND_TEXTURE]: [uuid: UUID | undefined]
  [PARCEL_MEDIA_COMMAND_URL]: [url: string | undefined]
  [PARCEL_MEDIA_COMMAND_TYPE]: [mimeType: string | undefined]
  [PARCEL_MEDIA_COMMAND_SIZE]: [x: number | undefined, y: number | undefined]
  [PARCEL_MEDIA_COMMAND_DESC]: [desc: string | undefined]
  [PARCEL_MEDIA_COMMAND_LOOP_SET]: [loop: number | undefined]
}

/** Recursively maps a tuple of ParcelMediaQuery flags to their return types. */
type MapParcelMediaQuery<T extends readonly ParcelMediaQueryFlag[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof ParcelMediaQueryReturnMap
      ? Rest extends readonly ParcelMediaQueryFlag[]
        ? [...ParcelMediaQueryReturnMap[K], ...MapParcelMediaQuery<Rest>]
        : never
      : never
    : ParcelMediaQueryReturnMap[ParcelMediaQueryFlag][number][]

/** Valid constants for EnvironmentParam functions. */
type EnvironmentParamFlag =
  | typeof SKY_TRACKS
  | typeof SKY_AMBIENT
  | typeof SKY_TEXTURE_DEFAULTS
  | typeof SKY_CLOUDS
  | typeof SKY_DOME
  | typeof SKY_GAMMA
  | typeof SKY_GLOW
  | typeof SKY_MOON
  | typeof SKY_STAR_BRIGHTNESS
  | typeof SKY_SUN
  | typeof SKY_PLANET
  | typeof SKY_REFRACTION
  | typeof SKY_LIGHT
  | typeof SKY_REFLECTION_PROBE_AMBIANCE
  | typeof WATER_BLUR_MULTIPLIER
  | typeof WATER_FOG
  | typeof WATER_FRESNEL
  | typeof WATER_TEXTURE_DEFAULTS
  | typeof WATER_NORMAL_SCALE
  | typeof WATER_REFRACTION
  | typeof WATER_WAVE_DIRECTION
  | typeof ENVIRONMENT_DAYINFO

/** Maps each EnvironmentParam constant to the tuple of values it returns. */
interface EnvironmentParamReturnMap {
  [SKY_TRACKS]: [sky2: number | undefined, sky3: number | undefined, sky4: number | undefined]
  [SKY_AMBIENT]: [ambientColor: Vector | undefined]
  [SKY_TEXTURE_DEFAULTS]: [
    bloomIsDefault: number | undefined,
    haloIsDefault: number | undefined,
    rainbowIsDefault: number | undefined,
  ]
  [SKY_CLOUDS]: [
    color: Vector | undefined,
    coverage: number | undefined,
    scale: number | undefined,
    variance: number | undefined,
    scroll: Vector | undefined,
    density: Vector | undefined,
    detail: Vector | undefined,
    isDefault: number | undefined,
  ]
  [SKY_DOME]: [
    offset: number | undefined,
    radius: number | undefined,
    maxAltitude: number | undefined,
  ]
  [SKY_GAMMA]: [gamma: number | undefined]
  [SKY_GLOW]: [glowSize: number | undefined, glowFocus: number | undefined]
  [SKY_MOON]: [
    rot: Quaternion | undefined,
    scale: number | undefined,
    brightness: number | undefined,
    isDefaultTexture: number | undefined,
    direction: Vector | undefined,
    ambientColor: Vector | undefined,
    diffuseColor: Vector | undefined,
  ]
  [SKY_STAR_BRIGHTNESS]: [brightness: number | undefined]
  [SKY_SUN]: [
    rot: Quaternion | undefined,
    scale: number | undefined,
    sunColor: Vector | undefined,
    isDefaultTexture: number | undefined,
    direction: Vector | undefined,
    ambientColor: Vector | undefined,
    diffuseColor: Vector | undefined,
  ]
  [SKY_PLANET]: [
    planetRadius: number | undefined,
    skyBottomRadius: number | undefined,
    skyTopRadius: number | undefined,
  ]
  [SKY_REFRACTION]: [
    moistureLevel: number | undefined,
    dropletRadius: number | undefined,
    iceLevel: number | undefined,
  ]
  [SKY_LIGHT]: [
    lightDirection: Vector | undefined,
    fadeColor: Vector | undefined,
    totalAmbient: Vector | undefined,
  ]
  [SKY_REFLECTION_PROBE_AMBIANCE]: [ambiance: number | undefined]
  [WATER_BLUR_MULTIPLIER]: [multiplier: number | undefined]
  [WATER_FOG]: [
    arg0: Vector | undefined,
    density: number | undefined,
    modulation: number | undefined,
  ]
  [WATER_FRESNEL]: [offset: number | undefined, scale: number | undefined]
  [WATER_TEXTURE_DEFAULTS]: [
    normalIsDefault: number | undefined,
    transparentIsDefault: number | undefined,
  ]
  [WATER_NORMAL_SCALE]: [scale: Vector | undefined]
  [WATER_REFRACTION]: [scaleAbove: number | undefined, scaleBelow: number | undefined]
  [WATER_WAVE_DIRECTION]: [largeWave: Vector | undefined, smallWave: Vector | undefined]
  [ENVIRONMENT_DAYINFO]: [
    dayLength: number | undefined,
    dayOffset: number | undefined,
    secsSinceMidnight: number | undefined,
  ]
}

/** Recursively maps a tuple of EnvironmentParam flags to their return types. */
type MapEnvironmentParam<T extends readonly EnvironmentParamFlag[]> = T extends readonly []
  ? []
  : T extends readonly [infer K, ...infer Rest]
    ? K extends keyof EnvironmentParamReturnMap
      ? Rest extends readonly EnvironmentParamFlag[]
        ? [...EnvironmentParamReturnMap[K], ...MapEnvironmentParam<Rest>]
        : never
      : never
    : EnvironmentParamReturnMap[EnvironmentParamFlag][number][]

/** Fluent builder for PrimParam lists. Compiles to a flat parameter list at build time. */
interface PrimParamBuilder {
  name(name: string): PrimParamBuilder
  desc(description: string): PrimParamBuilder
  slice(slice: Vector): PrimParamBuilder
  physicsShapeType(type: number): PrimParamBuilder
  material(flag: number): PrimParamBuilder
  physics(enabled: boolean): PrimParamBuilder
  tempOnRez(enabled: boolean): PrimParamBuilder
  phantom(enabled: boolean): PrimParamBuilder
  position(position: Vector): PrimParamBuilder
  posLocal(position: Vector): PrimParamBuilder
  rotation(rot: Quaternion): PrimParamBuilder
  rotLocal(rot: Quaternion): PrimParamBuilder
  size(size: Vector): PrimParamBuilder
  texture(
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
  ): PrimParamBuilder
  renderMaterial(face: number, renderMaterial: string): PrimParamBuilder
  text(text: string, color: Vector, alpha: number): PrimParamBuilder
  color(face: number, color: Vector, alpha: number): PrimParamBuilder
  bumpShiny(face: number, shiny: number, bump: number): PrimParamBuilder
  pointLight(
    enabled: boolean,
    linearColor: Vector,
    intensity: number,
    radius: number,
    falloff: number,
  ): PrimParamBuilder
  reflectionProbe(
    enabled: boolean,
    ambiance: number,
    clipDistance: number,
    flags: number,
  ): PrimParamBuilder
  fullbright(face: number, enabled: boolean): PrimParamBuilder
  flexible(
    enabled: boolean,
    softness: number,
    gravity: number,
    friction: number,
    wind: number,
    tension: number,
    force: Vector,
  ): PrimParamBuilder
  texgen(face: number, type: number): PrimParamBuilder
  glow(face: number, intensity: number): PrimParamBuilder
  omega(axis: Vector, spinrate: number, gain: number): PrimParamBuilder
  normal(
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
  ): PrimParamBuilder
  specular(
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
    color: Vector,
    glossiness: number,
    environment: number,
  ): PrimParamBuilder
  alphaMode(face: number, alphaMode: number, maskCutoff: number): PrimParamBuilder
  castShadows(enabled: boolean): PrimParamBuilder
  allowUnsit(enabled: boolean): PrimParamBuilder
  scriptedSitOnly(enabled: boolean): PrimParamBuilder
  sitTarget(enabled: boolean, offset: Vector, rot: Quaternion): PrimParamBuilder
  projector(texture: string, fov: number, focus: number, ambiance: number): PrimParamBuilder
  clickAction(action: number): PrimParamBuilder
  gltfBaseColor(
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
    linearColor: Vector,
    alpha: number,
    gltfAlphaMode: number,
    alphaMaskCutoff: number,
    doubleSided: number,
  ): PrimParamBuilder
  gltfNormal(
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
  ): PrimParamBuilder
  gltfMetallicRoughness(
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
    metallicFactor: number,
    roughnessFactor: number,
  ): PrimParamBuilder
  gltfEmissive(
    face: number,
    texture: string,
    repeats: Vector,
    offsets: Vector,
    rotationInRadians: number,
    linearEmissiveTint: Vector,
  ): PrimParamBuilder
  sitFlags(flags: number): PrimParamBuilder
  damage(damage: number, damageType: number): PrimParamBuilder
  health(health: number): PrimParamBuilder
  typeBox(
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    topSize: Vector,
    topShear: Vector,
  ): PrimParamBuilder
  typeCylinder(
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    topSize: Vector,
    topShear: Vector,
  ): PrimParamBuilder
  typePrism(
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    topSize: Vector,
    topShear: Vector,
  ): PrimParamBuilder
  typeSphere(
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    dimple: Vector,
  ): PrimParamBuilder
  typeTorus(
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    holeSize: Vector,
    topShear: Vector,
    advancedCut: Vector,
    taper: Vector,
    revolutions: number,
    radiusOffset: number,
    skew: number,
  ): PrimParamBuilder
  typeTube(
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    holeSize: Vector,
    topShear: Vector,
    advancedCut: Vector,
    taper: Vector,
    revolutions: number,
    radiusOffset: number,
    skew: number,
  ): PrimParamBuilder
  typeRing(
    holeShape: number,
    cut: Vector,
    hollow: number,
    twist: Vector,
    holeSize: Vector,
    topShear: Vector,
    advancedCut: Vector,
    taper: Vector,
    revolutions: number,
    radiusOffset: number,
    skew: number,
  ): PrimParamBuilder
  typeSculpt(map: string, type: number): PrimParamBuilder
  link(linkTarget: number, cb: (link: PrimParamBuilder) => PrimParamBuilder): PrimParamBuilder
}

declare function setPrimParams(linkNumber: number): PrimParamBuilder

/** Fluent builder for ParticleSystemParam lists. Compiles to a flat parameter list at build time. */
interface ParticleSystemParamBuilder {
  partFlags(flags: number): ParticleSystemParamBuilder
  srcPattern(pattern: number): ParticleSystemParamBuilder
  srcBurstRadius(radius: number): ParticleSystemParamBuilder
  srcAngleBegin(angleBegin: number): ParticleSystemParamBuilder
  srcAngleEnd(angleEnd: number): ParticleSystemParamBuilder
  srcInnerangle(angleInner: number): ParticleSystemParamBuilder
  srcOuterangle(angleOuter: number): ParticleSystemParamBuilder
  srcTargetKey(target: UUID): ParticleSystemParamBuilder
  partStartColor(colorStart: Vector): ParticleSystemParamBuilder
  partEndColor(colorEnd: Vector): ParticleSystemParamBuilder
  partStartAlpha(alphaStart: number): ParticleSystemParamBuilder
  partEndAlpha(alphaEnd: number): ParticleSystemParamBuilder
  partStartScale(scaleStart: Vector): ParticleSystemParamBuilder
  partEndScale(scaleEnd: Vector): ParticleSystemParamBuilder
  srcTexture(texture: string): ParticleSystemParamBuilder
  partStartGlow(glowStart: number): ParticleSystemParamBuilder
  partEndGlow(glowEnd: number): ParticleSystemParamBuilder
  partBlendFuncSource(bfSource: number): ParticleSystemParamBuilder
  partBlendFuncDest(bfDest: number): ParticleSystemParamBuilder
  srcMaxAge(durationSystem: number): ParticleSystemParamBuilder
  partMaxAge(durationParticle: number): ParticleSystemParamBuilder
  srcBurstRate(burstSleep: number): ParticleSystemParamBuilder
  srcBurstPartCount(burstParticleCount: number): ParticleSystemParamBuilder
  srcAccel(acceleration: Vector): ParticleSystemParamBuilder
  srcOmega(omega: Vector): ParticleSystemParamBuilder
  srcBurstSpeedMin(speedMin: number): ParticleSystemParamBuilder
  srcBurstSpeedMax(speedMax: number): ParticleSystemParamBuilder
}

declare function particleSystem(): ParticleSystemParamBuilder

declare function linkParticleSystem(linkNumber: number): ParticleSystemParamBuilder

/** Fluent builder for CameraParam lists. Compiles to a flat parameter list at build time. */
interface CameraParamBuilder {
  active(isActive: boolean): CameraParamBuilder
  behindnessAngle(degrees: number): CameraParamBuilder
  behindnessLag(seconds: number): CameraParamBuilder
  distance(meters: number): CameraParamBuilder
  focus(position: Vector): CameraParamBuilder
  focusLag(seconds: number): CameraParamBuilder
  focusLocked(isLocked: number): CameraParamBuilder
  focusOffset(meters: Vector): CameraParamBuilder
  focusThreshold(meters: number): CameraParamBuilder
  pitch(degrees: number): CameraParamBuilder
  position(position: Vector): CameraParamBuilder
  positionLag(seconds: number): CameraParamBuilder
  positionLocked(isLocked: number): CameraParamBuilder
  positionThreshold(meters: number): CameraParamBuilder
}

declare function setCameraParams(): CameraParamBuilder

/** Options object for httpRequest. All properties are optional. */
interface HttpParamOptions {
  method?: string
  mimetype?: string
  bodyMaxlength?: number
  verifyCert?: number
  verboseThrottle?: number
  customHeader?: [string, string]
  pragmaNoCache?: number
  userAgent?: string
  accept?: string
  extendedError?: number
  body?: string
}

declare function httpRequest(url: string, options: HttpParamOptions): UUID

/** Options object for castRay. All properties are optional. */
interface CastRayParamOptions {
  rejectTypes?: number
  dataFlags?: number
  maxHits?: number
  detectPhantom?: number
}

declare function castRay<const Opts extends CastRayParamOptions>(
  start: Vector,
  end: Vector,
  options: Opts,
): CastRayResult<Opts>

/** Fluent builder for CharacterParam lists. Compiles to a flat parameter list at build time. */
interface CharacterParamBuilder {
  desiredSpeed(desiredSpeed: number): CharacterParamBuilder
  radius(radius: number): CharacterParamBuilder
  length(length: number): CharacterParamBuilder
  orientation(orientation: number): CharacterParamBuilder
  type(type: number): CharacterParamBuilder
  avoidanceMode(avoidanceMode: number): CharacterParamBuilder
  maxAccel(maxAccel: number): CharacterParamBuilder
  maxDecel(maxDecel: number): CharacterParamBuilder
  desiredTurnSpeed(desiredTurnSpeed: number): CharacterParamBuilder
  maxTurnRadius(maxTurnRadius: number): CharacterParamBuilder
  maxSpeed(maxSpeed: number): CharacterParamBuilder
  accountForSkippedFrames(accountForSkippedFrames: number): CharacterParamBuilder
  stayWithinParcel(stayWithinParcel: number): CharacterParamBuilder
}

declare function createCharacter(): CharacterParamBuilder

declare function updateCharacter(): CharacterParamBuilder

/** Fluent builder for GltfOverrideParam lists. Compiles to a flat parameter list at build time. */
interface GltfOverrideParamBuilder {
  baseColorFactor(baseColorFactor: Vector | ""): GltfOverrideParamBuilder
  baseAlpha(baseAlpha: number | ""): GltfOverrideParamBuilder
  baseAlphaMode(baseAlphaMode: number | ""): GltfOverrideParamBuilder
  baseAlphaMask(baseAlphaMask: number | ""): GltfOverrideParamBuilder
  baseDoubleSided(baseDoubleSided: number | ""): GltfOverrideParamBuilder
  metallicFactor(metallicFactor: number | ""): GltfOverrideParamBuilder
  roughnessFactor(roughnessFactor: number | ""): GltfOverrideParamBuilder
  emissiveFactor(emissiveFactor: Vector | ""): GltfOverrideParamBuilder
}

declare function setGltfOverrides(link: number, face: number): GltfOverrideParamBuilder

/** Fluent builder for RezParam lists. Compiles to a flat parameter list at build time. */
interface RezParamBuilder {
  param(param: number): RezParamBuilder
  flags(flags: number): RezParamBuilder
  pos(pos: Vector, relative: number, atRoot: number): RezParamBuilder
  rot(rot: Quaternion, relative: number): RezParamBuilder
  vel(velocity: Vector, local: number, inherit: number): RezParamBuilder
  accel(force: Vector, local: number): RezParamBuilder
  omega(axis: Vector, local: number, spin: number, gain: number): RezParamBuilder
  damage(damage: number): RezParamBuilder
  sound(sound: string, volume: number, loop: number): RezParamBuilder
  soundCollide(sound: string, volume: number): RezParamBuilder
  lockAxes(locks: Vector): RezParamBuilder
  damageType(damageType: number): RezParamBuilder
  paramString(startParam: string): RezParamBuilder
}

declare function rezObjectWithParams(inventoryItem: string): RezParamBuilder
