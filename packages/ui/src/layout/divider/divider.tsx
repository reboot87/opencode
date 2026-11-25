/**
 * 分隔线 — Divider。
 * 用于划分区块的分隔组件中负责 Divider 部分，提供该部分所需的实现与类型定义。
 */
import { type ComponentProps, splitProps } from "solid-js"
import "./divider.css"

export interface DividerProps extends ComponentProps<"div"> {}

export function Divider(props: DividerProps) {
  const [local, rest] = splitProps(props, ["class", "classList"])

  return (
    <div
      {...rest}
      role="separator"
      aria-orientation="horizontal"
      data-component="divider-v2"
      classList={{
        ...local.classList,
        [local.class ?? ""]: !!local.class,
      }}
    />
  )
}
