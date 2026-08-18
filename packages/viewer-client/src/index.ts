export {
  descriptionMatches,
  displayExtension,
  displayName,
  eachPrim,
  ensurePublished,
  findItem,
  formatObjectSelector,
  isUuid,
  type ObjectRef,
  type ObjectSelector,
  parseObjectRef,
  parseObjectSelector,
  type ResolvedItem,
  resolveItem,
} from "./addressing.js"
export { ViewerClient } from "./client.js"
export { type CompileLanguage, parseCompileError, parseCompileErrors } from "./compile-errors.js"
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
