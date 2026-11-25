/**
 * 配对插件 — Index 出口。
 * 集中导出 配对插件 中 Index 相关的实现、组件与类型。
 */
import { Plugin } from "@opencode/plugin/gui"
import en from "./i18n/en"
import pair from "./icons/pair.svg?raw"

export default Plugin.define({ icons: { pair }, i18n: { en } })
