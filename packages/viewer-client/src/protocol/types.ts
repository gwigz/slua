/**
 * Wire types for the viewer's external script editor JSON-RPC server
 * (`llscripteditorws`, localhost:9020).
 *
 * The spec lives in the viewer repo at `doc/external-editor-json-rpc.md`, but
 * where the spec and the shipped C++ disagree, these follow the implementation
 * (and `sl-vscode-plugin`, which is written against it).
 */

// Session

export interface SessionHandshake {
  server_version: string
  protocol_version: string
  viewer_name: string
  viewer_version: string
  agent_id: string
  agent_name: string
  /** Path to a temp file holding a UUID. Read it, echo the contents verbatim. */
  challenge?: string
  languages: string[]
  syntax_id: string
  features: Record<string, boolean>
}

export interface SessionHandshakeResponse {
  client_name: string
  client_version: string
  protocol_version: string
  challenge_response?: string
  languages: string[]
  features: Record<string, boolean>
  script_name?: string
  script_language?: string
}

/** `SessionDisconnect.reason` values, from `llscripteditorws.h`. */
export const DisconnectReason = {
  Normal: 0,
  EditorClosed: 1,
  ProtocolError: 2,
  Timeout: 3,
  InternalError: 4,
} as const

export type DisconnectReasonCode = (typeof DisconnectReason)[keyof typeof DisconnectReason]

export interface SessionDisconnect {
  reason: number
  message: string
}

export interface SessionPing {
  timestamp: number
}

export interface SessionPingResponse {
  timestamp: number
  server_time: number
}

// Inventory and objects

export type InventoryItemType = "script" | "notecard"

export type ScriptVM = "lsl2" | "mono" | "luau"

/** Permission mask bits. Only owner and next_owner are transmitted. */
export const Permission = {
  Transfer: 0x2000,
  Modify: 0x4000,
  Copy: 0x8000,
} as const

export interface ItemPermissions {
  owner: number
  next_owner: number
}

export interface ObjectInventoryItem {
  item_id: string
  /** Display name, without any file extension. */
  name: string
  description?: string
  type: InventoryItemType
  /** Scripts only: 0 = LSL, 1 = Luau. */
  subtype?: number
  vm?: ScriptVM
  running?: boolean
  faulted?: boolean
  permissions?: ItemPermissions
  creator_id?: string
}

export interface LinkedObject {
  link_id: string
  /** Root is 1, children are >= 2. */
  link_number: number
  link_name: string
  link_description?: string
  inventory: ObjectInventoryItem[]
}

export interface ObjectPermissions {
  owner: number
  next_owner: number
}

export interface PublishedObject {
  object_id: string
  object_name: string
  object_description?: string
  region?: string
  owner_id?: string
  permissions?: ObjectPermissions
  can_save_back?: boolean
  inventory: ObjectInventoryItem[]
  linked_objects?: LinkedObject[]
}

// Object notifications

export interface ObjectPublishMessage {
  object: PublishedObject
}

export interface ObjectUnpublishMessage {
  object_id: string
  reason?: string
}

export interface InventoryChanges {
  added?: ObjectInventoryItem[]
  removed?: string[]
  modified?: ObjectInventoryItem[]
  content_changed?: string[]
  running_changed?: { item_id: string; running: boolean }[]
}

export interface LinkedObjectChanges {
  added?: LinkedObject[]
  removed?: string[]
  modified?: {
    link_id: string
    link_name?: string
    /** Either a delta or a full replacement array. */
    inventory?: InventoryChanges | ObjectInventoryItem[]
  }[]
}

export interface ObjectUpdateMessage {
  object_id: string
  object_name?: string
  inventory?: ObjectInventoryItem[]
  linked_objects?: LinkedObject[]
  /** Takes precedence over the full-replacement fields when present. */
  changes?: {
    inventory?: InventoryChanges
    linked_objects?: LinkedObjectChanges
  }
}

// Object calls

export interface ObjectListResponse {
  objects: PublishedObject[]
}

export interface ObjectRequestParams {
  object_id: string
}

/**
 * Newer viewers answer with the object inline; older ones answer
 * `{ success: true }` and follow up with an `object.publish` notification.
 */
export interface ObjectRequestResponse {
  object?: PublishedObject
  success?: boolean
  message?: string
}

export interface ObjectUnpublishParams {
  object_id: string
}

export interface ObjectUnpublishResponse {
  success: boolean
  object_id?: string
}

export interface ObjectContentGetParams {
  prim_id: string
  item_id: string
}

export interface ObjectContentGetResponse {
  success: boolean
  prim_id: string
  item_id: string
  content: string
  encoding?: "utf-8" | "base64"
}

export interface ObjectContentSaveParams {
  prim_id: string
  item_id: string
  content: string
  vm?: ScriptVM
  running?: boolean
}

