import { type ConnectOptions, SAVE_TIMEOUT_MS, ViewerConnection } from "./protocol/peer.js"
import type {
  CommandExecuteResponse,
  CommandListResponse,
  LanguageInfo,
  ObjectContentGetParams,
  ObjectContentGetResponse,
  ObjectContentSaveParams,
  ObjectContentSaveResponse,
  ObjectItemCreateParams,
  ObjectItemCreateResponse,
  ObjectItemDeleteParams,
  ObjectItemDeleteResponse,
  ObjectItemModifyParams,
  ObjectItemModifyResponse,
  ObjectListResponse,
  ObjectModifyParams,
  ObjectModifyResponse,
  ObjectRequestResponse,
  ObjectScriptResetParams,
  ObjectScriptSetRunningParams,
  ObjectUnpublishResponse,
  ScriptListResponse,
  ScriptSubscribeParams,
  ScriptSubscribeResponse,
  SimpleSuccessResponse,
  SyntaxCacheFileResponse,
  SyntaxCacheGetParams,
  SyntaxCacheListResponse,
  SyntaxIdResponse,
  SyntaxKind,
  ViewerEvents,
} from "./protocol/types.js"

/**
 * Typed calls and events over a `ViewerConnection`.
 *
 * The no-argument methods send `params: {}` rather than omitting `params`,
 * which is what the viewer's handlers expect.
 */
export class ViewerClient {
  readonly connection: ViewerConnection

  constructor(connection: ViewerConnection) {
    this.connection = connection
  }

  static async connect(options?: ConnectOptions): Promise<ViewerClient> {
    return new ViewerClient(await ViewerConnection.connect(options))
  }

  /** Subscribes to a viewer notification. Returns an unsubscribe function. */
  on<K extends keyof ViewerEvents>(
    event: K,
    handler: (params: ViewerEvents[K]) => void,
  ): () => void {
    return this.connection.peer.on(event, handler as (params: unknown) => void)
  }

  close(): void {
    this.connection.close()
  }

  // Objects

  objectList(): Promise<ObjectListResponse> {
    return this.connection.peer.call("object.list", {})
  }

  objectRequest(objectId: string): Promise<ObjectRequestResponse> {
    return this.connection.peer.call("object.request", { objectId: objectId })
  }

  objectUnpublish(objectId: string): Promise<ObjectUnpublishResponse> {
    return this.connection.peer.call("object.unpublish", { objectId: objectId })
  }

  objectModify(params: ObjectModifyParams): Promise<ObjectModifyResponse> {
    return this.connection.peer.call("object.modify", params)
  }

  // Content

  objectContentGet(params: ObjectContentGetParams): Promise<ObjectContentGetResponse> {
    return this.connection.peer.call("object.content.get", params)
  }

  /** Saves and compiles. Allows the viewer's full 60s upload budget plus slack. */
  objectContentSave(params: ObjectContentSaveParams): Promise<ObjectContentSaveResponse> {
    return this.connection.peer.call("object.content.save", params, SAVE_TIMEOUT_MS)
  }

  // Items

  objectItemCreate(params: ObjectItemCreateParams): Promise<ObjectItemCreateResponse> {
    return this.connection.peer.call("object.item.create", params)
  }

  objectItemDelete(params: ObjectItemDeleteParams): Promise<ObjectItemDeleteResponse> {
    return this.connection.peer.call("object.item.delete", params)
  }

  objectItemModify(params: ObjectItemModifyParams): Promise<ObjectItemModifyResponse> {
    return this.connection.peer.call("object.item.modify", params)
  }

  // Scripts

  setScriptRunning(params: ObjectScriptSetRunningParams): Promise<SimpleSuccessResponse> {
    return this.connection.peer.call("object.script.set_running", params)
  }

  resetScript(params: ObjectScriptResetParams): Promise<SimpleSuccessResponse> {
    return this.connection.peer.call("object.script.reset", params)
  }

  scriptList(): Promise<ScriptListResponse> {
    return this.connection.peer.call("script.list", {})
  }

  scriptSubscribe(params: ScriptSubscribeParams): Promise<ScriptSubscribeResponse> {
    return this.connection.peer.call("script.subscribe", params)
  }

  // Language and syntax

  syntaxId(): Promise<SyntaxIdResponse> {
    return this.connection.peer.call("language.syntax.id", {})
  }

  syntax(kind: SyntaxKind): Promise<LanguageInfo> {
    return this.connection.peer.call("language.syntax", { kind })
  }

  syntaxCache(): Promise<SyntaxCacheListResponse> {
    return this.connection.peer.call("language.syntax.cache", {})
  }

  syntaxGet(params: SyntaxCacheGetParams): Promise<SyntaxCacheFileResponse> {
    return this.connection.peer.call("language.syntax.get", params)
  }

  // Commands

  executeCommand(
    command: string,
    params?: Record<string, unknown>,
  ): Promise<CommandExecuteResponse> {
    return this.connection.peer.call("command.execute", { command, params })
  }

  listCommands(): Promise<CommandListResponse> {
    return this.connection.peer.call("command.list", {})
  }
}
