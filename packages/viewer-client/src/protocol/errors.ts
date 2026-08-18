/**
 * JSON-RPC error codes used by the viewer, from `indra/llcorehttp/lljsonrpcws.h`.
 *
 * The `-32099`..`-32000` block is implementation-defined by JSON-RPC 2.0 and
 * the viewer uses it for transport and permission failures.
 */
export const RpcErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  ConnectionClosed: -32000,
  RequestTimeout: -32001,
  Unauthorized: -32002,
  Forbidden: -32003,
  RateLimited: -32004,
  ServiceUnavailable: -32005,
  MessageTooLarge: -32006,
  InvalidSession: -32007,
} as const

export interface RpcErrorBody {
  code: number
  message: string
  data?: unknown
}

/**
 * A JSON-RPC `error` response, surfaced with the numeric code intact.
 *
 * `sl-vscode-plugin` folds the code into the message string and re-extracts it
 * with a regex later; keeping it structured avoids that round trip.
 */
export class RpcError extends Error {
  readonly code: number
  readonly data?: unknown
  readonly method?: string

  constructor(body: RpcErrorBody, method?: string) {
    super(body.message)

    this.name = "RpcError"
    this.code = body.code
    this.data = body.data
    this.method = method
  }
}

/** Raised when a call exceeds its timeout without a response. */
export class RpcTimeoutError extends Error {
  readonly method: string

  constructor(method: string, timeoutMs: number) {
    super(`timed out after ${timeoutMs}ms waiting for ${method}`)

    this.name = "RpcTimeoutError"
    this.method = method
  }
}

/** Raised when the connection drops, including with calls still in flight. */
export class ConnectionClosedError extends Error {
  constructor(message = "connection closed") {
    super(message)

    this.name = "ConnectionClosedError"
  }
}

/** Raised when nothing is listening, so the connection never opened. */
export class ViewerUnavailableError extends Error {
  readonly url: string

  constructor(url: string, detail?: string) {
    super(`could not connect to ${url}${detail ? ` (${detail})` : ""}`)

    this.name = "ViewerUnavailableError"
    this.url = url
  }
}

/** Raised when the viewer rejects, or we cannot satisfy, the auth challenge. */
export class HandshakeError extends Error {
  constructor(message: string) {
    super(message)

    this.name = "HandshakeError"
  }
}
