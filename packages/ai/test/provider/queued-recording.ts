/**
 * queued·录制的测试辅助模块。
 *
 * 被测模块：@opencode/ai/provider/queued-recording
 *
 * 覆盖各家供应商的接入实现：请求构造、响应解析与错误映射。
 */
import type { Poll } from "../../src/effect.js"

/**
 * Queued generations take minutes live, so record with a realistic interval. Replay consumes the recorded polls in
 * cassette order regardless of timing, so it runs them back-to-back instead of sleeping between each one.
 */
export const queuedPoll: Poll = {
  interval: process.env.RECORD === "true" ? "10 seconds" : "10 millis",
  timeout: "15 minutes",
}