export interface ObjectContentSaveResponse {
  success: boolean
  prim_id?: string
  item_id?: string
  compiled?: boolean
  /** Raw compiler output lines. Parse with `parseCompileErrors`. */
  errors?: string[]
  message?: string
}

export interface ObjectItemCreateParams {
  prim_id: string
  name: string
  type: InventoryItemType
  vm?: ScriptVM
  text?: string
}

export interface ObjectItemCreateResponse extends ObjectInventoryItem {
  prim_id: string
}

export interface ObjectItemDeleteParams {
  prim_id: string
  item_id: string
}

export interface ObjectItemDeleteResponse {
  success: boolean
  prim_id: string
  item_id: string
}

export interface ObjectScriptSetRunningParams {
  prim_id: string
  item_id: string
  running: boolean
}

export interface ObjectScriptResetParams {
  prim_id: string
  item_id: string
}

export interface SimpleSuccessResponse {
  success: boolean
  message?: string
}

export interface ObjectModifyParams {
  prim_id: string
  name?: string
  description?: string
  permissions?: { next_owner?: number }
}

export interface ObjectModifyResponse {
  success: boolean
  prim_id: string
  message?: string
}

export interface ObjectItemModifyParams extends ObjectModifyParams {
  item_id: string
}

export interface ObjectItemModifyResponse extends ObjectModifyResponse {
  item_id: string
}

// Scripts

export interface ScriptSubscribeParams {
  script_id: string
  script_name: string
  script_language: string
}

/** `ScriptSubscribeResponse.status` values, from `llscripteditorws.h`. */
export const SubscribeStatus = {
  Success: 0,
  InvalidEditor: 1,
  InvalidSubscription: 2,
  AlreadySubscribed: 3,
  InternalError: 4,
} as const

export interface ScriptSubscribeResponse {
  script_id: string
  success: boolean
  status: number
  object_id?: string
  item_id?: string
  message?: string
}

export interface ScriptUnsubscribeMessage {
  script_id: string
}

export interface ScriptListResponse {
  temp_dir: string
  script_ids: string[]
  success: boolean
}

// Compilation and runtime

export interface CompilationError {
  /** 1-based. */
  row: number
  /** 1-based for LSL, always 0 for Luau (the compiler gives no column). */
  column: number
  level: string
  message: string
  format?: "lsl"
}

export interface CompilationResult {
  script_id: string
  success: boolean
  running: boolean
  errors?: CompilationError[]
}

export interface RuntimeDebug {
  /** Empty string when the message came from a published object rather than a subscription. */
  script_id: string
  object_id: string
  object_name: string
  message: string
}

export interface RuntimeError extends RuntimeDebug {
  /** Currently always "" — the viewer does not yet composite the error text. */
  error: string
  /** Currently always 0, for the same reason. */
  line: number
  stack?: string[]
}

// Language and syntax

export type SyntaxKind = "defs.lsl" | "defs.lua"

export interface SyntaxIdResponse {
  id: string
}

export interface SyntaxChangeMessage {
  id: string
}

export interface LanguageInfo {
  id: string
  defs?: unknown
  success: boolean
  error?: string
}

export interface SyntaxCacheListResponse {
  files: string[]
  success: boolean
}

export interface SyntaxCacheGetParams {
  filename: string
  as_json?: boolean
}

export interface SyntaxCacheFileResponse {
  content?: string | Record<string, unknown>
  success: boolean
  error?: string
}

// Commands

/** `command.execute` failure codes, from `llscripteditorws.h`. */
export const CommandError = {
  UnknownCommand: 1,
  InvalidParams: 2,
  NotPermitted: 3,
  ExecutionError: 4,
} as const

export interface CommandExecuteParams {
  command: string
  params?: Record<string, unknown>
}

export interface CommandExecuteResponse {
  success: boolean
  result?: unknown
  error_code?: number
  message?: string
}

export interface CommandParamInfo {
  type: "string" | "number" | "boolean" | "object" | "array"
  required?: boolean
  description?: string
}

export interface CommandInfo {
  command: string
  description?: string
  params?: Record<string, CommandParamInfo>
}

export interface CommandListResponse {
  commands: CommandInfo[]
}

/** Notifications the viewer sends us. */
export interface ViewerEvents {
  "session.ok": void
  "session.disconnect": SessionDisconnect
  "language.syntax.change": SyntaxChangeMessage
  "script.unsubscribe": ScriptUnsubscribeMessage
  "script.compiled": CompilationResult
  "runtime.debug": RuntimeDebug
  "runtime.error": RuntimeError
  "object.publish": ObjectPublishMessage
  "object.unpublish": ObjectUnpublishMessage
  "object.update": ObjectUpdateMessage
}
