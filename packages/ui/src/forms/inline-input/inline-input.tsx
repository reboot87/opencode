/**
 * 行内输入 — InlineInput。
 * 嵌入文本流的输入组件中负责 InlineInput 部分，提供该部分所需的实现与类型定义。
 */
import type { ComponentProps } from "solid-js"
import { splitProps } from "solid-js"

export type InlineInputProps = ComponentProps<"input"> & {
  width?: string
}

export function InlineInput(props: InlineInputProps) {
  const [local, others] = splitProps(props, ["class", "width", "style"])

  const style = () => {
    if (!local.style) return { width: local.width }

    if (typeof local.style === "string") {
      if (!local.width) return local.style

      return `${local.style};width:${local.width}`
    }

    if (!local.width) return local.style

    return { ...local.style, width: local.width }
  }

  return <input data-component="inline-input" class={local.class} style={style()} {...others} />
}
