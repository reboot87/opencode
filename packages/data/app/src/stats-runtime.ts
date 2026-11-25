/**
 * 数据站源码 — StatsRuntime。
 * 模型能力对比站点的实现中负责 StatsRuntime 部分，提供该部分所需的实现与类型定义。
 */
import { Effect } from "effect"

export function runStatsEffect<A, E>(effect: Effect.Effect<A, E>) {
  return Effect.runPromise(effect)
}
