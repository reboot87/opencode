/**
 * 模块 — SettingsPage。
 * 该目录下的功能模块中负责 SettingsPage 部分，提供该部分所需的实现与类型定义。
 */
import type { JSX } from "solid-js"
// Plugin settings pages render inside the app's settings panel, which brings these styles and caps the width.
import "@/settings/settings.css"

export function SettingsPanel(props: { children: JSX.Element }) {
  return <div class="settings-panel h-screen max-w-[800px] bg-v2-background-bg-base">{props.children}</div>
}
