/**
 * 通用组件 — LinkedText。
 * 跨场景复用的通用 UI 组件中负责 LinkedText 部分，提供该部分所需的实现与类型定义。
 */
import { Index, Show, createMemo } from "solid-js"
import { linkSegments } from "./link-segments"

/** Plain text with every http(s) URL rendered as a link that opens outside the app. */
export function LinkedText(props: { text: string }) {
  const segments = createMemo(() => linkSegments(props.text))

  return (
    <Index each={segments()}>
      {(segment) => (
        <Show when={segment().href} fallback={segment().text}>
          {(href) => (
            <a data-slot="linked-text-link" href={href()} target="_blank" rel="noopener noreferrer">
              {segment().text}
            </a>
          )}
        </Show>
      )}
    </Index>
  )
}
