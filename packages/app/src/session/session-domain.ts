/**
 * 会话界面 — SessionDomain。
 * 会话主界面的视图与状态中负责 SessionDomain 部分，提供该部分所需的实现与类型定义。
 */
import type { SessionMessageInfo, SessionMessageUser } from "@opencode/client/promise"

export function selectSessionUserMessages(messages: SessionMessageInfo[]) {
  return messages.filter((message): message is SessionMessageUser => message.type === "user")
}

export function selectVisibleSessionUserMessages(messages: SessionMessageUser[], revertMessageID?: string) {
  if (!revertMessageID) return messages

  return messages.filter((message) => message.id < revertMessageID)
}
