/**
 * GUI 插件 — IconNameTypecheck。
 * GUI 插件的实现中负责 IconNameTypecheck 部分，提供该部分所需的实现与类型定义。
 */
// Fails the typecheck when the GUI SDK's names of the app's icons drift from the app's icon catalog. Nothing imports
// this file. Run `bun run generate` in packages/plugin to update them.

import type { AppIconName } from "@opencode/plugin/gui"
import type { iconNames } from "@opencode/ui/icons/catalog"

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

export const iconNamesMatch: Same<AppIconName, ReturnType<typeof iconNames>[number]> = true
