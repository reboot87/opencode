/**
 * 标题栏 — SidebarSessions。
 * 自定义窗口标题栏中负责 SidebarSessions 部分，提供该部分所需的实现与类型定义。
 */
import type { OpenCodeEvent } from "@opencode/client/promise"
import { mergeHomeSessionIndex } from "@/home/sessions/index"

// Events that keep a preview tab. This is deliberately separate from recency: opening or passively updating a
// session must not turn its preview into a permanent tab.
const activityTypes = [
  "session.inbox.enqueued",
  "session.step.started",
  "session.step.ended",
  "session.step.failed",
  "session.renamed",
  "session.moved",
  "session.archived",
  "session.unarchived",
  "session.revert.staged",
  "session.revert.cleared",
  "session.revert.committed",
] as const satisfies OpenCodeEvent["type"][]

export function isSidebarSessionActivity(
  event: OpenCodeEvent,
): event is Extract<OpenCodeEvent, { type: (typeof activityTypes)[number] }> {
  return activityTypes.some((type) => type === event.type)
}

// Loading a tab refreshes its metadata, not its place in the project list. A newer idle marker means a run ended
// after the index was fetched, which is the one server change that may move the session. Recency overrides are
// applied afterward by the shared desktop data layer, which owns send promotion.
export const mergeSidebarSessions = mergeHomeSessionIndex
