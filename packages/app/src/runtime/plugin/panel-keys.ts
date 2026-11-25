/**
 * 运行时插件 — PanelKeys。
 * 浏览器端的插件加载与扩展点中负责 PanelKeys 部分，提供该部分所需的实现与类型定义。
 */
import type { BuiltinPanel } from "@opencode/plugin/gui/builtin"

/** The key the host stores a panel tab under. */
export function panelKey(plugin: string, id: string) {
  return `${plugin}:${id}`
}

/** The stored keys the panels map with `BuiltinPanel.legacy`, each to the key of the tab it is now. */
export function legacyKeys(providers: readonly { readonly plugin: string; readonly value: BuiltinPanel }[]) {
  return new Map(
    providers.flatMap((item) =>
      Object.entries(item.value.legacy ?? {}).map(([key, id]) => [key, panelKey(item.plugin, id)] as const),
    ),
  )
}
