/**
 * 会话界面 — SessionFrame。
 * 会话主界面的视图与状态中负责 SessionFrame 部分，提供该部分所需的实现与类型定义。
 */
import type { ParentProps } from "solid-js"

export function SessionRouteFrame(props: ParentProps<{ padded?: boolean }>) {
  return (
    <div
      class="relative flex size-full flex-col"
      classList={{
        "px-[var(--shell-inline-inset,8px)] pb-[var(--shell-bottom-inset,8px)] pt-[var(--shell-top-inset,8px)]":
          props.padded,
      }}
    >
      {props.children}
    </div>
  )
}

export function SessionPanelFrame(props: ParentProps<{ raised?: boolean }>) {
  return (
    <div
      class="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] bg-v2-background-bg-base"
      classList={{
        "shadow-[var(--v2-elevation-raised)]": props.raised,
      }}
    >
      {props.children}
    </div>
  )
}
