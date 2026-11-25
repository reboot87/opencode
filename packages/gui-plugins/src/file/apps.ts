/**
 * 文件插件 — Apps。
 * 文件预览与操作的 GUI 插件中负责 Apps 部分，提供该部分所需的实现与类型定义。
 */
import { Schema } from "effect"

const OPEN_APPS = [
  "vscode",
  "cursor",
  "zed",
  "textmate",
  "antigravity",
  "finder",
  "terminal",
  "iterm2",
  "ghostty",
  "warp",
  "xcode",
  "android-studio",
  "powershell",
  "windows-terminal",
  "sublime-text",
] as const

export type OpenApp = (typeof OPEN_APPS)[number]

export const OpenAppPreferences = Schema.Struct({
  app: Schema.Literals(OPEN_APPS),
})
