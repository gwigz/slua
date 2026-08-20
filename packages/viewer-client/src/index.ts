export {
  descriptionMatches,
  displayExtension,
  displayName,
  eachPrim,
  ensurePublished,
  findItem,
  formatObjectSelector,
  isStaleInventory,
  isUuid,
  listPublished,
  matchesSelector,
  type ObjectRef,
  type ObjectSelector,
  parseObjectRef,
  parseObjectSelector,
  PUBLISH_ACTION,
  PUBLISH_HINT,
  PUBLISH_WAIT_MS,
  type PublishOptions,
  type PublishWatcher,
  type ResolvedItem,
  resolveItem,
  waitForAnyPublish,
  withoutWait,
  withStaleRetry,
} from "./addressing.js"
export { ViewerClient } from "./client.js"
export {
  type CompileLanguage,
  diagnosticsFrom,
  parseCompileError,
  parseCompileErrors,
} from "./compile-errors.js"
export {
  ConnectionClosedError,
  HandshakeError,
  RpcError,
  type RpcErrorBody,
  RpcErrorCode,
  RpcTimeoutError,
  ViewerUnavailableError,
} from "./protocol/errors.js"
export {
  JsonRpcPeer,
  type JsonRpcOptions,
  type NotificationHandler,
  type RequestHandler,
  type Transport,
} from "./protocol/jsonrpc.js"
export {
  buildHandshakeResponse,
  type ConnectOptions,
  DEFAULT_PORT,
  SAVE_TIMEOUT_MS,
  type TransportFactory,
  ViewerConnection,
  webSocketTransport,
} from "./protocol/peer.js"
export * from "./protocol/types.js"
export {
  loadSourceMapFor,
  resolveExistingSource,
  SourceMap,
  type SourceLocation,
} from "./sourcemap.js"
export {
  CONFIG_FILENAME,
  type Config,
  type HeaderTagOptions,
  leadingComment,
  loadConfig,
  parseConfig,
  parseHeaderTags,
  type PartialTarget,
  readHeaderTagsFor,
  type ResolveOptions,
  resolveTarget,
  type Target,
} from "./targets.js"
