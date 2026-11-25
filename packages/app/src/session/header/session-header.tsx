/**
 * 会话头部 — SessionHeader。
 * 会话界面顶部的标题与操作区中负责 SessionHeader 部分，提供该部分所需的实现与类型定义。
 */
import { createMediaQuery } from "@solid-primitives/media"
import { Show } from "solid-js"

export function SessionHeaderSpacer(props: { visible: boolean }) {
  const isDesktop = createMediaQuery("(min-width: 768px)")

  return (
    <Show when={isDesktop() && props.visible}>
      <div class="size-7 shrink-0" aria-hidden />
    </Show>
  )
}
