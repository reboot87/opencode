/**
 * 终端组件 — TodoItem。
 * 终端界面（Solid）组件中负责 TodoItem 部分，提供该部分所需的实现与类型定义。
 */
import { TextAttributes } from "@opentui/core"
import type { ResolvedTheme } from "@opencode/theme/tui"
import { todoMarker, type Todo } from "../util/todo"

export function TodoItem(props: { theme: ResolvedTheme; todo: Todo }) {
  const fg = () => {
    if (props.todo.status === "in_progress") return props.theme.text.feedback.warning.base
    if (props.todo.status === "cancelled") return props.theme.text.faint
    return props.theme.text.muted
  }

  return (
    <box flexDirection="row" gap={0}>
      <text flexShrink={0} fg={fg()}>
        {todoMarker(props.todo.status)}{" "}
      </text>
      <text
        flexGrow={1}
        wrapMode="word"
        fg={fg()}
        attributes={props.todo.status === "cancelled" ? TextAttributes.STRIKETHROUGH : undefined}
      >
        {props.todo.content}
      </text>
    </box>
  )
}
