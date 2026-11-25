/**
 * V2 组件 — SessionReviewEmptyChangesV2。
 * 第二版会话界面组件中负责 SessionReviewEmptyChangesV2 部分，提供该部分所需的实现与类型定义。
 */
import { useI18n } from "@opencode/ui/context/i18n"
import { Icon } from "@opencode/ui/icon"
import "./session-review-v2.css"

export function SessionReviewEmptyChangesV2() {
  const i18n = useI18n()

  return (
    <div data-slot="session-review-v2-empty-changes">
      <Icon name="review" size="large" />
      <div data-slot="session-review-v2-empty-changes-title">{i18n.t("ui.sessionReviewV2.empty.changes.title")}</div>
      <div data-slot="session-review-v2-empty-changes-description">
        {i18n.t("ui.sessionReviewV2.empty.changes.description")}
      </div>
    </div>
  )
}
