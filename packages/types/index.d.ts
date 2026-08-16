// Auto-generated from slua_definitions.yaml and lsl_definitions.yaml
// Do not edit manually.
/// <reference types="@typescript-to-lua/language-extensions" />
/**
 * A set of four float values. Used to represent rotations and orientations.
 * @customConstructor quaternion.create
 */
declare class Quaternion {
  constructor(x: number, y: number, z: number, s: number)
  /** X component of the rotation/quaternion. */
  readonly x: number
  /** Y component of the rotation/quaternion. */
  readonly y: number
  /** Z component of the rotation/quaternion. */
  readonly z: number
  /** S component of the rotation/quaternion. Equivalent to the W component in other notations. */
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
  /** Returns true if the UUID is not the null UUID (all zeros). */
  readonly istruthy: boolean
  /** Returns the raw 16-byte binary string of the UUID. */
  readonly bytes: string
}

/**
 * A set of three float values. Used to represent colors (RGB), positions, directions, and velocities.
 * @customConstructor vector.create
 */
declare class Vector {
  constructor(x: number, y: number, z?: number)
  /** X coordinate component of the vector. Typically represents red color, forward position, or pitch. */
  readonly x: number
  /** Y coordinate component of the vector. Typically represents green color, left/right position, or roll. */
  readonly y: number
  /** Z coordinate component of the vector. Typically represents blue color, altitude/upward position, or yaw. */
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
  /** Index of the detected entity. */
  readonly index: number
  /** Returns true if the detected index is valid and contains active data. */
  readonly valid: boolean
  /** Returns true if the detected object or avatar can have its damage adjusted. */
  readonly canAdjustDamage: boolean
  /** Modifies the amount of damage applied by the current on_damage event after it completes processing, specified by the damage event index number. */
  adjustDamage(newDamage: number): void
  /** Returns a list containing pending damage information for the event specified by number, including the current damage, the damage type, and the original damage delivered. */
  getDamage(): DamageDetails
  /** Returns a vector representing the grab offset of the user touching the object. Only works in touch events and returns <0.0, 0.0, 0.0> if number is not a valid index. */
  getGrab(): Vector
  /** Returns TRUE if the detected object or avatar specified by number has the same active group as the prim containing the script. Returns FALSE if the group is not active or if they are not in the group. */
  getGroup(): number
  /** Returns the key (UUID) of the detected object or avatar specified by number, or NULL_KEY if number is not a valid index. */
  getKey(): UUID
  /** Returns the link number (integer) of the triggered event (touches and collisions only) specified by number. Returns 0 for non-linked objects, 1 for the root prim, and 2+ for child prims. Returns 0 if not supported by the event. */
  getLinkNumber(): number
  /** Returns a string representing the name of the detected object or avatar specified by item. Returns an empty string if item is not a valid index. */
  getName(): string
  /** Returns the key (UUID) of the owner of the detected object specified by number. Returns an invalid key if number is not a valid index. */
  getOwner(): UUID
  /** Returns the vector position (in region coordinates) of the detected object or avatar specified by number, or <0.0, 0.0, 0.0> if number is not a valid index. */
  getPos(): Vector
  /** Returns the key (UUID) of the object or avatar that rezzed the detected object specified by number. */
  getRezzer(): UUID
  /** Returns the rotation of the detected object or avatar specified by number, or <0.0, 0.0, 0.0, 1.0> if number is not a valid offset index. */
  getRot(): Quaternion
  /** Returns the surface binormal vector (tangent to the surface, pointing along the positive T (V) direction of tangent space) at the touched location specified by index. Can be used with llDetectedTouchNormal to determine the tangent space. */
  getTouchBinormal(): Vector
  /** Returns the integer index of the face clicked by the avatar in the touch event specified by index. */
  getTouchFace(): number
  /** Returns the surface normal vector (perpendicular to the surface) at the touched location specified by index. Can be used with llDetectedTouchBinormal to determine the tangent space. */
  getTouchNormal(): Vector
  /** Returns the vector position where the object was touched (specified by index) in region coordinates, or in screen-space coordinates if the object is attached as a HUD. */
  getTouchPos(): Vector
  /** Returns the surface coordinates (<s, t, 0.0>) where the prim was touched, specified by index. X and Y contain the horizontal (s) and vertical (t) face coordinates, typically in the interval [0.0, 1.0]. Returns TOUCH_INVALID_TEXCOORD if coordinates cannot be determined. */
  getTouchST(): Vector
  /** Returns the texture coordinates (<u, v, 0.0>) where the prim was touched, specified by index. X and Y contain the horizontal (u) and vertical (v) texture coordinates, typically in the interval [0.0, 1.0] (affected by repeats and rotation). Returns TOUCH_INVALID_TEXCOORD if coordinates cannot be determined. */
  getTouchUV(): Vector
  /** Returns an integer bitfield representing the types (AGENT, ACTIVE, PASSIVE, or SCRIPTED) of the detected object or avatar specified by number. Returns 0 if number is not a valid index. */
  getType(): number
  /** Returns the vector velocity of the detected object or avatar specified by number, or <0.0, 0.0, 0.0> if number is not a valid offset index. */
  getVel(): Vector
}

