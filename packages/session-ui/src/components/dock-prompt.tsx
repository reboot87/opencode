/**
 * 通用组件 — DockPrompt。
 * 跨场景复用的通用 UI 组件中负责 DockPrompt 部分，提供该部分所需的实现与类型定义。
 */
import type { JSX } from "solid-js"

export function DockPrompt(props: {
  kind: "question" | "permission"
  variant?: "experimental"
  header: JSX.Element
  children: JSX.Element
  footer: JSX.Element
  ref?: (el: HTMLDivElement) => void
  onKeyDown?: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent>
}) {
  const slot = (name: string) => `${props.kind}-${name}`

  return (
    <div
      data-component="dock-prompt"
      data-kind={props.kind}
      data-variant={props.variant}
      ref={props.ref}
      onKeyDown={props.onKeyDown}
    >
      <div data-slot={slot("body")}>
        <div data-slot={slot("header")}>{props.header}</div>
        <div data-slot={slot("content")}>{props.children}</div>
      </div>
      <div data-slot={slot("footer")}>{props.footer}</div>
    </div>
  )
}
