/**
 * 终端界面 — Document。
 * OpenCode 终端界面的整体骨架与入口中负责 Document 部分，提供该部分所需的实现与类型定义。
 */
import type { FileDiffInfo, SessionMessageInfo, SessionStatus } from "@opencode/client/promise"

export type SessionDocument = {
  sessionID: string
  messages: SessionMessageInfo[]
  status: SessionStatus
  diffs: FileDiffInfo[]
}
