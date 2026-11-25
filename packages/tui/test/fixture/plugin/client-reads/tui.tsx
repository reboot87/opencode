/**
 * 插件夹具（client-reads） — Tui。
 * 模拟插件读取客户端数据的夹具中负责 Tui 部分，提供该部分所需的实现与类型定义。
 */
import { Plugin } from "@opencode/plugin/tui"

// Reads messages through the plugin client, whose files must stay inline bytes.
export default Plugin.define({
  id: "fixture.client-reads",
  setup(context) {
    void context.client.message.list({ sessionID: "ses_plugin_probe" })
  },
})
