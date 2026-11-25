/**
 * LLM 相关类型。
 * 定义 LLM 请求/响应在本层的共享结构。
 */
export * as LLM from "./llm.js"

import { Schema } from "effect"

export const FinishReason = Schema.Literals(["stop", "length", "tool-calls", "content-filter", "error", "unknown"])
export type FinishReason = typeof FinishReason.Type
