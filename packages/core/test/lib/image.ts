/**
 * 图片的测试辅助模块。
 *
 * 被测模块：@opencode/core/lib/image
 *
 * 核心测试的公共辅助模块：内存数据库、会话夹具与事件收集工具。
 */
import { Image } from "@opencode/core/image"
import { Effect, Layer } from "effect"

/** Passthrough resizer for tests that build Tool.node without a Location. */
export const imagePassthrough = Layer.mock(Image.Service, {
  normalize: (_resource, content) => Effect.succeed(content),
})
