/**
 * 应用外壳 — ProjectNavigation。
 * 浏览器应用的窗口框架与路由外壳中负责 ProjectNavigation 部分，提供该部分所需的实现与类型定义。
 */
import { createMediaQuery } from "@solid-primitives/media"
import { usePlatform } from "@/runtime/platform/platform"
import { useSettings } from "@/settings/model"

export function useProjectNavigation() {
  const platform = usePlatform()

  if (platform.platform !== "desktop") return () => false

  const settings = useSettings()

  const mobile = createMediaQuery("(max-width: 767px)")

  return () => {
    // The navigation prototype keeps Home in the sidebar.
    if (mobile() || settings.appearance.tabLayout() !== "vertical" || settings.appearance.navigationPrototype())
      return false

    return settings.general.sidebarOrganize() === "customize"
  }
}
