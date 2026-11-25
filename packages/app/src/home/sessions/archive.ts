/**
 * 主页会话 — Archive。
 * 主页中会话列表的展示中负责 Archive 部分，提供该部分所需的实现与类型定义。
 */
import { notifySessionTabsRemoved } from "@/shell/titlebar/session-events"
import type { ServerConnection } from "@/runtime/server/registry"
import type { SessionInfo } from "@opencode/client/promise"

type HomeSession = Pick<SessionInfo, "id" | "location">

export async function archiveHomeSession(input: {
  server: ServerConnection.Key
  session: HomeSession
  archive: (sessionID: string) => Promise<unknown>
  remove: () => void
  onError?: (error: unknown) => void
}) {
  await input
    .archive(input.session.id)
    .then(() => {
      input.remove()
      notifySessionTabsRemoved({
        server: input.server,
        directory: input.session.location.directory,
        sessionIDs: [input.session.id],
      })
    })
    .catch((error) => input.onError?.(error))
}
