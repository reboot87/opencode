/**
 * 主页项目 — Browse。
 * 主页中项目列表的展示中负责 Browse 部分，提供该部分所需的实现与类型定义。
 */
import { useDialog } from "@opencode/ui/context/dialog"
import { lazy, Suspense } from "solid-js"
import type { ServerConnection } from "@/runtime/server/registry"

export type ProjectBrowserTarget = { server: ServerConnection.Key; directory: string }

const ProjectBrowser = lazy(() => import("./browse-view"))

export function useProjectBrowser() {
  const dialog = useDialog()

  return (initial?: ProjectBrowserTarget) => {
    // A menu item unmounts on selection, so return focus to its trigger.
    const triggerID = document.activeElement?.closest('[role="menu"]')?.getAttribute("aria-labelledby")

    const trigger = triggerID && document.getElementById(triggerID)

    void dialog.show(
      () => (
        <Suspense>
          <ProjectBrowser initial={initial} />
        </Suspense>
      ),
      () => {
        if (!trigger) return
        queueMicrotask(() => {
          if (trigger.isConnected && document.activeElement === document.body && !dialog.active)
            trigger.focus({ preventScroll: true })
        })
      },
    )
  }
}
