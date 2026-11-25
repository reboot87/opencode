/**
 * 设置界面 — List。
 * 应用设置页面的框架中负责 List 部分，提供该部分所需的实现与类型定义。
 */
import type { Component, JSX } from "solid-js"
import "@/settings/settings.css"

export const SettingsList: Component<{ children: JSX.Element; variant?: "catalog" }> = (props) => {
  return (
    <div data-component="settings-list" data-variant={props.variant} data-focus-scope>
      {props.children}
    </div>
  )
}
