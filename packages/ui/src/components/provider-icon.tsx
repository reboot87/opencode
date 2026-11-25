/**
 * 通用组件 — ProviderIcon。
 * 跨场景复用的通用 UI 组件中负责 ProviderIcon 部分，提供该部分所需的实现与类型定义。
 */
import type { Component, JSX } from "solid-js"
import { createMemo, splitProps } from "solid-js"
import sprite from "./provider-icons/sprite.svg"
import { iconNames } from "./provider-icons/types"

export type ProviderIconProps = JSX.SVGElementTags["svg"] & {
  id: string
}

/** Whether a provider has its own icon. Others fall back to a generic one, which callers may prefer to leave out. */
export function hasProviderIcon(id: string) {
  return iconNames.some((name) => name === id)
}

export const ProviderIcon: Component<ProviderIconProps> = (props) => {
  const [local, rest] = splitProps(props, ["id", "class", "classList"])
  const resolved = createMemo(() => (hasProviderIcon(local.id) ? local.id : "synthetic"))

  return (
    <svg
      data-component="provider-icon"
      {...rest}
      classList={{
        ...local.classList,
        [local.class ?? ""]: !!local.class,
      }}
    >
      <use href={`${sprite}#${resolved()}`} />
    </svg>
  )
}
