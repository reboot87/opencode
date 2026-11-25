/**
 * V2 组件 — SessionReviewEmptyNoGitV2。
 * 第二版会话界面组件中负责 SessionReviewEmptyNoGitV2 部分，提供该部分所需的实现与类型定义。
 */
import { FileIcon } from "@opencode/ui/file-icon"
import { useI18n } from "@opencode/ui/context/i18n"
import { Button } from "@opencode/ui/button"
import "./session-review-v2.css"

export type SessionReviewEmptyNoGitV2Props = {
  pending: boolean
  onInitGit: () => void
}

export function SessionReviewEmptyNoGitV2(props: SessionReviewEmptyNoGitV2Props) {
  const i18n = useI18n()

  return (
    <div data-slot="session-review-v2-empty-no-git">
      <FileIcon node={{ path: ".gitignore", type: "file" }} mono />
      <div data-slot="session-review-v2-empty-no-git-title">{i18n.t("ui.sessionReviewV2.empty.noGit.title")}</div>
      <div data-slot="session-review-v2-empty-no-git-description">
        {i18n.t("ui.sessionReviewV2.empty.noGit.description")}
      </div>
      <Button variant="neutral" size="normal" disabled={props.pending} onClick={props.onInitGit}>
        {props.pending
          ? i18n.t("ui.sessionReviewV2.empty.noGit.actionLoading")
          : i18n.t("ui.sessionReviewV2.empty.noGit.action")}
      </Button>
    </div>
  )
}
