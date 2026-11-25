/**
 * 会话时间线 — Projection。
 * 会话消息时间线的渲染中负责 Projection 部分，提供该部分所需的实现与类型定义。
 */
import { createReactiveTimelineProjection } from "@opencode/session-ui/timeline/projection"

export { reuseTimelineRows } from "@opencode/session-ui/timeline/projection"

export function createTimelineProjection(input: Parameters<typeof createReactiveTimelineProjection>[0]) {
  return createReactiveTimelineProjection(input)
}
