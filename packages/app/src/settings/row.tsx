/**
 * 设置界面 — Row。
 * 应用设置页面的框架中负责 Row 部分，提供该部分所需的实现与类型定义。
 */
import type { Component, JSX } from "solid-js"
import "@/settings/settings.css"

export interface SettingsRowProps {
  title: string | JSX.Element
  description: string | JSX.Element
  children: JSX.Element
  align?: "start"
}

export const SettingsRow: Component<SettingsRowProps> = (props) => {
  return (
    <div data-component="settings-row" data-align={props.align}>
      <div data-slot="settings-row-copy">
        <div data-slot="settings-row-title">{props.title}</div>
        <div data-slot="settings-row-description">{props.description}</div>
      </div>
      <div data-slot="settings-row-control">{props.children}</div>
    </div>
  )
}
