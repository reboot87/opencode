/**
 * 时间线（新版） — PlacementReactivityTest。
 * 重构中的会话消息时间线中负责 PlacementReactivityTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { isServer } from "solid-js/web"
import { timelinePresets } from "../timeline/detail"
import { projectionRuns } from "../timeline/placement-reactivity"
import { createNextTimelineProjection } from "./projection"

const detail = timelinePresets.find((item) => item.id === "detailed")!.value

// Solid's server build does not track, so this runs with `bun test --conditions=browser`.
describe.skipIf(isServer)("New timeline placement reactivity", () => {
  test("does not rebuild its rows while calls stream or report progress", () => {
    const runs = projectionRuns(
      (messages, status) =>
        createNextTimelineProjection({ sessionMessages: messages, status, timelineDetail: () => detail }).rows,
    )

    expect(runs).toEqual({ streamed: 0, moved: 1, changed: [1, 1], scripted: 1 })
  })
})
