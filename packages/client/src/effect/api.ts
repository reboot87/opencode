/**
 * Effect 客户端 API 导出。
 * 再导出 Effect 风格的客户端 API 与事件类型。
 */
import type { WebsearchApi } from "./api/api.js"

export type { RpcApi, RpcClient } from "./rpc.js"
export type { SelectedEvent } from "../shared-events.js"

export type * from "./api/api.js"

export type WebSearchApi<E = never> = WebsearchApi<E>
