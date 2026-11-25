/**
 * 工作区设置 — ProjectFolderMissing。
 * 工作区相关设置中负责 ProjectFolderMissing 部分，提供该部分所需的实现与类型定义。
 */
import { Icon } from "@opencode/ui/icon"
import { Show } from "solid-js"
import { useLanguage } from "@/runtime/i18n/language"
import { useWorkspaceLocation } from "@/workspaces/location"
import "./project.css"

export function ProjectFolderMissing() {
  const language = useLanguage()
  const location = useWorkspaceLocation()

  return (
    <Show when={location().missing}>
      {(missing) => (
        <div role="status" class="project-settings-folder-missing">
          <Icon name="warning" class="project-settings-folder-missing-icon" />
          <div class="project-settings-folder-missing-copy">
            <span class="project-settings-folder-missing-title">
              {language.t("project.settings.folderMissing.title")}
            </span>
            <bdi dir="ltr" class="project-settings-folder-missing-path">
              {missing().directory}
            </bdi>
            <span>{language.t("project.settings.folderMissing.description")}</span>
          </div>
        </div>
      )}
    </Show>
  )
}
