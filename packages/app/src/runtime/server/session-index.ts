/**
 * 运行时服务端连接 — SessionIndex。
 * 浏览器端与服务端的连接与同步中负责 SessionIndex 部分，提供该部分所需的实现与类型定义。
 */
import type { SessionInfo } from "@opencode/client/promise"
import { rawTime } from "./data"

/** Merge live metadata into indexed roots. Only a completed run advances an indexed row's recency. */
export function mergeRootSessionIndex(indexed: readonly SessionInfo[], known: readonly SessionInfo[]) {
  const rows = new Map(indexed.map((info) => [info.id, info]))

  for (const info of known) {
    const row = rows.get(info.id)

    if (!row) {
      rows.set(info.id, info)
      continue
    }

    // A projected send bump must not reach `apply` as a server time, so copy the raw one.
    const updated = rawTime(row)
    const passive = (info.time.idle ?? 0) <= (row.time.idle ?? 0) && info.time.updated !== updated
    rows.set(info.id, passive ? { ...info, time: { ...info.time, updated } } : info)
  }

  return [...rows.values()].filter((info) => !info.parentID)
}
