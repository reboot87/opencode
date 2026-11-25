/**
 * AI SDK 的各类标识符（带品牌类型）。
 *
 * 用 Schema.brand 把普通字符串提升为品牌类型（如 ModelID），
 * 让编译器能区分"任意字符串"和"模型 ID"，防止 ID 混用。
 */
import { Schema } from "effect"

/** 协议实现的稳定字符串标识。 */
export const ProtocolID = Schema.String
export type ProtocolID = Schema.Schema.Type<typeof ProtocolID>

/** 可运行路由（route）的稳定字符串标识。 */
export const RouteID = Schema.String
export type RouteID = Schema.Schema.Type<typeof RouteID>

export const ModelID = Schema.String.pipe(Schema.brand("AI.ModelID"))
export type ModelID = typeof ModelID.Type

export const ProviderID = Schema.String.pipe(Schema.brand("AI.ProviderID"))
export type ProviderID = typeof ProviderID.Type

export const ResponseID = Schema.String
export type ResponseID = Schema.Schema.Type<typeof ResponseID>

export const ContentBlockID = Schema.String
export type ContentBlockID = Schema.Schema.Type<typeof ContentBlockID>

export const ToolCallID = Schema.String
export type ToolCallID = Schema.Schema.Type<typeof ToolCallID>
