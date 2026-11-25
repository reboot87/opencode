/**
 * Provider 目录 — Plugin。
 * 可用模型目录的浏览界面中负责 Plugin 部分，提供该部分所需的实现与类型定义。
 */
import type { PluginInfo } from "@opencode/client"

export function pluginLabel(plugin: PluginInfo) {
  if (plugin.id) return plugin.id

  if (plugin.source.type === "package") return plugin.source.target

  if (plugin.source.type === "local") return plugin.source.path

  return plugin.source.type
}

export function pluginLabels(plugins: readonly PluginInfo[]) {
  return plugins.flatMap((plugin) => (plugin.source.type === "builtin" ? [] : [pluginLabel(plugin)]))
}
