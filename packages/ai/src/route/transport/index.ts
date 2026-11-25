/**
 * 传输层（Transport）的统一出口与接口定义。
 *
 * Transport 负责"把请求字节送出去、把响应字节流收回来"，与协议（Protocol）解耦：
 *   - http.ts：普通 HTTP 请求/流式响应；
 *   - websocket.ts：WebSocket 双向通信（部分 provider 用 WS 传输流式事件）。
 *
 * 本文件导出公共类型（Transport / TransportRuntime / HttpMiddleware 等）和构造函数。
 */
import type { Effect, Scope, Stream } from "effect"
import { Endpoint } from "../endpoint.js"
import { Auth } from "../auth.js"
import type { HttpMiddleware, Interface as RequestExecutorInterface } from "../executor.js"
import type { WebSocketChannelExecutor } from "./websocket-channel.js"
import type { AIError, HttpContext, LLMRequest } from "../../schema/index.js"

export interface TransportRuntime {
  readonly http: RequestExecutorInterface
}

export interface TransportExecution<Frame> {
  readonly frames: Stream.Stream<Frame, AIError>
  readonly http?: HttpContext
  body?(frame: Frame): string | undefined
  raw?(frame: Frame): unknown
  /** Optional successful-consumption acknowledgement. HTTP leaves this absent. */
  readonly complete?: Effect.Effect<void>
}

export interface TransportExecuteOptions {
  readonly webSocket?: WebSocketChannelExecutor
}

export interface Transport<Body, Prepared, Frame> {
  readonly id: string
  readonly prepare: (input: TransportPrepareInput<Body>) => Effect.Effect<Prepared, AIError>
  readonly execute: (
    prepared: Prepared,
    request: LLMRequest,
    runtime: TransportRuntime,
    options?: TransportExecuteOptions,
  ) => Effect.Effect<TransportExecution<Frame>, AIError, Scope.Scope>
}

export interface TransportPrepareInput<Body> {
  readonly body: Body
  readonly request: LLMRequest
  readonly endpoint: Endpoint.Definition<Body>
  readonly auth: Auth.Definition
  readonly encodeBody: (body: Body) => string
  readonly headers?: (input: { readonly request: LLMRequest }) => Record<string, string>
  readonly middleware?: HttpMiddleware
  readonly webSocket?: WebSocketChannelExecutor
}

export * as HttpTransport from "./http.js"
export type { HttpHandler, HttpMiddleware } from "../executor.js"
export type {
  ChannelCheckpoint,
  ChannelCreate,
  ChannelObservation,
  WebSocketChannelDriver,
  WebSocketChannelExchange,
  WebSocketChannelExecution,
  WebSocketChannelExecutor,
} from "./websocket-channel.js"
export type { WebSocketConnection, WebSocketConnector, WebSocketRequest } from "./websocket.js"
export { WebSocketTransport } from "./websocket.js"