/** @noSelf */
declare interface LLEventMap {
  /** Triggered when the script's rotation (ourrot) comes within a defined angle (error) of the target rotation (targetrot) set by a call to llRotTarget (which returns the associated handle). */
  at_rot_target: (handle: number, targetrot: Quaternion, ourrot: Quaternion) => void
  /** Triggered when the scripted object's position (ourpos) comes within the defined range of the target position (targetpos) set by llTarget (which returns the associated handle tnum). */
  at_target: (tnum: number, targetpos: Vector, ourpos: Vector) => void
  /** Triggered whenever the object is attached to or detached from an avatar. Passes the UUID key of the avatar if attached, or NULL_KEY if detached. */
  attach: (avatar: UUID) => void
  /** Triggered when various properties of the object change. The parameter changes is a bitfield of CHANGED_* flags. */
  changed: (changes: number) => void
  /** Triggered continuously while an avatar or another object is colliding with the object containing the script. Passes num_detected, representing the number of detected collisions. */
  collision: (detected: DetectedEvent[]) => void
  /** Triggered when an avatar or another object stops colliding with the object containing the script. Passes num_detected, representing the number of detected collisions. */
  collision_end: (detected: DetectedEvent[]) => void
  /** Triggered when an avatar or another object first begins colliding with the object containing the script. Passes num_detected, representing the number of detected collisions. */
  collision_start: (detected: DetectedEvent[]) => void
  /** Triggered to pass captured avatar control inputs into the script. The parameter level indicates held controls, and edge indicates change in controls (both are bitfields of CONTROL_* constants). */
  control: (id: UUID, level: number, edge: number) => void
  /** Triggered when requested data is returned to the script (e.g., from llRequestAgentData, llRequestInventoryData, or llGetNotecardLine). */
  dataserver: (queryid: UUID, data: string) => void
  /** Receive an email requested by llGetNextEmail(). NumberRemaining indicates the number of emails remaining in the queue for llGetNextEmail() to retrieve. */
  email: (time: string, address: string, subject: string, msg: string, numLeft: number) => void
  /** Triggered when the agent specified by agent_id approves an experience permissions request (interactively or automatically if previously approved). */
  experience_permissions: (agentId: UUID) => void
  /** Triggered when the agent specified by agent_id denies experience permissions, or when permission is blocked for other reasons (specified by the error code reason). */
  experience_permissions_denied: (agentId: UUID, reason: number) => void
  /** Triggered after all on_damage events across all scripts have completed and damage is actively applied to the avatar or distributed among seated avatars. Collision detected functions (llDetected*) and llDetectedDamage are available. */
  final_damage: (detected: DetectedEvent[]) => void
  /** Triggered when a compatible viewer sends game controller input changes for the avatar specified by id. Only triggers for scripts in attachments or seats. */
  game_control: (id: UUID, buttonLevels: number, axes: number[]) => void
  /** Triggered when the script's registered URL receives an incoming HTTP request identified by request_id. */
  http_request: (requestId: UUID, method: string, body: string) => void
  /** Triggered when an HTTP response body is received for a pending request_id, or if the request fails or times out. */
  http_response: (requestId: UUID, status: number, metadata: list, body: string) => void
  /** Triggered in the root prim when a physical object or attached avatar is colliding with the ground at position pos. */
  land_collision: (pos: Vector) => void
  /** Triggered in the root prim when a physical object or attached avatar stops colliding with the ground at position pos. */
  land_collision_end: (pos: Vector) => void
  /** Triggered in the root prim when a physical object or attached avatar first begins colliding with the ground at position pos. */
  land_collision_start: (pos: Vector) => void
  /** Triggered when the script receives a link message from sender_num, containing the parameters num, str, and id sent via llMessageLinked. */
  link_message: (senderNum: number, num: number, str: string, id: string) => void
  /** Fires in all scripts in the linkset whenever the datastore has been modified via an llLinksetData function. Passes the action taken, the affected key name, and the new value. */
  linkset_data: (action: number, name: string, value: string) => void
  /** Triggered when a chat message matching active llListen filters is received on channel. Passes the sender's name and UUID key id, along with the spoken string msg. */
  listen: (channel: number, name: string, id: UUID, msg: string) => void
  /** Triggered when a resident specified by id pays an amount of Linden dollars (L$) to the prim. */
  money: (id: UUID, amount: number) => void
  /** Triggered whenever the physical or moving object containing the script stops moving. */
  moving_end: () => void
  /** Triggered whenever the physical or moving object containing the script starts moving. */
  moving_start: () => void
  /** Triggered when active sensors (from llSensor or llSensorRepeat) complete a scan without finding any matching targets. */
  no_sensor: () => void
  /** Triggered continuously while the object's rotation is outside the leeway angle of targets set via llRotTarget. */
  not_at_rot_target: () => void
  /** Triggered continuously while the object's position has not yet reached the range of targets set via llTarget. */
  not_at_target: () => void
  /** Triggered when this object successfully rezzes another object from its inventory. Passes the key (UUID) id of the newly rezzed object. */
  object_rez: (id: UUID) => void
  /** Triggered when damage has been inflicted on an avatar or task, but before it is applied or distributed. Collision detected functions (llDetected*), llDetectedDamage, and llAdjustDamage are available. Passes num_detected, representing the number of pending damage events. */
  on_damage: (detected: DetectedEvent[]) => void
  /** Triggered on all worn attachments when the wearing avatar's health reaches 0. */
  on_death: () => void
  /** Triggered when the object is rezzed into the world (by a script or user). Passes start_param from the rezzing call (or 0 if rezzed from inventory). Also triggers on attachments during login or when attached from inventory. */
  on_rez: (startParam: number) => void
  /** Triggered to inform the script of changes or failures in the pathfinding character's status. */
  path_update: (type: number, reserved: list) => void
  /**
   * Deprecated. Triggered by incoming XML-RPC calls, passing event_type, channel, message_id, sender, idata, and sdata.
   * @deprecated
   */
  remote_data: (
    eventType: number,
    channel: UUID,
    messageId: UUID,
    sender: string,
    idata: number,
    sdata: string,
  ) => void
  /** Triggered when an agent grants or denies runtime permissions requested by llRequestPermissions. Passes the active integer permissions bitfield perm (returns 0 if no permissions are currently granted). */
  run_time_permissions: (perm: number) => void
  /** Triggered when objects matching constraints of llSensor or llSensorRepeat are successfully detected. Passes num_detected, representing the number of detected targets. */
  sensor: (detected: DetectedEvent[]) => void
  /**
   * Triggered at regular periodic intervals configured by llSetTimerEvent.
   * @deprecated Use 'LLTimers' instead.
   */
  timer: () => void
  /** Triggered continuously while an avatar touches the object. Passes num_detected, representing the number of touching agents. */
  touch: (detected: DetectedEvent[]) => void
  /** Triggered when an avatar stops touching the object. Passes num_detected, representing the number of touching agents. */
  touch_end: (detected: DetectedEvent[]) => void
  /** Triggered when an avatar first touches the object. Passes num_detected, representing the number of touching agents. */
  touch_start: (detected: DetectedEvent[]) => void
  /** Triggered when an asynchronous L$ transfer (such as llTransferLindenDollars) is completed. Passes transaction info id, success status, and CSV or error data. */
  transaction_result: (id: UUID, success: boolean, data: string) => void
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
declare type DateTypeArg = {
  year: number
  month: number
  day: number
  hour?: number
  min?: number
  sec?: number
  isdst?: boolean
}
/** Date/time table structure used by os.date and os.time */
declare type DateTypeResult = {
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
/** Particle system parameter table. Pass to llprim.setParticleSystem() to emit particles. */
declare type ParticleParams = Record<string, any>
/** Prim face media parameter table. Pass to llprim.setMedia() to configure media on a face. */
declare type MediaParams = Record<string, any>
/** HTTP request parameter table. Pass to ll.HTTPRequest() to configure an HTTP request. */
declare type HttpRequestParams = Record<string, any>

/** Event registration and management class for Second Life events. Supports adding multiple handlers per event and dynamic registration. */
declare interface LLEvents {
  /** Registers a handler function to run whenever the specified event occurs. Multiple handlers can be attached to the same event and will run in the order they were added. Returns the same function passed in so it can be used later with LLEvents:off(). */
  on<E extends keyof LLEventMap>(event: E, callback: LLEventMap[E]): LLEventMap[E]
  /** Removes an event handler. If the function was added multiple times via LLEvents:on(), only the last one added is removed. Returns true if the function was found and removed, false otherwise. */
  off<E extends keyof LLEventMap>(event: E, callback: LLEventMap[E]): boolean
  /** Registers a one-time event handler. The function runs only once and is automatically removed afterward. Returns a newly generated wrapper function, which MUST be used if you want to manually remove the handler early using LLEvents:off(). */
  once<E extends keyof LLEventMap>(event: E, callback: LLEventMap[E]): LLEventMap[E]
  /** Returns an array table containing all the functions currently handling the specified event. Useful for debugging or for iterating to remove all functions handling an event. */
  handlers<E extends keyof LLEventMap>(event: E): LLEventMap[E][]
  /** Returns an array table of all event names that currently have active handler functions attached. */
  eventNames(): (keyof LLEventMap)[]
}

/** Timer management class for scheduling periodic and one-time callbacks. Note: Do not mix LLTimers with old LSL timer functions (e.g., llcompat.SetTimerEvent), as they share the same underlying event and will interfere with each other. */
declare interface LLTimers {
  /** Registers a repeating timer. The callback receives (expected_time, interval). Returns the same function passed in so it can be removed later. */
  every(seconds: number, callback: LLTimerEveryCallback): LLTimerCallback
  /** Registers a one-time timer. The timer runs only once and is automatically removed afterward. The callback receives (expected_time, nil). Returns the same function passed in, which can be used to cancel it early via LLTimers:off(). */
  once(seconds: number, callback: LLTimerOnceCallback): LLTimerCallback
  /** Stops and removes a timer. If the same function was added multiple times, only the last one added is removed, regardless of its interval. Returns true if the timer was found and removed, false otherwise. */
  off(callback: LLTimerCallback): boolean
}

/**
 * Metatable for building lists to pass to ll.SetLinkPrimitiveParamsFast
 * @noSelf
 */
declare interface PrimParamsSetterType {
  /** Call ll.SetLinkPrimitiveParamsFast with my instance list */
  apply(link?: number): void
}

/** rotation is an alias for quaternion. */
declare const rotation: typeof quaternion
/** Event registration and management singleton for Second Life events. */
declare const LLEvents: LLEvents
/** Timer management singleton for scheduling periodic and one-time callbacks. */
declare const LLTimers: LLTimers

/**
 * Checks if the value is truthy; if not, raises an error with the optional message. Returns the value upon success.
 * @noSelf
 */
declare function assert<T>(value?: T, errorMessage?: string): T
/**
 * Alias for gcinfo
 * @noSelf
 */
declare function collectgarbage(option: "count"): number
/**
 * Run the garbage collector
 * @noSelf
 */
declare function collectgarbage(option?: "collect"): void
/**
 * Dangerously executes a required module function
 * @noSelf
 */
declare function dangerouslyexecuterequiredmodule(f: (this: void, ...args: any[]) => any[]): any[]
/**
 * Raises an error with the specified object. The optional level determines which call stack level is blamed for the error.
 * @noSelf
 */
declare function error<T>(message: T, level?: number): never
/**
 * Returns the total heap size in kilobytes.
 * @noSelf
 */
declare function gcinfo(): number
/**
 * Get the scoped environment for the given function.
 * @noSelf
 */
declare function getfenv(
  target: ((this: void, ...args: any[]) => any[]) | number,
): Record<string, any>
/**
 * Returns the metatable for the specified object. If the metatable has a '__metatable' field, returns its value instead.
 * @noSelf
 */
declare function getmetatable<T>(obj: T): Record<string, any> | undefined
/**
 * Writes the contents of heap to the given file in JSON format. Intended to be used with tools/graphanalyze.py
 * @noSelf
 */
declare function graphheap(path: string): void
/**
 * Writes the contents of user heap to the given file in JSON format. Intended to be used with tools/graphanalyze.py
 * @noSelf
 */
declare function graphuserheap(path: string): void
/**
 * Returns an iterator for sequential integer key-value pairs in the table. Iteration starts at 1 and halts at the first nil value.
 * @noSelf
 */
declare function ipairs<V>(
  tab: V[],
): LuaMultiReturn<
  [(this: void, arg0: V[], arg1: number) => LuaMultiReturn<[number | undefined, V]>, V[], number]
>
/**
 * Compile Luau code into a function.
 * @noSelf
 */
declare function loadstring(src: string, chunkname?: string): any
/**
 * Creates a new untyped userdata object with an optional metatable.
 * @noSelf
 */
declare function newproxy(mt?: boolean): any
/**
 * Returns the next key-value pair in the table traversal order. If the index is nil or omitted, returns the first pair.
 * @noSelf
 */
declare function next<K, V>(t: Record<K, V>, i?: K): LuaMultiReturn<[K | undefined, V]>
/**
 * Returns an iterator for all key-value pairs in the table.
 * @noSelf
 */
declare function pairs<K, V>(
  t: Record<K, V>,
): LuaMultiReturn<
  [
    (this: void, arg0: Record<K, V>, arg1: K | undefined) => LuaMultiReturn<[K | undefined, V]>,
    Record<K, V>,
    K,
  ]
>
/**
 * Executes function f in protected mode, calling it with the provided arguments. Returns a boolean indicating success. If true, it also returns the function's results. If false, it returns the error message.
 * @noSelf
 */
declare function pcall(f: (...args: any[]) => any, ...args: any[]): any
/**
 * Sends all arguments as text privately to the object owner, separated by 4 spaces. The owner must be currently in the same region for the message to be received.
 * @noSelf
 */
declare function print(...args: any[]): void
/**
 * Returns true if a and b have the same type and value or reference, bypassing the __eq metamethod..
 * @noSelf
 */
declare function rawequal<T1, T2>(a: T1, b: T2): boolean
/**
 * Performs a table lookup, bypassing the __index metamethod..
 * @noSelf
 */
declare function rawget<K, V>(t: Record<K, V>, k: K): V | undefined
/**
 * Returns the length of a table or string, bypassing the __len metamethod..
 * @noSelf
 */
declare function rawlen<K, V>(t: Record<K, V> | string): number
/**
 * Assigns a value to a table field, bypassing the __newindex metamethod..
 * @noSelf
 */
declare function rawset<K, V>(t: Record<K, V>, k: K, v: V): Record<K, V>
/**
 * Execute the named external module.
 * @noSelf
 */
declare function require(target: any): any
/**
 * Returns a subset of arguments starting from the specified index. Supports negative indexing. If index is '#', returns the number of arguments.
 * @noSelf
 */
declare function select(i: string | number, ...args: any[]): any[]
/**
 * Set the scoped environment for the given function.
 * @noSelf
 */
declare function setfenv(target: number | ((...args: any[]) => any), env: Record<string, any>): any
/**
 * Changes the metatable for the given table. Raises an error if the table already has a protected metatable (it has a '__metatable' field).
 * @noSelf
 */
declare function setmetatable<T, MT>(t: T, mt: MT): T
/**
 * Converts the input string to a number in the specified base. Returns nil if invalid.
 * @noSelf
 */
declare function tonumber(value: string | undefined | number, base?: number): number | undefined
/**
 * Converts a string to a quaternion. Returns nil if invalid.
 * @noSelf
 */
declare function toquaternion(value: string | undefined | Quaternion): Quaternion | undefined
/**
 * Converts a string to a rotation (quaternion). Returns nil if invalid.
 * @noSelf
 */
declare function torotation(value: string | undefined | Quaternion): Quaternion | undefined
/**
 * Converts the input object to a string. Calls the metatable's '__tostring' metamethod if present.
 * @noSelf
 */
declare function tostring<T>(value: T): string
/**
 * Creates a new uuid from a string, buffer, or existing uuid. Returns nil if the string is not a valid UUID, or the buffer is shorter than 16 bytes.
 * @noSelf
 */
declare function touuid(val: string | undefined | buffer | UUID): UUID | undefined
/**
 * Converts a string to a vector. Returns nil if invalid.
 * @noSelf
 */
declare function tovector(val: string | undefined | Vector): Vector | undefined
/**
 * Returns the type of the object as a string.
 * @noSelf
 */
declare function type<T>(obj: T): string
/**
 * Returns values from an array in the specified index range.
 * @noSelf
 */
declare function unpack<V>(tab: V[], i?: number, j?: number): V[]
/**
 * Calls function f with the provided arguments, handling errors with err if they occur.
 * @noSelf
 */
declare function xpcall<E>(
  f: (...args: any[]) => any,
  err: (...args: any[]) => any,
  ...args: any[]
): any

/** Bitwise operations library. */
/** @noSelf */
declare namespace bit32 {
  /** Returns val shifted by i bits to the right. If i is negative, a left shift is performed.Does an arithmetic shift: The most significant bit of n is propagated during the shift.Returns 0 if i < -31, or all sign bits if i > 31. */
  export function arshift(val: number, i: number): number

  /** Returns the bitwise AND of the given numbers. */
  export function band(...args: number[]): number

  /** Returns the bitwise negation of val. */
  export function bnot(val: number): number

  /** Returns the bitwise OR of the given numbers. */
  export function bor(...args: number[]): number

  /** Returns the bitwise XOR of the given numbers. */
  export function bxor(...args: number[]): number

  /** Returns true if the bitwise AND of the given numbers is non-zero. */
  export function btest(...args: number[]): boolean

  /** Returns width bits from src, starting from bit index field. Raises an error if the selected bit range is goes outside the range [0, 31]. */
  export function extract(src: number, field: number, width?: number): number

  /** Returns val rotated by i bits to the left. If i is negative, a right rotate is performed. */
  export function lrotate(val: number, i: number): number

  /** Returns val shifted by i bits to the left. If i is negative, a right shift is performed. Returns 0 if i is outside the [-31, 31] range. */
  export function lshift(val: number, i: number): number

  /** Returns dst with width bits replaced from src, starting from bit index field. Raises an error if the selected bit range goes outside the range [0, 31]. */
  export function replace(dst: number, src: number, field: number, width?: number): number

  /** Returns val rotated by i bits to the right. If i is negative, a left rotate is performed. */
  export function rrotate(val: number, i: number): number

  /** Returns val shifted by i bits to the right. If i is negative, a left shift is performed. Returns 0 if i is outside the [-31, 31] range. */
  export function rshift(val: number, i: number): number

  /** Returns val, wrapped from float64 range to signed int32 range and truncated to integer. Makes integer arithmetic compatable with LSL. */
  export function s32(val: number): number

  /** Returns the product of two signed 32-bit integers as a signed 32-bit integer, wrapping as necessary. Avoids precision loss associated with float64 multiplication. Compatible with LSL integer multiplication. */
  export function smul(val1: number, val2: number): number

  /** Returns the count of val's leading zeros. */
  export function countlz(val: number): number

  /** Returns the count of val's trailing zeros. */
  export function countrz(val: number): number

  /** Returns val with its bytes swapped to the reverse order. */
  export function byteswap(val: number): number
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

  /** Reads a signed or unsigned 64-bit integer from the buffer at the given offset. */
  export function readinteger(b: buffer, offset: number): integer

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

  /** Writes a signed or unsigned 64-bit integer to the buffer at the given offset. */
  export function writeinteger(b: buffer, offset: number, value: integer): void

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

  /** Resumes a coroutine. Returns true followed by any values passed to coroutine.yield() or returned by the function. If an error occurs, returns false and the error message. */
  export function resume(co: LuaThread, ...args: any[]): LuaMultiReturn<[boolean, ...args: any[]]>

  /** Returns the currently running coroutine, or nil if called from the main coroutine. */
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
  /** Returns information about a stack level. */
  export function info(level: number, s: string): any[]

  /** Returns information about a function. */
  export function info(func: (this: void, ...args: any[]) => any[], s: string): any[]

  /** Returns information about a stack frame or function based on specified format. */
  export function info(
    co: LuaThread | ((this: void, ...args: any[]) => any[]) | number,
    level: number,
    s: string,
  ): any[]

  /** Returns a string with a traceback of the current call stack. */
  export function traceback(msg?: string, level?: number): string

  /** Returns a human-readable call stack starting from the specified level. */
  export function traceback(co: LuaThread, msg?: string, level?: number): string
}

/** 64-bit integer operations library. */
/** @noSelf */
declare namespace integer {
  /** Returns the sum of two 64-bit integers (signed or unsigned), wrapping on overflow. */
  export function add(int1: integer, int2: integer): integer

  /** Returns val shifted by i bits to the right. If i is negative, a left shift is performed.Does an arithmetic shift: The most significant bit of n is propagated during the shift. */
  export function arshift(val: integer, i: integer): integer

  /** Returns the bitwise AND of the given integers. */
  export function band(...args: integer[]): integer

  /** Returns the bitwise negation of val. */
  export function bnot(val: integer): integer

  /** Returns the bitwise OR of the given integers. */
  export function bor(...args: integer[]): integer

  /** Returns the bitwise XOR of the given integers. */
  export function bxor(...args: integer[]): integer

  /** Returns val with its bytes swapped to the reverse order. */
  export function bswap(val: integer): integer

  /** Returns true if the bitwise AND of the given integers is non-zero. */
  export function btest(...args: integer[]): boolean

  /** Returns val clamped between min and max. Raises an error if min is greater than max. */
  export function clamp(val: integer, min: integer, max: integer): integer

  /** Returns the count of val's leading zeros. */
  export function countlz(val: integer): integer

  /** Returns the count of val's trailing zeros. */
  export function countrz(val: integer): integer

  /** Returns number val converted to an integer. Returns nil if it has a fractional part, is out of range, or is NaN. */
  export function create(val: number): integer | undefined

  /** Returns dividend / divisor (signed), rounding toward zero. Raises an error if divisor is zero. */
  export function div(dividend: integer, divisor: integer): integer

  /** Returns width bits from src, starting from bit index field. Raises an error if the selected bit range is goes outside the range [0, 63]. */
  export function extract(src: integer, field: integer, width?: integer): integer

  /** Converts the input string to an integer in the specified base. Returns nil if not an integer. */
  export function fromstring(value: string, base?: number): integer | undefined

  /** Returns true if int1 >= int2 (signed). */
  export function ge(int1: integer, int2: integer): boolean

  /** Returns true if int1 > int2 (signed). */
  export function gt(int1: integer, int2: integer): boolean

  /** Returns dividend / divisor (signed), rounding toward negative infinity. Raises an error if divisor is zero. */
  export function idiv(dividend: integer, divisor: integer): integer

  /** Returns true if int1 <= int2 (signed). */
  export function le(int1: integer, int2: integer): boolean

  /** Returns true if int1 < int2 (signed). */
  export function lt(int1: integer, int2: integer): boolean

  /** Returns val rotated by i bits to the left. If i is negative, a right rotate is performed. */
  export function lrotate(val: integer, i: integer): integer

  /** Returns val shifted by i bits to the left. If i is negative, a right shift is performed. Returns 0 if i is outside the [-63, 63] range. */
  export function lshift(val: integer, i: integer): integer

  /** Returns the maximum value from the given integers (signed). */
  export function max(val: integer, ...args: integer[]): integer

  /** Returns the minimum value from the given integers (signed). */
  export function min(val: integer, ...args: integer[]): integer

  /** Returns the remainder of dividend / divisor (signed). The result always has the same sign as the divisor. Raises an error if divisor is zero. */
  export function mod(dividend: integer, divisor: integer): integer

  /** Returns the product of two 64-bit integers (signed or unsigned), wrapping on overflow. */
  export function mul(int1: integer, int2: integer): integer

  /** Returns the negation of val. integer.neg(integer.minsigned) == integer.minsigned due to overflow. */
  export function neg(val: integer): integer

  /** Returns the remainder of dividend / divisor (signed). The result always has the same sign as the dividend. Raises an error if divisor is zero. */
  export function rem(dividend: integer, divisor: integer): integer

  /** Returns dst with width bits replaced from src, starting from bit index field. Raises an error if the selected bit range goes outside the range [0, 63]. */
  export function replace(dst: integer, src: integer, field: integer, width?: integer): integer

  /** Returns val rotated by i bits to the right. If i is negative, a left rotate is performed. */
  export function rrotate(val: integer, i: integer): integer

  /** Returns val shifted by i bits to the right. If i is negative, a left shift is performed. Returns 0 if i is outside the [-63, 63] range. */
  export function rshift(val: integer, i: integer): integer

  /** Returns the difference between two 64-bit integers (signed or unsigned), wrapping on overflow. */
  export function sub(int1: integer, int2: integer): integer

  /** Returns the nearest float64 to the given int64. Is inexact above 2^53. */
  export function tonumber(val: integer): number

  /** Returns dividend / divisor (unsigned), rounding toward negative infinity. Raises an error if divisor is zero. */
  export function udiv(dividend: integer, divisor: integer): integer

  /** Returns true if int1 >= int2 (unsigned). */
  export function uge(int1: integer, int2: integer): boolean

  /** Returns true if int1 > int2 (unsigned). */
  export function ugt(int1: integer, int2: integer): boolean

  /** Returns true if int1 <= int2 (unsigned). */
  export function ule(int1: integer, int2: integer): boolean

  /** Returns true if int1 < int2 (unsigned). */
  export function ult(int1: integer, int2: integer): boolean

  /** Returns the remainder of dividend / divisor (unsigned). Raises an error if divisor is zero. */
  export function urem(dividend: integer, divisor: integer): integer

  /** The most positive signed int64 (2^63-1). */
  export const maxsigned: integer
  /** The most negative signed int64 (-2^63). */
  export const minsigned: integer
}

/** Base64 encoding/decoding library. */
/** @noSelf */
declare namespace llbase64 {
  /** Encodes a string or buffer to base64. */
  export function encode(data: string | buffer): string

  /** Decodes a base64 string to a buffer if asBuffer is true. */
  export function decode(data: string, asBuffer: true): buffer

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
  /** A constant to return from a reviver/replacer function to omit this item. */
  export const remove: any
  /** Metatable for declaring a table as an array for json encode. */
  export const array_mt: { __jsonhint: string }
  /** Metatable for declaring a table as an object for json encode. */
  export const object_mt: { __jsonhint: string }
  /** A constant to pass for an empty array to json encode. */
  export const empty_array: any[]
  /** A constant to pass for an empty object to json encode. */
  export const empty_object: any[]
}

/** Utilities for working with prims / objects */
/** @noSelf */
declare namespace llprim {
  /** Emit a particle system from a ParticleParams table. Omit link to apply to the current prim. */
  export function setParticleSystem(params?: ParticleParams, link?: number): void

  /** Configure media on a specific face. Omit link to apply to the current prim. */
  export function setMedia(face: number, params?: MediaParams, link?: number): number

  /** Metatable for building lists to pass to ll.SetLinkPrimitiveParamsFast */
  export const ParamsSetter: PrimParamsSetterTypeMeta
}

/** Mathematical functions library. */
/** @noSelf */
declare namespace math {
  /** Returns the absolute (positive) value of val. */
  export function abs(val: number): number

  /** Returns the arccosine of val in radians. Returns NaN if val is not in range [-1.0, 1.0]. */
  export function acos(val: number): number

  /** Returns the arcsine of val in radians. Returns NaN if val is not in range [-1.0, 1.0]. */
  export function asin(val: number): number

  /** Returns the arctangent of val in radians. */
  export function atan(val: number): number

  /** Returns the arctangent of y/x in radians, using the signs to determine the quadrant. Note the argument order: Y is the first parameter, X is the second parameter. */
  export function atan2(y: number, x: number): number

  /** Returns val rounded toward positive infinity. In other words, returns the smallest integer greater than or equal to val. */
  export function ceil(val: number): number

  /** Returns val clamped between min and max. Raises an error if min is greater than max. */
  export function clamp(val: number, min: number, max: number): number

  /** Returns the cosine of theta. Theta is in radians. */
  export function cos(theta: number): number

  /** Returns the hyperbolic cosine of n. */
  export function cosh(val: number): number

  /** Returns theta converted from radians to degrees. */
  export function deg(theta: number): number

  /** Returns the e to the power of val. */
  export function exp(val: number): number

  /** Returns val rounded toward negative infinity. In other words, returns the largest integer less than or equal to val. */
  export function floor(val: number): number

  /** Returns the remainder (modulo) of dividend/modulus, (i.e. d mod m), rounded towards zero. Returns NaN if modulus is 0. Identical to d % m if both arguments have the same sign. */
  export function fmod(dividend: number, modulus: number): number

  /** Breaks a floating-point number into it's component parts significand and exponent. In other words, Returns significand s and integer exponent e such that val = s * 2^e. Inverse of math.ldexp. */
  export function frexp(val: number): LuaMultiReturn<[number, number]>

  /** Returns s * 2^e. Inverse of math.frexp */
  export function ldexp(significand: number, exponent: number): number

  /** Linearly interpolates between start_val and end_val using factor t. */
  export function lerp(startVal: number, endVal: number, t: number): number

  /** Returns the logarithm of val in the given base. The default base is e. */
  export function log(val: number, base?: number): number

  /** Returns the base-10 logarithm of val. */
  export function log10(val: number): number

  /** Maps val from input range to output range. */
  export function map(
    val: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number

  /** Returns the maximum value from the given numbers. */
  export function max(val: number, ...args: number[]): number

  /** Returns the minimum value from the given numbers. */
  export function min(val: number, ...args: number[]): number

  /** Returns the integer and fractional parts of val. */
  export function modf(val: number): LuaMultiReturn<[number, number]>

  /** Returns a Perlin noise value for the point (x, y, z). The return value is in the range [-1.0, 1.0]. */
  export function noise(x: number, y?: number, z?: number): number

  /** Returns base to the power of exponent. */
  export function pow(base: number, exponent: number): number

  /** Returns theta converted from degrees to radians. */
  export function rad(theta: number): number

  /** Returns a random number within the given range. */
  export function random(min?: number, max?: number): number

  /**
   * Sets the seed for the random number generator.
   * @deprecated Disabled in SLua.
   */
  export function randomseed(...args: never[]): void

  /** Returns val rounded to the nearest integer. Halfway values are rounded away from zero. */
  export function round(val: number): number

  /** Returns -1 if val is negative, 1 if positive, and 0 if zero. */
  export function sign(val: number): number

  /** Returns the sine of theta. Theta is in radians. */
  export function sin(theta: number): number

  /** Returns the hyperbolic sine of val. */
  export function sinh(val: number): number

  /** Returns the square root of val. If negative, return Nan. */
  export function sqrt(val: number): number

  /** Returns the tangent of theta. Theta is in radians. */
  export function tan(theta: number): number

  /** Returns the hyperbolic tangent of val. */
  export function tanh(val: number): number

  /** Returns true if val is NaN. */
  export function isnan(val: number): boolean

  /** Returns true if val is infinite. */
  export function isinf(val: number): boolean

  /** Returns true if val is finite. */
  export function isfinite(val: number): boolean

  /** Base of the natural logarithm. */
  export const e: number
  /** Value larger than any other numeric value (infinity). 1/0. */
  export const huge: number
  /** Value representing an error (not a number). 0/0. */
  export const nan: number
  /** Golden ratio. (1 + math.sqrt(5))/2. */
  export const phi: number
  /** Ratio of a circle's circumference to its diameter. The number of radians in a half circle (semi-circle). math.tau/2. */
  export const pi: number
  /** Square root of 2. math.sqrt(2). */
  export const sqrt2: number
  /** Ratio of a circle's circumference to its radius. The number of radians in a full circle. math.pi*2. */
  export const tau: number
}

/** Operating system facilities library. */
/** @noSelf */
declare namespace os {
  /** Returns a high-precision timestamp in seconds for measuring durations. Has a resolution of 0.0001s (222 ticks per server frame, 3 ticks per script time slice). 6-11x slower to look up than ll.GetTime. */
  export function clock(): number

  /** Returns a table or string representation of the time based on the provided format. */
  export function date(formatString: "*t" | "!*t", t?: number): DateTypeResult

  /** Returns a table or string representation of the time based on the provided format. */
  export function date(formatString?: string, t?: number): string

  /**
   * Returns the difference in seconds between two timestamps. Same as a - b.
   * @deprecated Same as a - b
   */
  export function difftime(a: number, b: number): number

  /** Returns the current Unix timestamp. */
  export function time(): number

  /** Returns the current Unix timestamp or the timestamp of the given date. */
  export function time(time: DateTypeArg): number | undefined
}

/** Quaternion manipulation library. */
/** @noSelf */
declare namespace Quaternion {
  /** Creates a new quaternion with the given component values. */
  export function create(x: number, y: number, z: number, s: number): Quaternion

  /** Returns the normalized unit quaternion pointing the same direction as q. If <0, 0, 0, 0>, return quaternion.identity = <0, 0, 0, 1>. */
  export function normalize(q: Quaternion): Quaternion

  /** Returns the magnitude (geometric length) of the quaternion. */
  export function magnitude(q: Quaternion): number

  /** Returns the dot product of two quaternions. */
  export function dot(q1: Quaternion, q2: Quaternion): number

  /** Spherical linear interpolation from start_q to end_q using factor t. */
  export function slerp(startQ: Quaternion, endQ: Quaternion, t: number): Quaternion

  /** Returns the conjugate of the quaternion. Equivalent to quaternion(-q.x, -q.y, -q.z, q.s)) */
  export function conjugate(q: Quaternion): Quaternion

  /** Returns the unit vector pointing toward positive X direction (forward) in the coordinate space of rotation q. Equivalent to vector(1, 0, 0) * q. */
  export function tofwd(q: Quaternion): Vector

  /** Returns the unit vector pointing toward positive Y direction (left) in the coordinate space of rotation q. Equivalent to vector(0, 1, 0) * q. */
  export function toleft(q: Quaternion): Vector

  /** Returns the unit vector pointing toward positive Z direction (up) in the coordinate space of rotation q. Equivalent to vector(0, 0, 1) * q. */
  export function toup(q: Quaternion): Vector

  /** Identity quaternion constant. Causes no change when rotated. */
  export const identity: Quaternion
}

/** String manipulation library. */
/** @noSelf */
declare namespace string {
  /** Returns the numeric code of every byte in the range start_index..end_index in the string src. Negative indices count backward from the end of the string. */
  export function byte(src: string, startIndex?: number): number

  export function byte(src: string, startIndex: number, endIndex: number): number[]

  /** Constructs and returns a string from the given byte integers. */
  export function char(...args: number[]): string

  /** Returns the start and end byte indices of the first occurrence of pattern inside the string src, followed by any regex-captured substrings. Search starts from start_index. Returns nil if not found. Negative indices count backward from the end of the string. */
  export function find(
    src: string,
    pattern: string,
    startIndex?: number,
    plain?: boolean,
  ): LuaMultiReturn<[number | undefined, number | undefined, ...args: string[]]>

  /** Formats input values into a string using printf-style format specifiers. */
  export function format(formatString: string, ...args: any[]): string

  /** Returns an iterator function of all occurences of the regex pattern inside the string src. */
  export function gmatch(src: string, pattern: string): (this: void) => string[]

  /** Returns a copy of src with maxn occurrences of the regex pattern replaced by repl, followed by the total number of substitutions that occurred. repl can be a string, function, or table. */
  export function gsub(
    src: string,
    pattern: string,
    repl: string | Record<string, string> | ((this: void, ...args: string[]) => string),
    maxn?: number,
  ): LuaMultiReturn<[string, number]>

  /** Returns the number of bytes in the string. Identical to #str. */
  export function len(str: string): number

  /** Returns a lowercase copy of the string src. Only converts ASCII characters. Use ll.ToLower for strings that may contain Unicode. */
  export function lower(src: string): string

  /** Returns all occurences of the regex pattern inside the string src, starting from start_index. Returns nil if no match is found. Negative indices count backward from the end of the string. */
  export function match(src: string, pattern: string, startIndex?: number): string | undefined[]

  /** Packs values into a binary string. */
  export function pack(formatString: string, ...args: any[]): string

  /** Returns the size of a packed string for the given format. */
  export function packsize(formatString: string): number

  /** Returns the string src repeated n times. Returns an empty string if n is zero or negative. */
  export function rep(src: string, count: number): string

  /** Returns a copy of the string src with bytes in reverse order. */
  export function reverse(src: string): string

  /** Splits a string by separator. Returns a list of substrings. If the separator is nil, splits at commas (","). If the separator is empty, splits into individual one-byte substrings. */
  export function split(src: string, separator?: string): string[]

  /** Returns a copy of the substring from src within the inclusive byte range start_index..end_index. Negative indices count backward from the end of the string. */
  export function sub(src: string, startIndex: number, endIndex?: number): string

  /** Decodes a binary string using a pack format, starting from index start. Negative indices count backward from the end of the string. */
  export function unpack(formatString: string, src: string, start?: number): any[]

  /** Returns an uppercase copy of the string src. Only converts ASCII characters. Use ll.ToUpper for strings that may contain Unicode. */
  export function upper(src: string): string
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

  /** Appends an element to the end of the array. Equivalent to a[#a+1] = value. */
  export function insert<V>(a: V[], value: V): void

  /** Inserts an element at index i, shifting subsequent elements up by 1. The index must be within the range [1, #a]. */
  export function insert<V>(a: V[], i: number, value: V): void

  /** Appends one or more elements to the end of the array. */
  export function append<V>(a: V[], ...args: V[]): void

  /** Appends all elements from one array to the end of another. Shorthand for table.move(b, 1, #b, #a+1, a). */
  export function extend<V>(a: V[], b: V[]): V[]

  /** Removes and returns the element at index i, shifting subsequent elements down by 1. Defaults to the end of the array. Returns nil if no element was removed. */
  export function remove<V>(a: V[], i?: number): V | undefined

  /** Sorts an array in place. */
  export function sort<V>(a: V[], f?: (this: void, a: V, b: V) => boolean): void

  /** Packs arguments into a table and sets an 'n' field with the total count. This is the safest way to pack varargs (...) that might contain nil values. */
  export function pack<V>(...args: V[]): { n: number; [index: number]: V }

  /** Unpacks array elements into multiple return values. */
  export function unpack<V>(a: V[], i?: number, j?: number): V[]

  /** Copies elements [i..j] from src array into dest array starting at [d], overwriting existing elements. */
  export function move<V>(src: V[], i: number, j: number, d: number, dest?: V[]): V[]

  /** Creates a new table with pre-allocated array capacity, optionally filled. Preallocation only benefits array portions and is counter-productive for dictionaries. */
  export function create<V>(n: number, v?: V): V[]

  /** Finds the first occurrence of a value in the array and returns its index. Traversal stops at the first nil. */
  export function find<V>(t: V[], v: V, i?: number): number | undefined

  /** Clears all elements from a table while keeping its capacity to avoid memory reallocations during future assignments. */
  export function clear(t: any[]): void

  /** Reduces the memory usage of the table to the minimum necessary. */
  export function shrink<V>(t: V[], shrinkSparse?: boolean): V[]

  /** Freezes a table, making it read-only. The freeze is shallow and does not affect nested tables. Raises an error if the table is already frozen or has a protected metatable. */
  export function freeze<table>(t: table): table

  /** Returns true if a table is frozen. */
  export function isfrozen(t: any[]): boolean

  /** Creates a shallow copy of the table, copying its keys, values, and metatable. The clone is always unfrozen even if the source was frozen. */
  export function clone<table>(t: table): table
}

/** UTF-8 support library. */
/** @noSelf */
declare namespace utf8 {
  /** Constructs and returns a string from the given Unicode codepoint ordinals. */
  export function char(...args: number[]): string

  /** Returns an iterator that produces the byte offset and Unicode codepoint for each character in the string src. */
  export function codes(
    src: string,
  ): LuaMultiReturn<
    [(this: void, arg0: string, arg1: number) => LuaMultiReturn<[number, number]>, string, number]
  >

  /** Returns the ordinals (Unicode copepoint integers) of the characters in the inclusive byte range start_index..end_index in the string src. Negative indices count backward from the end of the string. */
  export function codepoint(src: string, startIndex?: number): number

  export function codepoint(src: string, startIndex: number, endIndex: number): number[]

  /** Returns the number of Unicode codepoints in the inclusive byte range start_index..end_index of the string src. If the string is not utf8, returns (nil, error index) instead. Negative indices count backward from the end of the string. */
  export function len(
    str: string,
    startIndex?: number,
    endIndex?: number,
  ): LuaMultiReturn<[number | undefined, number | undefined]>

  /** Returns the byte offset of the nth Unicode codepoint in the string. Negative indices count backward from the end of the string. */
  export function offset(str: string, n: number, startIndex?: number): number | undefined

  /** Pattern that matches exactly one UTF-8 byte sequence. */
  export const charpattern: string
}

/** UUID library. */
/** @noSelf */
declare namespace UUID {
  /** Creates a new uuid from a string, buffer, or existing uuid. Throws an error if the string is not a valid UUID, or the buffer is shorter than 16 bytes. */
  export function create(value: string | undefined | buffer | UUID): UUID
}

/** Vector manipulation library. */
/** @noSelf */
declare namespace Vector {
  /** Creates a new vector with the given component values. */
  export function create(x: number, y: number, z?: number): Vector

  /** Returns the magnitude (geometric length) of the vector. */
  export function magnitude(vec: Vector): number

  /** Returns the normalized unit vector pointing the same direction as vec. If <0, 0, 0>, return <NaN, NaN, NaN>. */
  export function normalize(vec: Vector): Vector

  /** Returns the cross product of two vectors. */
  export function cross(startVec: Vector, endVec: Vector): Vector

  /** Returns the dot product of two vectors. */
  export function dot(vec1: Vector, vec2: Vector): number

  /** Returns the angle from start_vec to end_vec in radians. The axis, if specified, is used to determine the sign of the angle. If no axis is specified, the angle is positive, as if axis was vector.cross(start_vec, end_vec). */
  export function angle(startVec: Vector, endVec: Vector, axis?: Vector): number

  /** Applies math.floor to each component of the vector. */
  export function floor(vec: Vector): Vector

  /** Applies math.ceil to each component of the vector. */
  export function ceil(vec: Vector): Vector

  /** Applies math.abs to each component of the vector. */
  export function abs(vec: Vector): Vector

  /** Applies math.sign to each component of the vector. */
  export function sign(vec: Vector): Vector

  /** Clamps each component of the vector between min and max values. */
  export function clamp(vec: Vector, min: Vector, max: Vector): Vector

  /** Applies math.max to each component of the vectors. */
  export function max(vec: Vector, ...args: Vector[]): Vector

  /** Applies math.min to each component of the vectors. */
  export function min(vec: Vector, ...args: Vector[]): Vector

  /** Linearly interpolates between start_vec and end_vec using factor t. */
  export function lerp(startVec: Vector, endVec: Vector, t: number): Vector

  /** Vector constant with all components set to 0. */
  export const zero: Vector
  /** Vector constant with all components set to 1. */
  export const one: Vector
}

/** @noSelf */
declare namespace ll {
  /**
   * Returns the absolute (positive) integer value of val.
   * @deprecated Use 'math.abs' instead. Double precision; fastcall.
   */
  export function Abs(val: number): number

  /**
   * Returns the arccosine of val in radians.
   * @deprecated Use 'math.acos' instead. Double precision; fastcall.
   */
  export function Acos(val: number): number

  /** Adds the avatar to the parcel ban list for the specified number of hours. A value of 0 hours adds the avatar indefinitely. Banned users teleporting to the parcel are redirected to a neighboring parcel; the minimum accepted duration is 0.01 hours (approximately 36 seconds). */
  export function AddToLandBanList(avatar: UUID, hours: number): void

  /** Adds the avatar to the land pass list for the specified number of hours (or indefinitely if hours is 0). */
  export function AddToLandPassList(avatar: UUID, hours: number): void

  /**
   * Modifies the amount of damage applied by the current on_damage event after it completes processing, specified by the damage event index number.
   * @indexArg number
   */
  export function AdjustDamage(number: number, newDamage: number): void

  /** Adjusts the volume of the currently playing attached sound (has no effect on sounds started with llTriggerSound). */
  export function AdjustSoundVolume(volume: number): void

  /** Returns TRUE if the specified agent is in the experience and the experience can run in the current region/location; returns FALSE otherwise. */
  export function AgentInExperience(agent: UUID): boolean

  /** If add is TRUE, allows users without object modify permissions to drop inventory items into the prim. If FALSE, restricts inventory dropping to users with modify permissions. */
  export function AllowInventoryDrop(add: boolean): void

  /** Returns the angle, in radians, between rotations start_rot and and end_rot. */
  export function AngleBetween(startRot: Quaternion, endRot: Quaternion): number

  /** Applies a linear impulse (momentum) to a physical object. If local is TRUE, the impulse is applied in local coordinates; otherwise, it is applied in global region coordinates. */
  export function ApplyImpulse(momentum: Vector, isLocal: boolean): void

  /** Applies a rotational impulse (force) to a physical object. If local is TRUE, the rotational impulse is applied in local coordinates; otherwise, it is applied in global region coordinates. */
  export function ApplyRotationalImpulse(force: Vector, isLocal: boolean): void

  /**
   * Returns the arcsine of val in radians.
   * @deprecated Use 'math.asin' instead. Double precision; fastcall.
   */
  export function Asin(val: number): number

  /**
   * Returns the arctangent of y/x in radians, using the signs to determine the quadrant. Note the argument order: Y is the first parameter, X is the second parameter.
   * @deprecated Use 'math.atan2' instead. Double precision; fastcall.
   */
  export function Atan2(y: number, x: number): number

  /** Attaches the object to the avatar who has granted the PERMISSION_ATTACH permission. Takes the object into the user's inventory and attaches it at attach_point. */
  export function AttachToAvatar(attachPoint: number): void

  /** Attaches the object temporarily to an avatar who has granted the PERMISSION_ATTACH permission. No permanent inventory is created, and the object disappears on detach or disconnect. Can be used on non-owners (changing ownership to the wearer). */
  export function AttachToAvatarTemp(attachPoint: number): void

  /** Returns the UUID of the avatar seated on the specified link's sit target, or NULL_KEY if no avatar is sitting there. */
  export function AvatarOnLinkSitTarget(link: number): UUID

  /** Returns the UUID of the avatar seated on the prim's sit target (defined via llSitTarget), or NULL_KEY if no avatar is sitting there or the prim lacks a sit target. */
  export function AvatarOnSitTarget(): UUID

  /** Returns the rotation defined by the coordinate axes fwd, left, and up. */
  export function Axes2Rot(fwd: Vector, left: Vector, up: Vector): Quaternion

  /** Returns the rotation that rotates angle radians around the axis vector. */
  export function AxisAngle2Rot(axis: Vector, angle: number): Quaternion

  /**
   * Returns an integer representing the Base64-decoded big-endian value of str. Returns zero if str is longer than 8 characters; the return value is unpredictable if str contains fewer than 6 characters.
   * @deprecated Use 'llbase64.decode' and 'string.unpack' or 'buffer.readi32' instead.
   */
  export function Base64ToInteger(str: string): number

  /**
   * Decodes the Base64-encoded string str into a conventional string, interpreting the bytes as a UTF-8 character sequence. Unprintable characters are converted to question marks.
   * @deprecated Use 'llbase64.decode' instead.
   */
  export function Base64ToString(str: string): string

  /** Delinks all prims in the linkset. Requires the PERMISSION_CHANGE_LINKS runtime permission, which must be requested and granted by the owner. */
  export function BreakAllLinks(): void

  /** Delinks the prim specified by the link number link. Requires the PERMISSION_CHANGE_LINKS runtime permission. */
  export function BreakLink(link: number): void

  /** Parses the comma-separated string src and returns it as a list. */
  export function CSV2List(src: string): string[]

  /**
   * Casts a ray into the physics world from start to end and reports collision data for intersections with objects based on options. Returns a list of strided values [UUID_1, {link_number_1}, hit_position_1, {hit_normal_1}, ..., status_code]. A negative status_code indicates an error; otherwise, it represents the number of hits.
   */
  export function CastRay<const T extends readonly unknown[]>(
    startPos: Vector,
    endPos: Vector,
    options: T & ParseCastRayParams<T>,
  ): list

  /**
   * Returns val rounded toward positive infinity. In other words, returns the smallest integer greater than or equal to val.
   * @deprecated Use 'math.ceil' instead. Fastcall.
   */
  export function Ceil(val: number): number

  /** Constructs and returns a single-character string from the given Unicode codepoint ordinal. */
  export function Char(val: number): string

  /** Resets all camera parameters to default values and turns off scripted camera control. Requires the PERMISSION_CONTROL_CAMERA runtime permission (automatically granted for attached or sat-on objects). */
  export function ClearCameraParams(): void

  /** @deprecated */
  export function ClearExperience(agentid: UUID, experienceid: UUID): void

  /** @deprecated */
  export function ClearExperiencePermissions(agentid: UUID): void

  /** Deletes the media and clears all parameters from the given face on the linked prim. Returns an integer STATUS_* flag detailing the success or failure of the operation. */
  export function ClearLinkMedia(link: number, face: number): number

  /** Deletes the media and clears all parameters from the specified face. Returns an integer STATUS_* flag detailing the success or failure of the operation. */
  export function ClearPrimMedia(face: number): number

  /**
   * Deprecated. Closes the specified XML-RPC channel.
   * @deprecated
   */
  export function CloseRemoteDataChannel(channel: UUID): void

  /**
   * Returns a float representing the cloud density at the prim's position offset by the vector offset.
   * @deprecated
   */
  export function Cloud(offset: Vector): number

  /** Sets the collision filter, either exclusively or inclusively. If accept is TRUE, only collisions matching name and id are processed; if FALSE, matches are excluded. Pass an empty string or NULL_KEY to name or id to skip filtering on that parameter. */
  export function CollisionFilter(name: string, id: UUID, accept: boolean): void

  /** Suppresses default collision sounds and replaces default impact sounds with impact_sound at the volume level specified by impact_volume. Supply an empty string to only suppress collision sounds. */
  export function CollisionSound(impactSound: string, impactVolume: number): void

  /**
   * Suppresses default collision sprites and replaces them with impact_sprite (which must be in the prim's inventory). Supply an empty string to only suppress collision sprites.
   * @deprecated
   */
  export function CollisionSprite(impactSprite: string): void

  /** Returns a hex-encoded hash digest string of message using the specified cryptographic algorithm. */
  export function ComputeHash(message: string, algorithm: string): string

  /**
   * Returns the cosine of theta. Theta is in radians.
   * @deprecated Use 'math.cos' instead. Double precision; fastcall.
   */
  export function Cos(theta: number): number

  /**
   * Converts the linkset containing the script into a pathfinding character entity (required to use pathfinding functions) using the specified options.
   */
  export function CreateCharacter<const T extends readonly unknown[]>(
    options: T & ParseCharacterParams<T>,
  ): void

  /** Starts an asynchronous transaction to create a key-value pair (k and v) associated with the script's experience. Returns a key query handle for the dataserver event. Fails with XP_ERROR_STORAGE_EXCEPTION if the key already exists. */
  export function CreateKeyValue(k: string, v: string): UUID

  /** Attempts to link the object containing the script with target. Requires the PERMISSION_CHANGE_LINKS runtime permission. */
  export function CreateLink(target: UUID, parent: boolean): void

  /** Generates a damage event delivering the specified amount of damage and damage_type to the targeted avatar or task in the same region. */
  export function Damage(target: UUID, damage: number, damageType: number): void

  /** Starts an asynchronous transaction to request the used and total data storage allocated for the experience. Returns a key query handle for the dataserver event. */
  export function DataSizeKeyValue(): UUID

  /** Converts the linkset back to a standard physical object, removing all pathfinding properties. */
  export function DeleteCharacter(): void

  /** Starts an asynchronous transaction to delete the key-value pair associated with key k in the experience. Returns a key query handle for the dataserver event. */
  export function DeleteKeyValue(k: string): UUID

  /**
   * Returns a copy of the list src with the slice from start_index to end_index (inclusive) removed. Negative indices count backward from the end of the list. If start_index is greater than end_index, the deletion excludes the specified range.
   * @deprecated Use 'table.remove' instead. Unnecessary table copying.
   * @indexArg startIndex
   * @indexArg endIndex
   */
  export function DeleteSubList(src: T[], startIndex: number, endIndex: number): T[]

  /**
   * Returns a copy of the string src with the characters from start_index to end_index (inclusive) removed. Negative indices count backward from the end of the string. If start_index is greater than end_index, the deletion excludes the specified range.
   * @indexArg startIndex
   * @indexArg endIndex
   */
  export function DeleteSubString(src: string, startIndex: number, endIndex: number): string

  /** Derezzes (deletes or returns) a targeted object in the region previously rezzed by a script in this linkset, returning TRUE on success or FALSE on failure. */
  export function DerezObject(id: UUID, flags: number): boolean

  /** Detaches the object containing the script from the avatar. Requires the PERMISSION_ATTACH runtime permission (automatically granted to attached objects). Note that the detached object is completely removed from the region and not dropped on the ground. */
  export function DetachFromAvatar(): void

  /**
   * Returns a list containing pending damage information for the event specified by number, including the current damage, the damage type, and the original damage delivered.
   * @indexArg number
   */
  export function DetectedDamage(number: number): DamageDetails

  /**
   * Returns a vector representing the grab offset of the user touching the object. Only works in touch events and returns <0.0, 0.0, 0.0> if number is not a valid index.
   * @indexArg number
   */
  export function DetectedGrab(number: number): Vector

  /**
   * Returns TRUE if the detected object or avatar specified by number has the same active group as the prim containing the script. Returns FALSE if the group is not active or if they are not in the group.
   * @indexArg number
   */
  export function DetectedGroup(number: number): boolean

  /**
   * Returns the key (UUID) of the detected object or avatar specified by number, or NULL_KEY if number is not a valid index.
   * @indexArg number
   */
  export function DetectedKey(number: number): UUID

  /**
   * Returns the link number (integer) of the triggered event (touches and collisions only) specified by number. Returns 0 for non-linked objects, 1 for the root prim, and 2+ for child prims. Returns 0 if not supported by the event.
   * @indexArg number
   */
  export function DetectedLinkNumber(number: number): number

  /**
   * Returns a string representing the name of the detected object or avatar specified by item. Returns an empty string if item is not a valid index.
   * @indexArg item
   */
  export function DetectedName(item: number): string

  /**
   * Returns the key (UUID) of the owner of the detected object specified by number. Returns an invalid key if number is not a valid index.
   * @indexArg number
   */
  export function DetectedOwner(number: number): UUID

  /**
   * Returns the vector position (in region coordinates) of the detected object or avatar specified by number, or <0.0, 0.0, 0.0> if number is not a valid index.
   * @indexArg number
   */
  export function DetectedPos(number: number): Vector

  /**
   * Returns the key (UUID) of the object or avatar that rezzed the detected object specified by number.
   * @indexArg number
   */
  export function DetectedRezzer(number: number): UUID

  /**
   * Returns the rotation of the detected object or avatar specified by number, or <0.0, 0.0, 0.0, 1.0> if number is not a valid offset index.
   * @indexArg number
   */
  export function DetectedRot(number: number): Quaternion

  /**
   * Returns the surface binormal vector (tangent to the surface, pointing along the positive T (V) direction of tangent space) at the touched location specified by index. Can be used with llDetectedTouchNormal to determine the tangent space.
   * @indexArg index
   */
  export function DetectedTouchBinormal(index: number): Vector

  /**
   * Returns the integer index of the face clicked by the avatar in the touch event specified by index.
   * @indexArg index
   */
  export function DetectedTouchFace(index: number): number

  /**
   * Returns the surface normal vector (perpendicular to the surface) at the touched location specified by index. Can be used with llDetectedTouchBinormal to determine the tangent space.
   * @indexArg index
   */
  export function DetectedTouchNormal(index: number): Vector

  /**
   * Returns the vector position where the object was touched (specified by index) in region coordinates, or in screen-space coordinates if the object is attached as a HUD.
   * @indexArg index
   */
  export function DetectedTouchPos(index: number): Vector

  /**
   * Returns the surface coordinates (<s, t, 0.0>) where the prim was touched, specified by index. X and Y contain the horizontal (s) and vertical (t) face coordinates, typically in the interval [0.0, 1.0]. Returns TOUCH_INVALID_TEXCOORD if coordinates cannot be determined.
   * @indexArg index
   */
  export function DetectedTouchST(index: number): Vector

  /**
   * Returns the texture coordinates (<u, v, 0.0>) where the prim was touched, specified by index. X and Y contain the horizontal (u) and vertical (v) texture coordinates, typically in the interval [0.0, 1.0] (affected by repeats and rotation). Returns TOUCH_INVALID_TEXCOORD if coordinates cannot be determined.
   * @indexArg index
   */
  export function DetectedTouchUV(index: number): Vector

  /**
   * Returns an integer bitfield representing the types (AGENT, ACTIVE, PASSIVE, or SCRIPTED) of the detected object or avatar specified by number. Returns 0 if number is not a valid index.
   * @indexArg number
   */
  export function DetectedType(number: number): number

  /**
   * Returns the vector velocity of the detected object or avatar specified by number, or <0.0, 0.0, 0.0> if number is not a valid offset index.
   * @indexArg number
   */
  export function DetectedVel(number: number): Vector

  /** Shows a dialog box on the screen of the specified agent, displaying msg along with up to 12 choice buttons. Clicking a button chats its label on channel. The chat originates at the object's position, but uses the agent's name and UUID, so it can be heard as long as the agent is still in the region. */
  export function Dialog(agent: UUID, msg: string, buttons: string[], channel: number): void

  /** Deletes the entire object containing the script (the object does not go to inventory). Use llBreakLink first to delete only a single prim. */
  export function Die(): void

  /** Returns a string that is the list src converted to a single string, with separator placed between each entry. */
  export function DumpList2String(src: list, separator: string): string

  /** Checks if the border reached along the vector dir from the vector pos is the edge of the world (i.e., has no neighboring simulator). Returns TRUE if it hits the edge of the world, or FALSE if there is a neighboring simulator. */
  export function EdgeOfWorld(pos: Vector, dir: Vector): boolean

  /** Ejects the specified avatar from land/parcels owned by the object's owner (group or resident). */
  export function EjectFromLand(avatar: UUID): void

  /** Sends an email with the given destination address, subject, and body msg. The email will be sent from `{ll.GetKey()}@lsl.secondlife.com`. This can be used for script communication; see llGetNextEmail() */
  export function Email(address: string, subject: string, msg: string): void

  /** Returns a string representing the escaped/encoded version of url, replacing spaces with '%20' and non-alphanumeric characters with their '%xx' hexadecimal UTF-8 equivalent. */
  export function EscapeURL(url: string): string

  /** Returns the quaternion representation of the Euler angles (in radians) within vec. */
  export function Euler2Rot(vec: Vector): Quaternion

  /** Directs a pathfinding character to evade target, attempting to hide from its pursuer if a hiding spot is available (i.e., no line of sight from the character's head to the pursuer's head, and no direct path on the navmesh). */
  export function Evade(target: UUID, options: list): void

  /** Sends a command (specified by command) to the pathing system with options. Currently only supports stopping pathfinding or making the character jump. */
  export function ExecCharacterCmd(command: number, options: list): void

  /**
   * Returns the absolute (positive) value of val.
   * @deprecated Use 'math.abs' instead. Double precision; fastcall.
   */
  export function Fabs(val: number): number

  /** Searches the text of a cached notecard for lines containing the given pattern and returns the number of matches found through a dataserver event. */
  export function FindNotecardTextCount(notecardname: string, pattern: string, options: list): UUID

  /**
   * Synchronously searches a cached notecard name for lines containing pattern, returning a list of line and column numbers. Returns a list containing 'NAK' if the notecard is not cached, or an empty list if no matches are found.
   * @indexArg start
   * @indexReturn
   */
  export function FindNotecardTextSync(
    name: string,
    pattern: string,
    start: number,
    count: number,
    options: list,
  ): list

  /** Directs a pathfinding character to keep the specified distance from the target position vector (within the region or adjacent regions). */
  export function FleeFrom(position: Vector, distance: number, options: list): void

  /**
   * Returns val rounded toward negative infinity. In other words, returns the largest integer less than or equal to val.
   * @deprecated Use 'math.floor' instead. Fastcall.
   */
  export function Floor(val: number): number

  /** Sets whether any avatar sitting on this prim is forced into mouselook mode. Setting mouselook to TRUE forces the mode; FALSE (default) allows the avatar to keep their current camera mode. */
  export function ForceMouselook(mouselook: boolean): void

  /** Returns a pseudo-random float in the range [0.0, mag) or (mag, 0.0] depending on the sign of mag. The value is inclusive of 0.0 but exclusive of mag. */
  export function Frand(mag: number): number

  /** Generates and returns a unique versioned UUID key (utilizing SHA-1 hashing). Due to being versioned, it will not return NULL_KEY; however, the exact UUID version is an implementation detail that should not be relied upon. */
  export function GenerateKey(): UUID

  /** Returns a vector representing the acceleration of the object in the region's frame of reference. */
  export function GetAccel(): Vector

  /** Returns an integer bitfield containing status information about the agent specified by id (such as AGENT_FLYING, AGENT_ATTACHMENTS, AGENT_SITTING, etc.). */
  export function GetAgentInfo(id: UUID): number

  /** Returns a string representing the language code of the preferred interface language set by the avatar. */
  export function GetAgentLanguage(avatar: UUID): string

  /** Requests a list of avatar UUID keys for agents currently in the region, limited by scope. Returns a list of keys or a list containing an error message string. */
  export function GetAgentList(scope: number, options: list): UUID[]

  /** Returns a vector representing the estimated bounding box size of the specified avatar, or ZERO_VECTOR if they are not in the same region. */
  export function GetAgentSize(avatar: UUID): Vector

  /** Returns a float representing the Blinn-Phong alpha (transparency) of face. If face is ALL_SIDES, returns the mean average of all faces. */
  export function GetAlpha(face: number): number

  /** Returns a string representing the name of the currently playing locomotion animation for the specified avatar. */
  export function GetAnimation(avatar: UUID): string

  /** Returns a list of keys (UUIDs) representing all active animations currently playing on the specified avatar. */
  export function GetAnimationList(avatar: UUID): UUID[]

  /** Returns a string representing the name of the animation currently overriding the specified anim_state. Requires the PERMISSION_OVERRIDE_ANIMATIONS or PERMISSION_TRIGGER_ANIMATION runtime permission. */
  export function GetAnimationOverride(animState: string): string

  /** Returns the integer attachment point (an ATTACH_* constant) that the object is attached to, or 0 if it is unattached or pending detachment. */
  export function GetAttached(): number

  /** Returns a list of object keys (UUIDs) worn by the specified avatar, in the order they were attached. HUDs are not included because they are neither public nor visible. Returns a list containing an error message string on failure. */
  export function GetAttachedList(avatar: UUID): UUID[] | string[]

  /** Returns a list of object keys (UUIDs) worn by the specified avatar, in the order they were attached, filtered by options. Returns a list containing an error message string on failure. */
  export function GetAttachedListFiltered(avatar: UUID, options: list): UUID[] | string[]

  /** Returns the bounding box of object (including any linked prims) relative to its root prim in local coordinates, formatted as [ (vector) min_corner, (vector) max_corner ]. */
  export function GetBoundingBox(object: UUID): Vector[]

  /** Returns a float representing the camera's current aspect ratio (width/height) of the agent who granted PERMISSION_TRACK_CAMERA. Returns 0.0 if permissions are not granted. */
  export function GetCameraAspect(): number

  /** Returns a float representing the camera's current field of view (FOV) in radians of the agent who granted PERMISSION_TRACK_CAMERA. Returns 0.0 if permissions are not granted. */
  export function GetCameraFOV(): number

  /** Returns a vector representing the camera's current position in region coordinates of the agent who granted PERMISSION_TRACK_CAMERA. Returns ZERO_VECTOR if permissions are not granted. */
  export function GetCameraPos(): Vector

  /** Returns a rotation representing the camera's current orientation of the agent who granted PERMISSION_TRACK_CAMERA. Returns ZERO_ROTATION if permissions are not granted. */
  export function GetCameraRot(): Quaternion

  /** Returns the vector position (in region coordinates) of the center of mass. Returns the individual child prim's center of mass if called from a child, or the entire linkset's center of mass if called from the root. */
  export function GetCenterOfMass(): Vector

  /** Returns a list containing the closest vector position on the navigation mesh (navmesh) to the specified point (expressed in region-local space), or an empty list if none is found. Configured using options. */
  export function GetClosestNavPoint(point: Vector, options: list): Vector[]

  /** Returns the Blinn-Phong RGB color vector of face (values between 0.0 and 1.0). If face is ALL_SIDES, returns the mean average of all faces. */
  export function GetColor(face: number): Vector

  /** Returns the key (UUID) of the prim's original creator. */
  export function GetCreator(): UUID

  /** Returns a string representing the current date in the UTC time zone in the format 'YYYY-MM-DD'. */
  export function GetDate(): string

  /** Returns an integer representing the number of seconds in the environmental day cycle applied to the current parcel. */
  export function GetDayLength(): number

  /** Returns an integer representing the offset duration (in seconds) added to calculate the current environmental time on this parcel. */
  export function GetDayOffset(): number

  /** Returns the display name string of the avatar specified by id if they are in the region or cached; returns an empty string otherwise (use llRequestDisplayName if the avatar is absent). */
  export function GetDisplayName(id: UUID): string

  /** Returns a float representing the remaining physics energy of the object as a percentage (0.0 to 1.0) of its maximum capacity. */
  export function GetEnergy(): number

  /** Returns a string containing the requested regional data specified by name. */
  export function GetEnv(name: string): string

  /**
   * Returns a list containing the current environment parameters for the parcel or region at pos, retrieved in the order specified by params.
   */
  export function GetEnvironment<const T extends readonly EnvironmentParamFlag[]>(
    pos: Vector,
    params: T,
  ): MapEnvironmentParam<T> | []

  /** Returns a list of details for the specified experience_id, formatted as [string experience_name, key owner_id, key experience_id, integer state, string state_message, key group_id]. */
  export function GetExperienceDetails(experienceId: UUID): ExperienceDetails

  /** Returns a text description of the specified experience error code, or a description of XP_ERROR_UNKNOWN_ERROR if the error is invalid. */
  export function GetExperienceErrorMessage(error: number): string

  /** @deprecated */
  export function GetExperienceList(agentid: UUID): UUID[]

  /** Returns a vector representing the constant force currently applied to the object (if the object is physical). */
  export function GetForce(): Vector

  /** Returns an integer representing the number of free bytes of memory currently available to the script. */
  export function GetFreeMemory(): number

  /** Returns an integer representing the number of available HTTP URLs (remaining for the owner if the object is attached, or for the region if unattached). */
  export function GetFreeURLs(): number

  /** Returns a float representing the time in seconds since midnight GMT (truncated to whole seconds). */
  export function GetGMTclock(): number

  /** Returns a vector representing the geometric center of the object relative to its root prim. */
  export function GetGeometricCenter(): Vector

  /** Returns a string representing the value of the specified header associated with the HTTP request_id. */
  export function GetHTTPHeader(requestId: UUID, header: string): string

  /** Returns a float representing the current health of the avatar or object specified by id. */
  export function GetHealth(id: UUID): number

  /** Returns the time when the item was placed in the prim's inventory, as a UTC timestamp string of the form "YYYY-MM-DDThh:mm:ssZ" */
  export function GetInventoryAcquireTime(item: string): string

  /** Returns the key (UUID) of the creator of the specified inventory item. */
  export function GetInventoryCreator(item: string): UUID

  /** Returns the description string of the specified inventory item. */
  export function GetInventoryDesc(item: string): string

  /** Returns the key (UUID) of the specified inventory item. */
  export function GetInventoryKey(item: string): UUID

  /**
   * Returns the name of the inventory item of the specified type (INVENTORY_*) at the specified inventory index.
   * @indexArg index
   */
  export function GetInventoryName(type: number, index: number): string

  /** Returns the count of items of the specified type (INVENTORY_*) in the prim's inventory. */
  export function GetInventoryNumber(type: number): number

  /** Returns the specified item's permission flags for the specified group. */
  export function GetInventoryPermMask(item: string, group: number): number

  /** Returns an integer representing the INVENTORY_* type of the named inventory item. */
  export function GetInventoryType(item: string): number

  /** Returns the key (UUID) of the prim containing the script. */
  export function GetKey(): UUID

  /** Returns the key (UUID) of the land owner at the vector pos, or NULL_KEY if the land is public. */
  export function GetLandOwnerAt(pos: Vector): UUID

  /** Returns the key (UUID) of the linked prim or avatar specified by link. */
  export function GetLinkKey(link: number): UUID

  /**
   * Returns a list containing the media parameters of the specified face on the linked prim link, retrieved in the order requested by params.
   */
  export function GetLinkMedia<const T extends readonly MediaParamFlag[]>(
    link: number,
    face: number,
    params: T,
  ): MapMediaParam<T> | []

  /** Returns a string containing the name of the linked prim specified by link. */
  export function GetLinkName(link: number): string

  /** Returns the integer link number of the prim containing the script (0 for unlinked, 1 for the root, and 2+ for children). */
  export function GetLinkNumber(): number

  /** Returns an integer representing the number of sides (faces) of the linked prim specified by link. */
  export function GetLinkNumberOfSides(link: number): number

  /**
   * Returns a list of primitive parameters requested in params for the linked prim specified by link (equivalent to llGetPrimitiveParams).
   */
  export function GetLinkPrimitiveParams<const T extends readonly unknown[]>(
    link: number,
    params: T & ParsePrimParamGets<T>,
  ): MapPrimParamGet<T> | []

  /** Returns an integer representing the active sit flags currently set on the linked prim specified by link. */
  export function GetLinkSitFlags(link: number): number

  /**
   * Returns an integer representing the variable type (TYPE_*) of the list entry at index in the list src.
   * @deprecated Use 'typeof' instead.
   * @indexArg index
   */
  export function GetListEntryType(src: list, index: number): number

  /**
   * Returns an integer representing the total number of elements in the list src.
   * @deprecated Use '#' or 'rawlen' instead. Metatable support.
   */
  export function GetListLength(src: list): number

  /** Returns a position vector relative to the root prim. If called from the root prim, it returns the global region position (or the position relative to the attachment point if attached). */
  export function GetLocalPos(): Vector

  /** Returns a rotation representing the local orientation of a child prim relative to the root prim, or the object's overall rotation if called from the root. */
  export function GetLocalRot(): Quaternion

  /** Returns a float representing the mass of the object (in lindograms). Returns the total linkset mass if called from the root, or the individual prim's mass if called from a child prim. Returns the wearer's mass if inside an attachment. */
  export function GetMass(): number

  /** Returns a float representing the mass of the object in kilograms. Functionally identical to llGetMass except for using MKS (metric) units. */
  export function GetMassMKS(): number

  /** Returns a float representing the maximum scale factor that can be applied to the object via llScaleByFactor without violating size or linkability limits. */
  export function GetMaxScaleFactor(): number

  /** Returns an integer representing the maximum memory limit (in bytes) that the script is allowed to allocate. */
  export function GetMemoryLimit(): number

  /** Returns a float representing the minimum scale factor that can be applied to the object via llScaleByFactor without violating size limits. */
  export function GetMinScaleFactor(): number

  /** Returns a normalized vector representing the current direction of the parcel's moon, taking altitude into account. Falls back to the region's moon direction if no custom parcel environment is set. */
  export function GetMoonDirection(): Vector

  /** Returns a rotation representing the orientation applied to the moon on the current parcel and altitude track. Falls back to the region's moon rotation if no custom parcel environment is set. */
  export function GetMoonRotation(): Quaternion

  /** Requests the next queued email via the email event. Emails must1. Be sent to `{ll.GetKey()}@lsl.secondlife.com`2. Be sent from the specified sender Address (or any address if blank)3. Have the specified subject Subject (or any subject if blank) */
  export function GetNextEmail(address: string, subject: string): void

  /**
   * Asynchronously requests the line index line of the notecard name from the dataserver. Returns a key query handle for the dataserver event, which will return 'EOF' when reaching past the end of the notecard.
   * @indexArg line
   */
  export function GetNotecardLine(name: string, line: number): UUID

  /**
   * Synchronously reads the line index line of the notecard name from the region's cache, immediately returning its text without raising a dataserver event. Returns 'NAK' if not cached or 'EOF' if out of bounds.
   * @indexArg line
   */
  export function GetNotecardLineSync(name: string, line: number): string

  /** Asynchronously requests the total line count of the notecard name. Returns a key query handle for the dataserver event. */
  export function GetNumberOfNotecardLines(name: string): UUID

  /** Returns an integer representing the total number of prims and seated avatars in the linkset containing the script. */
  export function GetNumberOfPrims(): number

  /** Returns an integer representing the total number of sides (faces) of the prim containing the script. */
  export function GetNumberOfSides(): number

  /** Returns a list of strings representing the names or UUIDs of all active animations currently playing on the object. */
  export function GetObjectAnimationNames(): string[]

  /** Returns a string containing the description of the specific prim containing the script. */
  export function GetObjectDesc(): string

  /**
   * Returns a list containing the requested parameters of the specified avatar or object id, retrieved in the order requested by params.
   */
  export function GetObjectDetails<const T extends readonly ObjectDetailFlag[]>(
    id: UUID,
    params: T,
  ): MapObjectDetail<T> | []

  /** Returns the key (UUID) of the linked child prim specified by link within the linkset identified by object_id. */
  export function GetObjectLinkKey(objectId: UUID, link: number): UUID

  /** Returns a float representing the mass of the avatar or object specified by id. */
  export function GetObjectMass(id: UUID): number

  /** Returns a string containing the name of the specific prim containing the script. */
  export function GetObjectName(): string

  /** Returns the script's object's permission flags for the specified group. */
  export function GetObjectPermMask(group: number): number

  /** Returns an integer representing the total number of prims in the object containing the specified prim. */
  export function GetObjectPrimCount(prim: UUID): number

  /** Returns a vector representing the physical rotation (angular velocity) of the object in radians per second. */
  export function GetOmega(): Vector

  /** Returns the key (UUID) of the object's current owner. */
  export function GetOwner(): UUID

  /** Returns the key (UUID) of the owner of the prim specified by id. */
  export function GetOwnerKey(id: UUID): UUID

  /**
   * Returns a list containing the requested parcel details specified by params (retrieved in the same order) for the parcel at the vector pos.
   */
  export function GetParcelDetails<const T extends readonly ParcelDetailFlag[]>(
    pos: Vector,
    params: T,
  ): MapParcelDetail<T> | []

  /** Returns an integer bitfield of parcel flags (PARCEL_FLAG_*) for the parcel at the position pos. */
  export function GetParcelFlags(pos: Vector): number

  /** Returns an integer representing the maximum combined land impact (prim limit) allowed for objects on the parcel at pos, determined either for the single parcel or sim-wide based on sim_wide. */
  export function GetParcelMaxPrims(pos: Vector, simWide: boolean): number

  /** Returns a string containing the parcel's streaming music (audio) URL. The object owner must also be the land owner (or share the same group deeding). */
  export function GetParcelMusicURL(): string

  /** Returns an integer representing the total land impact of objects on the parcel at pos in the specified category. If sim_wide is TRUE, returns combined usage for all regional parcels owned by the parcel owner; if FALSE, returns usage for only the specified parcel. */
  export function GetParcelPrimCount(pos: Vector, category: number, simWide: boolean): number

  /** Returns a list of up to 100 strides (formatted as [key owner, integer land_impact]) representing owners of objects on the parcel at pos, sorted by owner key. Requires owner-like permissions for the parcel and the script owner's presence in the region. */
  export function GetParcelPrimOwners(pos: Vector): ParcelPrimOwners

  /** Returns an integer bitfield representing the permissions (PERMISSION_*) currently granted to the script. */
  export function GetPermissions(): number

  /** Returns the key (UUID) of the avatar that last granted or declined permissions to the script, or NULL_KEY if the permissions request was ignored or cancelled. */
  export function GetPermissionsKey(): UUID

  /** Returns a list of the format [float gravity_multiplier, float restitution, float friction, float density] detailing the physical characteristics of the object. */
  export function GetPhysicsMaterial(): PhysicsMaterial

  /** Returns a vector representing the current position of the object in region coordinates. */
  export function GetPos(): Vector

  /**
   * Returns a list containing the media parameters of the specified face, retrieved in the order requested by params. Returns an empty list if no media exists on the face.
   */
  export function GetPrimMediaParams<const T extends readonly MediaParamFlag[]>(
    face: number,
    params: T,
  ): MapMediaParam<T> | []

  /**
   * Returns a list of primitive attribute values matching the requested params list.
   */
  export function GetPrimitiveParams<const T extends readonly unknown[]>(
    params: T & ParsePrimParamGets<T>,
  ): MapPrimParamGet<T> | []

  /** Returns an integer representing the current number of avatars in the region. */
  export function GetRegionAgentCount(): number

  /** Returns a vector (in meters) representing the global grid coordinates of the south-west corner of the current region (Z component is always 0.0). */
  export function GetRegionCorner(): Vector

  /** Returns an integer representing the total number of seconds in the region-wide day cycle. */
  export function GetRegionDayLength(): number

  /** Returns an integer representing the offset duration (in seconds) added to calculate the current environmental time for the region. */
  export function GetRegionDayOffset(): number

  /** Returns a float representing the average region simulator frames per second (FPS). */
  export function GetRegionFPS(): number

  /** Returns an integer bitfield representing the region flags (REGION_FLAG_*) currently enabled for the region containing the object. */
  export function GetRegionFlags(): number

  /** Returns a normalized vector representing the current direction of the region's moon, taking altitude into account. */
  export function GetRegionMoonDirection(): Vector

  /** Returns a rotation representing the orientation applied to the moon at the region level, taking altitude track into account. */
  export function GetRegionMoonRotation(): Quaternion

  /** Returns a string containing the name of the current region. */
  export function GetRegionName(): string

  /** Returns a normalized vector representing the current direction of the region's sun, taking altitude into account. */
  export function GetRegionSunDirection(): Vector

  /** Returns a rotation representing the orientation applied to the sun at the region level, taking altitude track into account. */
  export function GetRegionSunRotation(): Quaternion

  /** Returns a float representing the current physics time dilation of the region, ranging from 0.0 (full dilation / slow) to 1.0 (no dilation / real-world speed). */
  export function GetRegionTimeDilation(): number

  /** Returns a float with subsecond precision representing the elapsed seconds since region environmental midnight or region uptime (whichever is smaller). If the region's sun position is fixed, returns region uptime. */
  export function GetRegionTimeOfDay(): number

  /** Returns a string representing the render material on face (returns the inventory name if it is in the prim's inventory, or its key UUID otherwise). */
  export function GetRenderMaterial(face: number): string

  /** Returns a vector representing the position (in region coordinates) of the root prim of the linkset containing the script. */
  export function GetRootPosition(): Vector

  /** Returns a rotation representing the orientation (relative to the region) of the root prim of the linkset containing the script. */
  export function GetRootRotation(): Quaternion

  /** Returns a rotation representing the prim's orientation relative to the region's axes. */
  export function GetRot(): Quaternion

  /** Returns an integer representing the maximum memory (in bytes) used by the script while the memory profiler was last active (only valid after using PROFILE_SCRIPT_MEMORY). */
  export function GetSPMaxMemory(): number

  /** Returns a vector representing the physical scale (dimensions in meters) of the prim containing the script. */
  export function GetScale(): Vector

  /** Returns a string containing the name of the script calling this function. */
  export function GetScriptName(): string

  /** Returns a boolean integer indicating whether the specified script in the prim's inventory is running (returns TRUE if running, FALSE otherwise). */
  export function GetScriptState(script: string): boolean

  /** Returns a float containing the value of the requested region statistic specified by stat_type. */
  export function GetSimStats(statType: number): number

  /** Returns a string containing the hostname of the server machine running the script (e.g., 'sim225.agni.lindenlab.com'). */
  export function GetSimulatorHostname(): string

  /** Returns an integer representing the start/rez parameter passed to the object on creation (returns 0 if rezzed by an agent). */
  export function GetStartParameter(): number

  /** Returns the initialization string passed to the object's root prim on rez with llRezObjectWithParams (via REZ_PARAM_STRING; returns an empty string if rezzed by an agent). */
  export function GetStartString(): string

  /** Returns a list of position vectors representing pathfinding waypoints between start and end on the static navmesh for a character of the specified radius. Ignores movable obstacles and can be used in any region regardless of dynamic pathfinding status. */
  export function GetStaticPath(
    startPos: Vector,
    endPos: Vector,
    radius: number,
    params: list,
  ): list

  /** Returns a boolean integer indicating whether the specified status flag status is enabled for the object. */
  export function GetStatus(status: number): boolean

  /**
   * Returns a copy of the substring from src within the inclusive codepoint range start_index..end_index. Negative indices count backward from the end of the string. If start_index is greater than end_index, the substring is the excluded range.
   * @indexArg startIndex
   * @indexArg endIndex
   */
  export function GetSubString(src: string, startIndex: number, endIndex: number): string

  /** Returns a normalized vector representing the current direction of the parcel's sun, taking altitude into account. Falls back to the region's sun direction if no custom parcel environment is set. */
  export function GetSunDirection(): Vector

  /** Returns a rotation representing the orientation applied to the sun on the current parcel and altitude track. Falls back to the region's sun rotation if no custom parcel environment is set. */
  export function GetSunRotation(): Quaternion

  /** Returns a string representing the Blinn-Phong diffuse texture on face (returns the inventory name if it is a texture in the prim's inventory, or its key UUID otherwise). */
  export function GetTexture(face: number): string

  /** Returns a vector containing the texture offsets of face in the X (horizontal U) and Y (vertical V) components (Z is unused). */
  export function GetTextureOffset(face: number): Vector

  /** Returns a float representing the texture rotation angle (in radians) on face. */
  export function GetTextureRot(face: number): number

  /** Returns a vector containing the texture scales of face in the X and Y components (Z is unused). */
  export function GetTextureScale(face: number): Vector

  /** Returns a float representing the elapsed script time in seconds with subsecond precision (since the script started, was reset, or since the last call to llResetTime or llGetAndResetTime). */
  export function GetTime(): number

  /** Returns a float with subsecond precision representing the elapsed seconds since parcel environmental midnight or region uptime (whichever is smaller). If the parcel's sun position is fixed, returns region uptime. */
  export function GetTimeOfDay(): number

  /** Returns a string containing the current date and time in the UTC time zone formatted as an ISO 8601 timestamp ('YYYY-MM-DDThh:mm:ss.ff..fZ'). */
  export function GetTimestamp(): string

  /** Returns a vector representing the physical torque force currently acting on the object (if the object is physical). */
  export function GetTorque(): Vector

  /**
   * Returns an integer representing the current Unix timestamp (the number of seconds elapsed since 00:00:00 Jan 1, 1970 UTC).
   * @deprecated Use 'os.time' instead. Int32 will wrap on 2038-01-19
   */
  export function GetUnixTime(): number

  /** Returns an integer representing the total number of bytes of memory currently used by the script (non-Mono scripts always return 16,384 bytes). */
  export function GetUsedMemory(): number

  /** Returns a string representing the unique username of the avatar specified by id if they are connected to the region or cached; returns an empty string otherwise (use llRequestUsername if the avatar is absent). */
  export function GetUsername(id: UUID): string

  /** Returns a vector representing the velocity of the object (in meters per second) relative to the global region coordinates. For physical objects, returns the velocity of its center of mass. */
  export function GetVel(): Vector

  /** Returns a list containing the values of the visual parameters requested in params for the agent specified by agentid. */
  export function GetVisualParams(agentid: UUID, params: (number | string)[]): (number | "")[]

  /** Returns a float representing the time in seconds since midnight Pacific Time (PST/PDT), which is equivalent to Second Life Time (SLT) truncated to whole seconds. */
  export function GetWallclock(): number

  /** Gives the specified inventory items to the agent as a new folder named folder, as permitted by the permissions system. Customizes the transfer using options. */
  export function GiveAgentInventory(
    agent: UUID,
    folder: string,
    items: string[],
    options: list,
  ): number

  /** Gives the specified inventory item to the target, as permitted by the permissions system. The target can be any agent or an object located in the same region. */
  export function GiveInventory(target: UUID, item: string): void

  /** Gives the list of inventory items to target as a new folder named folder. If target is an object, the items are passed directly into its inventory and no folder is created. The target must be an agent or an object in the same region. */
  export function GiveInventoryList(target: UUID, folder: string, items: string[]): void

  /** Transfers the specified amount of L$ from the script owner to the destination avatar. Silently fails if the PERMISSION_DEBIT permission has not been granted. Returns 0 (use llTransferLindenDollars to match transactions to transaction_result events). */
  export function GiveMoney(destination: UUID, amount: number): number

  /** Rezzes an object directly from a UUID specified by id at the position pos, provided the owner has the god-bit set. */
  export function GodLikeRezObject(id: UUID, pos: Vector): void

  /** Returns a float representing the ground height directly below the prim's position offset by the vector offset. */
  export function Ground(offset: Vector): number

  /** Returns a vector representing the ground contour direction (the direction with no change in elevation) directly below the prim's position offset by the vector offset. */
  export function GroundContour(offset: Vector): Vector

  /** Returns a vector representing the ground surface normal vector directly below the current position offset by the vector offset. */
  export function GroundNormal(offset: Vector): Vector

  /** Critically damps the object's vertical motion to height (using critical damping timescale tau) if it is within height * 0.5 of the terrain (or water level if water is TRUE). Only works on physics-enabled objects; do not use with vehicles. */
  export function GroundRepel(height: number, water: boolean, tau: number): void

  /** Returns a vector representing the ground slope directly below the prim's position offset by the vector offset. */
  export function GroundSlope(offset: Vector): Vector

  /** Returns a Base64-encoded HMAC hash of msg using the secret key private_key and the specified digest algorithm (md5, sha1, sha224, sha256, sha384, or sha512). */
  export function HMAC(privateKey: string, msg: string, algorithm: string): string

  /**
   * Sends an HTTP request to the specified url containing body and configured via parameters. Raises an http_response event and returns a key query handle identifying the request.
   */
  export function HTTPRequest<const T extends readonly unknown[]>(
    url: string,
    parameters: T & ParseHttpParams<T>,
    body: string,
  ): UUID

  /** Responds to the incoming HTTP request identified by request_id with the HTTP status code status and the payload body. */
  export function HTTPResponse(requestId: UUID, status: number, body: string): void

  /** Returns an integer representing the 32-bit hash value of the string val (returns 0 if the string is empty). */
  export function Hash(val: string): number

  /**
   * Returns a copy of dst with src inserted at the given codepoint index.
   * @indexArg index
   */
  export function InsertString(dst: string, index: number, src: string): string

  /** Sends an instant message containing msg to the agent identified by their key. */
  export function InstantMessage(agent: UUID, msg: string): void

  /** Returns an 8-character Base64 string representing the big-endian encoded value of number. */
  export function IntegerToBase64(number: number): string

  /** Returns TRUE if agent_id and the owner of the script are friends, and FALSE otherwise. */
  export function IsFriend(agentId: UUID): boolean

  /** Checks the specified face on the linked prim link. Returns TRUE if the face material is a PBR render material, or FALSE if it uses Blinn-Phong diffuse textures. */
  export function IsLinkGLTFMaterial(link: number, face: number): boolean

  /**
   * Parses the JSON string src and returns a list representing its top-level elements.
   * @deprecated Use 'lljson.decode' instead.
   */
  export function Json2List(src: string): list

  /**
   * Parses the JSON string json and returns the value found by traversing the specified path of specifiers as a string.
   * @deprecated Use 'lljson.decode' instead. Also, the indices are zero-based.
   */
  export function JsonGetValue(json: string, specifiers: list): string

  /**
   * Returns a new JSON string representing json with the target located at specifiers set to value. Supports JSON_APPEND to append elements. Writing JSON_DELETE deletes the target. Overwriting array bounds or setting non-array levels with array indices returns JSON_INVALID.
   * @deprecated Use 'lljson.encode' instead. Also, the indices are zero-based.
   */
  export function JsonSetValue(json: string, specifiers: list, value: string): string

  /**
   * Parses the JSON string json and returns the JSON type constant (JSON_*) representing the value found at specifiers.
   * @deprecated Use 'lljson.decode' and 'typeof' instead. Also, the indices are zero-based.
   */
  export function JsonValueType(json: string, specifiers: list): string

  /** Returns a string containing the name of the prim or avatar specified by id. The target must be a valid, rezzed entity in the current region, otherwise an empty string is returned. Avatars return their legacy name. */
  export function Key2Name(id: UUID): string

  /** Starts an asynchronous transaction requesting the total count of keys in the experience data store. Returns a key query handle for the dataserver event. */
  export function KeyCountKeyValue(): UUID

  /**
   * Starts an asynchronous transaction to retrieve count keys from the experience data store starting at the zero-based index first. Returns a key query handle for the dataserver event. Fails with XP_ERROR_KEY_NOT_FOUND if out of bounds.
   * @indexArg first
   */
  export function KeysKeyValue(first: number, count: number): UUID

  /** Returns a sRGB colorspace vector converted from the linear RGB colorspace argument. */
  export function Linear2sRGB(color: Vector): Vector

  /** Adjusts the volume of the currently playing sound attached to the linked prim link (has no effect on sounds started with llTriggerSound). */
  export function LinkAdjustSoundVolume(link: number, volume: number): void

  /**
   * Creates or updates a particle system on the linked prim link based on the list of rules. An empty list removes the particle system.
   */
  export function LinkParticleSystem<const T extends readonly unknown[]>(
    link: number,
    rules: T & ParseParticleSystemParams<T>,
  ): void

  /** Plays the specified sound on the linked prim link (once or looping) at volume. Only one sound can be attached to a prim at a time; new attachments or calling llStopSound stops previous playback. Controlled by flags. */
  export function LinkPlaySound(link: number, sound: string, volume: number, flags: number): void

  /** Enables or disables sound queuing on the linked prim link. When set to TRUE, sounds will queue and play in sequence. */
  export function LinkSetSoundQueueing(link: number, queue: boolean): void

  /** Limits the audibility radius of attached and triggered scripted sounds to distance radius (in meters) around the linked prim link. */
  export function LinkSetSoundRadius(link: number, radius: number): void

  /** Sets the sit target position (offset) and orientation (rot) for the linked prim link, relative to the prim's own position and rotation. Clear by setting offset to <0.0, 0.0, 0.0>. */
  export function LinkSitTarget(link: number, offset: Vector, rot: Quaternion): void

  /** Stops the playback of any currently playing attached sound on the linked prim link. */
  export function LinkStopSound(link: number): void

  /** Returns an integer representing the number of bytes available/remaining in the linkset's datastore. */
  export function LinksetDataAvailable(): number

  /** Returns the total count of keys in the linkset datastore that match the regular expression pattern. */
  export function LinksetDataCountFound(pattern: string): number

  /** Returns an integer representing the total number of unique keys stored in the linkset's datastore. */
  export function LinksetDataCountKeys(): number

  /** Deletes the unprotected key-value pair specified by name from the linkset's datastore, triggering a linkset_data event. */
  export function LinksetDataDelete(name: string): number

  /** Deletes all keys in the datastore matching the regular expression pattern. Returns a list [num_deleted, num_failed_protected]. Decrypts and deletes protected keys if matching pass is provided. */
  export function LinksetDataDeleteFound(pattern: string, pass: string): number[]

  /** Deletes the protected key-value pair specified by name from the linkset's datastore using the passphrase pass, triggering a linkset_data event. */
  export function LinksetDataDeleteProtected(name: string, pass: string): number

  /**
   * Returns an alphabetically sorted list of up to count keys from the datastore that match the regular expression pattern, starting at index start (returns all matching keys if count < 1).
   * @indexArg start
   */
  export function LinksetDataFindKeys(pattern: string, start: number, count: number): string[]

  /**
   * Returns an alphabetically sorted list of up to count keys from the datastore, starting at index start (returns all keys if count < 1).
   * @indexArg start
   */
  export function LinksetDataListKeys(start: number, count: number): string[]

  /** Reads and returns the string value corresponding to key name from the linkset's datastore. */
  export function LinksetDataRead(name: string): string

  /** Reads and returns the string value of the protected key name from the linkset's datastore using the passphrase pass. */
  export function LinksetDataReadProtected(name: string, pass: string): string

  /** Erases all key-value pairs stored in the linkset's datastore, triggering a linkset_data event (with LINKSETDATA_RESET) in all scripts in the linkset. */
  export function LinksetDataReset(): void

  /** Creates or updates an unprotected key-value pair (name and value) in the linkset's datastore. Returns an integer success or failure code. */
  export function LinksetDataWrite(name: string, value: string): number

  /** Creates or updates a protected key-value pair (name and value) in the linkset's datastore using the passphrase pass. Returns an integer success or failure code. */
  export function LinksetDataWriteProtected(name: string, value: string, pass: string): number

  /** Returns a string of comma-separated values taken in order from the list src. */
  export function List2CSV(src: list): string

  /**
   * Returns the float value at index in the list src. Returns 0.0 if the index is out of bounds or if the value cannot be type-cast.
   * @deprecated Use '[]' and 'tonumber' instead.
   * @indexArg index
   */
  export function List2Float(src: list, index: number): number

  /**
   * Returns the integer value at index in the list src. Returns 0 if the index is out of bounds or if the value cannot be type-cast.
   * @deprecated Use '[]', 'tonumber', and 'math.modf' instead.
   * @indexArg index
   */
  export function List2Integer(src: list, index: number): number

  /**
   * Converts the list values into a JSON string of the specified type (either a JSON_ARRAY or a JSON_OBJECT). Returns JSON_INVALID if an error is encountered.
   * @deprecated Use 'lljson.encode' instead.
   */
  export function List2Json(type: string, values: list): string

  /**
   * Returns the key (UUID) value at index in the list src. Returns a null string/key if the index is out of bounds or if the value cannot be type-cast.
   * @deprecated Use '[]' and 'touuid' instead.
   * @indexArg index
   */
  export function List2Key(src: list, index: number): UUID

  /**
   * Returns a new list containing the subset of entries from src within the inclusive range specified by the start and end indices. Negative indices count backward from the end.
   * @deprecated Use 'unpack' (fastcall) or 'table.move' instead. Prefer structured tables over strided lists.
   * @indexArg startIndex
   * @indexArg endIndex
   */
  export function List2List(src: T[], startIndex: number, endIndex: number): T[]

  /**
   * Returns a list containing the slice_index'th element of every stride within the inclusive range from start to end in the strided list src. Stride must be a positive integer.
   * @deprecated Prefer structured tables over strided lists.
   * @indexArg startIndex
   * @indexArg endIndex
   * @indexArg sliceIndex
   */
  export function List2ListSlice(
    src: T[],
    startIndex: number,
    endIndex: number,
    stride: number,
    sliceIndex: number,
  ): T[]

  /**
   * Returns a new list containing the first element of every stride in the strided list src within the inclusive range from start to end.
   * @deprecated Prefer structured tables over strided lists.
   * @indexArg startIndex
   * @indexArg endIndex
   */
  export function List2ListStrided(
    src: T[],
    startIndex: number,
    endIndex: number,
    stride: number,
  ): T[]

  /**
   * Returns the rotation value at index in the list src. Returns ZERO_ROTATION if the index is out of bounds or if the value cannot be type-cast.
   * @deprecated Use '[]' instead.
   * @indexArg index
   */
  export function List2Rot(src: list, index: number): Quaternion

  /**
   * Returns the string value at index in the list src. Returns an empty string if the index is out of bounds.
   * @deprecated Use '[]' and 'tostring' instead.
   * @indexArg index
   */
  export function List2String(src: list, index: number): string

  /**
   * Returns the vector value at index in the list src. Returns ZERO_VECTOR if the index is out of bounds or if the value cannot be type-cast.
   * @deprecated Use '[]' instead.
   * @indexArg index
   */
  export function List2Vector(src: list, index: number): Vector

  /**
   * Returns the integer index of the first instance of list test within the list src (returns -1 if not found).
   * @deprecated Use 'table.find' instead. Prefer dictionaries or single-item searches.
   * @indexReturn
   */
  export function ListFindList(src: list, test: list): number | undefined

  /**
   * Returns the integer index of the specified instance of list test within the list src (returns -1 if not found).
   * @deprecated Use 'table.find' instead. Prefer dictionaries or single-item searches.
   * @indexArg instance
   * @indexReturn
   */
  export function ListFindListNext(src: list, test: list, instance: number): number | undefined

  /**
   * Returns the integer index of the first instance of list test in the strided list src within the range from start to end (stepping through by stride). Returns -1 if not found.
   * @deprecated Prefer dictionary lookups over strided list searches.
   * @indexArg startIndex
   * @indexArg endIndex
   * @indexReturn
   */
  export function ListFindStrided(
    src: list,
    test: list,
    startIndex: number,
    endIndex: number,
    stride: number,
  ): number | undefined

  /**
   * Returns a new list containing all elements of dest with the elements of src inserted starting at index start. Does not modify dest itself.
   * @deprecated Use 'table.insert' instead. Unnecessary table copying. Fastcall.
   * @indexArg start
   */
  export function ListInsertList(dest: T[], src: T[], start: number): T[]

  /** Returns a randomized copy of the list src by blocks of size stride. If the list length is not perfectly divisible by stride, no randomization occurs. */
  export function ListRandomize(src: T[], stride: number): T[]

  /**
   * Returns a copy of the list dest with the inclusive range from start to end removed, and the elements of src inserted in its place at start.
   * @deprecated Use 't[n] = x' instead. Unnecessary table copying.
   * @indexArg startIndex
   * @indexArg endIndex
   */
  export function ListReplaceList(dest: T[], src: T[], startIndex: number, endIndex: number): T[]

  /** Returns a copy of the list src, sorted into blocks of stride in ascending order (if ascending is TRUE) or descending order (if FALSE). Only works if the first entry of each block shares the same datatype. */
  export function ListSort(src: T[], stride: number, ascending: boolean): T[]

  /**
   * Returns a copy of the list src sorted into blocks of stride by the element at stride_index in each block. Sorted in ascending order (if ascending is TRUE) or descending order (if FALSE).
   * @deprecated Use 'table.sort' instead. Prefer structured tables over strided lists.
   * @indexArg strideIndex
   */
  export function ListSortStrided(
    src: T[],
    stride: number,
    strideIndex: number,
    ascending: boolean,
  ): T[]

  /** Returns the numeric result of the statistical aggregate function operation (a LIST_STAT_* constant) on the numeric list src. */
  export function ListStatistics(operation: number, src: number[]): number

  /** Creates a listener on channel from name and id for msg. Returns an integer listener handle used to control or remove the listener. Empty strings or NULL_KEY filters do not filter on those parameters. */
  export function Listen(channel: number, name: string, id: UUID, msg: string): number

  /** Enables or disables the listener specified by the integer handle. If active is TRUE, the listener is activated; if FALSE, it is deactivated. */
  export function ListenControl(handle: number, active: boolean): void

  /** Completely removes the listener specified by the integer handle. */
  export function ListenRemove(handle: number): void

  /** Shows a dialog box displaying message to the avatar avatar offering to open the specified url. Clicking yes launches the URL in their default web browser. */
  export function LoadURL(avatar: UUID, message: string, url: string): void

  /**
   * Returns natural (base e) logarithm of val. If negative, return 0.0.
   * @deprecated Use 'math.log' instead. Double precision; fastcall.
   */
  export function Log(val: number): number

  /**
   * Returns base-10 (common) logarithm of val. If negative, return 0.0.
   * @deprecated Use 'math.log10' instead. Double precision; fastcall.
   */
  export function Log10(val: number): number

  /** Causes the object to orient its positive Z-axis (up axis) toward the target vector, keeping its positive X-axis (forward axis) below the horizon. Tracks target until llStopLookAt is called or strength is set to 0.0. */
  export function LookAt(target: Vector, strength: number, damping: number): void

  /** Plays the attached sound looping indefinitely at the specified volume. Only one sound can be attached to a prim at a time; new loops adjust the volume of the currently playing sound without restarting it. */
  export function LoopSound(sound: string, volume: number): void

  /** Plays the attached sound looping indefinitely at the specified volume and declares it a Sync Master, forcing slave sounds to synchronize with it. */
  export function LoopSoundMaster(sound: string, volume: number): void

  /** Plays the attached sound looping indefinitely at the specified volume, synchronized to the most audible active Sync Master in range. */
  export function LoopSoundSlave(sound: string, volume: number): void

  /** Returns a string of 32 hex characters representing the MD5 checksum of src salted with nonce (formatted as ':' + nonce). */
  export function MD5String(src: string, nonce: number): string

  /**
   * Deprecated. Generates a circular explosion of particles. Use llParticleSystem instead.
   * @deprecated Use 'll.ParticleSystem' instead.
   */
  export function MakeExplosion(
    particles: number,
    scale: number,
    vel: number,
    lifetime: number,
    arc: number,
    texture: string,
    offset: Vector,
  ): void

  /**
   * Deprecated. Generates fire-like particles. Use llParticleSystem instead.
   * @deprecated Use 'll.ParticleSystem' instead.
   */
  export function MakeFire(
    particles: number,
    scale: number,
    vel: number,
    lifetime: number,
    arc: number,
    texture: string,
    offset: Vector,
  ): void

  /**
   * Deprecated. Generates a fountain of particles. Use llParticleSystem instead.
   * @deprecated Use 'll.ParticleSystem' instead.
   */
  export function MakeFountain(
    particles: number,
    scale: number,
    vel: number,
    lifetime: number,
    arc: number,
    bounce: number,
    texture: string,
    offset: Vector,
    bounceOffset: number,
  ): void

  /**
   * Deprecated. Generates smoke-like particles. Use llParticleSystem instead.
   * @deprecated Use 'll.ParticleSystem' instead.
   */
  export function MakeSmoke(
    particles: number,
    scale: number,
    vel: number,
    lifetime: number,
    arc: number,
    texture: string,
    offset: Vector,
  ): void

  /** Adds or removes agents from the estate's access or ban lists, or groups from the estate's group access list, specified by the action. Returns TRUE if successful, or FALSE if throttled, if the action/ID is invalid, or if the script owner lacks estate management rights. */
  export function ManageEstateAccess(action: number, avatar: UUID): boolean

  /** Displays an in-world beacon and optionally opens the world map for the avatar touching or wearing the object, centered on region_name with pos highlighted. Only works for attached scripts or during touch events. */
  export function MapBeacon(regionName: string, pos: Vector, options: list): void

  /** Opens the world map for the avatar touching or wearing the object, centered on simname with pos highlighted. Only works for attached scripts or during touch events. Note: look_at currently has no effect. */
  export function MapDestination(simname: string, pos: Vector, lookAt: Vector): void

  /** Triggers a link_message event, sending num, str, and id to the scripts in the prim(s) specified by link to allow scripts within the same object to communicate. */
  export function MessageLinked(
    link: number,
    num: number,
    str: string | UUID,
    id: string | UUID,
  ): void

  /** Sets the minimum delay time between events being handled (minimums and defaults vary by event type). */
  export function MinEventDelay(delay: number): void

  /** Returns base raised to the power exponent, modulo modulus (i.e., (b^e)%m). All inputs are wrapped to unsigned 32-bit integer range [0..4294967295]. Output is wrapped to signed 32-bit integer range [-2147483648..2147483647]. Will never overflow, unlike (b^e), which can overflow to inf. */
  export function ModPow(base: number, exponent: number, modulus: number): number

  /** Modifies the terrain using the specified land action and brush size (0, 1, or 2, corresponding to 2m x 2m, 4m x 4m, or 8m x 8m). */
  export function ModifyLand(action: number, brush: number): void

  /** Critically damps the physical object's motion to position target in tau seconds. Setting tau to 0.0 stops the critical damping; recommended tau values are greater than 0.2. */
  export function MoveToTarget(target: Vector, tau: number): void

  /** Requests the key (UUID) of the avatar name in the current region. Returns NULL_KEY if no matching agent is present. Formats are 'First Last' or 'first.last' (assumes 'Resident' if last name is omitted; case-insensitive). */
  export function Name2Key(name: string): UUID

  /** Directs a pathfinding character to navigate to the position pos (located in the current or adjacent regions) using the parameters specified in options. */
  export function NavigateTo(pos: Vector, options: list): void

  /** Sets the texture horizontal (u) and vertical (v) offsets for the chosen face. If face is ALL_SIDES, offsets all faces. */
  export function OffsetTexture(u: number, v: number, face: number): void

  /** Opens the specified viewer floater_name loaded with url and configured via params. Returns an integer error code, or 0 if successful. */
  export function OpenFloater(floaterName: string, url: string, params: list): number

  /**
   * Deprecated. Creates a channel to listen for incoming XML-RPC calls, triggering a remote_data event with the channel ID once available.
   * @deprecated
   */
  export function OpenRemoteDataChannel(): void

  /**
   * Returns the ordinal (Unicode copepoint integer) of the character at index in the string val. Negative indices count backward from the end of the string.
   * @indexArg index
   */
  export function Ord(val: string, index: number): number

  /** Returns TRUE if the avatar or object specified by key id is over land owned by the script owner, or FALSE otherwise. */
  export function OverMyLand(id: UUID): boolean

  /**
   * Sends the chat message msg privately to the object owner (the owner must be currently in the same region for the message to be received).
   * @deprecated Use 'print' instead.
   */
  export function OwnerSay(msg: string): void

  /** Controls the playback of movies and other multimedia resources on a parcel or for an agent, using the PARCEL_MEDIA_COMMAND_* settings specified in commandList. */
  export function ParcelMediaCommandList(commandList: list): void

  /**
   * Queries the media properties of the parcel containing the script, returning a list of values in the order requested by query. Only works if the object is owned by the landowner or deeded to the land's group.
   */
  export function ParcelMediaQuery<const T extends readonly ParcelMediaQueryFlag[]>(
    query: T,
  ): MapParcelMediaQuery<T> | []

  /** Breaks the string src into a list of substrings, discarding any separators, keeping spacers, and omitting any empty null values. separators and spacers accept up to 8 string entries each. */
  export function ParseString2List(src: string, separators: string[], spacers: string[]): string[]

  /** Breaks the string src into a list of substrings, discarding separators and keeping spacers, while preserving empty null values (unlike llParseString2List). separators and spacers accept up to 8 string entries each. */
  export function ParseStringKeepNulls(
    src: string,
    separators: string[],
    spacers: string[],
  ): string[]

  /**
   * Creates or updates a particle system on the prim containing the script based on rules. An empty list removes the particle system.
   */
  export function ParticleSystem<const T extends readonly unknown[]>(
    rules: T & ParseParticleSystemParams<T>,
  ): void

  /** Sets the pass-collisions attribute. If pass is TRUE, collision events are passed from child prims to the root; if FALSE (default), they only trigger events in the affected child prim. */
  export function PassCollisions(pass: number): void

  /** Sets the pass-touches attribute. If pass is TRUE, touch events are passed from child prims to the root; if FALSE (default), they only trigger events in the affected child prim. */
  export function PassTouches(pass: number): void

  /** Directs a pathfinding character to patrol sequentially through the coordinates specified in patrolPoints, configured by options. */
  export function PatrolPoints(patrolPoints: Vector[], options: list): void

  /** Plays the specified sound once at volume, attached to the object. Only one sound can be attached to a prim at a time; new sounds or calling llStopSound stops previous playback. A second call with the same sound adjusts the volume without restarting it. */
  export function PlaySound(sound: string, volume: number): void

  /** Plays the attached sound once at volume, synchronized to the next loop point of the most audible active Sync Master. */
  export function PlaySoundSlave(sound: string, volume: number): void

  /**
   * Directs the avatar owning the object to point at the vector pos.
   * @deprecated
   */
  export function PointAt(pos: Vector): void

  /**
   * Returns base raised to the power exponent. If result is imaginary, returns NaN.
   * @deprecated Use '^' instead. Double precision; operator.
   */
  export function Pow(base: number, exponent: number): number

  /** Causes nearby viewers in range to preload the specified sound from the object's inventory to prevent playback delays. */
  export function PreloadSound(sound: string): void

  /** Directs a pathfinding character to pursue and chase target, configured by the parameters specified in options. */
  export function Pursue(target: UUID, options: list): void

  /** Applies physical impulse (force) and ang_impulse (rotational force) to the specified target avatar or object. */
  export function PushObject(
    target: UUID,
    impulse: Vector,
    angImpulse: Vector,
    isLocal: boolean,
  ): void

  /** Starts an asynchronous transaction to read the value associated with key k in the experience. Returns a key query handle for the dataserver event. Fails with XP_ERROR_KEY_NOT_FOUND if the key does not exist. */
  export function ReadKeyValue(k: string): UUID

  /**
   * Legacy function intended to reload the web page displayed on the prim's faces (currently non-functional).
   * @deprecated Use 'll.SetPrimMediaParams' instead.
   */
  export function RefreshPrimURL(): void

  /** Broadcasts the message msg to all scripts listening on channel Channel within the region. PUBLIC_CHANNEL (0) cannot be used, so, only scripts can receive the message. */
  export function RegionSay(channel: number, msg: string): void

  /** Sends the message msg on Channel privately to the targeted agent or object (if within the region). If target is an agent and channel is non-zero, the message can also be heard by any attachments worn by the avatar. */
  export function RegionSayTo(target: UUID, channel: number, msg: string): void

  /**
   * Deprecated. Intended to return camera control back to the avatar (use llClearCameraParams instead).
   * @deprecated Use 'll.ClearCameraParams' instead.
   */
  export function ReleaseCamera(avatar: UUID): void

  /** Stops taking inputs (previously acquired via llTakeControls) from the avatar, dequeuing any remaining control events and revoking the PERMISSION_TAKE_CONTROLS permission. */
  export function ReleaseControls(): void

  /** Releases the specified url (previously obtained via llRequestURL), rendering it no longer usable. */
  export function ReleaseURL(url: string): void

  /**
   * Deprecated. Sends an XML-RPC reply on channel to message_id with payload string sdata and integer idata.
   * @deprecated
   */
  export function RemoteDataReply(
    channel: UUID,
    messageId: UUID,
    sdata: string,
    idata: number,
  ): void

  /**
   * Deprecated. Used with XML-RPC to reregister remote data channels if the object moves to another region.
   * @deprecated
   */
  export function RemoteDataSetRegion(): void

  /**
   * Deprecated.
   * @deprecated
   */
  export function RemoteLoadScript(
    target: UUID,
    script: string,
    running: number,
    startParam: number,
  ): void

  /** Copies the script into target, setting it running (if running is TRUE) with the start_param, provided the script owner has modify permissions on target and target's PIN matches pin (set via llSetRemoteScriptAccessPin). */
  export function RemoteLoadScriptPin(
    target: UUID,
    script: string,
    pin: number,
    running: boolean,
    startParam: number,
  ): void

  /** Removes the specified avatar from the land parcel's ban list. */
  export function RemoveFromLandBanList(avatar: UUID): void

  /** Removes the specified avatar from the land parcel's pass/access list. */
  export function RemoveFromLandPassList(avatar: UUID): void

  /** Permanently deletes the named inventory item from the prim's inventory. */
  export function RemoveInventory(item: string): void

  /** Disables the specified vehicle flags (sets them to FALSE) using the bitwise mask flags. */
  export function RemoveVehicleFlags(flags: number): void

  /** Replaces the region and parcel environment seen by the specified agent_id as part of an experience, transitioning the settings over transition seconds. Passing NULL_KEY or an empty string for environment restores defaults. */
  export function ReplaceAgentEnvironment(
    agentId: UUID,
    transition: number,
    environment: string,
  ): number

  /** Replaces the environment on the parcel containing position (or the entire region if position is <-1.0, -1.0, -1.0>) for the specified track_no. Modifies day_length and day_offset if specified. Requires edit permissions on the parcel or estate management rights. */
  export function ReplaceEnvironment(
    position: Vector,
    environment: string,
    trackNo: number,
    dayLength: number,
    dayOffset: number,
  ): number

  /** Returns a copy of src with count occurrences of pattern replaced by replacement_pattern. Setting count to 0 replaces all occurrences; positive counts process left-to-right, while negative counts process right-to-left. */
  export function ReplaceSubString(
    src: string,
    pattern: string,
    replacementPattern: string,
    count: number,
  ): string

  /** Asynchronously requests the specified data category (DATA_*) about the agent id. Triggers a dataserver event with the results and returns a key query handle. */
  export function RequestAgentData(id: UUID, data: number): UUID

  /** Asynchronously requests the display name of the agent specified by id, triggering a dataserver event with the results. The agent does not need to be online or in the region. Returns a key query handle. */
  export function RequestDisplayName(id: UUID): UUID

  /** Requests permission from the specified agent to participate in the experience. These permissions are persistent and apply grid-wide across all scripts in the experience, automatically triggering experience_permissions or experience_permissions_denied. */
  export function RequestExperiencePermissions(agent: UUID, name: string): void

  /** Asynchronously requests data for the named inventory item, triggering a dataserver event. Currently, only landmark items are supported (which return local region coordinates). Returns a key query handle. */
  export function RequestInventoryData(item: string): UUID

  /** Requests permissions (a bitfield specified by permissions) from the agent in the same region, calling run_time_permissions if granted. This call does not pause script execution. */
  export function RequestPermissions(agent: UUID, permissions: number): void

  /** Asynchronously requests one secure HTTPS (SSL, port 12043) URL for use by this object, triggering an http_request event. Returns a key query handle. */
  export function RequestSecureURL(): UUID

  /** Asynchronously requests data (using a DATA_SIM_* constant) about the region. Triggers a dataserver event and returns a key query handle. */
  export function RequestSimulatorData(region: string, data: number): UUID

  /** Asynchronously requests one HTTP URL for use by this script, triggering an http_request event. Returns a key query handle. */
  export function RequestURL(): UUID

  /** Asynchronously requests the Agent ID key (UUID) for the agent specified by their current or historical username, returning NULL_KEY if not found. Returns a key query handle for the dataserver event. */
  export function RequestUserKey(username: string): UUID

  /** Asynchronously requests the unique single-word username of the agent identified by id, triggering a dataserver event. The agent does not need to be online or in the region. Returns a key query handle. */
  export function RequestUsername(id: UUID): UUID

  /** Resets the animation override for anim_state to its default value (use 'ALL' to reset all states). Requires the PERMISSION_OVERRIDE_ANIMATIONS permission. */
  export function ResetAnimationOverride(animState: string): void

  /** Removes all blocked residents from the land parcel's ban list. */
  export function ResetLandBanList(): void

  /** Removes all residents from the land parcel's access/pass list. */
  export function ResetLandPassList(): void

  /** Resets the named script name in the prim's inventory. */
  export function ResetOtherScript(script: string): void

  /** Resets the current script. */
  export function ResetScript(): void

  /** Returns objects specified by the list of UUIDs objects to their owners. Requires the PERMISSION_RETURN_OBJECTS permission, and the script owner must own the parcel or be an estate manager/region owner. */
  export function ReturnObjectsByID(objects: UUID[]): number

  /** Returns objects owned by owner within the specified scope (parcel, parcel owner, or region). Requires the PERMISSION_RETURN_OBJECTS permission, and the script owner must own the parcel or be an estate manager/region owner. */
  export function ReturnObjectsByOwner(owner: UUID, scope: number): number

  /** Instantiates the named inventory object with the root prim at pos with velocity vel and rotation rot, passing start_param as the on_rez start parameter. The vel parameter is ignored if the rezzed object is non-physical. */
  export function RezAtRoot(
    item: string,
    pos: Vector,
    vel: Vector,
    rot: Quaternion,
    startParam: number,
  ): void

  /** Instantiates the named inventory object with the bounding box centered at pos with velocity vel and rotation rot, passing param as the on_rez start parameter. The vel parameter is ignored if the rezzed object is non-physical. */
  export function RezObject(
    item: string,
    pos: Vector,
    vel: Vector,
    rot: Quaternion,
    startParam: number,
  ): void

  /**
   * Instantiates the named inventory object (defaulting to the rezzing prim's position unless REZ_POS is specified) using the initial set of parameters specified in options. Returns the key of the rezzed object, or a blank key on failure.
   */
  export function RezObjectWithParams<const T extends readonly unknown[]>(
    item: string,
    options: T & ParseRezParams<T>,
  ): UUID

  /** Returns the angle, in radians, that q rotates. */
  export function Rot2Angle(q: Quaternion): number

  /** Returns the unit vector axis that q rotates around. */
  export function Rot2Axis(q: Quaternion): Vector

  /** Returns a vector of Euler angles (roll, pitch, yaw) of q. The angles will be in radians. */
  export function Rot2Euler(q: Quaternion): Vector

  /**
   * Returns the unit vector pointing toward positive X (forward) in the coordinate space of rotation q. Equivalent to <1, 0, 0> * q.
   * @deprecated Use 'quaternion.tofwd' instead.
   */
  export function Rot2Fwd(q: Quaternion): Vector

  /**
   * Returns the unit vector pointing toward positive Y (left) in the coordinate space of rotation q. Equivalent to <0, 1, 0> * q.
   * @deprecated Use 'quaternion.toleft' instead.
   */
  export function Rot2Left(q: Quaternion): Vector

  /**
   * Returns the unit vector pointing toward positive Z (up) in the coordinate space of rotation q. Equivalent to <0, 0, 1> * q.
   * @deprecated Use 'quaternion.toup' instead.
   */
  export function Rot2Up(q: Quaternion): Vector

  /** Returns the shortest-path quaternion that rotates start_vec onto end_vec. */
  export function RotBetween(startVec: Vector, endVec: Vector): Quaternion

  /** Causes the object to smoothly rotate to target_direction with a force defined by strength and damping. A strength of 0.0 cancels the rotation target. Rotation is maintained until stopped with llStopLookAt. */
  export function RotLookAt(targetDirection: Quaternion, strength: number, damping: number): void

  /** Registers the rotation rot with a leeway tolerance error (in radians) as a target, triggering at_rot_target and not_at_rot_target events. Returns an integer handle to unregister the target via llRotTargetRemove. */
  export function RotTarget(rot: Quaternion, error: number): number

  /** Removes the rotational target specified by the integer handle registered with llRotTarget. */
  export function RotTargetRemove(handle: number): void

  /** Sets the texture rotation of face to the specified angle (in radians). If face is ALL_SIDES, rotates the texture on all faces. */
  export function RotateTexture(angle: number, face: number): void

  /**
   * Returns val rounded to the nearest integer. Halfway values are rounded toward infinity.
   * @deprecated Use 'math.round' instead. Fastcall.
   */
  export function Round(val: number): number

  /** Returns a string of 40 hex characters representing the SHA-1 security hash of src. */
  export function SHA1String(src: string): string

  /** Returns a string of 64 hex characters representing the SHA-256 security hash of src. */
  export function SHA256String(src: string): string

  /** Returns TRUE if the agent or object specified by uuid is in the same region (simulator) and shares the same active group as the prim containing the script; returns FALSE otherwise. */
  export function SameGroup(uuid: UUID): boolean

  /** Broadcasts the message msg to all scripts or agents listening on channel within llGetEnv("chat_range"), which is 20m on most regions. Agents listen on PUBLIC_CHANNEL (0) and DEBUG_CHANNEL (2147483647). All other channels are for script-to-script communication. */
  export function Say(channel: number, msg: string): void

  /** Attempts to uniformly resize the entire object by scaling_factor, maintaining size-position ratios of the prims. Fails if the linkset is physical, a pathfinding character, in keyframed motion, would exceed prim scale/linkability limits, or would overflow parcel capacity. */
  export function ScaleByFactor(scalingFactor: number): boolean

  /** Sets the diffuse texture horizontal u and vertical v scales (repeats) on the specified face of the prim. Setting face to ALL_SIDES updates all sides. Negative scale values flip the texture. */
  export function ScaleTexture(u: number, v: number, face: number): void

  /** Returns TRUE if the vector position pos is over public land, sandbox land, land restricting edit/build permissions, or land that disables outside scripts. */
  export function ScriptDanger(pos: Vector): boolean

  /** Enables or disables the script's profiling state using flags (supports PROFILE_SCRIPT_MEMORY on Mono, or PROFILE_NONE). Active profiling can significantly reduce script performance. */
  export function ScriptProfiler(flags: number): void

  /**
   * Deprecated. Sends an XML-RPC request to dest on channel, containing the channel ID as a string, integer idata, and string sdata. Returns a key representing the message_id.
   * @deprecated
   */
  export function SendRemoteData(channel: UUID, dest: string, idata: number, sdata: string): UUID

  /** Performs a single scan from the prim's forward vector for name and id of type within radius meters and arc radians. Results trigger a sensor or no_sensor event. Passing empty filters (blank name, 0 type, or NULL_KEY id) disables that filter. */
  export function Sensor(name: string, id: UUID, type: number, radius: number, arc: number): void

  /** Removes the periodic sensor previously configured by llSensorRepeat. */
  export function SensorRemove(): void

  /** Sets up a repeating periodic scan every rate seconds for name and id of type within radius meters and arc radians of the forward vector. Results trigger sensor or no_sensor events. */
  export function SensorRepeat(
    name: string,
    id: UUID,
    type: number,
    radius: number,
    arc: number,
    rate: number,
  ): void

  /** Sets an individual agent's environmental settings using the attributes in params over a duration of transition seconds. Must be used as part of an experience; passing an empty list removes overrides. */
  export function SetAgentEnvironment(agentId: UUID, transition: number, params: list): number

  /** Sets the rotation of the avatar to rot, controlled by flags. */
  export function SetAgentRot(rot: Quaternion, flags: number): void

  /** Sets the diffuse texture alpha (opacity) of face. If face is ALL_SIDES, applies to all faces. Values are clamped between 0.1 and 1.0 (where 1.0 is fully opaque). */
  export function SetAlpha(alpha: number, face: number): void

  /** Sets the angular velocity of a physical object to initial_omega (mass-independent). If local is TRUE, applied in local coordinates; if FALSE, applied in global coordinates. Has no effect on non-physical objects. */
  export function SetAngularVelocity(initialOmega: Vector, isLocal: boolean): void

  /** Overrides the default animation for anim_state with anim (which must be in the object's inventory or a built-in animation). Requires the PERMISSION_OVERRIDE_ANIMATIONS permission. */
  export function SetAnimationOverride(animState: string, anim: string): void

  /** Sets the buoyancy of a physical object (requires physics to be enabled). A value of 0.0 offers no buoyancy, < 1.0 sinks, 1.0 counteracts gravity, and > 1.0 rises. */
  export function SetBuoyancy(buoyancy: number): void

  /** Sets the target offset vector (in local coordinates) that a seated avatar's camera will look at. */
  export function SetCameraAtOffset(offset: Vector): void

  /** Sets the eye offset vector (in local coordinates) where a seated avatar's camera is positioned. */
  export function SetCameraEyeOffset(offset: Vector): void

  /**
   * Sets multiple camera parameters simultaneously using the list of rules. Requires the PERMISSION_CONTROL_CAMERA runtime permission.
   */
  export function SetCameraParams<const T extends readonly unknown[]>(
    rules: T & ParseCameraParams<T>,
  ): void

  /** Sets the action (a CLICK_ACTION_* flag) performed when an avatar left-clicks the prim. */
  export function SetClickAction(action: number): void

  /** Sets the Blinn-Phong diffuse RGB color of face. If face is ALL_SIDES, applies the color to all faces. */
  export function SetColor(color: Vector, face: number): void

  /** Sets the 'Content-Type' header of subsequent HTTP server responses (via llHTTPResponse) for request_id using the specified content_type (a CONTENT_TYPE_* constant). */
  export function SetContentType(requestId: UUID, contentType: number): void

  /** Sets the amount of damage delivered when this object hits an avatar. The object is immediately destroyed upon inflicting damage, and no collision event is triggered. */
  export function SetDamage(damage: number): void

  /** Overrides the environmental settings at position for a parcel (or region if position is <-1.0, -1.0, z>) using the parameters in params. Passing an empty params list removes previous overrides. */
  export function SetEnvironment(position: Vector, params: list): number

  /** @deprecated */
  export function SetExperienceKey(experienceid: UUID): number

  /** Applies a constant linear force to a physical object. If local is TRUE, force is applied relative to local coordinates; if FALSE, applied relative to region coordinates. */
  export function SetForce(force: Vector, isLocal: boolean): void

  /** Sets both the constant linear force and constant torque acting on a physical object. If local is TRUE, forces are applied in local coordinates; if FALSE, in global coordinates. */
  export function SetForceAndTorque(force: Vector, torque: Vector, isLocal: boolean): void

  /** Changes the painted terrain textures on the region based on changes. The script owner must have estate management rights. Returns an integer status. */
  export function SetGroundTexture(changes: list): number

  /** Critically damps the physical object's vertical movement to hover at height (above ground, or above water if water is TRUE) in tau seconds. Do not use with vehicles; call llStopHover to cancel. */
  export function SetHoverHeight(height: number, water: boolean, tau: number): void

  /** Sets the specified item's permission flags for the specified group. */
  export function SetInventoryPermMask(item: string, group: number, flags: number): void

  /** Smoothly moves a non-physical object between the positions, orientations, and times specified in the keyframes list, configured via options. Collisions with keyframed objects are ignored. An empty keyframes list terminates the motion. */
  export function SetKeyframedMotion(keyframes: list, options: list): void

  /** Sets the Blinn-Phong alpha (transparency) of face on the linked prim link. */
  export function SetLinkAlpha(link: number, alpha: number, face: number): void

  /** Sets the camera eye position offset eye and looking-at position offset at for avatars who sit on the linked prim link. */
  export function SetLinkCamera(link: number, eye: Vector, at: Vector): void

  /** Sets the Blinn-Phong diffuse RGB color of face on the linked prim link. */
  export function SetLinkColor(link: number, color: Vector, face: number): void

  /**
   * Sets or removes individual GLTF override parameters specified by params on face of the linked prim link.
   */
  export function SetLinkGLTFOverrides<const T extends readonly unknown[]>(
    link: number,
    face: number,
    params: T & ParseGltfOverrideParams<T>,
  ): void

  /** Sets the media parameters specified by params on face of the linked prim link without a script delay. Returns an integer STATUS_* flag detailing success or failure. */
  export function SetLinkMedia(link: number, face: number, params: list): number

  /**
   * Deprecated (use llSetLinkPrimitiveParamsFast instead). Sets primitive parameters for the linked prim link according to rules.
   * @deprecated Use 'll.SetLinkPrimitiveParamsFast' instead.
   */
  export function SetLinkPrimitiveParams<const T extends readonly unknown[]>(
    link: number,
    rules: T & ParsePrimParams<T>,
  ): void

  /**
   * Sets primitive parameters for the linked prim link according to rules with no built-in script sleep delay.
   */
  export function SetLinkPrimitiveParamsFast<const T extends readonly unknown[]>(
    link: number,
    rules: T & ParsePrimParams<T>,
  ): void

  /** Applies material (UUID or inventory name) to face of the linked prim link. Note: This clears most PRIM_GLTF_* properties on the face except for repeats, offsets, and rotation. */
  export function SetLinkRenderMaterial(link: number, material: string, face: number): void

  /** Sets the sit target flags for the linked prim link inside the linkset. */
  export function SetLinkSitFlags(link: number, flags: number): void

  /** Applies texture (UUID or inventory name) to face of the linked prim link. */
  export function SetLinkTexture(link: number, texture: string, face: number): void

  /** Animates the texture on face of the linked prim link by setting the scale and offset according to mode. Parameters sizex/sizey define frames, start defines the start frame/angle, length defines duration, and rate defines playback speed. */
  export function SetLinkTextureAnim(
    link: number,
    mode: number,
    face: number,
    sizex: number,
    sizey: number,
    start: number,
    length: number,
    rate: number,
  ): void

  /** Sets the rotation of a child prim relative to its root prim using rot. */
  export function SetLocalRot(rot: Quaternion): void

  /** Sets the description of the prim containing the script to description (limited to 127 characters). */
  export function SetObjectDesc(description: string): void

  /** Sets the name of the prim containing the script to name. */
  export function SetObjectName(name: string): void

  /** Sets the scripts's object's permission flags for the specified group. */
  export function SetObjectPermMask(group: number, flags: number): void

  /** Sets the parcel the object is on for sale. If ForSale is TRUE, puts the land up for sale using Options (price, buyer, objects included). Setting ForSale to FALSE removes the parcel from sale. Requires parcel ownership and the PERMISSION_PRIVILEGED_LAND_ACCESS permission. Returns an error code or 0 if successful. */
  export function SetParcelForSale(forSale: boolean, options: list): number

  /** Sets the streaming audio (music) URL for the parcel containing the object. The object owner must match the landowner or land group. */
  export function SetParcelMusicURL(url: string): void

  /** Suggests default amounts for the pay text input field price and the four payment dialog quick_pay_buttons when an avatar pays this object. */
  export function SetPayPrice(price: number, quickPayButtons: number[]): void

  /** Configures the physical characteristics of an object. The mask bitfield specifies which of the other parameters (gravity_multiplier, restitution, friction, or density) should be applied to the object. */
  export function SetPhysicsMaterial(
    mask: number,
    gravityMultiplier: number,
    restitution: number,
    friction: number,
    density: number,
  ): void

  /** Moves the non-physical object or prim toward the vector pos (up to 10m). If called in a child prim, pos is treated as root-relative; if called from the root prim, the entire object is moved. */
  export function SetPos(pos: Vector): void

  /** Sets the media parameters specified by params on the designated face of the prim. Returns an integer STATUS_* flag detailing success or failure. */
  export function SetPrimMediaParams(face: number, params: list): number

  /**
   * Deprecated (use llSetPrimMediaParams instead). Updates the URL displayed on the prim's faces.
   * @deprecated Use 'll.SetPrimMediaParams' instead.
   */
  export function SetPrimURL(url: string): void

  /**
   * Deprecated (use llSetLinkPrimitiveParamsFast instead). Sets the prim's attributes according to rules.
   * @deprecated Use 'll.SetLinkPrimitiveParamsFast' instead.
   */
  export function SetPrimitiveParams<const T extends readonly unknown[]>(
    rules: T & ParsePrimParams<T>,
  ): void

  /** Tries to move the entire object so that its root prim is within 0.1m of the vector position (underground positions are set to ground level). Returns TRUE on success or FALSE on failure. */
  export function SetRegionPos(position: Vector): boolean

  /** Sets the prim's remote script access PIN to pin (a non-zero value enables loading via llRemoteLoadScriptPin, while zero disables it). */
  export function SetRemoteScriptAccessPin(pin: number): void

  /** Applies material (UUID or inventory name) to face of the prim. Note: This clears most PRIM_GLTF_* properties on the face except for repeats, offsets, and rotation. */
  export function SetRenderMaterial(material: string, face: number): void

  /** Sets the rotation of the prim to rot. If in a child prim, rot is treated as root-relative; if in the root prim of a non-physical object, rotates the entire object. */
  export function SetRot(rot: Quaternion): void

  /** Sets the physical scale (dimensions) of the prim containing the script to size. */
  export function SetScale(size: Vector): void

  /** Sets the running state of the named script in the prim's inventory. If running is TRUE, the script is enabled; if FALSE, it is disabled. */
  export function SetScriptState(script: string, running: boolean): void

  /** Displays the string text instead of 'Sit' (or 'Sit Here') in the viewer's right-click context menu. */
  export function SetSitText(text: string): void

  /** Sets whether attached sounds wait for the current sound to end before playing (enables queuing if queue is TRUE, disables if FALSE). The queue is one level deep. */
  export function SetSoundQueueing(queue: boolean): void

  /** Limits the audibility radius of attached and triggered scripted sounds to distance radius. */
  export function SetSoundRadius(radius: number): void

  /** Sets the object status attributes specified by status to value. */
  export function SetStatus(status: number, value: boolean): void

  /** Displays floating text above the prim with the specified color vector and transparency alpha. */
  export function SetText(text: string, color: Vector, alpha: number): void

  /** Applies the Blinn-Phong diffuse texture to face of the prim. */
  export function SetTexture(texture: string, face: number): void

  /** Animates the texture on face of the prim by setting its scale and offset. mode defines options, sizex/sizey define frames, start defines the start frame/angle, length defines duration, and rate defines playback speed. */
  export function SetTextureAnim(
    mode: number,
    face: number,
    sizex: number,
    sizey: number,
    start: number,
    length: number,
    rate: number,
  ): void

  /** Applies a constant torque rotational force to a physical object. If local is TRUE, torque is applied in local coordinates; if FALSE, applied in global coordinates. */
  export function SetTorque(torque: Vector, isLocal: boolean): void

  /** Displays the string text instead of 'Touch' in the right-click context menu. */
  export function SetTouchText(text: string): void

  /** Enables the vehicle flags specified in the Flags bitmask. */
  export function SetVehicleFlags(flags: number): void

  /** Sets the specified vehicle float parameter param to value. */
  export function SetVehicleFloatParam(param: number, value: number): void

  /** Sets the specified vehicle rotation parameter param to rot. */
  export function SetVehicleRotationParam(param: number, rot: Quaternion): void

  /** Sets the vehicle physics preset type to one of the default vehicle types. */
  export function SetVehicleType(type: number): void

  /** Sets the specified vehicle vector parameter param to vec. */
  export function SetVehicleVectorParam(param: number, vec: Vector): void

  /** Sets the linear velocity of a physical object to velocity. If local is TRUE, velocity is treated as a local directional vector; if FALSE, as a global region directional vector. Has no effect on non-physical objects. */
  export function SetVelocity(velocity: Vector, isLocal: boolean): void

  /** Broadcasts the message msg to all scripts or agents listening on channel within llGetEnv("shout_range"), which is 100m on most regions. Agents listen on PUBLIC_CHANNEL (0) and DEBUG_CHANNEL (2147483647). All other channels are for script-to-script communication. */
  export function Shout(channel: number, msg: string): void

  /** Returns the Base64-encoded RSA signature of msg using the PEM-formatted private_key and the specified digest algorithm (sha1, sha224, sha256, sha384, or sha512). Can be paired with llVerifyRSA to pass verifiable messages. */
  export function SignRSA(privateKey: string, msg: string, algorithm: string): string

  /**
   * Returns the sine of theta. Theta is in radians.
   * @deprecated Use 'math.sin' instead. Double precision; fastcall.
   */
  export function Sin(theta: number): number

  /** Forces the avatar specified by agent_id (who must be participating in the experience) to sit on the sit target of the prim indicated by link. If occupied, searches down the linkset for an available sit target. Returns an integer. */
  export function SitOnLink(agentId: UUID, link: number): number

  /** Sets the sit target position (offset) and rotation (rot) relative to the prim's position and orientation. Clears the sit target if offset is ZERO_VECTOR. */
  export function SitTarget(offset: Vector, rot: Quaternion): void

  /** Puts the script to sleep for sec seconds (at least until the next server-frame, ~0.02222 seconds). The script is inactive during this time. If sec is 0.0 or less, the script does not sleep. */
  export function Sleep(sec: number): void

  /**
   * Deprecated (use llPlaySound instead). Plays the specified sound at volume, with options to loop or queue the sound.
   * @deprecated Use 'll.PlaySound' instead.
   */
  export function Sound(sound: string, volume: number, queue: boolean, loop: boolean): void

  /**
   * Deprecated (use llPreloadSound instead). Preloads the specified sound on viewers within range.
   * @deprecated Use 'll.PreloadSound' instead.
   */
  export function SoundPreload(sound: string): void

  /**
   * Returns the square root of val. If negative, return NaN.
   * @deprecated Use 'math.sqrt' instead. Double precision; fastcall.
   */
  export function Sqrt(val: number): number

  /** Starts the animation anim (inventory or built-in) on the avatar who granted the script the PERMISSION_TRIGGER_ANIMATION permission (automatically granted for attached or sat-on objects). */
  export function StartAnimation(anim: string): void

  /** Starts the specified animation anim (inventory or built-in) on the rigged mesh object associated with the current script. */
  export function StartObjectAnimation(anim: string): void

  /** Stops the specified animation anim (inventory, built-in, or UUID) on the avatar who granted the script the PERMISSION_TRIGGER_ANIMATION permission (automatically granted for attached or sat-on objects). */
  export function StopAnimation(anim: string): void

  /** Stops the hover behavior (such as that initiated by llSetHoverHeight). */
  export function StopHover(): void

  /** Stops causing the object to look at or point toward a target (canceling llLookAt or llRotLookAt). */
  export function StopLookAt(): void

  /** Stops the critically damped movement of the object toward a target (canceling llMoveToTarget). Use llStopLookAt to stop rotational tracking. */
  export function StopMoveToTarget(): void

  /** Stops the specified animation anim (inventory, built-in, or UUID) on the rigged mesh object associated with the current script. */
  export function StopObjectAnimation(anim: string): void

  /**
   * Stops the avatar who owns the object from pointing.
   * @deprecated
   */
  export function StopPointAt(): void

  /** Stops playback of the currently playing attached sound. */
  export function StopSound(): void

  /**
   * Returns the number of unicode codepoints in the string.
   * @deprecated Use 'utf8.len' or '#' or 'string.len' instead.
   */
  export function StringLength(str: string): number

  /**
   * Returns the Base64 representation string of str, interpreting it as a UTF-8 byte sequence.
   * @deprecated Use 'llbase64.encode' instead.
   */
  export function StringToBase64(str: string): string

  /** Returns a copy of the string src with leading, trailing, or both types of whitespace (including spaces, tabs, and line feeds) eliminated, according to the specified trim type. */
  export function StringTrim(src: string, type: number): string

  /**
   * Returns the codepoint index of the first occurrence of pattern inside the string source. Returns -1 if not found. No regex.
   * @indexReturn
   */
  export function SubStringIndex(source: string, pattern: string): number | undefined

  /**
   * Deprecated (use llSetCameraParams instead). Formerly used to take control of the agent's camera.
   * @deprecated Use 'll.SetCameraParams' instead.
   */
  export function TakeCamera(avatar: UUID): void

  /** Intercepts inputs (keyboard/mouse clicks) from the agent, specifically those specified by controls. The boolean accept determines if events are generated, and pass_on determines if inputs also perform their default functions. Requires the PERMISSION_TAKE_CONTROLS runtime permission. */
  export function TakeControls(controls: number, accept: boolean, passOn: boolean): void

  /**
   * Returns the tangent of theta. Theta is in radians.
   * @deprecated Use 'math.tan' instead. Double precision; fastcall.
   */
  export function Tan(theta: number): number

  /** Registers a positional target at position with a leeway radius range. This triggers at_target and not_at_target events. Returns an integer handle to unregister the target via llTargetRemove. */
  export function Target(position: Vector, range: number): number

  /** Applies a smooth client-side rotation around the local axis at a rate equal to spinrate multiplied by the magnitude of axis (in radians per second) with a force defined by gain. Set spinrate to 0.0 to cancel. */
  export function TargetOmega(axis: Vector, spinrate: number, gain: number): void

  /** Removes the positional target specified by the integer handle registered with llTarget. */
  export function TargetRemove(handle: number): void

  /** Sends an email to with the given subject subject and body msg to the target (which can designate the owner or creator of the object). The email will be sent from `{ll.GetKey()}@lsl.secondlife.com`. */
  export function TargetedEmail(target: number, subject: string, msg: string): void

  /** Teleports the owning agent (who must grant PERMISSION_TELEPORT) to a landmark in the object's inventory. If landmark is empty, teleports them to position within the current region. Upon arrival, the agent is turned to face look_at. Can only teleport the owner. */
  export function TeleportAgent(
    agent: UUID,
    landmark: string,
    position: Vector,
    lookAt: Vector,
  ): void

  /** Teleports the owning agent (who must grant PERMISSION_TELEPORT) to region_coordinates within a target region specified by global_coordinates. Upon landing, the agent faces the direction look_at. Can only teleport the owner. */
  export function TeleportAgentGlobalCoords(
    agent: UUID,
    globalCoordinates: Vector,
    regionCoordinates: Vector,
    lookAt: Vector,
  ): void

  /** Teleports the avatar (who must be standing on land owned by the script owner) directly to their designated home location without warning (similar to a God Summons). */
  export function TeleportAgentHome(avatar: UUID): void

  /** Opens an input text box dialog displaying msg to the agent. Submitting text chats the input string on channel as if said by the agent. The chat originates at the object's position, but uses the agent's name and UUID, so it can be heard as long as the agent is still in the region. */
  export function TextBox(agent: UUID, msg: string, channel: number): void

  /** Returns a lowercase copy of the string src. Converts all unicode characters, not just ASCII. */
  export function ToLower(src: string): string

  /** Returns an uppercase copy of the string src. Converts all unicode characters, not just ASCII. */
  export function ToUpper(src: string): string

  /** Transfers amount of L$ from the script owner to the destination avatar, requiring the PERMISSION_DEBIT permission. Returns a key query handle matching the resulting transaction_result event. */
  export function TransferLindenDollars(destination: UUID, amount: number): UUID

  /** Transfers ownership of the object (or a copy of it, depending on Flags) to the specified agent. Returns an integer indicating the success or failure of the transfer. */
  export function TransferOwnership(agent: UUID, flags: number, options: list): number

  /** Plays specified sound once at volume, centered at the object's current position but not attached (does not move with the object and cannot be stopped or adjusted). Does not affect attached sounds. */
  export function TriggerSound(sound: string, volume: number): void

  /** Plays the specified sound once at volume, centered at the object but not attached, restricted to the axis-aligned bounding box defined by the coordinates top_north_east and bottom_south_west. */
  export function TriggerSoundLimited(
    sound: string,
    volume: number,
    topNorthEast: Vector,
    bottomSouthWest: Vector,
  ): void

  /** Forces the agent specified by id to stand up if they are sitting on the object containing the script, or are currently over land owned by the object's owner. */
  export function UnSit(id: UUID): void

  /** Returns a string representing the unescaped/decoded version of url, replacing '%20' with spaces and decoding raw UTF-8 characters. */
  export function UnescapeURL(url: string): string

  /**
   * Updates settings for a pathfinding character using the parameters specified in options.
   */
  export function UpdateCharacter<const T extends readonly unknown[]>(
    options: T & ParseCharacterParams<T>,
  ): void

  /** Starts an asynchronous transaction to update the key k to value v inside the experience datastore. If checked is TRUE, the update fails with XP_ERROR_RETRY_UPDATE unless the existing value matches original_value. */
  export function UpdateKeyValue(
    k: string,
    v: string,
    checked: boolean,
    originalValue: string,
  ): UUID

  /**
   * Returns a float representing the undirected, non-negative distance between vectors vec_a and vec_b.
   * @deprecated Use 'vector.magnitude' instead. It's a fastcall.
   */
  export function VecDist(vecA: Vector, vecB: Vector): number

  /**
   * Returns the magnitude (geometric length) of vec.
   * @deprecated Use 'vector.magnitude' instead. It's a fastcall.
   */
  export function VecMag(vec: Vector): number

  /**
   * Returns the normalized unit vector pointing the same direction as vec. If <0, 0, 0>, return <0, 0, 0>.
   * @deprecated Use 'vector.normalize' instead. It's a fastcall.
   */
  export function VecNorm(vec: Vector): Vector

  /** Returns TRUE if the Base64-formatted signature is verified as valid for the message msg when using the digest algorithm and public_key. Returns FALSE otherwise. */
  export function VerifyRSA(
    publicKey: string,
    msg: string,
    signature: string,
    algorithm: string,
  ): boolean

  /** If detect is TRUE, enables VolumeDetect (object becomes phantom and physical objects/avatars can pass through it). Triggers collision_start on initial intersection and collision_end when intersection stops (standard collision events are suppressed while intersecting). */
  export function VolumeDetect(detect: boolean): void

  /** Directs a pathfinding character to wander around a central coordinate origin, restricted within the bounding distance limits of dist and configured by options. */
  export function WanderWithin(origin: Vector, dist: Vector, options: list): void

  /** Returns a float representing the water height directly below the prim's position offset by the vector offset. */
  export function Water(offset: Vector): number

  /** Broadcasts the message msg to all scripts or agents listening on channel within llGetEnv("whisper_range"), which is 10m on most regions. Agents listen on PUBLIC_CHANNEL (0) and DEBUG_CHANNEL (2147483647). All other channels are for script-to-script communication. */
  export function Whisper(channel: number, msg: string): void

  /** Returns a vector representing the wind velocity at the prim's position offset by the vector offset. */
  export function Wind(offset: Vector): Vector

  /** Returns the local position vector that places the center of the HUD object directly over the world coordinate world_pos as viewed by the current camera. Requires the PERMISSION_TRACK_CAMERA runtime permission. */
  export function WorldPosToHUD(worldPos: Vector): Vector

  /** Correctly performs a bitwise exclusive OR (XOR) on Base64 strings str1 and str2, returning the result as a Base64 string. The string str2 repeats if it is shorter than str1. */
  export function XorBase64(str1: string, str2: string): string

  /**
   * Deprecated (use llXorBase64 instead). Retained for backwards compatibility. Incorrectly performs a bitwise exclusive OR (XOR) on Base64 strings str1 and str2.
   * @deprecated Use 'll.XorBase64' instead.
   */
  export function XorBase64Strings(str1: string, str2: string): string

  /**
   * Deprecated (use llXorBase64 instead). Correctly performs (unless nulls are present) a bitwise exclusive OR (XOR) on Base64 strings str1 and str2.
   * @deprecated Use 'll.XorBase64' instead.
   */
  export function XorBase64StringsCorrect(str1: string, str2: string): string

  /** Returns a linear RGB colorspace vector converted from the sRGB colorspace argument. */
  export function sRGB2Linear(color: Vector): Vector
}

/** Objects running a script or physically moving (using server resources). In llDetectedType(), it identifies physical objects and agents. In llSensor() or llSensorRepeat(), it searches for moving physical objects or scripted objects. */
declare const ACTIVE: 2
/** Agents (avatars). In llDetectedType, it indicates an avatar. In llSensor or llSensorRepeat, it searches for avatars by legacy name (functionally identical to AGENT_BY_LEGACY_NAME, though using AGENT_BY_LEGACY_NAME is recommended instead). */
declare const AGENT: 1
/** Used with llGetAgentInfo to determine if the queried avatar has 'Always Run' enabled or is using tap-tap-hold. */
declare const AGENT_ALWAYS_RUN: 4096
/** Used with llGetAgentInfo to determine if the queried avatar has attachments. */
declare const AGENT_ATTACHMENTS: 2
/** Used with llGetAgentInfo to identify if the avatar is registered with Linden Lab as an automated/scripted agent (bot). */
declare const AGENT_AUTOMATED: 16384
/** Used with llGetAgentInfo to determine if the avatar is in autopilot mode, which is enabled when the user selects 'Go Here' on the ground or uses double-click autopilot. */
declare const AGENT_AUTOPILOT: 8192
/** Used with llGetAgentInfo to determine if the avatar is in 'away' mode, which indicates they toggled away or have been inactive for too long. */
declare const AGENT_AWAY: 64
/** Used with llGetAgentInfo to determine if the avatar is in 'busy' mode. */
declare const AGENT_BUSY: 2048
/** Used to find agents by legacy name. In llDetectedType, it indicates an avatar. In llSensor or llSensorRepeat, it searches for avatars by legacy name. */
declare const AGENT_BY_LEGACY_NAME: 1
/** Used to find agents by username (see Avatar Names). */
declare const AGENT_BY_USERNAME: 16
/** Used with llGetAgentInfo to determine if the avatar is crouching. */
declare const AGENT_CROUCHING: 1024
/** Used with llGetAgentInfo to determine if the avatar is floating or hovering because of a scripted attachment using either llSetHoverHeight or llGroundRepel. */
declare const AGENT_FLOATING_VIA_SCRIPTED_ATTACHMENT: 32768
/** Used with llGetAgentInfo to determine if the queried avatar is flying or hovering. */
declare const AGENT_FLYING: 1
/** Used with llGetAgentInfo to determine if the avatar is in the air (jumping, flying, or falling). */
declare const AGENT_IN_AIR: 256
/** Agents on the same parcel where the script is running. */
declare const AGENT_LIST_PARCEL: 1
/** Agents on any parcel in the region where the parcel owner is the same as the owner of the parcel under the scripted object. */
declare const AGENT_LIST_PARCEL_OWNER: 2
/** Returns any or all agents in the region. */
declare const AGENT_LIST_REGION: 4
/** Used with llGetAgentInfo to determine if the avatar is in mouselook. */
declare const AGENT_MOUSELOOK: 8
/** Used with llGetAgentInfo to determine if the avatar is sitting on an object and linked to it. */
declare const AGENT_ON_OBJECT: 32
/** Used with llGetAgentInfo to determine if the avatar is carrying scripted objects or has scripted attachments. */
declare const AGENT_SCRIPTED: 4
/** Used with llGetAgentInfo to determine if the avatar is sitting. */
declare const AGENT_SITTING: 16
/** Used with llGetAgentInfo to determine if the avatar is typing. */
declare const AGENT_TYPING: 512
/** Used with llGetAgentInfo to determine if the queried avatar is walking, running, or crouch walking. */
declare const AGENT_WALKING: 128
/** Selects all sides of an object in an applicable function. */
declare const ALL_SIDES: -1
/** Enables texture animation. This must be set to start the animation and cleared to stop it. */
declare const ANIM_ON: 1
/** A special constant representing all HUD attachment points when filtering for any HUD attachment. */
declare const ATTACH_ANY_HUD: -1
/** Attachment point for the avatar's geometric center or root. */
declare const ATTACH_AVATAR_CENTER: 40
/** Attachment point for the avatar's back. */
declare const ATTACH_BACK: 9
/** Attachment point for the avatar's belly, stomach, or tummy. */
declare const ATTACH_BELLY: 28
/** Attachment point for the avatar's chest or sternum. */
declare const ATTACH_CHEST: 1
/** Attachment point for the avatar's chin. */
declare const ATTACH_CHIN: 12
/** Attachment point for the avatar's jaw. */
declare const ATTACH_FACE_JAW: 47
/** Attachment point for the avatar's left ear (extended). */
declare const ATTACH_FACE_LEAR: 48
/** Attachment point for the avatar's left eye (extended). */
declare const ATTACH_FACE_LEYE: 50
/** Attachment point for the avatar's right ear (extended). */
declare const ATTACH_FACE_REAR: 49
/** Attachment point for the avatar's right eye (extended). */
declare const ATTACH_FACE_REYE: 51
/** Attachment point for the avatar's tongue. */
declare const ATTACH_FACE_TONGUE: 52
/** Attachment point for the avatar's groin. */
declare const ATTACH_GROIN: 53
/** Attachment point for the avatar's head. */
declare const ATTACH_HEAD: 2
/** Attachment point for the avatar's left hind foot. */
declare const ATTACH_HIND_LFOOT: 54
/** Attachment point for the avatar's right hind foot. */
declare const ATTACH_HIND_RFOOT: 55
/** Attachment point for HUD Bottom. */
declare const ATTACH_HUD_BOTTOM: 37
/** Attachment point for HUD Bottom Left. */
declare const ATTACH_HUD_BOTTOM_LEFT: 36
/** Attachment point for HUD Bottom Right. */
declare const ATTACH_HUD_BOTTOM_RIGHT: 38
/** Attachment point for HUD Center. */
declare const ATTACH_HUD_CENTER_1: 35
/** Attachment point for HUD Center 2. */
declare const ATTACH_HUD_CENTER_2: 31
/** Attachment point for HUD Top Center. */
declare const ATTACH_HUD_TOP_CENTER: 33
/** Attachment point for HUD Top Left. */
declare const ATTACH_HUD_TOP_LEFT: 34
/** Attachment point for HUD Top Right. */
declare const ATTACH_HUD_TOP_RIGHT: 32
/** Attachment point for the avatar's left ear. */
declare const ATTACH_LEAR: 13
/** Attachment point for the avatar's left pectoral. */
declare const ATTACH_LEFT_PEC: 29
/** Attachment point for the avatar's left eye. */
declare const ATTACH_LEYE: 15
/** Attachment point for the avatar's left foot. */
declare const ATTACH_LFOOT: 7
/** Attachment point for the avatar's left hand. */
declare const ATTACH_LHAND: 5
/** Attachment point for the avatar's left ring finger. */
declare const ATTACH_LHAND_RING1: 41
/** Attachment point for the avatar's left hip. */
declare const ATTACH_LHIP: 25
/** Attachment point for the avatar's left lower arm. */
declare const ATTACH_LLARM: 21
/** Attachment point for the avatar's left lower leg. */
declare const ATTACH_LLLEG: 27
/**
 * Attachment point for the avatar's right pectoral (deprecated, use ATTACH_RIGHT_PEC).
 * @deprecated Use 'ATTACH_RIGHT_PEC' instead.
 */
declare const ATTACH_LPEC: 30
/** Attachment point for the avatar's left shoulder. */
declare const ATTACH_LSHOULDER: 3
/** Attachment point for the avatar's left upper arm. */
declare const ATTACH_LUARM: 20
/** Attachment point for the avatar's left upper leg. */
declare const ATTACH_LULEG: 26
/** Attachment point for the avatar's left wing. */
declare const ATTACH_LWING: 45
/** Attachment point for the avatar's mouth. */
declare const ATTACH_MOUTH: 11
/** Attachment point for the avatar's neck. */
declare const ATTACH_NECK: 39
/** Attachment point for the avatar's nose. */
declare const ATTACH_NOSE: 17
/** Attachment point for the avatar's pelvis. */
declare const ATTACH_PELVIS: 10
/** Attachment point for the avatar's right ear. */
declare const ATTACH_REAR: 14
/** Attachment point for the avatar's right eye. */
declare const ATTACH_REYE: 16
/** Attachment point for the avatar's right foot. */
declare const ATTACH_RFOOT: 8
/** Attachment point for the avatar's right hand (the default attachment point). */
declare const ATTACH_RHAND: 6
/** Attachment point for the avatar's right ring finger. */
declare const ATTACH_RHAND_RING1: 42
/** Attachment point for the avatar's right hip. */
declare const ATTACH_RHIP: 22
/** Attachment point for the avatar's right pectoral. */
declare const ATTACH_RIGHT_PEC: 30
/** Attachment point for the avatar's right lower arm. */
declare const ATTACH_RLARM: 19
/** Attachment point for the avatar's right lower leg. */
declare const ATTACH_RLLEG: 24
/**
 * Attachment point for the avatar's left pectoral (deprecated, use ATTACH_LEFT_PEC).
 * @deprecated Use 'ATTACH_LEFT_PEC' instead.
 */
declare const ATTACH_RPEC: 29
/** Attachment point for the avatar's right shoulder. */
declare const ATTACH_RSHOULDER: 4
/** Attachment point for the avatar's right upper arm. */
declare const ATTACH_RUARM: 18
/** Attachment point for the avatar's right upper leg. */
declare const ATTACH_RULEG: 23
/** Attachment point for the avatar's right wing. */
declare const ATTACH_RWING: 46
/** Attachment point for the avatar's tail base. */
declare const ATTACH_TAIL_BASE: 43
/** Attachment point for the avatar's tail tip. */
declare const ATTACH_TAIL_TIP: 44
declare const AVOID_CHARACTERS: 1
declare const AVOID_DYNAMIC_OBSTACLES: 2
declare const AVOID_NONE: 0
/** Causes llMapBeacon to optionally display and focus the world map on the avatar's viewer. */
declare const BEACON_MAP: 1
/** Turns on or off scripted control of the camera. */
declare const CAMERA_ACTIVE: 12
/** Sets the angle in degrees within which the camera is not constrained by changes in target rotation. */
declare const CAMERA_BEHINDNESS_ANGLE: 8
/** Sets how strongly the camera is forced to stay behind the target if outside of behindness angle. */
declare const CAMERA_BEHINDNESS_LAG: 9
/** Sets how far away the camera wants to be from its target. */
declare const CAMERA_DISTANCE: 7
/** Sets camera focus (target position) in region coordinates. */
declare const CAMERA_FOCUS: 17
/** How much the camera lags as it tries to aim towards the target. */
declare const CAMERA_FOCUS_LAG: 6
/** Locks the camera focus so it will not move. */
declare const CAMERA_FOCUS_LOCKED: 22
/** Adjusts the camera focus position relative to the target. */
declare const CAMERA_FOCUS_OFFSET: 1
/** Sets the radius of a sphere around the camera's target position within which its focus is not affected by target motion. */
declare const CAMERA_FOCUS_THRESHOLD: 11
/** Adjusts the angular amount that the camera aims straight ahead vs. straight down, maintaining the same distance; analogous to 'incidence'." */
declare const CAMERA_PITCH: 0
/** Sets camera position in region coordinates. */
declare const CAMERA_POSITION: 13
/** How much the camera lags as it tries to move towards its 'ideal' position. */
declare const CAMERA_POSITION_LAG: 5
/** Locks the camera position so it will not move. */
declare const CAMERA_POSITION_LOCKED: 21
/** Sets the radius of a sphere around the camera's ideal position within which it is not affected by target motion. */
declare const CAMERA_POSITION_THRESHOLD: 10
/** Object inventory changed because a user other than the owner (or the owner if the object is no-mod) added an item. This is only possible if enabled via llAllowInventoryDrop. */
declare const CHANGED_ALLOWED_DROP: 64
/** Object's Blinn-Phong color or alpha parameters have changed. */
declare const CHANGED_COLOR: 2
/** Prim inventory has changed by someone who has modification rights to it. */
declare const CHANGED_INVENTORY: 1
/** Number of prims making up the object or avatars seated on it has changed. Also occurs when duplicating a linked object or when a prim changes type or shape. Does not trigger on attach/detach, sit/unsit in attachments, or single prim duplication. */
declare const CHANGED_LINK: 32
/** Prim Media on the prim has changed. */
declare const CHANGED_MEDIA: 2048
/** Object has changed owners. Triggers in the original object when a user takes it, copies it, or deeds it to a group, and in the new object when it is first rezzed. */
declare const CHANGED_OWNER: 128
/** Object has changed regions by crossing a boundary or teleporting (if attached). Triggers only in the root prim of a linkset. */
declare const CHANGED_REGION: 256
/** Region containing this object has just come online. */
declare const CHANGED_REGION_START: 1024
/** Render material (prim material ID or material overrides) has changed on one or more faces. */
declare const CHANGED_RENDER_MATERIAL: 4096
/** Prim scale of at least one prim in the linked object has changed. Only the root prim receives this event. */
declare const CHANGED_SCALE: 8
/** Prim base shape (PRIM_TYPE, such as box, prism, torus, taper, twist, or cut) has changed. */
declare const CHANGED_SHAPE: 4
/** Avatar this object is attached to has teleported. Triggers only in the root prim of an attachment. Does not occur for child prims or 'sit teleports'. If scripts are disabled at the destination, the event queues and triggers after moving to a script-enabled parcel. */
declare const CHANGED_TELEPORT: 512
/** Prim texture parameters (shine/bump settings, repeats, flip, rotation, offset, or texture) have changed. */
declare const CHANGED_TEXTURE: 16
/** TRUE matches pre-existing behavior. If set to FALSE, character will not attempt to catch up on lost time when pathfinding performance is low, potentially providing more reliable movement (albeit while potentially appearing to be more stuttery). */
declare const CHARACTER_ACCOUNT_FOR_SKIPPED_FRAMES: 14
/** Allows you to specify that a character should not try to avoid other characters, should not try to avoid dynamic obstacles (relatively fast moving objects and avatars), or both. This is framed in the positive sense ([CHARACTER_AVOIDANCE_MODE, AVOID_CHARACTERS] would create a character that avoided other characters but not agents or moving vehicles). Setting this parameter to AVOID_NONE causes the character to not avoid either category. */
declare const CHARACTER_AVOIDANCE_MODE: 5
/** Makes the character jump. Requires a height parameter between 0.1m and 2.0m as the first element of the llExecCharacterCmd option list. */
declare const CHARACTER_CMD_JUMP: 1
/** Stops any current pathfinding operation in a smooth fashion. */
declare const CHARACTER_CMD_SMOOTH_STOP: 2
/** Stops any current pathfinding operation. */
declare const CHARACTER_CMD_STOP: 0
/** Speed of pursuit in meters per second. */
declare const CHARACTER_DESIRED_SPEED: 1
/** The character's maximum speed while turning--note that this is only loosely enforced (i.e., a character may turn at higher speeds under certain conditions) */
declare const CHARACTER_DESIRED_TURN_SPEED: 12
/** Set collision capsule length If the value is less than twice the radius plus 0.1m, it will be set to twice the radius plus 0.1m. */
declare const CHARACTER_LENGTH: 3
/** The character's maximum acceleration rate. */
declare const CHARACTER_MAX_ACCEL: 8
/** The character's maximum deceleration rate. */
declare const CHARACTER_MAX_DECEL: 9
/** The character's maximum speed. Affects speed when avoiding dynamic obstacles and when traversing low-walkability objects in TRAVERSAL_TYPE_FAST mode. */
declare const CHARACTER_MAX_SPEED: 13
/** The character's turn radius when traveling at CHARACTER_DESIRED_TURN_SPEED */
declare const CHARACTER_MAX_TURN_RADIUS: 10
/** Set the character orientation. */
declare const CHARACTER_ORIENTATION: 4
/** Set collision capsule radius. */
declare const CHARACTER_RADIUS: 2
/** FALSE matches traditional behavior. If set to TRUE, treat the parcel boundaries as one-way obstacles (will re-enter but can't leave on it's own). */
declare const CHARACTER_STAY_WITHIN_PARCEL: 15
/** Specifies which walkability coefficient will be used by this character. */
declare const CHARACTER_TYPE: 6
/** Used for pathfinding character types that prefer movement consistent with humanoids. */
declare const CHARACTER_TYPE_A: 0
/** Used for pathfinding character types that prefer movement consistent with wild animals or off-road vehicles. */
declare const CHARACTER_TYPE_B: 1
/** Used for mechanical pathfinding character types or road-going vehicles. */
declare const CHARACTER_TYPE_C: 2
/** Used for pathfinding character types that are inconsistent with types A, B, or C. */
declare const CHARACTER_TYPE_D: 3
/** Used to set no specific pathfinding character type. */
declare const CHARACTER_TYPE_NONE: 4
/** Opens the buy dialog when the prim is clicked or touched. */
declare const CLICK_ACTION_BUY: 2
/** Disables click actions. No touches are detected or passed. */
declare const CLICK_ACTION_DISABLED: 8
/** Disables click actions. Clicks pass through the object to whatever is behind it, and no touches are detected. */
declare const CLICK_ACTION_IGNORE: 9
/** Performs the default action: triggers touch events when the prim is clicked or touched. */
declare const CLICK_ACTION_NONE: 0
/** Opens the object inventory dialog when the prim is clicked or touched. */
declare const CLICK_ACTION_OPEN: 4
/** Opens the web media dialog or plays parcel media (without pausing) when the prim is touched. */
declare const CLICK_ACTION_OPEN_MEDIA: 6
/** Opens the pay dialog when the prim is clicked or touched. */
declare const CLICK_ACTION_PAY: 3
/** Enables HTML-on-a-prim or plays/pauses parcel media when the prim is clicked or touched. */
declare const CLICK_ACTION_PLAY: 5
/** Causes the avatar to sit on the prim when it is clicked or touched. */
declare const CLICK_ACTION_SIT: 1
/** Triggers touch events when the prim is clicked or touched. */
declare const CLICK_ACTION_TOUCH: 0
/** Zooms the avatar camera in on the object (Viewer 2) when clicked or touched. */
declare const CLICK_ACTION_ZOOM: 7
/** A region-wide channel reserved for combat-related log events. Passing this to llRegionSay adds the message to the combat log, and scripts listening on this channel can monitor the combat log. */
declare const COMBAT_CHANNEL: 2147483646
/** ID used by all combat log messages sent from the region to the COMBAT_CHANNEL. Scripts can filter llListen calls with this ID to receive only system-generated combat log messages. */
declare const COMBAT_LOG_ID: UUID
/** Sets the 'Content-Type' header of subsequent LSL HTTP server responses via llHTTPResponse to 'application/atom+xml'. */
declare const CONTENT_TYPE_ATOM: 4
/** Sets the 'Content-Type' header of subsequent LSL HTTP server responses via llHTTPResponse to 'application/x-www-form-urlencoded'. */
declare const CONTENT_TYPE_FORM: 7
/** Sets the 'Content-Type' header of subsequent LSL HTTP server responses via llHTTPResponse to 'text/html'. Only valid for embedded browsers on content owned by the viewer; falls back to 'text/plain' otherwise. */
declare const CONTENT_TYPE_HTML: 1
/** Sets the 'Content-Type' header of subsequent LSL HTTP server responses via llHTTPResponse to 'application/json'. */
declare const CONTENT_TYPE_JSON: 5
/** Sets the 'Content-Type' header of subsequent LSL HTTP server responses via llHTTPResponse to 'application/llsd+xml' (Linden Lab Structured Data). */
declare const CONTENT_TYPE_LLSD: 6
/** Sets the 'Content-Type' header of subsequent LSL HTTP server responses via llHTTPResponse to 'application/rss+xml'. */
declare const CONTENT_TYPE_RSS: 8
/** Sets the 'Content-Type' header of subsequent LSL HTTP server responses via llHTTPResponse to 'text/plain'. */
declare const CONTENT_TYPE_TEXT: 0
/** Sets the 'Content-Type' header of subsequent LSL HTTP server responses via llHTTPResponse to 'application/xhtml+xml'. */
declare const CONTENT_TYPE_XHTML: 3
/** Sets the 'Content-Type' header of subsequent LSL HTTP server responses via llHTTPResponse to 'application/xml'. */
declare const CONTENT_TYPE_XML: 2
/** Tests for the avatar move back control (↓ or S). */
declare const CONTROL_BACK: 2
/** Tests for the avatar move down control (PgDn or C). */
declare const CONTROL_DOWN: 32
/** Tests for the avatar move forward control (↑ or W). */
declare const CONTROL_FWD: 1
/** Tests for the avatar left mouse button control. */
declare const CONTROL_LBUTTON: 268435456
/** Tests for the avatar move left control (Shift + ← or Shift + A). */
declare const CONTROL_LEFT: 4
/** Tests for the avatar left mouse button control while in mouselook. */
declare const CONTROL_ML_LBUTTON: 1073741824
/** Tests for the avatar move right control (Shift + → or Shift + D). */
declare const CONTROL_RIGHT: 8
/** Tests for the avatar rotate left control (← or A). */
declare const CONTROL_ROT_LEFT: 256
/** Tests for the avatar rotate right control (→ or D). */
declare const CONTROL_ROT_RIGHT: 512
/** Tests for the avatar move up control (PgUp or E). */
declare const CONTROL_UP: 16
/** Identifies objects in the world that can process damage. In llDetectedType, it indicates a damageable agent, or an object containing a script with on_damage or final_damage events. Can also filter llSensor/llSensorRepeat calls. */
declare const DAMAGEABLE: 32
/** Damage caused by a caustic substance, such as acid. */
declare const DAMAGE_TYPE_ACID: 1
/** Damage caused by a blunt object, such as a club. */
declare const DAMAGE_TYPE_BLUDGEONING: 2
/** Damage inflicted by exposure to extreme cold. */
declare const DAMAGE_TYPE_COLD: 3
/** Damage caused by electricity. */
declare const DAMAGE_TYPE_ELECTRIC: 4
declare const DAMAGE_TYPE_EMOTIONAL: 14
/** Damage inflicted by exposure to heat or flames. */
declare const DAMAGE_TYPE_FIRE: 5
/** Damage inflicted by a great force or impact (Vertical Sim / SLMC). */
declare const DAMAGE_TYPE_FORCE: 6
/** Generic or legacy damage. */
declare const DAMAGE_TYPE_GENERIC: 0
/** System damage generated by impact with land, terrain, or a prim. */
declare const DAMAGE_TYPE_IMPACT: -1
/** Damage caused by a direct assault on the life-force. */
declare const DAMAGE_TYPE_NECROTIC: 7
/** Damage caused by a piercing object such as a bullet, spear, or arrow (Vertical Sim / SLMC). */
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
/** Used with llRequestAgentData to return the agent's account creation ('born on') date as a string in ISO 8601 format (YYYY-MM-DD), based on Pacific Time (not UTC). */
declare const DATA_BORN: 3
/** Used with llRequestAgentData to return the requested agent's legacy name. */
declare const DATA_NAME: 2
/** Used with llRequestAgentData to return whether the requested agent is online (returns an integer boolean string: TRUE if online, FALSE if offline). */
declare const DATA_ONLINE: 1
/** Used with llRequestAgentData to return a string containing the integer mask flag for payment status (contains PAYMENT_INFO_ON_FILE, PAYMENT_INFO_USED, or both). */
declare const DATA_PAYINFO: 8
/** Deprecated. Used with llRequestAgentData to return the string '0, 0, 0, 0, 0, 0'. It formerly returned a comma-separated list of positive and negative ratings (behavior, appearance, and building) before ratings were removed from SL. */
declare const DATA_RATING: 4
/** Reserved for Linden use. */
declare const DATA_RESERVED_0: 9
/** Used with llRequestSimulatorData to return the region's global position as a vector. */
declare const DATA_SIM_POS: 5
/** Used with llRequestSimulatorData to return the simulator rating string ('PG', 'MATURE', 'ADULT', or 'UNKNOWN'). */
declare const DATA_SIM_RATING: 7
/** Used with llRequestSimulatorData to return the simulator status as a string. */
declare const DATA_SIM_STATUS: 6
/** A chat channel reserved for script debugging and error messages. Passing this to llSay, llWhisper, or llShout prints text to the Script Warning/Error Window and broadcasts it to nearby avatars' script consoles. */
declare const DEBUG_CHANNEL: 2147483647
/** Constant 0.017453293 (precise value is PI/180). Multiply a value in degrees by this number to convert it to radians. */
declare const DEG_TO_RAD: number
/** Used with llSetPhysicsMaterial to indicate that the density parameter is enabled (which overrides the previous value). Must be between 1.0 and 22587.0 kg/m³. */
declare const DENSITY: 1
/** Used with llDerezObject to immediately delete (kill) the object. */
declare const DEREZ_DIE: 0
/** Used with llDerezObject to mark the object as temporary, allowing the simulator to clean it up at a later time. */
declare const DEREZ_MAKE_TEMP: 1
/** Used with llDerezObject to return the targeted object to the rezzer's (derezzer's) inventory, saving its current state. */
declare const DEREZ_TO_INVENTORY: 2
/** Current time and day information day_length: Number of seconds in the environments day cycle. day_offset: Number of seconds day cycle is offset from GMT. secs_since_midnight: Number of seconds elapsed since the last day cycle midnight. */
declare const ENVIRONMENT_DAYINFO: 200
/** Unable to find the specified agent, or could not find an agent with the specified ID. */
declare const ENV_INVALID_AGENT: -4
/** There was an issue with one of the rules, or an attempt was made to change an unknown property. */
declare const ENV_INVALID_RULE: -5
/** Attempted to change environments outside an experience, or the script is not running as part of an experience with a valid experience key. */
declare const ENV_NOT_EXPERIENCE: -1
/** Environmental settings inventory object could not be found, or there is no environment on this parcel to modify. */
declare const ENV_NO_ENVIRONMENT: -3
/** Experience has not been enabled or cannot run on the land. */
declare const ENV_NO_EXPERIENCE_LAND: -7
/** Agent has not granted permission to change environments. */
declare const ENV_NO_EXPERIENCE_PERMISSION: -2
/** Script lacks permissions to modify the environment at this location, or an attempt was made to remove altitude track 0 or 1. */
declare const ENV_NO_PERMISSIONS: -9
/** Agent, parcel, or region will attempt to change the applied environment. */
declare const ENV_OK: 1
/** Scripts have exceeded the throttle limit. Wait and retry the request. */
declare const ENV_THROTTLE: -8
/** Could not validate the environmental settings or values passed. */
declare const ENV_VALIDATION_FAIL: -6
/**
 * A value equal to three newline characters ("
 *
 *
 * ") returned by the dataserver event, indicating that the requested line is past the end of the notecard.
 */
declare const EOF: string
/** An inexplicable and generic error where nothing is known about the cause. */
declare const ERR_GENERIC: -1
/** Return value for llReturnObject* functions indicating that the parameters passed are malformed. */
declare const ERR_MALFORMED_PARAMS: -3
/** Return value for llReturnObject* functions indicating a lack of permissions to perform the task on the specified parcel. */
declare const ERR_PARCEL_PERMISSIONS: -2
/** Return value for llReturnObject* functions indicating the script lacks the runtime permissions required to perform the requested task. */
declare const ERR_RUNTIME_PERMISSIONS: -4
/** Return value for llReturnObject* functions indicating that the task has been throttled and should be retried later. */
declare const ERR_THROTTLED: -5
/** Used as an input parameter for llManageEstateAccess to add an agent to the estate's Allowed Residents list. */
declare const ESTATE_ACCESS_ALLOWED_AGENT_ADD: 4
/** Used as an input parameter for llManageEstateAccess to remove an agent from the estate's Allowed Residents list. */
declare const ESTATE_ACCESS_ALLOWED_AGENT_REMOVE: 8
/** Used as an input parameter for llManageEstateAccess to add a group to the estate's Allowed Groups list. */
declare const ESTATE_ACCESS_ALLOWED_GROUP_ADD: 16
/** Used as an input parameter for llManageEstateAccess to remove a group from the estate's Allowed Groups list. */
declare const ESTATE_ACCESS_ALLOWED_GROUP_REMOVE: 32
/** Used as an input parameter for llManageEstateAccess to add an agent to the estate's Banned Residents list. */
declare const ESTATE_ACCESS_BANNED_AGENT_ADD: 64
/** Used as an input parameter for llManageEstateAccess to remove an agent from the estate's Banned Residents list. */
declare const ESTATE_ACCESS_BANNED_AGENT_REMOVE: 128
/** Flags used to control which attachments are returned. */
declare const FILTER_FLAGS: 2
/** Filter flag used with llGetAttachedListFiltered to include HUDs with matching experiences in the returned result. */
declare const FILTER_FLAG_HUDS: 1
/** Filter parameter used to include a specific attachment point. */
declare const FILTER_INCLUDE: 1
/** Forces the pathfinding character to navigate in a straight line toward the specified position (can be set to TRUE or FALSE). */
declare const FORCE_DIRECT_PATH: 1
/** Used with llSetPhysicsMaterial to enable the friction override. The value must be between 0.0 and 255.0. */
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
/** Used with llGetClosestNavPoint to limit how far out to search for a navigation point. */
declare const GCNP_RADIUS: 0
/** Used with llGetClosestNavPoint to specify that the test should use the static navmesh, ignoring all dynamic obstacles. */
declare const GCNP_STATIC: 1
/** Used with llSetPhysicsMaterial to enable the gravity multiplier override. The value must be between -1.0 and +28.0. */
declare const GRAVITY_MULTIPLIER: 8
/** Constant indicating that the collision capsule orientation for a pathfinding character is horizontal. */
declare const HORIZONTAL: 1
/** HTTP_ACCEPT parameters can be passed to limit the number of mime types that are sent in the Accept: header of the HTTP request. Specified mime types may include character set and q parameters. This parameter may be specified multiple times. The specified mime type must be one already recognized by llHTTPRequest. These include any text/ mime type, or the following application mime types: “application/xhtml+xml”, “application/atom+xml”, “application/json”, “application/xml”, “application/llsd+xml”, “application/x-javascript”, “application/javascript”, “application/x-www-form-urlencoded”, or “application/rss+xml”. The Content-Type header in the response is checked against the specified HTTP_ACCEPT parameters. If the value of the header is not in the list of acceptable mime types, llHTTPRequest will return 415 as a result code and the body will be "Unsupported or unknown Content-Type." */
declare const HTTP_ACCEPT: 8
/** Sets the maximum (UTF-8 encoded) byte length of the HTTP response body. The maximum that can be set depends upon which VM is used. Mono Max: 16384 LSO Max: 4096 ⚠️ Warning: Applies to the Outgoing pipeline only (HTTP calls invoked by llHTTPRequest,and responses from http_response). Tip: When you only need to request a small amount of data from a remote source, consider using the Content-Range header instead. */
declare const HTTP_BODY_MAXLENGTH: 2
/** Indicates the response body truncation point in bytes. */
declare const HTTP_BODY_TRUNCATED: 0
/** Add an extra custom HTTP header to the request. The first string is the name of the parameter to change, e.g. "Pragma", and the second string is the value, e.g. "no-cache". Multiple custom headers may be configured per request, as long as the combined custom header length is no greater than 4096 characters. Note that certain headers, such as the default headers, are blocked for security reasons. */
declare const HTTP_CUSTOM_HEADER: 5
/** If TRUE llHTTPRequest will always return a key. If there was an error making the HTTP request. Detailed error information will be returned through the http_response event using the provided key. Error information is delivered in a JSON block as described in RFC 7807. Details about extended return codes can be found below. */
declare const HTTP_EXTENDED_ERROR: 9
/** "GET", "POST", "PUT" and "DELETE" */
declare const HTTP_METHOD: 0
/** text/* MIME types should specify a charset. To emulate HTML forms use application/x-www-form-urlencoded. This allows you to set the body to a properly escaped (llEscapeURL) sequence of <name,value> pairs in the form var=value&var2=value2 and have them automatically parsed by web frameworks. MIME types must be specified in the format: type/subtype[;option=value] Some valid examples are "text/html" "text/plain;charset=utf-8" "application/xhtml+xml" "application/json" "application/x-www-form-urlencoded" "application/rss+xml" "multipart/mixed; boundary="---1234567890---"" */
declare const HTTP_MIMETYPE: 1
/** Sends "Pragma: no-cache" header (TRUE), or does not send a "Pragma" header (FALSE). */
declare const HTTP_PRAGMA_NO_CACHE: 6
/** The user agent value is appended to the one generated by LSL itself. It should follow the syntax from the HTTP standard like: "My-Script-Name/1.0 (Mozilla compatible)". Note: Spaces are not allowed in HTTP User Agent token values, so "My Script Name/1.0" will produce a script error; change the spaces to hyphens ("-") */
declare const HTTP_USER_AGENT: 7
/** If TRUE, shout error messages to DEBUG_CHANNEL if the outgoing request rate exceeds the server limit. If FALSE, the error messages are suppressed (llHTTPRequest will still return NULL_KEY). */
declare const HTTP_VERBOSE_THROTTLE: 4
/** If TRUE, the server SSL certificate must be verifiable using one of the standard certificate authorities[1] when making HTTPS requests. If FALSE, any server SSL certificate will be accepted. */
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
/** Used with inventory functions to specify that all types of inventory items should be retrieved. */
declare const INVENTORY_ALL: -1
/** Used with inventory functions to filter or retrieve items of the ANIMATION type. */
declare const INVENTORY_ANIMATION: 20
/** Used with inventory functions to filter or retrieve items of the BODYPART type. */
declare const INVENTORY_BODYPART: 13
/** Used with inventory functions to filter or retrieve items of the CLOTHING type. */
declare const INVENTORY_CLOTHING: 5
/** Used with inventory functions to filter or retrieve items of the GESTURE type. */
declare const INVENTORY_GESTURE: 21
/** Used with inventory functions to filter or retrieve items of the LANDMARK type. */
declare const INVENTORY_LANDMARK: 3
/** Used with inventory functions to filter or retrieve items of the MATERIAL type. */
declare const INVENTORY_MATERIAL: 57
/** Value returned by inventory functions indicating that the specified inventory item does not exist. */
declare const INVENTORY_NONE: -1
/** Used with inventory functions to filter or retrieve items of the NOTECARD type. */
declare const INVENTORY_NOTECARD: 7
/** Used with inventory functions to filter or retrieve items of the OBJECT type. */
declare const INVENTORY_OBJECT: 6
/** Used with inventory functions to filter or retrieve items of the SCRIPT type. */
declare const INVENTORY_SCRIPT: 10
/** Used with inventory functions to filter or retrieve items of the SETTING type. */
declare const INVENTORY_SETTING: 56
/** Used with inventory functions to filter or retrieve items of the SOUND type. */
declare const INVENTORY_SOUND: 1
/** Used with inventory functions to filter or retrieve items of the TEXTURE type. */
declare const INVENTORY_TEXTURE: 0
/**
 * A specifier for llJsonSetValue indicating the given value should be appended to the array at the specified level. If the target value is not an array, the existing data will be overwritten and replaced by the new array.
 * @deprecated Use 'lljson.decode' and 'table.insert' instead.
 */
declare const JSON_APPEND: -1
/**
 * Used with llList2Json to indicate that the provided list should be encoded and returned as a string-serialized JSON array.
 * @deprecated Use 'lljson.array_mt' instead.
 */
declare const JSON_ARRAY: string
/**
 * A constant used to delete a value within a JSON text string.
 * @deprecated Use 'nil' instead.
 */
declare const JSON_DELETE: string
/**
 * Return value for llJsonValueType indicating that the value at the specified address in a JSON string is a boolean FALSE.
 * @deprecated Use 'false' instead.
 */
declare const JSON_FALSE: string
/**
 * Indicates an invalid state or parameter. Returned by llList2Json when inputs are not well-formed, by llJsonValueType for an invalid JSON type, or by llJsonGetValue when attempting to access a nonexistent location.
 * @deprecated Use 'pcall' instead.
 */
declare const JSON_INVALID: string
/**
 * Return value for llJsonValueType indicating that the value at the specified address in a JSON string is a JSON null.
 * @deprecated Use 'lljson.null' instead.
 */
declare const JSON_NULL: string
/**
 * Return value for llJsonValueType indicating that the value at the specified address in a JSON string is a number.
 * @deprecated Use 'typeof' instead.
 */
declare const JSON_NUMBER: string
/**
 * Used with llList2Json to indicate that the provided list is a strided list of key-value pairs to be encoded and returned as a JSON object.
 * @deprecated Use 'lljson.object_mt' instead.
 */
declare const JSON_OBJECT: string
/**
 * Return value for llJsonValueType indicating that the value at the specified address in a JSON string is a string.
 * @deprecated Use 'typeof' instead.
 */
declare const JSON_STRING: string
/**
 * Return value for llJsonValueType indicating that the value at the specified address in a JSON string is a boolean TRUE.
 * @deprecated Use 'true' instead.
 */
declare const JSON_TRUE: string
/** Command used with KFM_COMMAND in llSetKeyframedMotion to pause the keyframed motion without resetting it to the start. */
declare const KFM_CMD_PAUSE: 2
/** Command used with KFM_COMMAND in llSetKeyframedMotion to resume a motion previously stopped by KFM_CMD_STOP or paused by KFM_CMD_PAUSE. */
declare const KFM_CMD_PLAY: 0
/** Command used with KFM_COMMAND in llSetKeyframedMotion to stop the keyframed motion and reset it to the start. */
declare const KFM_CMD_STOP: 1
/** Option flag in llSetKeyframedMotion followed by KFM_CMD_STOP, KFM_CMD_PLAY, or KFM_CMD_PAUSE to play, stop, or pause the motion. */
declare const KFM_COMMAND: 0
/** Option flag in llSetKeyframedMotion followed by a bitwise combination of KFM_TRANSLATION and KFM_ROTATION to specify keyframe data. If absent, both rotation and translation data must be provided. */
declare const KFM_DATA: 2
/** Playback mode used with KFM_MODE in llSetKeyframedMotion (default). It plays the frames sequentially from 1 to N and then stops. */
declare const KFM_FORWARD: 0
/** Playback mode used with KFM_MODE in llSetKeyframedMotion. It plays the frames sequentially from 1 to N, returns to the initial position, and repeats indefinitely. */
declare const KFM_LOOP: 1
/** Option flag in llSetKeyframedMotion followed by KFM_LOOP, KFM_REVERSE, KFM_FORWARD, or KFM_PING_PONG to set the playback mode (defaults to KFM_FORWARD). Must be specified when the keyframe list is provided. */
declare const KFM_MODE: 1
/** Playback mode used with KFM_MODE in llSetKeyframedMotion. */
declare const KFM_PING_PONG: 2
/** Playback mode used with KFM_MODE in llSetKeyframedMotion. It plays the frames in reverse order (from N down to 1) and then stops. */
declare const KFM_REVERSE: 3
/** Specifies that rotation data is included in the moves list for llSetKeyframedMotion. */
declare const KFM_ROTATION: 1
/** Specifies that translation data is included in the moves list for llSetKeyframedMotion. */
declare const KFM_TRANSLATION: 2
/** Use a large brush size (8m x 8m). */
declare const LAND_BRUSH_LARGE: 2
/** Use a medium brush size (4m x 4m).. */
declare const LAND_BRUSH_MEDIUM: 1
/** Use a small brush size (2m x 2m). */
declare const LAND_BRUSH_SMALL: 0
/**
 * Legacy large brush size (8m x 8m). Note: This constant value is incorrect; use LAND_BRUSH_LARGE instead.
 * @deprecated Use 'LAND_BRUSH_LARGE' instead.
 */
declare const LAND_LARGE_BRUSH: 3
/** Action used with llModifyLand to level the land at the prim's center. */
declare const LAND_LEVEL: 0
/** Action used with llModifyLand to lower the land. */
declare const LAND_LOWER: 2
/**
 * Legacy medium brush size (4m x 4m). Note: This constant value is incorrect; use LAND_BRUSH_MEDIUM instead.
 * @deprecated Use 'LAND_BRUSH_MEDIUM' instead.
 */
declare const LAND_MEDIUM_BRUSH: 2
/** Action used with llModifyLand to randomize the terrain and make it rough. */
declare const LAND_NOISE: 4
/** Action used with llModifyLand to raise the land. */
declare const LAND_RAISE: 1
/** Action used with llModifyLand to restore the land to its baked value. */
declare const LAND_REVERT: 5
/**
 * Legacy small brush size (2m x 2m). Note: This constant value is incorrect; use LAND_BRUSH_SMALL instead.
 * @deprecated Use 'LAND_BRUSH_SMALL' instead.
 */
declare const LAND_SMALL_BRUSH: 1
/** Action used with llModifyLand to smooth the land. */
declare const LAND_SMOOTH: 3
declare const LEGACY_MASS_FACTOR: number
/** Event or flag indicating a key-value pair has been removed from the linkset datastore, either via llLinksetDataDelete or by writing an empty value. */
declare const LINKSETDATA_DELETE: 2
/** Error code indicating a key-value pair was too large to write to the linkset datastore. */
declare const LINKSETDATA_EMEMORY: 1
/** Error code indicating the key name supplied to a linkset datastore operation was empty. */
declare const LINKSETDATA_ENOKEY: 2
/** Error code indicating the key-value pair is protected from being deleted or overwritten in the linkset datastore. */
declare const LINKSETDATA_EPROTECTED: 3
/** Flag or value indicating a comma-separated list of keys has been deleted from the linkset datastore via llLinksetDataDeleteFound. */
declare const LINKSETDATA_MULTIDELETE: 3
/** Error code indicating the specified key could not be found in the linkset datastore. */
declare const LINKSETDATA_NOTFOUND: 4
/** Status code indicating that the linkset datastore was not updated because the written value matched the existing stored value. */
declare const LINKSETDATA_NOUPDATE: 5
/** Status code indicating the linkset datastore operation completed successfully. */
declare const LINKSETDATA_OK: 0
/** Event or flag indicating the linkset datastore has been cleared/reset via llLinksetDataReset. */
declare const LINKSETDATA_RESET: 0
/** Event or flag indicating a key in the linkset datastore has been created or updated with a new value via llLinksetDataWrite. */
declare const LINKSETDATA_UPDATE: 1
/** Refers to all child prims in the linkset (every prim except the root). */
declare const LINK_ALL_CHILDREN: -3
/** Refers to every other prim in the linkset, excluding the prim containing the script. */
declare const LINK_ALL_OTHERS: -2
/** Refers to the root prim of the linkset. */
declare const LINK_ROOT: 1
/** Refers to every prim in the linkset. */
declare const LINK_SET: -1
/** Refers specifically to the single prim containing the running script. */
declare const LINK_THIS: -4
/** Option used with llListStatistics to calculate the geometric mean of a list of numbers. */
declare const LIST_STAT_GEOMETRIC_MEAN: 9
/** Option used with llListStatistics to find the largest number in the list. */
declare const LIST_STAT_MAX: 2
/** Option used with llListStatistics to calculate the mean (average) of the numbers in the list. */
declare const LIST_STAT_MEAN: 3
/** Option used with llListStatistics to calculate the median of the numbers in the list. */
declare const LIST_STAT_MEDIAN: 4
/** Option used with llListStatistics to find the smallest number in the list. */
declare const LIST_STAT_MIN: 1
/** Option used with llListStatistics to determine the count of float and integer elements in the list. */
declare const LIST_STAT_NUM_COUNT: 8
/** Option used with llListStatistics to calculate the range (maximum value minus minimum value) of the list. */
declare const LIST_STAT_RANGE: 0
/** Option used with llListStatistics to calculate the sample standard deviation of a list of numbers. */
declare const LIST_STAT_STD_DEV: 5
/** Option used with llListStatistics to calculate the sum of the numbers in the list. */
declare const LIST_STAT_SUM: 6
/** Option used with llListStatistics to calculate the sum of the squares of the numbers in the list. */
declare const LIST_STAT_SUM_SQUARES: 7
/** Used with texture animation functions to cause the animation to loop continuously. */
declare const LOOP: 2
/** Permissions mask option representing base permissions. */
declare const MASK_BASE: 0
/** Permissions mask option to include the object's inventory contents when calculating permissions. Can be combined with other mask flags (e.g., MASK_OWNER | MASK_COMBINED). */
declare const MASK_COMBINED: 16
/** Permissions mask option representing permissions held by everyone. */
declare const MASK_EVERYONE: 3
/** Permissions mask option representing active group permissions. */
declare const MASK_GROUP: 2
/** Permissions mask option representing permissions the next owner will inherit. */
declare const MASK_NEXT: 4
/** Permissions mask option representing current owner permissions. */
declare const MASK_OWNER: 1
/** Value returned by llGetNotecardLineSync (ASCII NAK surrounded by newlines, i.e., codes 10, 21, 10) when requested notecard data is not in the region's cache. */
declare const NAK: string
declare const NAVIGATE_TO_GOAL_REACHED_DIST: 2
/** A special string constant used as a null or empty key value. */
declare const NULL_KEY: UUID
/** Gets the account level of an avatar. If id is not an avatar, -1 is returned. 0 is Basic account level. 1 is Premium account level. 5 is Plus account level. 10 is Premium Plus account level. */
declare const OBJECT_ACCOUNT_LEVEL: 41
/** Gets the integer boolean detailing if the object's root is set to "Animated Mesh" or gets the total number of "Animated Mesh" attachments worn by an agent. */
declare const OBJECT_ANIMATED_COUNT: 39
/** Gets the avatar's available "Animated Mesh" attachment slot count. If id is not an avatar, 0 is returned. */
declare const OBJECT_ANIMATED_SLOTS_AVAILABLE: 40
/** Gets the attachment point to which the object is attached. It returns an integer matching one of the ATTACH_* constants. */
declare const OBJECT_ATTACHED_POINT: 19
/** Gets the avatar's available attachment slot count. If id is not an avatar, 0 is returned. */
declare const OBJECT_ATTACHED_SLOTS_AVAILABLE: 35
/** Gets a float which describes the sex setting of the avatar's currently worn shape. If id is not an avatar, -1.0 is returned. Normal operational values are in the range [0.0, 1.0]. 0.0 is standard female setting, 1.0 is standard male setting. Intermediate values with visible differences are possible with manually crafted shapes. */
declare const OBJECT_BODY_SHAPE_TYPE: 26
/** Gets the average CPU time (in seconds) used by the object for navigation, if the object is a pathfinding character. Returns 0 for non-characters. */
declare const OBJECT_CHARACTER_TIME: 17
/** Gets the click action of the prim. It returns an integer matching one of the CLICK_ACTION_* constants. */
declare const OBJECT_CLICK_ACTION: 28
/** Gets the object's creation time. This time is established with raw material rezzing through the build menu and with mesh uploads. This time is NOT established with inventory rezzes, scripted rezzes, object modifying, copying or transferring. If id is an avatar, an empty string is returned. */
declare const OBJECT_CREATION_TIME: 36
/** Gets the prim's creator key. If id is an avatar, a NULL_KEY is returned. */
declare const OBJECT_CREATOR: 8
/** Retrieves the amount of damage a prim inflicts on collision. */
declare const OBJECT_DAMAGE: 51
/** Retrieves the type of damage a prim inflicts on collision. It returns an integer that can match one of the DAMAGE_TYPE_* constants, be a custom damage type or be repurposed by a combat system. */
declare const OBJECT_DAMAGE_TYPE: 52
/** Gets the prim's description. If id is an avatar, an empty string is returned. */
declare const OBJECT_DESC: 2
/** Gets the prim's group key. If id is an avatar, a NULL_KEY is returned, which means a workaround is required to get an avatar's active group.[1] */
declare const OBJECT_GROUP: 7
/** Gets the avatar's group tag text. If id is not an avatar, an empty string is returned. */
declare const OBJECT_GROUP_TAG: 33
/** Retrieves the health of an avatar or prim. */
declare const OBJECT_HEALTH: 50
/** Gets the hover height of the avatar. If id is not an avatar, 0.0 is returned. Normal values are in the range [-2.0, 2.0] with a default of 0.0. This value does not reflect the avatar shape's "Hover" slider, only the dynamic viewer setting. */
declare const OBJECT_HOVER_HEIGHT: 25
/** Gets the UUID of the object's previous owner, if known. For group-owned objects, this is the avatar that deeded the object. Returns NULL_KEY for avatars, or objects that were never transferred. A rezzed object taken back to inventory, then re-rezzed, will return its current owner key. */
declare const OBJECT_LAST_OWNER_ID: 27
/** Get this object's index in the linkset. */
declare const OBJECT_LINK_NUMBER: 46
/** Flag used with llGetObjectDetails to get a boolean, indicating if the object is locked. */
declare const OBJECT_LOCKED: 55
/** Gets the mass (in Kilograms) of this object's linkset. */
declare const OBJECT_MASS: 43
/** Retrieves the physics material set on this object. It returns an integer matching one of the PRIM_MATERIAL_* constants. */
declare const OBJECT_MATERIAL: 42
/** Gets the prim's name. If id is an avatar, the Legacy Name is returned. */
declare const OBJECT_NAME: 1
/** Gets the object's rotational velocity (radians per second). */
declare const OBJECT_OMEGA: 29
/** Gets an object's owner key. If id is an avatar, that avatar's key is returned (which is the same as id). If id is group-owned, a NULL_KEY is returned. */
declare const OBJECT_OWNER: 6
/** Gets the pathfinding setting of the object in the region. It returns an integer matching one of the OPT_* constants. */
declare const OBJECT_PATHFINDING_TYPE: 20
/** Retrieves the permissions for this object as 5 integers. */
declare const OBJECT_PERMS: 53
/** Retrieves the permissions for this object combined with all of its inventory items as 5 integers. */
declare const OBJECT_PERMS_COMBINED: 54
/** Gets the integer boolean detailing if phantom is enabled or disabled on the object. If id is an avatar or attachment, 0 is returned. */
declare const OBJECT_PHANTOM: 22
/** Gets the integer boolean detailing if physics is enabled or disabled on the object. If id is an avatar or attachment, 0 is returned. */
declare const OBJECT_PHYSICS: 21
/** Gets the physics cost of the object. */
declare const OBJECT_PHYSICS_COST: 16
/** Gets the prim's position in region coordinates. If id is an avatar outside the region (see above), this position is relative to the region the script is running in. */
declare const OBJECT_POS: 3
/** Gets the object's prim count */
declare const OBJECT_PRIM_COUNT: 30
/** Gets the prim equivalence of the object. */
declare const OBJECT_PRIM_EQUIVALENCE: 13
/** Gets the avatar's render weight. If id is an object, 0 is returned. If id is an avatar whose render weight is unknown to the simulator, -1 is returned. The maximum render weight reported by the server is 500000[1]. */
declare const OBJECT_RENDER_WEIGHT: 24
/** Scope flag used with llReturnObjectsByOwner to return all objects on the same parcel as the script owned by the specified owner. Requires the script owner to be an estate manager or the parcel owner. */
declare const OBJECT_RETURN_PARCEL: 1
/** Scope flag used with llReturnObjectsByOwner to return all objects owned by the specified owner that are located on parcels owned by the script's owner. */
declare const OBJECT_RETURN_PARCEL_OWNER: 2
/** Scope flag used with llReturnObjectsByOwner to return all objects in the region owned by the specified owner. Only works if the script is owned by the estate owner or an estate manager. */
declare const OBJECT_RETURN_REGION: 4
/** Gets the key of the object that rezzed this object be it an object or an avatar. */
declare const OBJECT_REZZER_KEY: 32
/** Retrieves the time that this object was rezzed. */
declare const OBJECT_REZ_TIME: 45
/** Gets the id of the root prim of the object requested. If id is an avatar, returns the id of the root prim of the linkset the avatar is sitting on and linked to (or the avatar's own id if the avatar is not sitting on an object within the region). */
declare const OBJECT_ROOT: 18
/** Gets the prim's rotation. */
declare const OBJECT_ROT: 4
/** Gets the number of running scripts attached to the object or agent. */
declare const OBJECT_RUNNING_SCRIPT_COUNT: 9
/** Get the size of this object. */
declare const OBJECT_SCALE: 47
/** Gets the amount of script memory used by the object or agent, in bytes, or its upper limit. See page for more info. */
declare const OBJECT_SCRIPT_MEMORY: 11
/** Gets the total amount of average script CPU time used by the object or agent, in seconds. See page for more info. */
declare const OBJECT_SCRIPT_TIME: 12
/** Gets the total number of agents selecting any links in the object. If id is an avatar, 0 is returned. */
declare const OBJECT_SELECT_COUNT: 37
/** Gets the server cost of the object. */
declare const OBJECT_SERVER_COST: 14
/** Gets the total number of agents sitting on any links in the object. If id is an avatar, 0 is returned. */
declare const OBJECT_SIT_COUNT: 38
/** Gets the streaming (download) cost of the object. */
declare const OBJECT_STREAMING_COST: 15
/** Gets the integer boolean detailing if the object is temporarily attached. */
declare const OBJECT_TEMP_ATTACHED: 34
/** Gets the integer boolean detailing if temporary is enabled or disabled on the object. */
declare const OBJECT_TEMP_ON_REZ: 23
/** Gets the floating text displayed above this object. */
declare const OBJECT_TEXT: 44
/** Gets the alpha value of the floating text displayed above this object. */
declare const OBJECT_TEXT_ALPHA: 49
/** Gets the color of the floating text displayed above this object. */
declare const OBJECT_TEXT_COLOR: 48
/** Gets the object's total number of inventory items. */
declare const OBJECT_TOTAL_INVENTORY_COUNT: 31
/** Gets the number of scripts, both running and stopped, attached to the object or agent. */
declare const OBJECT_TOTAL_SCRIPT_COUNT: 10
/** Flag returned by llGetObjectDetails when an invalid flag is requested. */
declare const OBJECT_UNKNOWN_DETAIL: -1
/** Gets the object's velocity. */
declare const OBJECT_VELOCITY: 5
/** Flag used with llGetObjectDetails to get a boolean, indicating if the object is VolumeDetect. */
declare const OBJECT_VOLUME_DETECT: 56
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
/** Sets the alpha for the face(s). Only impacts the rendering when the alpha mode is set to PRIM_GLTF_ALPHA_MODE_BLEND. */
declare const OVERRIDE_GLTF_BASE_ALPHA: 2
/** Sets the alpha cutoff level on the face(s) when alpha mode is set to mask. */
declare const OVERRIDE_GLTF_BASE_ALPHA_MASK: 4
/** Set the alpha mode on the face(s). Must be one of the valid blend modes GLTF Alpha Mode value description PRIM_GLTF_ALPHA_MODE_OPAQUE 0 Ignore the alpha value and render the material as opaque. PRIM_GLTF_ALPHA_MODE_BLEND 1 Render the material with transparency determined by the alpha value. Blending is done in linear color space. As is the case for Blinn-Phong as well, this mode suffers from depth sorting and performance issues. Use alpha mask instead when possible. PRIM_GLTF_ALPHA_MODE_MASK 2 Render the material as fully opaque where the alpha value is greater than the alpha cutoff, and otherwise render the material as fully transparent. */
declare const OVERRIDE_GLTF_BASE_ALPHA_MODE: 3
/** Set the tinting color used for the base color. Color is specified in linear RGB. Use llsRGB2Linear to convert colors from Blinn-Phong to PBR. */
declare const OVERRIDE_GLTF_BASE_COLOR_FACTOR: 1
/** If set to TRUE then the texture on the face(s) will be rendered as double sided. */
declare const OVERRIDE_GLTF_BASE_DOUBLE_SIDED: 5
/** Set the tint used for the emissive texture on the face(s). Note that this is specified in linear RGB. */
declare const OVERRIDE_GLTF_EMISSIVE_FACTOR: 8
/** Adjusts the metallic factor on the specified face(s). Value should be between 0 and 1. */
declare const OVERRIDE_GLTF_METALLIC_FACTOR: 6
/** Adjust the roughness factor on the specified face(s). Value should be between 0 and 1. */
declare const OVERRIDE_GLTF_ROUGHNESS_FACTOR: 7
/** Used with llGetParcelPrimCount to get the total land impact of objects not owned by the parcel owner but set to or owned by the parcel's group. */
declare const PARCEL_COUNT_GROUP: 2
/** Used with llGetParcelPrimCount to get the land impact of all objects that are neither owned by the parcel owner nor set to or owned by the parcel's group. */
declare const PARCEL_COUNT_OTHER: 3
/** Used with llGetParcelPrimCount to get the total land impact of objects owned by the parcel owner. */
declare const PARCEL_COUNT_OWNER: 1
/** Used with llGetParcelPrimCount to get the total land impact of all objects currently selected or sat on. */
declare const PARCEL_COUNT_SELECTED: 4
/** Used with llGetParcelPrimCount to get the total land impact of temporary (temp-on-rez) objects. */
declare const PARCEL_COUNT_TEMP: 5
/** Used with llGetParcelPrimCount to get the total land impact of all objects on the parcel(s), excluding temporary (temp-on-rez) objects. */
declare const PARCEL_COUNT_TOTAL: 0
/** The parcel's area, in sqm. */
declare const PARCEL_DETAILS_AREA: 4
/** The description of the parcel. */
declare const PARCEL_DETAILS_DESC: 1
/** Parcel flags set for this parcel. See llGetParcelFlags for a listing of the flags and their meaning. */
declare const PARCEL_DETAILS_FLAGS: 12
/** The parcel group's key. */
declare const PARCEL_DETAILS_GROUP: 3
/** The parcel's key. */
declare const PARCEL_DETAILS_ID: 5
/** Look at vector set for the landing point on this parcel, if any. */
declare const PARCEL_DETAILS_LANDING_LOOKAT: 10
/** Landing point set for this parcel, if any. */
declare const PARCEL_DETAILS_LANDING_POINT: 9
/** The name of the parcel. */
declare const PARCEL_DETAILS_NAME: 0
/** The parcel owner's key. */
declare const PARCEL_DETAILS_OWNER: 2
/** The total prim capacity on this and all same-owner parcels, sim-wide. See llGetParcelMaxPrims for same-parcel-only and/or sim-wide reporting. */
declare const PARCEL_DETAILS_PRIM_CAPACITY: 7
/** The total prim usage on this and all same-owner parcels, sim-wide. See llGetParcelPrimCount to get prim count by parcel owner, group, temp, etc. for same-parcel-only and/or sim-wide reporting. */
declare const PARCEL_DETAILS_PRIM_USED: 8
/** Is the script in danger in the indicated parcel. See llScriptDanger for a discussion of script danger. */
declare const PARCEL_DETAILS_SCRIPT_DANGER: 13
/** The parcel's avatar visibility setting[2] */
declare const PARCEL_DETAILS_SEE_AVATARS: 6
/** Teleport routing for this parcel. 0 = TP_ROUTING_BLOCKED 1 = TP_ROUTING_LANDINGP 2 = TP_ROUTING_FREE Note that routing rules are only enforced if the landing point is set. */
declare const PARCEL_DETAILS_TP_ROUTING: 11
/** Flag used with llGetParcelFlags to check if the parcel allows all objects to enter. */
declare const PARCEL_FLAG_ALLOW_ALL_OBJECT_ENTRY: 134217728
/** Flag used with llGetParcelFlags to check if group members or scripts in group-deeded objects are allowed to create/rez objects on the parcel. */
declare const PARCEL_FLAG_ALLOW_CREATE_GROUP_OBJECTS: 67108864
/** Flag used with llGetParcelFlags to check if the parcel allows anyone to create objects. */
declare const PARCEL_FLAG_ALLOW_CREATE_OBJECTS: 64
/** Flag used with llGetParcelFlags to check if damage is enabled on the parcel. */
declare const PARCEL_FLAG_ALLOW_DAMAGE: 32
/** Flag used with llGetParcelFlags to check if flying is allowed on the parcel. */
declare const PARCEL_FLAG_ALLOW_FLY: 1
/** Flag used with llGetParcelFlags to check if the parcel restricts object entry to only group-owned and owner-owned objects. */
declare const PARCEL_FLAG_ALLOW_GROUP_OBJECT_ENTRY: 268435456
/** Flag used with llGetParcelFlags to check if the parcel allows scripts owned by the parcel's group to run. */
declare const PARCEL_FLAG_ALLOW_GROUP_SCRIPTS: 33554432
/** Flag used with llGetParcelFlags to check if the parcel allows landmarks to be created. */
declare const PARCEL_FLAG_ALLOW_LANDMARK: 8
/** Flag used with llGetParcelFlags to check if scripts (including outside scripts) are allowed to run on the parcel. */
declare const PARCEL_FLAG_ALLOW_SCRIPTS: 2
/** Flag used with llGetParcelFlags to check if the parcel allows anyone to terraform the land. */
declare const PARCEL_FLAG_ALLOW_TERRAFORM: 16
declare const PARCEL_FLAG_LINDEN_HOMES: 8388608
/** Flag used with llGetParcelFlags to check if the parcel restricts spatialized sounds to the parcel (preventing outside sound from being heard inside). */
declare const PARCEL_FLAG_LOCAL_SOUND_ONLY: 32768
/** Flag used with llGetParcelFlags to check if the parcel restricts the use of llPushObject by non-owners (or non-group officers if group-owned). */
declare const PARCEL_FLAG_RESTRICT_PUSHOBJECT: 2097152
/** Flag used with llGetParcelFlags to check if the parcel limits access to group members. */
declare const PARCEL_FLAG_USE_ACCESS_GROUP: 256
/** Flag used with llGetParcelFlags to check if the parcel limits access to a specific list of residents (avatars). */
declare const PARCEL_FLAG_USE_ACCESS_LIST: 512
/** Flag used with llGetParcelFlags to check if the parcel uses a ban list (including restricting access based on payment information). */
declare const PARCEL_FLAG_USE_BAN_LIST: 1024
/** Flag used with llGetParcelFlags to check if the parcel restricts access via purchasable land passes (sold for L$). */
declare const PARCEL_FLAG_USE_LAND_PASS_LIST: 2048
/** Command used with llParcelMediaCommandList to apply the specified media command to the designated agent only. */
declare const PARCEL_MEDIA_COMMAND_AGENT: 7
/** Command used with llParcelMediaCommandList to toggle or set the parcel media option 'Auto scale content'. */
declare const PARCEL_MEDIA_COMMAND_AUTO_ALIGN: 9
/** Used to get or set the parcel media description. (1.19.1 RC0 or later) */
declare const PARCEL_MEDIA_COMMAND_DESC: 12
/** Command used with llParcelMediaCommandList to start the media stream playing from the current frame and have it loop back to the beginning when it reaches the end. */
declare const PARCEL_MEDIA_COMMAND_LOOP: 3
/** Used to get or set the parcel's media loop duration. (1.19.1 RC0 or later) */
declare const PARCEL_MEDIA_COMMAND_LOOP_SET: 13
/** Command used with llParcelMediaCommandList to pause the media stream on the current frame. */
declare const PARCEL_MEDIA_COMMAND_PAUSE: 1
/** Command used with llParcelMediaCommandList to play the media stream from its current frame, stopping when the end is reached. */
declare const PARCEL_MEDIA_COMMAND_PLAY: 2
/** Used to get or set the parcel media pixel resolution. (1.19.1 RC0 or later) */
declare const PARCEL_MEDIA_COMMAND_SIZE: 11
/** Command used with llParcelMediaCommandList to stop the media stream and rewind it to the first frame. */
declare const PARCEL_MEDIA_COMMAND_STOP: 0
/** Used to get or set the parcel's media texture. */
declare const PARCEL_MEDIA_COMMAND_TEXTURE: 4
/** Command used with llParcelMediaCommandList to jump to a specific timestamp in the media stream, specified in floating-point seconds. */
declare const PARCEL_MEDIA_COMMAND_TIME: 6
/** Used to get or set the parcel media MIME type (e.g. "text/html"). (1.19.1 RC0 or later) */
declare const PARCEL_MEDIA_COMMAND_TYPE: 10
/** Command used with llParcelMediaCommandList to completely unload the media and restore the face's original texture. */
declare const PARCEL_MEDIA_COMMAND_UNLOAD: 8
/** Used to get or set the parcel's media url. */
declare const PARCEL_MEDIA_COMMAND_URL: 5
/** Option used with llSetParcelForSale to specify the agent ID authorized to buy the parcel. If none is set, any agent can purchase it. */
declare const PARCEL_SALE_AGENT: 2
/** Option used with llSetParcelForSale. If set to TRUE, objects on the parcel are included in the sale. */
declare const PARCEL_SALE_OBJECTS: 3
/** Option used with llSetParcelForSale to set the parcel price. If no authorized agent is set, the price must be greater than 0. */
declare const PARCEL_SALE_PRICE: 1
/** Status code indicating the parcel sale information was successfully set. */
declare const PARCEL_SALE_OK: 0
/** Error code indicating the parcel could not be found. */
declare const PARCEL_SALE_ERROR_NO_PARCEL: 1
/** Error code indicating the script lacks the required permissions to set the parcel sale information. */
declare const PARCEL_SALE_ERROR_NO_PERMISSIONS: 2
/** Error code indicating the parcel is in escrow and cannot be put up for sale. */
declare const PARCEL_SALE_ERROR_IN_ESCROW: 3
/** Error code indicating the specified parcel price is invalid (e.g., less than or equal to 0). */
declare const PARCEL_SALE_ERROR_INVALID_PRICE: 4
/** Error code indicating the parameters provided to set the parcel sale information are invalid. */
declare const PARCEL_SALE_ERROR_BAD_PARAMS: 5
/** Identifies static or non-moving in-world objects (which do not consume active server resources). In llDetectedType(), indicates non-physical objects. In llSensor()/llSensorRepeat() filters, searches for non-physical, non-scripted, inactive, or non-moving physical objects. */
declare const PASSIVE: 4
/** Used with event-passing functions (e.g., llPassTouches, llPassCollisions) to ensure events are always passed from the child prim to the root prim, regardless of whether they are handled by child script handlers. */
declare const PASS_ALWAYS: 1
/** Used with event-passing functions (default behavior) to pass events from the child prim to the root prim only if there is no script handling the event in the child. */
declare const PASS_IF_NOT_HANDLED: 0
/** Used with event-passing functions to ensure events are never passed from the child prim to the root prim, regardless of whether they are handled by child script handlers. */
declare const PASS_NEVER: 2
/** Option parameter for llPatrolPoints (defaults to FALSE). If TRUE, the character slows down and momentarily pauses at each waypoint. If FALSE, the character moves to the next waypoint at full speed with no pause. */
declare const PATROL_PAUSE_AT_WAYPOINTS: 0
/** Agent data flag returned by llRequestAgentData indicating if the user has payment information on file. */
declare const PAYMENT_INFO_ON_FILE: 1
/** Agent data flag returned by llRequestAgentData indicating if the user has ever used their payment information. */
declare const PAYMENT_INFO_USED: 2
/** Used with llSetPayPrice to use the default value for the specified quick pay button. */
declare const PAY_DEFAULT: -2
/** Used with llSetPayPrice to hide the specified quick pay button completely. */
declare const PAY_HIDE: -1
/** Runtime permission that allows the script to successfully call llGiveMoney or llTransferLindenDollars to debit the owner's account. */
declare const PERMISSION_DEBIT: 2
/** Runtime permission that allows the script to successfully call the llTakeControls function to intercept the agent's controls. */
declare const PERMISSION_TAKE_CONTROLS: 4
/**
 * (Not yet implemented)
 * @deprecated Not implemented.
 */
declare const PERMISSION_REMAP_CONTROLS: 8
/** Runtime permission that allows the script to start or stop animations on the agent (such as using llStartAnimation). */
declare const PERMISSION_TRIGGER_ANIMATION: 16
/** Runtime permission that allows the script to successfully attach to or detach from the agent using llAttachToAvatar. */
declare const PERMISSION_ATTACH: 32
/**
 * (Not yet implemented)
 * @deprecated Not implemented.
 */
declare const PERMISSION_RELEASE_OWNERSHIP: 64
/** Runtime permission that allows the script to successfully create, break, or modify links to other objects using llCreateLink, llBreakLink, or llBreakAllLinks. */
declare const PERMISSION_CHANGE_LINKS: 128
/**
 * (Not yet implemented)
 * @deprecated Not implemented.
 */
declare const PERMISSION_CHANGE_JOINTS: 256
/**
 * (Not yet implemented)
 * @deprecated Not implemented.
 */
declare const PERMISSION_CHANGE_PERMISSIONS: 512
/** Runtime permission that allows the script to track the agent's camera position and rotation. */
declare const PERMISSION_TRACK_CAMERA: 1024
/** Runtime permission that allows the script to control the agent's camera. The agent must be sitting on or attached to the object, and permission is automatically revoked on standing up or detaching. */
declare const PERMISSION_CONTROL_CAMERA: 2048
/** Runtime permission required to teleport the agent using the llTeleportAgent function. */
declare const PERMISSION_TELEPORT: 4096
/** Runtime permission that allows the script to manage estate access rules via llManageEstateAccess without notifying the object owner of the changes. */
declare const PERMISSION_SILENT_ESTATE_MANAGEMENT: 16384
/** Runtime permission that allows the script to configure and override default animations on the agent. */
declare const PERMISSION_OVERRIDE_ANIMATIONS: 32768
/** Runtime permission required to use the llReturnObjectsByID and llReturnObjectsByOwner functions to return objects from parcels. */
declare const PERMISSION_RETURN_OBJECTS: 65536
/** Runtime permission that grants the script privileged access to land parcel functions, which is required to use llSetParcelForSale. */
declare const PERMISSION_PRIVILEGED_LAND_ACCESS: 524288
/** Permissions mask representing a combination of move, modify, copy, and transfer permissions. */
declare const PERM_ALL: 2147483647
/** Permissions mask representing copy permission. */
declare const PERM_COPY: 32768
/** Permissions mask representing modify permission. */
declare const PERM_MODIFY: 16384
/** Permissions mask representing move permission. */
declare const PERM_MOVE: 524288
/** Permissions mask representing transfer permission. */
declare const PERM_TRANSFER: 8192
/**
 * Mathematical constant pi, representing the number of radians in a half circle (semi-circle). When used in sensor functions, it specifies a full sphere scan.
 * @deprecated Use 'math.pi' instead. Double precision.
 */
declare const PI: number
/** Used with texture animation functions to cause the animation to play forward first, and then in reverse. */
declare const PING_PONG: 8
/**
 * Mathematical constant pi/2, representing the number of radians in a quarter circle. When used in sensor functions, it specifies a hemisphere scan.
 * @deprecated Use 'math.pi/2' instead. Double precision.
 */
declare const PI_BY_TWO: number
/** Avatars are allowed to manually stand up when seated on this prim. Only valid for prims in a valid experience. */
declare const PRIM_ALLOW_UNSIT: 39
/** Sets the prim's diffuse texture alpha rendering mode attributes. */
declare const PRIM_ALPHA_MODE: 38
/** Prim parameter setting for PRIM_ALPHA_MODE. Directs the face to use alpha blending for diffuse texture rendering (if an alpha channel exists). Also used as the default value to clear material settings from a prim face. */
declare const PRIM_ALPHA_MODE_BLEND: 1
/** Prim parameter setting for PRIM_ALPHA_MODE. Renders the diffuse texture's alpha channel as an emissivity mask. Pixels render with an emissivity corresponding to their opacity under all lighting conditions (fully opaque pixels effectively render as 'full bright'). */
declare const PRIM_ALPHA_MODE_EMISSIVE: 3
/** Prim parameter setting for PRIM_ALPHA_MODE. Renders the diffuse texture's alpha channel on a binary per-pixel basis; pixels more opaque than the alpha cutoff render as fully opaque, while pixels below the cutoff render as fully transparent. */
declare const PRIM_ALPHA_MODE_MASK: 2
/** Prim parameter setting for PRIM_ALPHA_MODE. Directs the face to ignore the alpha channel of the diffuse texture and render as completely opaque (default setting when a material face lacks an alpha channel). */
declare const PRIM_ALPHA_MODE_NONE: 0
/** Face bump mapping setting: bark. */
declare const PRIM_BUMP_BARK: 4
/** Face bump mapping setting: petridish (blobby amoeba-like shapes). */
declare const PRIM_BUMP_BLOBS: 12
/** Face bump mapping setting: bricks. */
declare const PRIM_BUMP_BRICKS: 5
/** Face bump mapping setting: brightness (generated from highlights). */
declare const PRIM_BUMP_BRIGHT: 1
/** Face bump mapping setting: checker. */
declare const PRIM_BUMP_CHECKER: 6
/** Face bump mapping setting: concrete. */
declare const PRIM_BUMP_CONCRETE: 7
/** Face bump mapping setting: darkness (generated from lowlights). */
declare const PRIM_BUMP_DARK: 2
/** Face bump mapping setting: discs (packed circles). */
declare const PRIM_BUMP_DISKS: 10
/** Face bump mapping setting: gravel. */
declare const PRIM_BUMP_GRAVEL: 11
/** Face bump mapping setting: stonetile (large tile). */
declare const PRIM_BUMP_LARGETILE: 14
/** Face bump mapping setting: none (no bump map). */
declare const PRIM_BUMP_NONE: 0
/** Sets the face's shiny & bump. */
declare const PRIM_BUMP_SHINY: 19
/** Face bump mapping setting: siding. */
declare const PRIM_BUMP_SIDING: 13
/** Face bump mapping setting: cutstone (blocks). */
declare const PRIM_BUMP_STONE: 9
/** Face bump mapping setting: stucco. */
declare const PRIM_BUMP_STUCCO: 15
/** Face bump mapping setting: suction (rings). */
declare const PRIM_BUMP_SUCTION: 16
/** Face bump mapping setting: crustytile. */
declare const PRIM_BUMP_TILE: 8
/** Face bump mapping setting: weave. */
declare const PRIM_BUMP_WEAVE: 17
/** Face bump mapping setting: woodgrain. */
declare const PRIM_BUMP_WOOD: 3
/**
 * Sets the prim's cast shadow attribute. (DEPRECATED)
 * @deprecated Not implemented.
 */
declare const PRIM_CAST_SHADOWS: 24
/** Click action for this prim */
declare const PRIM_CLICK_ACTION: 43
/** Prim parameter to set the collision sound UUID and volume level for the prim. */
declare const PRIM_COLLISION_SOUND: 53
/** Sets the face's color. */
declare const PRIM_COLOR: 18
/** Sets the damage and damage type delivered by a prim on collision. */
declare const PRIM_DAMAGE: 51
/** Sets the prim's description. */
declare const PRIM_DESC: 28
/** Sets the prim as flexible. */
declare const PRIM_FLEXIBLE: 21
/** Sets the face's full bright flag. */
declare const PRIM_FULLBRIGHT: 20
/** Sets the face's glow attribute. */
declare const PRIM_GLOW: 25
/** GLTF alpha mode setting for PRIM_GLTF_BASE_COLOR. Renders the material with transparency (alpha blending) in linear color space. Transparency from the texture is multiplied by the material's opacity multiplier. Note: This mode can suffer from depth sorting and performance issues. */
declare const PRIM_GLTF_ALPHA_MODE_BLEND: 1
/** GLTF alpha mode setting for PRIM_GLTF_BASE_COLOR. Renders the material as fully opaque where the alpha value is greater than the alpha cutoff, and fully transparent otherwise. */
declare const PRIM_GLTF_ALPHA_MODE_MASK: 2
/** GLTF alpha mode setting for PRIM_GLTF_BASE_COLOR. Ignores the alpha channel entirely and renders the face material as completely opaque. */
declare const PRIM_GLTF_ALPHA_MODE_OPAQUE: 0
/** Sets the prim's GLTF Material Base Color map attributes. This parameter's arguments are GLTF overrides. ⚠️ Warning: Setting an argument to the empty string ("") will clear the respective override. GLTF texture transforms are always overrides, so setting them to the empty string ("") will clear them. See this example for a workaround. The SL team is open to feedback on LSL improvements for GLTF. gltf_alpha_mode Flags V Description PRIM_GLTF_ALPHA_MODE_OPAQUE 0 Ignore the alpha value and render the material as opaque. PRIM_GLTF_ALPHA_MODE_BLEND 1 Render the material with transparency determined by the alpha value. Blending is done in linear color space. As is the case for Blinn-Phong as well, this mode suffers from depth sorting and performance issues. Use alpha mask instead when possible. PRIM_GLTF_ALPHA_MODE_MASK 2 Render the material as fully opaque where the alpha value is greater than the alpha cutoff, and otherwise render the material as fully transparent. */
declare const PRIM_GLTF_BASE_COLOR: 48
/** Sets the prim's GLTF Material Emissive map attributes. This parameter's arguments are GLTF overrides. ⚠️ Warning: Setting an argument to the empty string ("") will clear the respective override. GLTF texture transforms are always overrides, so setting them to the empty string ("") will clear them. See this example for a workaround. The SL team is open to feedback on LSL improvements for GLTF. */
declare const PRIM_GLTF_EMISSIVE: 46
/** Sets the prim's GLTF ORM map attributes (Occlusion, Roughness, Metallic). This parameter's arguments are GLTF overrides. ⚠️ Warning: Setting an argument to the empty string ("") will clear the respective override. GLTF texture transforms are always overrides, so setting them to the empty string ("") will clear them. See this example for a workaround. The SL team is open to feedback on LSL improvements for GLTF. */
declare const PRIM_GLTF_METALLIC_ROUGHNESS: 47
/** Sets the prim's GLTF Material Normal map attributes. This parameter's arguments are GLTF overrides. ⚠️ Warning: Setting an argument to the empty string ("") will clear the respective override. GLTF texture transforms are always overrides, so setting them to the empty string ("") will clear them. See this example for a workaround. The SL team is open to feedback on LSL improvements for GLTF. */
declare const PRIM_GLTF_NORMAL: 45
/** Sets the health value for this prim. */
declare const PRIM_HEALTH: 52
/** Parameter used with certain PRIM_TYPE_* flags to make a circular hole via the hole_shape parameter. */
declare const PRIM_HOLE_CIRCLE: 16
/** Parameter used with certain PRIM_TYPE_* flags to make a hole of the same shape as the outer shape via the hole_shape parameter. */
declare const PRIM_HOLE_DEFAULT: 0
/** Parameter used with certain PRIM_TYPE_* flags to make a squarish hole via the hole_shape parameter. */
declare const PRIM_HOLE_SQUARE: 32
/** Parameter used with certain PRIM_TYPE_* flags to make a triangular hole via the hole_shape parameter. */
declare const PRIM_HOLE_TRIANGLE: 48
/** Sets the next linknumber to use in the linkset. */
declare const PRIM_LINK_TARGET: 34
/** Sets the prim's material. */
declare const PRIM_MATERIAL: 2
/** @deprecated Use 'DENSITY' instead. */
declare const PRIM_MATERIAL_DENSITY: 1
/** Prim material constant: flesh. */
declare const PRIM_MATERIAL_FLESH: 4
/** @deprecated Use 'FRICTION' instead. */
declare const PRIM_MATERIAL_FRICTION: 2
/** Prim material constant: glass (features very low friction). */
declare const PRIM_MATERIAL_GLASS: 2
/** @deprecated Use 'GRAVITY_MULTIPLIER' instead. */
declare const PRIM_MATERIAL_GRAVITY_MULTIPLIER: 8
/**
 * Deprecated prim material constant. Light is now a face property instead of a prim property; equivalent functionality is achieved using [PRIM_FULLBRIGHT, ALL_SIDES, TRUE].
 * @deprecated Use 'PRIM_FULLBRIGHT' instead.
 */
declare const PRIM_MATERIAL_LIGHT: 7
/** Prim material constant: metal. */
declare const PRIM_MATERIAL_METAL: 1
/** Prim material constant: plastic. */
declare const PRIM_MATERIAL_PLASTIC: 5
/** @deprecated Use 'RESTITUTION' instead. */
declare const PRIM_MATERIAL_RESTITUTION: 4
/** Prim material constant: rubber. */
declare const PRIM_MATERIAL_RUBBER: 6
/** Prim material constant: stone. */
declare const PRIM_MATERIAL_STONE: 0
/** Prim material constant: wood. */
declare const PRIM_MATERIAL_WOOD: 3
/** Gets the default image state (the image that the user sees before a piece of media is active) for the chosen face. The default image is specified by Second Life's server for that media type. Note: This flag is not currently implemented. */
declare const PRIM_MEDIA_ALT_IMAGE_ENABLE: 0
/** Gets whether auto-looping is enabled. */
declare const PRIM_MEDIA_AUTO_LOOP: 4
/** Gets whether the media auto-plays when a Resident can view it. */
declare const PRIM_MEDIA_AUTO_PLAY: 5
/** Gets whether auto-scaling is enabled. Auto-scaling forces the media to the full size of the texture. */
declare const PRIM_MEDIA_AUTO_SCALE: 6
/** Gets whether clicking the media triggers auto-zoom and auto-focus on the media. */
declare const PRIM_MEDIA_AUTO_ZOOM: 7
/** Gets the style of controls. Can be either PRIM_MEDIA_CONTROLS_STANDARD or PRIM_MEDIA_CONTROLS_MINI. */
declare const PRIM_MEDIA_CONTROLS: 1
/** Mini web navigation controls constant; does not include an address bar. */
declare const PRIM_MEDIA_CONTROLS_MINI: 1
/** Standard web navigation controls constant. */
declare const PRIM_MEDIA_CONTROLS_STANDARD: 0
/** Gets the current url displayed on the chosen face. Changing this URL causes navigation. 1024 characters Max */
declare const PRIM_MEDIA_CURRENT_URL: 2
/** Gets whether the first click interaction is enabled. Note: This flag appears not to work. */
declare const PRIM_MEDIA_FIRST_CLICK_INTERACT: 8
/** Gets the height of the media in pixels. */
declare const PRIM_MEDIA_HEIGHT_PIXELS: 10
/** Gets the home url for the chosen face. 1024 characters max */
declare const PRIM_MEDIA_HOME_URL: 3
declare const PRIM_MEDIA_MAX_HEIGHT_PIXELS: 2048
declare const PRIM_MEDIA_MAX_URL_LENGTH: 1024
declare const PRIM_MEDIA_MAX_WHITELIST_COUNT: 64
declare const PRIM_MEDIA_MAX_WHITELIST_SIZE: 1024
declare const PRIM_MEDIA_MAX_WIDTH_PIXELS: 2048
declare const PRIM_MEDIA_PARAM_MAX: 14
/** Gets the permissions mask that control who can see the media control bar above the object: PRIM_MEDIA_PERM_NONE PRIM_MEDIA_PERM_OWNER PRIM_MEDIA_PERM_GROUP PRIM_MEDIA_PERM_ANYONE */
declare const PRIM_MEDIA_PERMS_CONTROL: 14
/** Gets the permissions mask that control who can interact with the object: PRIM_MEDIA_PERM_NONE PRIM_MEDIA_PERM_OWNER PRIM_MEDIA_PERM_GROUP PRIM_MEDIA_PERM_ANYONE */
declare const PRIM_MEDIA_PERMS_INTERACT: 13
declare const PRIM_MEDIA_PERM_ANYONE: 4
declare const PRIM_MEDIA_PERM_GROUP: 2
declare const PRIM_MEDIA_PERM_NONE: 0
declare const PRIM_MEDIA_PERM_OWNER: 1
/** Gets the whitelist as a string of escaped, comma-separated URLs. This string can hold up to 64 URLs or 1024 characters, whichever comes first. */
declare const PRIM_MEDIA_WHITELIST: 12
/** Gets whether navigation is restricted to URLs in PRIM_MEDIA_WHITELIST. */
declare const PRIM_MEDIA_WHITELIST_ENABLE: 11
/** Gets the width of the media in pixels. */
declare const PRIM_MEDIA_WIDTH_PIXELS: 9
/** Sets the prim's name. */
declare const PRIM_NAME: 27
/** Sets the prim's normal map attributes. */
declare const PRIM_NORMAL: 37
/** Sets the prim's spin to the specified axis and rate. */
declare const PRIM_OMEGA: 32
/** Sets the object's phantom status. */
declare const PRIM_PHANTOM: 5
/** Sets the object's physics status. */
declare const PRIM_PHYSICS: 3
/** Physics shape type setting. Uses the convex hull of the prim shape to generate its physics representation (the default for mesh objects). */
declare const PRIM_PHYSICS_SHAPE_CONVEX: 2
/** Physics shape type setting. Directs the physics engine to ignore this prim entirely, preventing it from contributing to the linkset's physics shape. Note: Cannot be applied to the root prim. */
declare const PRIM_PHYSICS_SHAPE_NONE: 1
/** Physics shape type setting. Uses the actual visible shape of the prim to determine its physics representation (the default for all non-mesh objects). */
declare const PRIM_PHYSICS_SHAPE_PRIM: 0
/** Sets the prim's physics shape type. */
declare const PRIM_PHYSICS_SHAPE_TYPE: 30
/** Sets the prim as a point light. */
declare const PRIM_POINT_LIGHT: 23
/** Sets the prim's position. */
declare const PRIM_POSITION: 6
/** Sets the prim's local position. */
declare const PRIM_POS_LOCAL: 33
/** Light projector settings for this prim. */
declare const PRIM_PROJECTOR: 42
/** Sets the prim as a reflection probe. */
declare const PRIM_REFLECTION_PROBE: 44
/** Flag option used with PRIM_REFLECTION_PROBE. When set, the reflection probe volume is a box; when unset, it defaults to a sphere. */
declare const PRIM_REFLECTION_PROBE_BOX: 1
/** Flag option used with PRIM_REFLECTION_PROBE. When set, the probe dynamically includes avatars in its image-based lighting reflections (which carries a rendering performance cost). */
declare const PRIM_REFLECTION_PROBE_DYNAMIC: 2
/** Flag option used with PRIM_REFLECTION_PROBE. When set, intersecting low-roughness PBR materials act as mirrors. Note: Mirrors do not reflect avatars unless PRIM_REFLECTION_PROBE_DYNAMIC is also enabled, and they carry a performance cost. */
declare const PRIM_REFLECTION_PROBE_MIRROR: 4
/** Sets the prim's render_material. Setting this param will also clear most PRIM_GLTF_* properties on the face, with the exceptions of repeats, offsets, and rotation_in_radians */
declare const PRIM_RENDER_MATERIAL: 49
/** Sets the prim's global rotation. */
declare const PRIM_ROTATION: 8
/** Sets the prim's local rotation. */
declare const PRIM_ROT_LOCAL: 29
/** Avatars are not permitted to manually sit on this prim. */
declare const PRIM_SCRIPTED_SIT_ONLY: 40
/** Read-only flag for PRIM_TYPE_SCULPT to query whether the object is an Animated Mesh (Animesh). */
declare const PRIM_SCULPT_FLAG_ANIMESH: 32
/** Flag for PRIM_TYPE_SCULPT to render the sculpted prim inside-out by inverting the normals of each polygon. */
declare const PRIM_SCULPT_FLAG_INVERT: 64
/** Flag for PRIM_TYPE_SCULPT to render a mirror-image of the sculpted prim, mirrored across the X-axis. */
declare const PRIM_SCULPT_FLAG_MIRROR: 128
/** Sculpt type option for PRIM_TYPE_SCULPT that stitches the left side to the right to produce a cylinder-shaped sculpted prim. */
declare const PRIM_SCULPT_TYPE_CYLINDER: 4
/** Bitmask used when parsing sculpted prim properties (PRIM_TYPE_SCULPT) from llGetPrimitiveParams to separate the base sculpt type from modifying flags (invert or mirror). */
declare const PRIM_SCULPT_TYPE_MASK: 7
/** Sculpt type option for PRIM_TYPE_SCULPT indicating the object is a uploaded Mesh model. */
declare const PRIM_SCULPT_TYPE_MESH: 5
/** Sculpt type option for PRIM_TYPE_SCULPT that performs no stitching or converging, producing a flat plane-shaped sculpted prim. */
declare const PRIM_SCULPT_TYPE_PLANE: 3
/** Sculpt type option for PRIM_TYPE_SCULPT that stitches the left side to the right and separately converges the top and bottom to produce a sphere-shaped sculpted prim. */
declare const PRIM_SCULPT_TYPE_SPHERE: 1
/** Sculpt type option for PRIM_TYPE_SCULPT that stitches top-to-bottom and left-to-right to produce a torus-shaped sculpted prim. */
declare const PRIM_SCULPT_TYPE_TORUS: 2
/** Sets the highest intensity legacy face shininess setting. */
declare const PRIM_SHINY_HIGH: 3
/** Sets the lowest intensity legacy face shininess setting. */
declare const PRIM_SHINY_LOW: 1
/** Sets a medium intensity legacy face shininess setting. */
declare const PRIM_SHINY_MEDIUM: 2
/** Disables the legacy face shininess setting. */
declare const PRIM_SHINY_NONE: 0
/** Sets the flags on the prim's sit target Flag Description SIT_FLAG_SIT_TARGET 0x1 Read-only flag to indicate whether the link has a sit target. Use llSitTarget, llLinkSitTarget, or PRIM_SIT_TARGET to disable or enable this flag. Use llGetLinkSitFlags, or llGetLinkPrimitiveParams with PRIM_SIT_FLAGS to read this flag. SIT_FLAG_ALLOW_UNSIT 0x2 Allow an avatar to manually unsit from a sit target. Only applies to agents who had been seated via an LSL script. See llSitOnLink. SIT_FLAG_SCRIPTED_ONLY 0x4 Only allow scripted sits on this sit target. SIT_FLAG_NO_COLLIDE 0x10 Disable the avatar's collision volume when they are seated on this sit target. SIT_FLAG_NO_DAMAGE 0x20 Do not distribute damage to agents sitting on this sit target. */
declare const PRIM_SIT_FLAGS: 50
/** The sit target, if any defined for this prim. */
declare const PRIM_SIT_TARGET: 41
/** Sets the prim's size. */
declare const PRIM_SIZE: 7
/** Sets the prim's slice (a shape attribute). */
declare const PRIM_SLICE: 35
/** Sets the prim's specular map attributes. */
declare const PRIM_SPECULAR: 36
/** Sets the object's temporary attribute. */
declare const PRIM_TEMP_ON_REZ: 4
/** Sets the face's texture mode. */
declare const PRIM_TEXGEN: 22
/** Texture mapping mode setting for PRIM_TEXGEN. Specifies that texture repeat units are measured in texture repeats per face. */
declare const PRIM_TEXGEN_DEFAULT: 0
/** Texture mapping mode setting for PRIM_TEXGEN. Specifies that texture repeat units are measured in repeats per half-meter (unlike the in-world editor, which measures in repeats per meter). */
declare const PRIM_TEXGEN_PLANAR: 1
/** Sets the prim's floating text. */
declare const PRIM_TEXT: 26
/** Sets the prim's texture attributes. */
declare const PRIM_TEXTURE: 17
/** Gets the prim shape. [Would you like to know more?][Hide] */
declare const PRIM_TYPE: 9
/** Shape parameter for PRIM_TYPE used to define the prim as a box and configure its shape properties. */
declare const PRIM_TYPE_BOX: 0
/** Shape parameter for PRIM_TYPE used to define the prim as a cylinder and configure its shape properties. */
declare const PRIM_TYPE_CYLINDER: 1
/** Shape parameter for PRIM_TYPE used to define the prim as a prism and configure its shape properties. */
declare const PRIM_TYPE_PRISM: 2
/** Shape parameter for PRIM_TYPE used to define the prim as a ring and configure its shape properties. */
declare const PRIM_TYPE_RING: 6
/** Shape parameter for PRIM_TYPE used to define the prim as a sculpted prim (sculpty) or mesh of a specific type. */
declare const PRIM_TYPE_SCULPT: 7
/** Shape parameter for PRIM_TYPE used to define the prim as a sphere and configure its shape properties. */
declare const PRIM_TYPE_SPHERE: 3
/** Shape parameter for PRIM_TYPE used to define the prim as a torus and configure its shape properties. */
declare const PRIM_TYPE_TORUS: 4
/** Shape parameter for PRIM_TYPE used to define the prim as a tube and configure its shape properties. */
declare const PRIM_TYPE_TUBE: 5
/** Disables script profiling. */
declare const PROFILE_NONE: 0
/** Enables script memory profiling, tracking the maximum amount of memory consumed while it is active. */
declare const PROFILE_SCRIPT_MEMORY: 1
/** Scales the RGBA values by the RGBA values of the destination. */
declare const PSYS_PART_BF_DEST_COLOR: 2
/** PSYS_PART_BF_ONE */
declare const PSYS_PART_BF_ONE: 0
/** Scales the RGBA values by the inverted RGBA values of the destination. */
declare const PSYS_PART_BF_ONE_MINUS_DEST_COLOR: 4
/** Scales the RGBA values by the inverted alpha values of the particle source. */
declare const PSYS_PART_BF_ONE_MINUS_SOURCE_ALPHA: 9
/** Scales the RGBA values by the inverted RGBA values of the particle source. */
declare const PSYS_PART_BF_ONE_MINUS_SOURCE_COLOR: 5
/** Scales the RGBA values by the alpha values of the particle source. */
declare const PSYS_PART_BF_SOURCE_ALPHA: 7
/** Scales the RGBA values by the RGBA values of the particle source. */
declare const PSYS_PART_BF_SOURCE_COLOR: 3
/** Zeros out the source or destination RGBA values. */
declare const PSYS_PART_BF_ZERO: 1
/** Specifies how blending function uses the current framebuffer's color and alpha information to produce the rendered result. Defaults to PSYS_PART_BF_ONE_MINUS_SOURCE_ALPHA. To make particles blend with the background in a less opaque and more luminescent way use PSYS_PART_BF_ONE for dest and the default for source. Most other blending combinations will render the invisible/alpha portion of your particle texture, unless the invisible area of your texture is all black (or, in some cases, unless it is all white). */
declare const PSYS_PART_BLEND_FUNC_DEST: 25
/** Specifies how blending function uses the incoming particle's color and alpha information to produce the rendered result. Defaults to PSYS_PART_BF_SOURCE_ALPHA. */
declare const PSYS_PART_BLEND_FUNC_SOURCE: 24
/** Particle flag causing particles to bounce off a plane at the emitter object's Z height. */
declare const PSYS_PART_BOUNCE_MASK: 4
/** Particle flag that makes particles full-bright and unaffected by global lighting (sunlight). Otherwise, particles are lit by current global lighting or local point lights. */
declare const PSYS_PART_EMISSIVE_MASK: 256
/** Specifies the alpha the particles transition to during their lifetime. Only used if the PSYS_PART_INTERP_COLOR_MASK flag is set. Valid values are the same as PSYS_PART_START_ALPHA. */
declare const PSYS_PART_END_ALPHA: 4
/** A vector specifying the color the particles transition to during their lifetime. Only used if the PSYS_PART_INTERP_COLOR_MASK flag is set. */
declare const PSYS_PART_END_COLOR: 3
/** Specifies the glow that the particles transition to during their lifetime. Valid values are the same as PSYS_PART_START_GLOW. */
declare const PSYS_PART_END_GLOW: 27
/** Specifies the scale or size the particles transition to during their lifetime. Only used if the PSYS_PART_INTERP_SCALE_MASK flag is set. Valid values are the same as PSYS_PART_START_SCALE. */
declare const PSYS_PART_END_SCALE: 6
/** Various flags controlling the behavior of the particle system. The value may be specified as an integer in decimal or hex format, or by ORing together (using the | operator) one or more of the following flag constants: */
declare const PSYS_PART_FLAGS: 0
/** Particle flag causing particle positions to remain relative to the position and movement of the emitter. Enabling this flag disables the PSYS_SRC_BURST_RADIUS rule. */
declare const PSYS_PART_FOLLOW_SRC_MASK: 16
/** Particle flag causing particles to rotate and orient their vertical 'top' toward their direction of movement or emission. Otherwise, they remain vertically oriented with the top of the texture facing up. */
declare const PSYS_PART_FOLLOW_VELOCITY_MASK: 32
/** Particle flag causing the particle's color and alpha to smoothly interpolate from their START values to their END values over its lifetime. */
declare const PSYS_PART_INTERP_COLOR_MASK: 1
/** Particle flag causing the particle's size/scale to transition from its START setting to its END setting over its lifetime. */
declare const PSYS_PART_INTERP_SCALE_MASK: 2
/** Specifies the lifetime of each particle emitted, in seconds. Maximum is 30.0 seconds. During this time, the particle will appear, change appearance and move according to the parameters specified in the other sections, and then disappear. */
declare const PSYS_PART_MAX_AGE: 7
/** Particle flag that joins emitted particles into a continuous ribbon strip. Textures stretch to join adjacent edges. Width is controlled by the 'x' start/end scale; 'y' controls maximum visibility distance. Ribbon segments are not camera-facing, mimic the emitter's Z-axis, and require horizontal movement to render. */
declare const PSYS_PART_RIBBON_MASK: 1024
/** Specifies the alpha of the particles upon emission. Valid values are in the range 0.0 to 1.0. Lower values are more transparent; higher ones are more opaque. */
declare const PSYS_PART_START_ALPHA: 2
/** A vector specifying the color of the particles upon emission. */
declare const PSYS_PART_START_COLOR: 1
/** Specifies the glow of the particles upon emission. Valid values are in the range of 0.0 (no glow) to 1.0 (full glow). */
declare const PSYS_PART_START_GLOW: 26
/** Specifies the scale or size of the particles upon emission. Valid values for each direction are 0.03125 to 4.0, in meters. The actual particle size is always a multiple of 0.03125. Smaller changes don't have any effect. Since particles are essentially 2D sprites, the Z component of the vector is ignored and can be set to 0.0. */
declare const PSYS_PART_START_SCALE: 5
/** Particle flag causing emitted particles to move in a straight, evenly-spaced line toward the PSYS_SRC_TARGET_KEY target. Ignores non-DROP patterns, radius, burst speeds, angles, omega, acceleration, and wind. Combining with bounce while target is below emitter deflects particles upward. */
declare const PSYS_PART_TARGET_LINEAR_MASK: 128
/** Particle flag causing emitted particles to change course and travel toward the target specified by PSYS_SRC_TARGET_KEY during their lifetime. If no valid or reachable target is set, particles target the emitting prim itself. */
declare const PSYS_PART_TARGET_POS_MASK: 64
/** Particle flag that applies wind as a secondary force on the particles, damping their velocity toward the wind velocity. */
declare const PSYS_PART_WIND_MASK: 8
/** Specifies a directional acceleration vector applied to each particle as it is emitted, in meters per second squared. Valid values are 0.0 to 100.0 for each direction both positive and negative, as region coordinates. */
declare const PSYS_SRC_ACCEL: 8
/** Specifies a half angle, in radians, of a circular or spherical "dimple" or conic section (starting from the emitter facing) within which particles will NOT be emitted. Valid values are the same as for PSYS_SRC_ANGLE_END, though the effects are reversed accordingly. If the pattern is PSYS_SRC_PATTERN_ANGLE, the presentation is a 2D flat circular section. If PSYS_SRC_PATTERN_ANGLE_CONE or PSYS_SRC_PATTERN_ANGLE_CONE_EMPTY is used, the presentation is a 3D spherical section. Note that the value of this parameter and PSYS_SRC_ANGLE_END are internally re-ordered such that this parameter gets the smaller of the two values. */
declare const PSYS_SRC_ANGLE_BEGIN: 22
/** Specifies a half angle, in radians, of a circular or spherical "dimple" or conic section (starting from the emitter facing) within which particles WILL be emitted. Valid values are 0.0, which will result in particles being emitted in a straight line in the direction of the emitter facing, to PI, which will result in particles being emitted in a full circular or spherical arc around the emitter, not including the "dimple" or conic section defined by PSYS_SRC_ANGLE_BEGIN. If the pattern is PSYS_SRC_PATTERN_ANGLE, the presentation is a 2D flat circular section. If PSYS_SRC_PATTERN_ANGLE_CONE or PSYS_SRC_PATTERN_ANGLE_CONE_EMPTY is used, the presentation is a 3D spherical section. Note that the value of this parameter and PSYS_SRC_ANGLE_BEGIN are internally re-ordered such that this parameter gets the larger of the two values. */
declare const PSYS_SRC_ANGLE_END: 23
/** Specifies the number of particles emitted in each "burst". */
declare const PSYS_SRC_BURST_PART_COUNT: 15
/** Specifies the distance from the emitter where particles will be created. This rule is ignored when the PSYS_PART_FOLLOW_SRC_MASK flag is set. A test in http://forums-archive.secondlife.com/327/f5/226722/1.html indicates that the maximum value is 50.00 */
declare const PSYS_SRC_BURST_RADIUS: 16
/** Specifies the time interval, in seconds, between "bursts" of particles being emitted. Specifying a value of 0.0 will cause the emission of particles as fast as the viewer can do so. */
declare const PSYS_SRC_BURST_RATE: 13
/** Specifies the maximum value of a random range of values which is selected for each particle in a burst as its initial speed upon emission, in meters per second. Note that the value of this parameter and PSYS_SRC_BURST_SPEED_MIN are internally re-ordered such that this parameter gets the larger of the two values. */
declare const PSYS_SRC_BURST_SPEED_MAX: 18
/** Specifies the minimum value of a random range of values which is selected for each particle in a burst as its initial speed upon emission, in meters per second. Note that the value of this parameter and PSYS_SRC_BURST_SPEED_MAX are internally re-ordered such that this parameter gets the smaller of the two values. */
declare const PSYS_SRC_BURST_SPEED_MIN: 17
/** DEPRECATED: Use PSYS_SRC_ANGLE_BEGIN instead. Works similar to its replacement rule, except the edge of the section is aligned with the emitter facing, rather than its center. */
declare const PSYS_SRC_INNERANGLE: 10
/** Specifies the length of time, in seconds, that the emitter will operate upon coming into view range (if the particle system is already set) or upon execution of this function (if already in view range). Upon expiration, no more particles will be emitted, except as specified above. Zero will give the particle system an infinite duration. (caveat 1) */
declare const PSYS_SRC_MAX_AGE: 19
declare const PSYS_SRC_OBJ_REL_MASK: 1
/** Sets how far to rotate the "pattern" after each particle burst. (Burst frequency is set with PSYS_SRC_BURST_RATE.) Omega values are approximately 'radians per burst' around the prim's global (not local) X, Y, Z axes. For precise and predictable pattern rotation, rotate the prim instead of using PSYS_SRC_OMEGA. Omega has no visible effect on drop, explode and certain specific angle and angle cone patterns, depending on prim orientation. Pattern rotation can be used with prim orientation and llTargetOmega() but won't produce consistent results. (caveat 2 and caveat 3) */
declare const PSYS_SRC_OMEGA: 21
/** DEPRECATED: Use PSYS_SRC_ANGLE_END instead. Works similar to its replacement rule, except the edge of the section is aligned with the emitter facing, rather than the section's center. */
declare const PSYS_SRC_OUTERANGLE: 11
/** Specifies the general emission pattern. */
declare const PSYS_SRC_PATTERN: 9
/** Emission pattern that sprays particles outward in a flat circular, semi-circular, arc, or ray-shaped 2D area (around the prim's local X-axis) as defined by the start/end and inner/outer angle parameters. */
declare const PSYS_SRC_PATTERN_ANGLE: 4
/** Emission pattern that sprays particles outward in a 3D spherical, conical, or ring-shaped area defined by the start/end and inner/outer angle parameters. Can emulate the EXPLODE pattern if angles are set to 0.0 and PI. */
declare const PSYS_SRC_PATTERN_ANGLE_CONE: 8
/** Incomplete emission pattern that behaves identically to the DROP pattern. Intended to invert the ANGLE parameters to define an empty area where particles are not sprayed. */
declare const PSYS_SRC_PATTERN_ANGLE_CONE_EMPTY: 16
/** Emission pattern that drops particles at the source position with no initial velocity. Overrides burst radius, minimum speed, and maximum speed settings to 0.0. */
declare const PSYS_SRC_PATTERN_DROP: 1
/** Emission pattern that shoots particles outward in all directions using the burst parameters. */
declare const PSYS_SRC_PATTERN_EXPLODE: 2
/** Specifies the key of a target object, prim, or agent towards which the particles will change course and move (if PSYS_PART_TARGET_POS_MASK is specified) or will move in a straight line (if PSYS_PART_TARGET_LINEAR_MASK is specified). They will attempt to end up at the geometric center of the target at the end of their lifetime. Requires the PSYS_PART_TARGET_POS_MASK or PSYS_PART_TARGET_LINEAR_MASK flag be set. caveat 4 */
declare const PSYS_SRC_TARGET_KEY: 20
/** Specifies the name of a texture in the emitter prim's inventory to use for each particle. Alternatively, you may specify an asset key UUID for a texture. If using llLinkParticleSystem and texture is not a UUID, texture must be in the emitter prim (not necessarily with the script). */
declare const PSYS_SRC_TEXTURE: 12
/** Integer constant representing the open local chat channel. Passing this to chat functions (llSay, llWhisper, llShout) prints text to the publicly heard chat seen by nearby users and objects. */
declare const PUBLIC_CHANNEL: 0
/** Option for llPursue that selects a random destination near the PURSUIT_OFFSET (range is 0 to 1, where 1 is most random). Requires a non-zero PURSUIT_OFFSET. */
declare const PURSUIT_FUZZ_FACTOR: 3
/** Option for llPursue defining how close (between 0.25m and 10m) the character must be to consider the goal reached. */
declare const PURSUIT_GOAL_TOLERANCE: 5
/** Option for llPursue specifying whether the pathfinding character attempts to predict and intercept the target's future location. */
declare const PURSUIT_INTERCEPT: 4
/** Option for llPursue specifying a constant position offset relative to the target for the character to navigate toward. */
declare const PURSUIT_OFFSET: 1
/** Path update status code triggered when an llEvade character determines it has successfully hidden from its pursuer. */
declare const PU_EVADE_HIDDEN: 7
/** Path update status code triggered when an llEvade character switches from hiding to running. */
declare const PU_EVADE_SPOTTED: 8
/** Path update failure code triggered when a character enters a region where dynamic pathfinding has been disabled in the Region Debug Console. */
declare const PU_FAILURE_DYNAMIC_PATHFINDING_DISABLED: 10
/** Path update failure code triggered when the specified goal is not on the region's navigation mesh (navmesh) and is unreachable. */
declare const PU_FAILURE_INVALID_GOAL: 3
/** Path update failure code triggered when the character is at an unnavigable starting position (e.g., off the navmesh or too high above it). */
declare const PU_FAILURE_INVALID_START: 2
/** Path update fatal error triggered when there is no navmesh generated for the region (typically indicates a server failure). */
declare const PU_FAILURE_NO_NAVMESH: 9
/** Path update failure code triggered when no reachable destinations remain (e.g., all patrol waypoints are blocked). */
declare const PU_FAILURE_NO_VALID_DESTINATION: 6
/** Path update failure code representing an unspecified or general failure. */
declare const PU_FAILURE_OTHER: 1000000
/** Path update failure code triggered when a character is blocked from entering a parcel (e.g., the parcel is full or object entry was disabled after the navmesh was baked). */
declare const PU_FAILURE_PARCEL_UNREACHABLE: 11
/** Path update failure code triggered when an llPursue or llEvade target can no longer be tracked (e.g., they left the region or went more than ~30m outside region boundaries). */
declare const PU_FAILURE_TARGET_GONE: 5
/** Path update failure code triggered when a previously valid goal becomes unreachable (e.g., an obstacle blocks the path). */
declare const PU_FAILURE_UNREACHABLE: 4
/** Path update status code triggered when the character reaches its goal and either stops or chooses a new goal (if wandering). */
declare const PU_GOAL_REACHED: 1
/** Path update status code triggered when the character enters the slowdown distance near its current goal. */
declare const PU_SLOWDOWN_DISTANCE_REACHED: 0
/** 180/PI. Multiply a value in radians by this number to convert it to degrees. */
declare const RAD_TO_DEG: number
/** Raycast error indicating the parcel or agent exceeded the maximum allocated raycast time. Waiting a few frames and retrying will usually succeed as resources replenish. */
declare const RCERR_CAST_TIME_EXCEEDED: -3
/** Raycast error indicating the request failed due to low simulator performance. Wait before retrying, and if possible, reduce scene complexity. */
declare const RCERR_SIM_PERF_LOW: -2
/** Raycast error indicating an unspecified failure. */
declare const RCERR_UNKNOWN: -1
/** Described in the RC_DATA_FLAGS section. */
declare const RC_DATA_FLAGS: 2
/** Set to TRUE (or nonzero) to detect phantom AND volume detect objects. It is not possible to detect only phantom objects or only volume detect objects. If set to TRUE, phantom and volume detect objects will always be detected, even if RC_REJECT_NONPHYSICAL and RC_REJECT_PHYSICAL are set in RC_REJECT_TYPES. */
declare const RC_DETECT_PHANTOM: 1
/** Flag used with llCastRay causing the results stride to include the specific link number that was hit. */
declare const RC_GET_LINK_NUM: 4
/** Flag used with llCastRay causing the results stride to include the surface normal vector of the impact point. */
declare const RC_GET_NORMAL: 1
/** Flag used with llCastRay that returns the key of the hit object's root prim instead of the hit child prim. */
declare const RC_GET_ROOT_KEY: 2
/** Maximum number of hits to return. Maximum value is 256. To avoid performance issues, keep it small. */
declare const RC_MAX_HITS: 3
/** Flag used with llCastRay to prevent the detection of avatars. */
declare const RC_REJECT_AGENTS: 1
/** Flag used with llCastRay to ignore the actual terrain ground (land). */
declare const RC_REJECT_LAND: 8
/** Flag used with llCastRay to ignore non-physical objects. */
declare const RC_REJECT_NONPHYSICAL: 4
/** Flag used with llCastRay to ignore physical objects. */
declare const RC_REJECT_PHYSICAL: 2
/** Mask used to ignore specific types of objects (and avatars). */
declare const RC_REJECT_TYPES: 0
/** Flag used with llGetRegionFlags to check if the region is entirely damage-enabled. */
declare const REGION_FLAG_ALLOW_DAMAGE: 1
/** Flag used with llGetRegionFlags to check if direct teleportation is allowed in the region. */
declare const REGION_FLAG_ALLOW_DIRECT_TELEPORT: 1048576
/** Flag used with llGetRegionFlags to check if flying is blocked/disabled in the region. */
declare const REGION_FLAG_BLOCK_FLY: 524288
declare const REGION_FLAG_BLOCK_FLYOVER: 134217728
/** Flag used with llGetRegionFlags to check if terraforming is disabled in the region. */
declare const REGION_FLAG_BLOCK_TERRAFORM: 64
/** Flag used with llGetRegionFlags to check if collisions have been disabled in the region. */
declare const REGION_FLAG_DISABLE_COLLISIONS: 4096
/** Flag used with llGetRegionFlags to check if physics has been disabled in the region. */
declare const REGION_FLAG_DISABLE_PHYSICS: 16384
/** Flag used with llGetRegionFlags to check if the sun's position is fixed in the region. */
declare const REGION_FLAG_FIXED_SUN: 16
/** Flag used with llGetRegionFlags to check if llPushObject is restricted in the region. */
declare const REGION_FLAG_RESTRICT_PUSHOBJECT: 4194304
/** Flag used with llGetRegionFlags to check if the region is designated as a sandbox. */
declare const REGION_FLAG_SANDBOX: 256
/** @deprecated */
declare const REMOTE_DATA_CHANNEL: 1
/** @deprecated */
declare const REMOTE_DATA_REPLY: 3
/** @deprecated */
declare const REMOTE_DATA_REQUEST: 2
/** Option flag for llPursue defining whether the character requires a physical line-of-sight to chase the target. When active, it will not target positions blocked by solid obstacles. */
declare const REQUIRE_LINE_OF_SIGHT: 2
/** Used with llSetPhysicsMaterial to enable the restitution (bounciness) value (must be between 0.0 and 1.0) which overrides the previous value. */
declare const RESTITUTION: 4
/** Used with texture animation functions to cause the animation to play in reverse (from end to start). */
declare const REVERSE: 4
/** A constant force to apply to the object. If local is TRUE, the force vector is in local coordinates. */
declare const REZ_ACCEL: 5
/** The amount of damage applied to an agent upon collision with this object. */
declare const REZ_DAMAGE: 8
/** The damage type to apply when this prim collides with another object. Can match one of the DAMAGE_TYPE_* constants, be a custom damage type or repurpose the damage field. */
declare const REZ_DAMAGE_TYPE: 12
/** Flags applied to rezzed object when it is created in the world. Flags parameter integer value description REZ_FLAG_TEMP 0x0001 Object is rezzed as temporary. REZ_FLAG_PHYSICAL 0x0002 Object is rezzed as physical. REZ_FLAG_PHANTOM 0x0004 Object is rezzed as phantom REZ_FLAG_DIE_ON_COLLIDE 0x0008 The object will die after its first collision. REZ_FLAG_DIE_ON_NOENTRY 0x0010 Object will die if it attempts to enter a parcel that it can't. REZ_FLAG_NO_COLLIDE_OWNER 0x0020 Object will not trigger a collision event if colliding with its owner.† REZ_FLAG_NO_COLLIDE_FAMILY 0x0040 Object will not trigger collision events when colliding with other object rezzed by the same rezzer.† REZ_FLAG_BLOCK_GRAB_OBJECT 0x0080 Grabbing is disabled for this object. † Disabling collisions only disables collision events and damage. The object will still cause a physics collision and may push the objects. */
declare const REZ_FLAGS: 1
/** Rez flag that disables grabbing on the newly rezzed object. */
declare const REZ_FLAG_BLOCK_GRAB_OBJECT: 128
/** Rez flag causing the object to die/delete after its first collision. */
declare const REZ_FLAG_DIE_ON_COLLIDE: 8
/** Rez flag causing the object to die/delete if it attempts to enter an unauthorized parcel. */
declare const REZ_FLAG_DIE_ON_NOENTRY: 16
/** Rez flag preventing collision events from triggering when colliding with other objects created by the same rezzer. */
declare const REZ_FLAG_NO_COLLIDE_FAMILY: 64
/** Rez flag preventing collision events from triggering when colliding with its owner. */
declare const REZ_FLAG_NO_COLLIDE_OWNER: 32
/** Rez flag causing the object to be created as phantom. */
declare const REZ_FLAG_PHANTOM: 4
/** Rez flag causing the object to be created with physics enabled. */
declare const REZ_FLAG_PHYSICAL: 2
/** Rez flag causing the object to be created as temporary. */
declare const REZ_FLAG_TEMP: 1
/** Prevent the object from spinning on certain axes. Setting the vector's coordinate to non-zero will prevent the object from spinning on that axis. For instance REZ_LOCK_AXES, <1.0, 1.0, 0.0> will allow the object to only rotate around its Z-axis. */
declare const REZ_LOCK_AXES: 11
/** Spin the object around the specified axis. If local is TRUE that axis is in local coordinates, otherwise they are global. */
declare const REZ_OMEGA: 7
/** Start parameter passed into the rezzed object's on_rez(integer) event. */
declare const REZ_PARAM: 0
/** Pass an initialization string to the root prim of the newly rezzed object that may be read with llGetStartString from within the rezzed object. Maximum string length is 1024 bytes. */
declare const REZ_PARAM_STRING: 13
/** Position to rez the new object in the world. If relative is FALSE the position is in region coordinates. If relative is TRUE, the position will be relative to the rezzing object. If at_root is FALSE, the center of the object will be at the position specified by pos(llRezObject). Set at_root to TRUE to set the position of the root prim(llRezAtRoot). */
declare const REZ_POS: 2
/** The initial rotation to apply to the object. If relative is TRUE, the rotation is relative to the rezzing object, otherwise it is absolute. */
declare const REZ_ROT: 3
/** A sound to attach to this object. It will be played at the specified volume. If loop is TRUE the sound will loop continuously for the life of the object. The sound parameter may be either a sound file in the rezzer's inventory or the UUID of a sound asset. */
declare const REZ_SOUND: 9
/** A sound to play upon collision with another object, the ground or an avatar. The sound parameter may be either a sound file in the rezzer's inventory or the UUID of a sound asset. */
declare const REZ_SOUND_COLLIDE: 10
declare const REZ_TORQUE: 6
/** The initial velocity to apply to the object. If local is TRUE the velocity is in the local object coordinate frame, otherwise it is in world coordinates. If inherit is TRUE the object also inherits it's rezzer's velocity. */
declare const REZ_VEL: 4
/** Used with texture animation functions to animate the texture's rotation. Cannot be combined with SCALE. */
declare const ROTATE: 32
/** Used with texture animation functions to animate the texture's scale. Cannot be combined with ROTATE. */
declare const SCALE: 64
/** Identifies scripted in-world objects. In llDetectedType(), indicates the target has at least one active script. In llSensor()/llSensorRepeat() filters, searches for objects containing active scripts that are currently running. */
declare const SCRIPTED: 8
/** Returns the total number of active scripts in the region. */
declare const SIM_STAT_ACTIVE_SCRIPT_COUNT: 12
/** Returns the total number of agents in the region. */
declare const SIM_STAT_AGENT_COUNT: 10
/** Returns the time spent in the 'agent' segment of the simulation frame. */
declare const SIM_STAT_AGENT_MS: 7
/** Returns the number of agent updates per second. */
declare const SIM_STAT_AGENT_UPDATES: 2
/** Returns the time spent on the AI step. */
declare const SIM_STAT_AI_MS: 26
/** Returns the pending asset download count. */
declare const SIM_STAT_ASSET_DOWNLOADS: 15
/** Returns the pending asset upload count. */
declare const SIM_STAT_ASSET_UPLOADS: 16
/** Returns the number of child (neighboring) agents in the region. */
declare const SIM_STAT_CHILD_AGENT_COUNT: 11
/** Returns the total frame time. */
declare const SIM_STAT_FRAME_MS: 3
/** Returns the time spent in the 'image' segment of the simulation frame. */
declare const SIM_STAT_IMAGE_MS: 8
/** Returns the pump IO time. */
declare const SIM_STAT_IO_PUMP_MS: 24
/** Returns the time spent in the 'network' segment of the simulation frame. */
declare const SIM_STAT_NET_MS: 4
/** Returns the time spent in the main simulation 'other' segment of the frame, which encapsulates task, script, and miscellaneous updates. */
declare const SIM_STAT_OTHER_MS: 5
/** Returns the average number of incoming packets per second. */
declare const SIM_STAT_PACKETS_IN: 13
/** Returns the average number of outgoing packets per second. */
declare const SIM_STAT_PACKETS_OUT: 14
/** Returns the percentage of pathfinding characters updated (or skipped) each frame, averaged over the last minute. Corresponds to the 'Characters Updated' stat in the viewer's Statistics Bar. */
declare const SIM_STAT_PCT_CHARS_STEPPED: 0
/** Returns the physics simulation frames per second (FPS). */
declare const SIM_STAT_PHYSICS_FPS: 1
/** Returns the time spent in the 'physics' segment of the simulation frame. */
declare const SIM_STAT_PHYSICS_MS: 6
/** Returns the average update time for the physics 'other' segment. */
declare const SIM_STAT_PHYSICS_OTHER_MS: 20
/** Returns the average update time for the physics 'shape' segment. */
declare const SIM_STAT_PHYSICS_SHAPE_MS: 19
/** Returns the average physics step time. */
declare const SIM_STAT_PHYSICS_STEP_MS: 18
/** Returns the number of script events per second. */
declare const SIM_STAT_SCRIPT_EPS: 21
/** Returns the time spent in the 'script' segment of the simulation frame. */
declare const SIM_STAT_SCRIPT_MS: 9
/** Returns the percentage of scripts run during the frame. */
declare const SIM_STAT_SCRIPT_RUN_PCT: 25
/** Returns the time spent sleeping. */
declare const SIM_STAT_SLEEP_MS: 23
/** Returns the spare time left after the frame. */
declare const SIM_STAT_SPARE_MS: 22
/** Returns the total number of unacknowledged bytes. */
declare const SIM_STAT_UNACKED_BYTES: 17
/** Sit flag indicating that a seated avatar is allowed to manually stand up (unsit) from a sit target. Applies only to agents who were seated via an LSL script like llSitOnLink. */
declare const SIT_FLAG_ALLOW_UNSIT: 2
/** Sit flag that disables the avatar's collision volume/hitbox while seated on this sit target. */
declare const SIT_FLAG_NO_COLLIDE: 16
/** Sit flag that prevents damage from being distributed or forwarded to agents sitting on this sit target. */
declare const SIT_FLAG_NO_DAMAGE: 32
/** Sit flag that restricts sits to script-controlled actions only, preventing avatars from manually sitting on this prim. */
declare const SIT_FLAG_SCRIPTED_ONLY: 4
/** Read-only sit flag indicating whether the prim has an active sit target. Set or cleared using llSitTarget, llLinkSitTarget, or PRIM_SIT_TARGET, and read via llGetLinkSitFlags or PRIM_SIT_FLAGS. */
declare const SIT_FLAG_SIT_TARGET: 1
/** Sit error code indicating that the specified agent/avatar ID could not be found or is invalid. */
declare const SIT_INVALID_AGENT: -4
/** Sit error code indicating that the link ID does not specify a valid prim, is not found, or resolves to multiple prims. */
declare const SIT_INVALID_LINK: -5
/** Sit error code returned when attempting to force an avatar to sit on an invalid target (such as an attachment) that cannot be sat upon. */
declare const SIT_INVALID_OBJECT: -7
/** Sit error code returned if the script is not running within a valid experience, lacks a valid experience key, or the experience is not permitted at the current location. */
declare const SIT_NOT_EXPERIENCE: -1
/** Sit error code indicating that the avatar lacks access to the parcel where the target prim/linkset is located. */
declare const SIT_NO_ACCESS: -6
/** Sit error code indicating that the agent has not granted experience permissions to force sits. */
declare const SIT_NO_EXPERIENCE_PERMISSION: -2
/** Sit error code indicating that no open or available sit target could be found in the linkset. */
declare const SIT_NO_SIT_TARGET: -3
/** Sit error code indicating that the agent was seated successfully. */
declare const SIT_OK: 1
declare const SKY_ABSORPTION_CONFIG: 16
/** The ambient color of the environment. */
declare const SKY_AMBIENT: 0
/** Environmental setting containing the colors used to calculate blue density and blue horizon in the sky. */
declare const SKY_BLUE: 22
/** Environmental cloud information. color: The color used for the clouds. coverage: The coverage percentage. scale: The scaling applied to the cloud textures. variance: A randomizing factor applied to the main cloud layer scroll: The scroll speed of the clouds. X is east/west Y is north/south Z is unused density: The X/Y and D parameter used to generate cloud density detail: The X/Y and D parameter used to generate cloud details. is_default: 1 if the clouds are using the default texture. */
declare const SKY_CLOUDS: 2
/** Environmental setting containing the inventory name or UUID of the texture used for the clouds. */
declare const SKY_CLOUD_TEXTURE: 19
/** Environmental setting representing counts for each density profile type. */
declare const SKY_DENSITY_PROFILE_COUNTS: 3
/** Sky dome information. offset radius maximum altitude */
declare const SKY_DOME: 4
/** The gamma value applied to the scene. In viewer versions 7.0+, this value has been repurposed into the "HDR Scale" value in the EEP editor. (Thus, this will return the value of the HDR Scale slider). */
declare const SKY_GAMMA: 5
/** Glow applied to the sun and moon. size of glow effect focus of glow effect */
declare const SKY_GLOW: 6
/** Environmental setting containing the values used to calculate the light scattering impact of blue density and blue horizon on the scene. */
declare const SKY_HAZE: 23
/** Miscellaneous lighting values light_direction: A unit vector indicating the direction of the dominant light source. fade_color: A color vector representing the current color of the light emitted from the dominant light source (in sRGB space). total_ambient: A color vector representing the current ambient color in use in the scene (in sRGB space). */
declare const SKY_LIGHT: 8
/** Environmental setting for Mie scattering profile parameters. */
declare const SKY_MIE_CONFIG: 17
/** Detailed moon information rot: The current rotation applied to the moon. scale: The current scale applied to the moon's texture brightness: The moon's brightness is_default_texture: 1 if the moon texture is set to the default. 0 otherwise direction: A unit vector pointing at the moon. ambient_color: The ambient color of the moon diffuse_color: The diffuse color applied to the moon. */
declare const SKY_MOON: 9
/** Environmental setting containing the inventory name or UUID of the texture used for the moon. */
declare const SKY_MOON_TEXTURE: 20
/** Planet information used in rendering the sky planet_radius sky_bottom_radius sky_top_radius */
declare const SKY_PLANET: 10
/** Environmental setting for Rayleigh scattering profile parameters. */
declare const SKY_RAYLEIGH_CONFIG: 18
/** Minimum ambiance value for all reflection probes. range = [0.0, 10.0] Caveat: This parameter will be supported in the upcoming GLTF Materials project. Currently it will only work in supported testing areas with a supported test viewer. */
declare const SKY_REFLECTION_PROBE_AMBIANCE: 24
/** Sky refraction parameters for rainbows and optical effects. moisture_level droplet_radius ice_level */
declare const SKY_REFRACTION: 11
/** Environmental setting for the brightness value applied to stars. */
declare const SKY_STAR_BRIGHTNESS: 13
/** Detailed sun information rot: The current rotation applied to the sun. scale: The current scale applied to the sun's texture sun_color: is_default_texture: 1 if the sun texture is set to the default. 0 otherwise direction: A unit vector pointing at the sun. ambient_color: The ambient color of the sun. diffuse_color: The diffuse color applied to the sun. */
declare const SKY_SUN: 14
/** Environmental setting containing the inventory name or UUID of the texture used for the sun. */
declare const SKY_SUN_TEXTURE: 21
/** Checks if the textures are currently set to use the default. For default values, the returned integer is 1. If the texture uses something other than the default, the returned value is 0. */
declare const SKY_TEXTURE_DEFAULTS: 1
/** Altitudes for sky transitions in the region. */
declare const SKY_TRACKS: 15
/** Used with texture animation functions to cause the animation to slide smoothly in the X direction (or transition smoothly in SCALE/ROTATE modes) instead of making instant frame changes. */
declare const SMOOTH: 16
/** Sound playback option that loops the sound continuously on the prim until stopped. */
declare const SOUND_LOOP: 1
/** Sound playback option (default) that plays the sound once, attached to the prim. */
declare const SOUND_PLAY: 0
/** Sound playback option that synchronizes playback to the nearest active sound master (see llLoopSoundMaster). */
declare const SOUND_SYNC: 4
/** Sound playback option that triggers a non-attached sound once at the prim's current location (does not move with the prim). This flag overrides all other sound playback options. */
declare const SOUND_TRIGGER: 2
/**
 * Mathematical constant representing the square root of 2.
 * @deprecated Use 'math.sqrt2' instead. Double precision.
 */
declare const SQRT2: number
/** Status flag (default FALSE) that blocks click-and-drag grab movements on unlinked prims or the root prim of a linkset. Useful for preventing physical objects from being trivially disturbed. */
declare const STATUS_BLOCK_GRAB: 64
/** Status flag that blocks click-and-drag grab movements on all prims across the entire linkset. */
declare const STATUS_BLOCK_GRAB_OBJECT: 1024
/** Status code indicating that one or more arguments passed to the function had a bounds error. */
declare const STATUS_BOUNDS_ERROR: 1002
/**
 * Unused legacy status flag intended to configure an object's ability to cast shadows.
 * @deprecated Not implemented.
 */
declare const STATUS_CAST_SHADOWS: 512
/** Status flag (default TRUE) that causes the object to be deleted (and not returned) if it goes off-world (useful for bullets or rockets). Overridden by STATUS_RETURN_AT_EDGE. */
declare const STATUS_DIE_AT_EDGE: 128
/** Status flag (default FALSE) that causes the object to be deleted if it attempts to enter an unauthorized or full parcel. No-copy objects ignore this setting and remain in-world. */
declare const STATUS_DIE_AT_NO_ENTRY: 2048
/** Status code indicating an internal error occurred. */
declare const STATUS_INTERNAL_ERROR: 1999
/** Status code indicating the function was called with malformed parameters. */
declare const STATUS_MALFORMED_PARAMS: 1000
/** Status code indicating that the specified object or item was not found. */
declare const STATUS_NOT_FOUND: 1003
/** Status code indicating the requested feature is not supported. */
declare const STATUS_NOT_SUPPORTED: 1004
/** Status code indicating the function call completed successfully. */
declare const STATUS_OK: 0
/** Status flag (default FALSE) that makes the entire object phantom/non-colliding when set to TRUE, allowing avatars and objects to pass through it. It is a good idea to use this for most objects that move or rotate, but are non-physical. It is also useful for simulating volumetric lighting. */
declare const STATUS_PHANTOM: 16
/** Status flag (default FALSE) that controls whether the object responds to physical interactions, gravity, and forces. */
declare const STATUS_PHYSICS: 1
/** Status flag causing the object to be returned to its owner when it goes off-world, overriding STATUS_DIE_AT_EDGE. */
declare const STATUS_RETURN_AT_EDGE: 256
/** Status flag (default TRUE) that allows physical rotation on the object's local X-axis. Setting to FALSE prevents physical rotation around the local X-axis. For example, a sit-and-spin device spins around the Z axis (up) but not around the X or Y axes. */
declare const STATUS_ROTATE_X: 2
/** Status flag (default TRUE) that allows physical rotation on the object's local Y-axis. Setting to FALSE prevents physical rotation around the local Y-axis. For example, a sit-and-spin device spins around the Z axis (up) but not around the X or Y axes. */
declare const STATUS_ROTATE_Y: 4
/** Status flag (default TRUE) that allows physical rotation on the object's local Z-axis. Setting to FALSE prevents physical rotation around the local Z-axis. */
declare const STATUS_ROTATE_Z: 8
/** Status flag (default FALSE) that restricts the object's physical movement to within its creation region and a short distance (10 to 20 meters) from its creation point to prevent it from escaping. */
declare const STATUS_SANDBOX: 32
/** Status code indicating that one or more arguments passed to the function had a type mismatch. */
declare const STATUS_TYPE_MISMATCH: 1001
/** Status code indicating a media domain whitelist check has failed. */
declare const STATUS_WHITELIST_FAILED: 2001
/** Trims whitespace off both the beginning and the end of the string. */
declare const STRING_TRIM: 3
/** Trims whitespace/spaces off the beginning of the string. */
declare const STRING_TRIM_HEAD: 1
/** Trims whitespace/spaces off the end of the string. */
declare const STRING_TRIM_TAIL: 2
/** Flag used with llTargetedEmail to send the email message to the owner of the calling object. */
declare const TARGETED_EMAIL_OBJECT_OWNER: 2
/** Flag used with llTargetedEmail to send the email message to the creator of the root object. */
declare const TARGETED_EMAIL_ROOT_CREATOR: 1
/** Terrain parameter used with llSetGroundTexture to set the texture or material (via UUID, inventory name, or default NULL_KEY/empty string) for terrain detail layer 1. */
declare const TERRAIN_DETAIL_1: 0
/** Terrain parameter used with llSetGroundTexture to set the texture or material (via UUID, inventory name, or default NULL_KEY/empty string) for terrain detail layer 2. */
declare const TERRAIN_DETAIL_2: 1
/** Terrain parameter used with llSetGroundTexture to set the texture or material (via UUID, inventory name, or default NULL_KEY/empty string) for terrain detail layer 3. */
declare const TERRAIN_DETAIL_3: 2
/** Terrain parameter used with llSetGroundTexture to set the texture or material (via UUID, inventory name, or default NULL_KEY/empty string) for terrain detail layer 4. */
declare const TERRAIN_DETAIL_4: 3
/** Terrain parameter used with llSetGroundTexture to set the north-east height range for texture blending. Specifies low as the maximum height for texture 1, high as the minimum height for texture 4, and lets textures 2 and 3 mix in between. */
declare const TERRAIN_HEIGHT_RANGE_NE: 7
/** Terrain parameter used with llSetGroundTexture to set the north-west height range for texture blending. Specifies low as the maximum height for texture 1, high as the minimum height for texture 4, and lets textures 2 and 3 mix in between. */
declare const TERRAIN_HEIGHT_RANGE_NW: 6
/** Terrain parameter used with llSetGroundTexture to set the south-east height range for texture blending. Specifies low as the maximum height for texture 1, high as the minimum height for texture 4, and lets textures 2 and 3 mix in between. */
declare const TERRAIN_HEIGHT_RANGE_SE: 5
/** Terrain parameter used with llSetGroundTexture to set the south-west height range for texture blending. Specifies low as the maximum height for texture 1, high as the minimum height for texture 4, and lets textures 2 and 3 mix in between. */
declare const TERRAIN_HEIGHT_RANGE_SW: 4
/** Terrain parameter used with llSetGroundTexture to set the UV offset vector (ignoring the Z component) for drawing terrain layer 1. Only works for PBR textures. */
declare const TERRAIN_PBR_OFFSET_1: 16
/** Terrain parameter used with llSetGroundTexture to set the UV offset vector (ignoring the Z component) for drawing terrain layer 2. Only works for PBR textures. */
declare const TERRAIN_PBR_OFFSET_2: 17
/** Terrain parameter used with llSetGroundTexture to set the UV offset vector (ignoring the Z component) for drawing terrain layer 3. Only works for PBR textures. */
declare const TERRAIN_PBR_OFFSET_3: 18
/** Terrain parameter used with llSetGroundTexture to set the UV offset vector (ignoring the Z component) for drawing terrain layer 4. Only works for PBR textures. */
declare const TERRAIN_PBR_OFFSET_4: 19
/** Terrain parameter used with llSetGroundTexture to set the rotation of the PBR texture for layer 1, in radians. Only works for PBR textures. */
declare const TERRAIN_PBR_ROTATION_1: 12
/** Terrain parameter used with llSetGroundTexture to set the rotation of the PBR texture for layer 2, in radians. Only works for PBR textures. */
declare const TERRAIN_PBR_ROTATION_2: 13
/** Terrain parameter used with llSetGroundTexture to set the rotation of the PBR texture for layer 3, in radians. Only works for PBR textures. */
declare const TERRAIN_PBR_ROTATION_3: 14
/** Terrain parameter used with llSetGroundTexture to set the rotation of the PBR texture for layer 4, in radians. Only works for PBR textures. */
declare const TERRAIN_PBR_ROTATION_4: 15
/** Terrain parameter used with llSetGroundTexture to set the UV scale vector (repeats per meter, ignoring the Z component) for terrain layer 1. Only works for PBR textures. */
declare const TERRAIN_PBR_SCALE_1: 8
/** Terrain parameter used with llSetGroundTexture to set the UV scale vector (repeats per meter, ignoring the Z component) for terrain layer 2. Only works for PBR textures. */
declare const TERRAIN_PBR_SCALE_2: 9
/** Terrain parameter used with llSetGroundTexture to set the UV scale vector (repeats per meter, ignoring the Z component) for terrain layer 3. Only works for PBR textures. */
declare const TERRAIN_PBR_SCALE_3: 10
/** Terrain parameter used with llSetGroundTexture to set the UV scale vector (repeats per meter, ignoring the Z component) for terrain layer 4. Only works for PBR textures. */
declare const TERRAIN_PBR_SCALE_4: 11
/** Asset UUID representing the default 'Blank' texture. */
declare const TEXTURE_BLANK: UUID
declare const TEXTURE_DEFAULT: UUID
/** Asset UUID representing the default 'Default Media' texture. */
declare const TEXTURE_MEDIA: UUID
/** Asset UUID representing the default 'Plywood' texture. */
declare const TEXTURE_PLYWOOD: UUID
/** Asset UUID representing the '*Default Transparent Texture' in the library (included with viewers). */
declare const TEXTURE_TRANSPARENT: UUID
/** Value returned by llDetectedTouchFace when the touch position is not valid. */
declare const TOUCH_INVALID_FACE: -1
/** Value returned by llDetectedTouchUV and llDetectedTouchST when the touch position is not valid. */
declare const TOUCH_INVALID_TEXCOORD: Vector
/** Value returned by llDetectedTouchPos, llDetectedTouchNormal, and llDetectedTouchBinormal when the touch position is not valid. */
declare const TOUCH_INVALID_VECTOR: Vector
/** Teleport routing setting indicating that direct teleporting is blocked on the parcel. */
declare const TP_ROUTING_BLOCKED: 0
/** Teleport routing setting indicating that teleports are unrestricted on the parcel. */
declare const TP_ROUTING_FREE: 2
/** Teleport routing setting indicating that teleports are routed to the parcel's landing point (if one has been set). */
declare const TP_ROUTING_LANDINGP: 1
/** Inventory transfer error code indicating that an invalid option was passed in the options list. */
declare const TRANSFER_BAD_OPTS: -1
/** Inventory transfer error code indicating that the root path specified in TRANSFER_DEST was invalid or resolved to nothing. */
declare const TRANSFER_BAD_ROOT: -5
/** Inventory option specifying the destination root folder to transfer inventory into. */
declare const TRANSFER_DEST: 0
/** Inventory parameter specifying flags to control the behavior of inventory transfers. */
declare const TRANSFER_FLAGS: 1
/** Inventory transfer flag that copies the transferred object and places it in the recipient's inventory (implies TRANSFER_FLAG_TAKE). */
declare const TRANSFER_FLAG_COPY: 4
/** Inventory transfer flag reserved for future expansion; do not use. */
declare const TRANSFER_FLAG_RESERVED: 1
/** Inventory transfer flag that automatically removes the object from the world and places it in the recipient's inventory once accepted. */
declare const TRANSFER_FLAG_TAKE: 2
/** Inventory transfer error code indicating ownership of an attached object cannot be transferred. */
declare const TRANSFER_NO_ATTACHMENT: -7
/** Inventory transfer error code indicating that the list was empty or contained only non-transferable items. */
declare const TRANSFER_NO_ITEMS: -4
/** Inventory transfer error code indicating the object lacks transfer permissions. */
declare const TRANSFER_NO_PERMS: -6
/** Inventory transfer error code indicating the receiving agent could not be found in the current region. */
declare const TRANSFER_NO_TARGET: -2
/** Status code indicating that the inventory transfer was successful or the transfer offer was successfully made. */
declare const TRANSFER_OK: 0
/** Inventory transfer error code indicating that the transfer rate has exceeded the inventory transfer throttle. */
declare const TRANSFER_THROTTLE: -3
/** Pathfinding parameter specifying the character's movement traversal type. Expects TRAVERSAL_TYPE_SLOW (default), _FAST, or _NONE. */
declare const TRAVERSAL_TYPE: 7
declare const TRAVERSAL_TYPE_FAST: 1
declare const TRAVERSAL_TYPE_NONE: 2
declare const TRAVERSAL_TYPE_SLOW: 0
/**
 * Mathematical constant pi*2, representing the number of radians in a full circle.
 * @deprecated Use 'math.tau' instead. Double precision.
 */
declare const TWO_PI: number
/**
 * Variable type constant indicating the list entry or value is a float.
 * @deprecated Use '"number"' instead.
 */
declare const TYPE_FLOAT: 2
/**
 * Variable type constant indicating the list entry or value is an integer.
 * @deprecated Use '"number"' instead.
 */
declare const TYPE_INTEGER: 1
/**
 * Variable type constant indicating the list entry or value is invalid.
 * @deprecated Use 'nil' instead.
 */
declare const TYPE_INVALID: 0
/**
 * Variable type constant indicating the list entry or value is a key.
 * @deprecated Use '"uuid"' instead.
 */
declare const TYPE_KEY: 4
/**
 * Variable type constant indicating the list entry or value is a rotation.
 * @deprecated Use '"quaternion"' instead.
 */
declare const TYPE_ROTATION: 6
/**
 * Variable type constant indicating the list entry or value is a string.
 * @deprecated Use '"string"' instead.
 */
declare const TYPE_STRING: 3
/**
 * Variable type constant indicating the list entry or value is a vector.
 * @deprecated Use '"vector"' instead.
 */
declare const TYPE_VECTOR: 5
declare const URL_REQUEST_DENIED: string
declare const URL_REQUEST_GRANTED: string
/** Vehicle float parameter (range 0.0 to 1.0) acting as a scalar to modulate the strength of angular deflection, reorienting the vehicle's preferred axis toward its true velocity. */
declare const VEHICLE_ANGULAR_DEFLECTION_EFFICIENCY: 32
/** Vehicle float parameter specifying the exponential timescale for the vehicle to achieve full angular deflection, reorienting its preferred axis of motion to match its true velocity. */
declare const VEHICLE_ANGULAR_DEFLECTION_TIMESCALE: 33
/** Vehicle vector parameter specifying the timescales (range [0.07, infinity) seconds per axis) for the exponential decay of angular velocity about the vehicle's preferred axes (at, left, up). */
declare const VEHICLE_ANGULAR_FRICTION_TIMESCALE: 17
/** Vehicle float parameter specifying the exponential timescale (in seconds) for the angular motor's magnitude and effectiveness to decay toward zero. */
declare const VEHICLE_ANGULAR_MOTOR_DECAY_TIMESCALE: 35
/** Vehicle vector parameter specifying the direction and magnitude of the angular velocity (in radians per second) that the vehicle's angular motor attempts to achieve. */
declare const VEHICLE_ANGULAR_MOTOR_DIRECTION: 19
/** Vehicle float parameter specifying the exponential timescale for the vehicle's angular motor to achieve full power and velocity. */
declare const VEHICLE_ANGULAR_MOTOR_TIMESCALE: 34
/** Vehicle float parameter (range -1.0 to 1.0) controlling banking efficiency, where negative values lean out of turns and positive values lean into turns. This parameter makes banking affect steering; use angular motors to bank. 0.0 means no banking. */
declare const VEHICLE_BANKING_EFFICIENCY: 38
/** Vehicle float parameter (range 0.0 (static) to 1.0) (dynamic) controlling the mix between static banking (scales only with roll angle) and dynamic banking (additionally scales with linear speed). */
declare const VEHICLE_BANKING_MIX: 39
/** Vehicle float parameter specifying the exponential timescale for the banking behavior to take full effect. This is another way to scale the strength of the banking effect, however it affects the term that is proportional to the difference between what the banking behavior is trying to do, and what the vehicle is actually doing. */
declare const VEHICLE_BANKING_TIMESCALE: 40
/** Vehicle float parameter (range -1.0 to 1.0) defining buoyancy, where -1.0 represents double gravity and 1.0 represents full anti-gravity. */
declare const VEHICLE_BUOYANCY: 27
/** Vehicle flag that prevents attachments worn by passengers from pushing the vehicle via llPushObject or other scripting functions. */
declare const VEHICLE_FLAG_BLOCK_INTERFERENCE: 1024
/** Vehicle flag used with mouselook steering/banking. When set, the passenger's mouselook camera rotates independently of the vehicle's orientation. */
declare const VEHICLE_FLAG_CAMERA_DECOUPLED: 512
/** Vehicle flag that forces the hover behavior to maintain a global height rather than hovering relative to the ground or water. */
declare const VEHICLE_FLAG_HOVER_GLOBAL_HEIGHT: 16
/** Vehicle flag that forces the hover behavior to ignore water height and hover exclusively relative to the terrain/land. */
declare const VEHICLE_FLAG_HOVER_TERRAIN_ONLY: 8
/** Vehicle flag preventing hover from pushing downward, allowing hovering vehicles to jump or fly above their designated hover height. */
declare const VEHICLE_FLAG_HOVER_UP_ONLY: 32
/** Vehicle flag that forces the hover behavior to ignore terrain height and hover exclusively relative to water. */
declare const VEHICLE_FLAG_HOVER_WATER_ONLY: 4
/** Vehicle flag that prevents ground vehicles from motoring upward into the sky. When combined with banking, banking strength decays when the vehicle is airborne (no longer colliding) to prevent steering mid-jump. */
declare const VEHICLE_FLAG_LIMIT_MOTOR_UP: 64
/** Vehicle flag for vehicles with a vertical attractor that need to climb or dive, allowing airplanes to use the banking feature. */
declare const VEHICLE_FLAG_LIMIT_ROLL_ONLY: 2
/** Vehicle flag that enables mouselook control, remapping left-right camera motions (yaw) to rotations about the vehicle's local X-axis. */
declare const VEHICLE_FLAG_MOUSELOOK_BANK: 256
/** Vehicle flag that enables steering via mouse, directing the angular motor to align the vehicle's local X-axis with the direction of the client-side camera. */
declare const VEHICLE_FLAG_MOUSELOOK_STEER: 128
/** Vehicle flag that prevents linear deflection parallel to the world Z-axis, preventing ground vehicles (such as bumper cars) from climbing into the sky. */
declare const VEHICLE_FLAG_NO_DEFLECTION_UP: 1
/**
 * Obsolete legacy name for VEHICLE_FLAG_NO_DEFLECTION_UP.
 * @deprecated Use 'VEHICLE_FLAG_NO_DEFLECTION_UP' instead.
 */
declare const VEHICLE_FLAG_NO_FLY_UP: 1
/** Vehicle float parameter (range 0.0 to 1.0) controlling hover damping, where 0.0 is bouncy and 1.0 is critically damped. */
declare const VEHICLE_HOVER_EFFICIENCY: 25
/** Vehicle float parameter specifying the height at which the vehicle attempts to hover. Set to 0.0 to disable hover. */
declare const VEHICLE_HOVER_HEIGHT: 24
/** Vehicle float parameter specifying the timescale (period of time in seconds) for the vehicle to achieve its hover height. */
declare const VEHICLE_HOVER_TIMESCALE: 26
/** Vehicle float parameter (range 0.0 to 1.0) modulating the efficiency and strength of linear deflection. That is, its a simple scalar for modulating the strength of linear deflection. */
declare const VEHICLE_LINEAR_DEFLECTION_EFFICIENCY: 28
/** Vehicle float parameter specifying the exponential timescale for the vehicle to redirect its linear velocity along its preferred X-axis. It is another way to specify how much time it takes for the vehicle's linear velocity to be redirected to its preferred axis of motion. */
declare const VEHICLE_LINEAR_DEFLECTION_TIMESCALE: 29
/** Vehicle vector parameter specifying the timescales (range [0.07, infinity) seconds per axis) for the exponential decay of linear velocity along the vehicle's preferred axes (at, left, up). */
declare const VEHICLE_LINEAR_FRICTION_TIMESCALE: 16
/** Vehicle float parameter specifying the exponential timescale (in seconds) for the linear motor's magnitude and effectiveness to decay toward zero. */
declare const VEHICLE_LINEAR_MOTOR_DECAY_TIMESCALE: 31
/** Vehicle vector parameter specifying the direction and magnitude of the linear velocity (range [0, 30] m/s) that the vehicle's linear motor attempts to achieve. */
declare const VEHICLE_LINEAR_MOTOR_DIRECTION: 18
/** Vehicle vector parameter specifying the offset from the vehicle's center of mass where the linear motor force is applied. */
declare const VEHICLE_LINEAR_MOTOR_OFFSET: 20
/** Vehicle float parameter specifying the exponential timescale for the vehicle to reach its full linear motor velocity. */
declare const VEHICLE_LINEAR_MOTOR_TIMESCALE: 30
/** Vehicle rotation parameter setting the orientation of the vehicle's preferred axes of motion (at, left, up) relative to its local geometric frame (x, y, z). */
declare const VEHICLE_REFERENCE_FRAME: 44
/** Vehicle type constant for aircraft that use linear deflection for lift, banking to turn, and no hover. */
declare const VEHICLE_TYPE_AIRPLANE: 4
/** Vehicle type constant for balloons that use hover and friction but no deflection. */
declare const VEHICLE_TYPE_BALLOON: 5
/** Vehicle type constant for boats that hover over water with high friction and minor angular deflection. */
declare const VEHICLE_TYPE_BOAT: 3
/** Vehicle type constant for land vehicles that bounce along the ground and rely on external controls or timer events to drive their motors. */
declare const VEHICLE_TYPE_CAR: 2
/** Constant used to disable and turn off vehicle physics support on the object. */
declare const VEHICLE_TYPE_NONE: 0
/** Vehicle type constant for sliding vehicles that bump along the ground and prefer to move along their local X-axis. */
declare const VEHICLE_TYPE_SLED: 1
/** Vehicle float parameter (range 0.0 to 1.0) controlling vertical attraction stability (0.0 is wobbly/bouncy, 1.0 is critically damped/firm) to keep the vehicle upright. */
declare const VEHICLE_VERTICAL_ATTRACTION_EFFICIENCY: 36
/** Vehicle float parameter specifying the exponential timescale (in seconds) for the vehicle to rotate and align its local Z-axis (up) with the world Z-axis (vertical). */
declare const VEHICLE_VERTICAL_ATTRACTION_TIMESCALE: 37
/** Constant indicating that the collision capsule orientation for a pathfinding character is vertical. */
declare const VERTICAL: 0
/** Option parameter for llWanderWithin specifying whether the character should pause briefly after reaching each wander waypoint. */
declare const WANDER_PAUSE_AT_WAYPOINTS: 0
/** Multiplier applied to blur the scene when under water. */
declare const WATER_BLUR_MULTIPLIER: 100
/** Fog parameters applied when underwater color: The color of the underwater fog density: Density exponent applied to the fog modulation: */
declare const WATER_FOG: 101
/** Fresnel scattering applied to the surface of the water. offset scale */
declare const WATER_FRESNEL: 102
/** Scaling applied to the water normal map. */
declare const WATER_NORMAL_SCALE: 104
/** Environmental setting containing the inventory name or UUID of the normal map texture used for water waves. */
declare const WATER_NORMAL_TEXTURE: 107
/** Refraction factors when looking through the surface of the water. scale_above scale_below */
declare const WATER_REFRACTION: 105
/** Checks if the textures are currently set to use the default. For default values the returned integer is 1, if the texture uses something other than the default this value is 0. */
declare const WATER_TEXTURE_DEFAULTS: 103
/** Vector for the directions of the waves Y represents north/south and X represents movement east/west. large_wave: Large wave speed and direction. small_wave: Small wave speed and direction. */
declare const WATER_WAVE_DIRECTION: 106
/** Region currently has experiences disabled. */
declare const XP_ERROR_EXPERIENCES_DISABLED: 2
/** Experience owner has temporarily disabled the experience. */
declare const XP_ERROR_EXPERIENCE_DISABLED: 8
/** Experience has been suspended by Linden Lab customer support. */
declare const XP_ERROR_EXPERIENCE_SUSPENDED: 9
/** Script is associated with an experience that no longer exists. */
declare const XP_ERROR_INVALID_EXPERIENCE: 7
/** One of the string arguments was too big to fit in the key-value store. */
declare const XP_ERROR_INVALID_PARAMETERS: 3
/** Requested key does not exist. */
declare const XP_ERROR_KEY_NOT_FOUND: 14
/** Content rating of the experience exceeds that of the region. */
declare const XP_ERROR_MATURITY_EXCEEDED: 16
/** No error was detected. */
declare const XP_ERROR_NONE: 0
/** Sim was unable to verify the validity of the experience. Retrying after a short wait is advised. */
declare const XP_ERROR_NOT_FOUND: 6
/** This experience is not allowed to run by the requested agent, or experience permissions were denied by the user. */
declare const XP_ERROR_NOT_PERMITTED: 4
/** Experience is blocked or not enabled for this land, or is not allowed to run in the current region. */
declare const XP_ERROR_NOT_PERMITTED_LAND: 17
/** This script is not associated with an experience. */
declare const XP_ERROR_NO_EXPERIENCE: 5
/** An attempt to write data to the key-value store failed due to the data quota being met. */
declare const XP_ERROR_QUOTA_EXCEEDED: 11
/** Request for experience permissions was ignored and the request timed out without modification. */
declare const XP_ERROR_REQUEST_PERM_TIMEOUT: 18
/** A checked update failed due to an out of date request. */
declare const XP_ERROR_RETRY_UPDATE: 15
/** Unable to communicate with the key-value store, or attempted to create a key that already exists. */
declare const XP_ERROR_STORAGE_EXCEPTION: 13
/** Key-value store is currently disabled on this region. */
declare const XP_ERROR_STORE_DISABLED: 12
/** Call failed due to too many recent calls. */
declare const XP_ERROR_THROTTLED: 1
/** An unknown error occurred that is not covered by any of the other predetermined error states. */
declare const XP_ERROR_UNKNOWN_ERROR: 10
/** A rotation constant representing an identity rotation (causes no change). This is the default value for rotation variables. */
declare const ZERO_ROTATION: Quaternion
/** A vector constant representing <0.0, 0.0, 0.0>. This is the default value for vector variables. */
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
    texture: string | "",
    repeats: Vector | "",
    offsets: Vector | "",
    rotationInRadians: number | "",
    linearColor: Vector | "",
    alpha: number | "",
    gltfAlphaMode: number | "",
    alphaMaskCutoff: number | "",
    doubleSided: number | "",
  ]
  [PRIM_GLTF_NORMAL]: [
    face: number,
    texture: string | "",
    repeats: Vector | "",
    offsets: Vector | "",
    rotationInRadians: number | "",
  ]
  [PRIM_GLTF_METALLIC_ROUGHNESS]: [
    face: number,
    texture: string | "",
    repeats: Vector | "",
    offsets: Vector | "",
    rotationInRadians: number | "",
    metallicFactor: number | "",
    roughnessFactor: number | "",
  ]
  [PRIM_GLTF_EMISSIVE]: [
    face: number,
    texture: string | "",
    repeats: Vector | "",
    offsets: Vector | "",
    rotationInRadians: number | "",
    linearEmissiveTint: Vector | "",
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
    texture: string | "",
    repeats: Vector | "",
    offsets: Vector | "",
    rotationInRadians: number | "",
    linearColor: Vector | "",
    alpha: number | "",
    gltfAlphaMode: number | "",
    alphaMaskCutoff: number | "",
    doubleSided: number | "",
  ): PrimParamBuilder
  gltfNormal(
    face: number,
    texture: string | "",
    repeats: Vector | "",
    offsets: Vector | "",
    rotationInRadians: number | "",
  ): PrimParamBuilder
  gltfMetallicRoughness(
    face: number,
    texture: string | "",
    repeats: Vector | "",
    offsets: Vector | "",
    rotationInRadians: number | "",
    metallicFactor: number | "",
    roughnessFactor: number | "",
  ): PrimParamBuilder
  gltfEmissive(
    face: number,
    texture: string | "",
    repeats: Vector | "",
    offsets: Vector | "",
    rotationInRadians: number | "",
    linearEmissiveTint: Vector | "",
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

declare function $setPrimParams(linkNumber: number): PrimParamBuilder

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

declare function $particleSystem(): ParticleSystemParamBuilder

declare function $linkParticleSystem(linkNumber: number): ParticleSystemParamBuilder

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

declare function $setCameraParams(): CameraParamBuilder

/** Options object for $httpRequest. All properties are optional. */
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

declare function $httpRequest(url: string, options: HttpParamOptions): UUID

/** Options object for $castRay. All properties are optional. */
interface CastRayParamOptions {
  rejectTypes?: number
  dataFlags?: number
  maxHits?: number
  detectPhantom?: number
}

declare function $castRay<const Opts extends CastRayParamOptions>(
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

declare function $createCharacter(): CharacterParamBuilder

declare function $updateCharacter(): CharacterParamBuilder

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

declare function $setGltfOverrides(link: number, face: number): GltfOverrideParamBuilder

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

declare function $rezObjectWithParams(inventoryItem: string): RezParamBuilder
