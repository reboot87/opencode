/**
 * 目标插件 — Index 出口。
 * 集中导出 目标插件 中 Index 相关的实现、组件与类型。
 */
import { Plugin } from "@opencode/plugin/gui"
import en from "./i18n/en"
import active from "./icons/active.svg?raw"
import complete from "./icons/complete.svg?raw"
import paused from "./icons/paused.svg?raw"

// The pill's glyph of each goal status. Each is framed to its 14px ring, the size of a pill's icon, so it draws at
// full size there.
export default Plugin.define({ icons: { active, paused, complete }, i18n: { en } })
