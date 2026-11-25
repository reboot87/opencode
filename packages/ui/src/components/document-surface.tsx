/**
 * 通用组件 — DocumentSurface。
 * 跨场景复用的通用 UI 组件中负责 DocumentSurface 部分，提供该部分所需的实现与类型定义。
 */
import type { JSX } from "solid-js"
import "./document-surface.css"

export function DocumentSurface(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} data-component="document-surface" />
}
