/**
 * 活动环 — ActivityRing。
 * 环形活动指示组件中负责 ActivityRing 部分，提供该部分所需的实现与类型定义。
 */
import { type ComponentProps } from "solid-js"
import { Spinner } from "../../components/spinner"
import "./activity-ring.css"

export function ActivityRing(props: ComponentProps<typeof Spinner>) {
  return (
    <Spinner
      {...props}
      width={props.width ?? 14}
      height={props.height ?? 14}
      data-component="activity-ring"
      aria-hidden={props["aria-hidden"] ?? "true"}
    />
  )
}
