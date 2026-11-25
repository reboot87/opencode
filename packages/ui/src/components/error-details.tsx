/**
 * 通用组件 — ErrorDetails。
 * 跨场景复用的通用 UI 组件中负责 ErrorDetails 部分，提供该部分所需的实现与类型定义。
 */
import type { JSX } from "solid-js"

/** A full error in a scrollable, selectable block, above the actions that resolve it. */
export function ErrorDetails(props: { error: string; children: JSX.Element }) {
  return (
    <div data-component="error-details">
      <pre data-slot="error-details-text" tabIndex={-1}>
        {props.error}
      </pre>
      <div data-slot="error-details-actions">{props.children}</div>
    </div>
  )
}
