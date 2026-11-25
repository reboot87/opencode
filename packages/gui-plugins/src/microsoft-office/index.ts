/**
 * Office 插件 — Index 出口。
 * 集中导出 Office 插件 中 Index 相关的实现、组件与类型。
 */
import { Plugin } from "@opencode/plugin/gui"
import en from "./i18n/en"

/** Read-only previews of Word, Excel and PowerPoint files in the file view. */
export default Plugin.define({
  i18n: { en },
})
