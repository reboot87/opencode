/**
 * 会话请求 — SessionQuestionDock。
 * 会话界面的请求发起与状态跟踪中负责 SessionQuestionDock 部分，提供该部分所需的实现与类型定义。
 */
import { Show } from "solid-js"
import type { FormInfo } from "@opencode/client/promise"
import { useSettings } from "@/settings/model"
import { SessionQuestionDockClassic } from "./session-question-dock-classic"
import { SessionQuestionDockExperimental } from "./session-question-dock-experimental"

export function SessionQuestionDock(props: { request: FormInfo; onSubmit: () => void }) {
  const settings = useSettings()

  return (
    <Show when={settings.general.newQuestionUI()} fallback={<SessionQuestionDockClassic {...props} />}>
      <SessionQuestionDockExperimental {...props} />
    </Show>
  )
}
