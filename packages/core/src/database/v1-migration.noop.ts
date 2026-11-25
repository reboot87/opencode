/**
 * v1 数据库迁移（空实现）。
 * 在不支持迁移的运行时提供直接标记为已完成的占位实现。
 */
import { Effect, Layer } from "effect"

export type Status = { readonly status: "completed" }

export const layer = Layer.empty
export function status() {
  return Effect.succeed({ status: "completed" } as const)
}
export function run() {
  return Effect.succeed({ status: "completed" } as const)
}
