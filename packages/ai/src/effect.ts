/**
 * Effect 风格 API 入口（@opencode/ai/effect）。
 *
 * 与顶层 `ai` 客户端（Promise / AsyncIterable 风格）不同，这里的方法直接返回 Effect / Stream，
 * 供已经运行在 Effect runtime 里的调用方（如 opencode core）使用，省去 Promise 包装。
 * 各能力映射到对应模块：LLM / Image / Decision / Embedding / Video，语音与转写暂时标记为实验性。
 */
import { Decision } from "./decision.js"
import { Embedding } from "./embedding.js"
import { Image } from "./image.js"
import { LLM } from "./llm.js"
import { Speech } from "./speech.js"
import { Transcription } from "./transcription.js"
import { Video } from "./video.js"

/** The Effect API: the same shape as `ai` from `@opencode/ai`, returning `Effect` and `Stream`. */
export const ai = {
  request: LLM.request,
  generate: LLM.generate,
  stream: LLM.stream,
  loop: LLM.loop,
  collect: LLM.collect,
  compact: LLM.compact,
  canCompact: LLM.canCompact,
  image: Image,
  decision: Decision,
  embedding: Embedding,
  video: Video,
  /** 实验性 API：可能变动，不保证兼容性。 */
  experimental: {
    speech: Speech,
    transcription: Transcription,
  },
} as const

export { AIClient } from "./ai-client.js"
export { LLMClient } from "./route/client.js"
export { ImageClient } from "./image-client.js"
export { VideoClient } from "./video-client.js"
export { Auth } from "./route/auth.js"
export { ProviderPackage } from "./provider-package.js"
export type { LLMClientService } from "./route/client.js"
export { DecisionClient } from "./decision-client.js"
export { DecisionRoute } from "./route/decision.js"
export { EmbeddingClient } from "./embedding-client.js"
export { EmbeddingRoute } from "./route/embedding.js"
export { Generation } from "./generation.js"
export { ToolFailure, emptyInputJsonSchema, toDefinitions, tool } from "./tool.js"
export { ToolRuntime } from "./tool-runtime.js"
export type { ToolSettlement } from "./tool-runtime.js"
export * from "./public.js"
