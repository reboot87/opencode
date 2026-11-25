/**
 * 终端组件 — DialogAgent。
 * 终端界面（Solid）组件中负责 DialogAgent 部分，提供该部分所需的实现与类型定义。
 */
import { createMemo } from "solid-js"
import { useLocal } from "../context/local"
import { DialogSelect } from "../ui/dialog-select"
import { useDialog } from "../ui/dialog"

export function DialogAgent() {
  const local = useLocal()
  const dialog = useDialog()

  const options = createMemo(() =>
    local.agent.list().map((item) => {
      return {
        value: item.id,
        title: item.id,
        description: item.description,
      }
    }),
  )

  return (
    <DialogSelect
      title="Select agent"
      searchInTitle
      titlePlaceholder="Search agents"
      current={local.agent.current()?.id}
      options={options()}
      onSelect={(option) => {
        local.agent.set(option.value)
        dialog.clear()
      }}
    />
  )
}
