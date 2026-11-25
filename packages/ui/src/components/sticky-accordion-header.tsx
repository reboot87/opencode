/**
 * 通用组件 — StickyAccordionHeader。
 * 跨场景复用的通用 UI 组件中负责 StickyAccordionHeader 部分，提供该部分所需的实现与类型定义。
 */
import { Accordion } from "@opencode/ui/accordion"
import { ParentProps } from "solid-js"

export function StickyAccordionHeader(
  props: ParentProps<{ class?: string; classList?: Record<string, boolean | undefined> }>,
) {
  return (
    <Accordion.Header
      data-component="sticky-accordion-header"
      classList={{
        ...props.classList,
        [props.class ?? ""]: !!props.class,
      }}
    >
      {props.children}
    </Accordion.Header>
  )
}
