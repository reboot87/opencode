/**
 * 徽标 — Badge。
 * 紧凑状态标记组件中负责 Badge 部分，提供该部分所需的实现与类型定义。
 */
import { type ComponentProps, splitProps } from "solid-js"
import "./badge.css"

export interface BadgeProps extends ComponentProps<"span"> {
  appearance?: "standard" | "compact"
  variant?: "neutral" | "accent" | "subtle" | "danger"
}

export function Badge(props: BadgeProps) {
  const [split, rest] = splitProps(props, ["class", "classList", "children", "appearance", "variant"])

  return (
    <span
      {...rest}
      data-component="tag"
      data-appearance={split.appearance ?? "compact"}
      data-variant={split.variant ?? "neutral"}
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
    >
      {split.children}
    </span>
  )
}
