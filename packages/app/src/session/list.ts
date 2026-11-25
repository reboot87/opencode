/**
 * 会话界面 — List。
 * 会话主界面的视图与状态中负责 List 部分，提供该部分所需的实现与类型定义。
 */
import type { SessionApi, SessionInfo, SessionListInput } from "@opencode/client/promise"

export async function listAllSessions(
  api: Pick<SessionApi, "list">,
  input: Omit<SessionListInput, "cursor">,
  options?: Parameters<SessionApi["list"]>[1],
) {
  const load = async (cursor?: string): Promise<SessionInfo[]> => {
    const result = await api.list({ ...input, limit: input.limit ?? 100, cursor }, options)
    const sessions = result.data

    if (result.data.length === 0 || !result.cursor.next) return sessions

    return [...sessions, ...(await load(result.cursor.next))]
  }

  return load()
}
