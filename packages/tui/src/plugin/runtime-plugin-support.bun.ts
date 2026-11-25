/**
 * 终端插件支持 — RuntimePluginSupportBun。
 * 终端界面的插件加载与扩展点中负责 RuntimePluginSupportBun 部分，提供该部分所需的实现与类型定义。
 */
import { ensurePluginRuntime, provides } from "@opencode/plugin/runtime"
import { Plugin, PluginContextProvider, usePlugin } from "@opencode/plugin/tui"
import { ensureRuntimePluginSupport } from "@opentui/solid/runtime-plugin-support/configure"

ensurePluginRuntime()
ensureRuntimePluginSupport({
  additional: {
    "@opencode/plugin/tui": { Plugin, PluginContextProvider, usePlugin },
  },
  preserve: provides,
})
