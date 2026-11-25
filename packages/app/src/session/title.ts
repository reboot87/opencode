/**
 * 会话界面 — Title。
 * 会话主界面的视图与状态中负责 Title 部分，提供该部分所需的实现与类型定义。
 */
import type { SessionInfo } from "@opencode/client/promise"
import { displayLabel } from "@opencode/util/session-title-fallback"

const pattern = /^(New session|Child session) - \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

export function sessionLabel(session: Pick<SessionInfo, "title" | "parentID">) {
  return displayLabel(session)
}

export function sessionTitle(title?: string) {
  if (!title) return title
  const match = title.match(pattern)

  return match?.[1] ?? title
}
