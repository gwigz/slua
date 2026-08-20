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
  serverVersion: string
  protocolVersion: string
  viewerName: string
  viewerVersion: string
  agentId: string
  agentName: string
  /** Path to a temp file holding a UUID. Read it, echo the contents verbatim. */
  challenge?: string
  languages: string[]
  syntaxId: string
  /**
   * Known flags: `liveSync`, `compilation`, `syntaxCache`, `commands` and
   * `unifiedDiagnostics`. The last one marks the viewer build that renamed
   * `errors` to `diagnostics` and moved runtime events onto item references.
   */
  features: Record<string, boolean>
}

export interface SessionHandshakeResponse {
  clientName: string
  clientVersion: string
  protocolVersion: string
  challengeResponse?: string
  languages: string[]
  features: Record<string, boolean>
  scriptName?: string
  scriptLanguage?: string
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
  serverTime: number
}

// Inventory and objects

export type InventoryItemType = "script" | "notecard"

export type ScriptVM = "lsl2" | "mono" | "luau"

/** Permission mask bits. Only owner and nextOwner are transmitted. */
export const Permission = {
  Transfer: 0x2000,
  Modify: 0x4000,
  Copy: 0x8000,
} as const

export interface ItemPermissions {
  owner: number
  nextOwner: number
}

export interface ObjectInventoryItem {
  itemId: string
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
  creatorId?: string
}

export interface LinkedObject {
  linkId: string
  /** Root is 1, children are >= 2. */
  linkNumber: number
  linkName: string
  linkDescription?: string
  inventory: ObjectInventoryItem[]
}

export interface ObjectPermissions {
  owner: number
  nextOwner: number
}

export interface PublishedObject {
  objectId: string
  objectName: string
  objectDescription?: string
  region?: string
  ownerId?: string
  permissions?: ObjectPermissions
  canSaveBack?: boolean
  inventory: ObjectInventoryItem[]
  linkedObjects?: LinkedObject[]
}

// Object notifications

export interface ObjectPublishMessage {
  object: PublishedObject
}

export interface ObjectUnpublishMessage {
  objectId: string
  reason?: string
}

export interface InventoryChanges {
  added?: ObjectInventoryItem[]
  removed?: string[]
  modified?: ObjectInventoryItem[]
  contentChanged?: string[]
  runningChanged?: { itemId: string; running: boolean }[]
}

export interface LinkedObjectChanges {
  added?: LinkedObject[]
  removed?: string[]
  modified?: {
    linkId: string
    linkName?: string
    /** Either a delta or a full replacement array. */
    inventory?: InventoryChanges | ObjectInventoryItem[]
  }[]
}

export interface ObjectUpdateMessage {
  objectId: string
  objectName?: string
  inventory?: ObjectInventoryItem[]
  linkedObjects?: LinkedObject[]
  /** Takes precedence over the full-replacement fields when present. */
  changes?: {
    inventory?: InventoryChanges
    linkedObjects?: LinkedObjectChanges
  }
}

// Object calls

export interface ObjectListResponse {
  objects: PublishedObject[]
}

export interface ObjectRequestParams {
  objectId: string
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
  objectId: string
}

export interface ObjectUnpublishResponse {
  success: boolean
  objectId?: string
}

export interface ObjectContentGetParams {
  primId: string
  itemId: string
}

export interface ObjectContentGetResponse {
  success: boolean
  primId: string
  itemId: string
  content: string
  encoding?: "utf-8" | "base64"
}

export interface ObjectContentSaveParams {
  primId: string
  itemId: string
  content: string
  vm?: ScriptVM
  running?: boolean
}

export interface ObjectContentSaveResponse {
  success: boolean
  primId?: string
  itemId?: string
  compiled?: boolean
  /**
   * Compiler diagnostics, on a viewer advertising `unifiedDiagnostics`.
   * Read this and `errors` together with `diagnosticsFrom`.
   */
  diagnostics?: Diagnostic[]
  /** Raw compiler output lines, from a viewer without `unifiedDiagnostics`. */
  errors?: string[]
  message?: string
}

export interface ObjectItemCreateParams {
  primId: string
  name: string
  type: InventoryItemType
  vm?: ScriptVM
  text?: string
}

export interface ObjectItemCreateResponse extends ObjectInventoryItem {
  primId: string
}

export interface ObjectItemDeleteParams {
  primId: string
  itemId: string
}

export interface ObjectItemDeleteResponse {
  success: boolean
  primId: string
  itemId: string
}

export interface ObjectScriptSetRunningParams {
  primId: string
  itemId: string
  running: boolean
}

export interface ObjectScriptResetParams {
  primId: string
  itemId: string
}

export interface SimpleSuccessResponse {
  success: boolean
  message?: string
}

export interface ObjectModifyParams {
  primId: string
  name?: string
  description?: string
  permissions?: { nextOwner?: number }
}

export interface ObjectModifyResponse {
  success: boolean
  primId: string
  message?: string
}

export interface ObjectItemModifyParams extends ObjectModifyParams {
  itemId: string
}

export interface ObjectItemModifyResponse extends ObjectModifyResponse {
  itemId: string
}

// Scripts

export interface ScriptSubscribeParams {
  scriptId: string
  scriptName: string
  scriptLanguage: string
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
  scriptId: string
  success: boolean
  status: number
  objectId?: string
  itemId?: string
  message?: string
}

export interface ScriptUnsubscribeMessage {
  scriptId: string
}

export interface ScriptListResponse {
  tempDir: string
  scriptIds: string[]
  success: boolean
}

// Compilation and runtime

export interface Diagnostic {
  /** 1-based, or 0 when the viewer could not place the message. */
  row: number
  /** 1-based for LSL, always 0 for Luau (the compiler gives no column). */
  column: number
  level: string
  message: string
  /**
   * Set when the message came from the LSL compiler. Absent is not proof of
   * the opposite: the viewer's save path leaves it off unparsed LSL lines.
   */
  format?: "lsl"
}

/** @deprecated Renamed to `Diagnostic`, matching the viewer's spelling. */
export type CompilationError = Diagnostic

/** Where a runtime event or diagnostic came from. */
export interface ItemRef {
  /** The root prim of the linkset, which is what `object.*` calls address. */
  rootId: string
  primId?: string
  itemId?: string
  name?: string
  language?: "lsl" | "luau"
}

export interface CompilationResult {
  /** @deprecated Kept by the viewer while it migrates to item references. */
  scriptId: string
  success: boolean
  running: boolean
  /** On a viewer advertising `unifiedDiagnostics`. */
  diagnostics?: Diagnostic[]
  /** From a viewer without `unifiedDiagnostics`. */
  errors?: Diagnostic[]
}

export interface RuntimeDebug {
  /**
   * @deprecated Only sent by a viewer without `unifiedDiagnostics`, and empty
   * there when the message came from a published object rather than a
   * subscription. Use `item` instead.
   */
  scriptId?: string
  /** The root prim of the linkset. */
  objectId: string
  primId?: string
  itemId?: string
  objectName: string
  message: string
  /** `owner_say` is the script talking to its owner, not debug output. */
  channel?: "debug" | "owner_say"
  item?: ItemRef
}

export interface RuntimeError extends RuntimeDebug {
  /**
   * The error on its own, without the surrounding chat text. Empty when the
   * viewer could not parse the simulator's format, and always empty on a
   * viewer without `unifiedDiagnostics`.
   */
  error: string
  /** The line the error names, or 0 when it names none. */
  line: number
  column?: number
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
  asJson?: boolean
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
  errorCode?: number
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
