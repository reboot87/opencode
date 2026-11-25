/**
 * V2 组件 — SessionProgressIndicatorV2。
 * 第二版会话界面组件中负责 SessionProgressIndicatorV2 部分，提供该部分所需的实现与类型定义。
 */
import { type ComponentProps } from "solid-js"
import { Spinner } from "@opencode/ui/spinner"
import "./session-progress-indicator-v2.css"

// The app's one activity spinner, shared by the activity chip, subagent rows, task cards and loading tabs.
export function SessionProgressIndicatorV2(props: ComponentProps<typeof Spinner>) {
  return (
    <Spinner
      {...props}
      width={props.width ?? 16}
      height={props.height ?? 16}
      data-component="session-progress-indicator-v2"
      aria-hidden={props["aria-hidden"] ?? "true"}
    />
  )
}
