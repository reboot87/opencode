/**
 * 分裂按钮 — SplitButton。
 * 主操作加下拉菜单的组合按钮中负责 SplitButton 部分，提供该部分所需的实现与类型定义。
 */
import { splitProps, type ComponentProps, type ParentProps } from "solid-js"
import "./split-button.css"

export function SplitButton(props: ParentProps<ComponentProps<"div">>) {
  const [split, rest] = splitProps(props, ["class", "classList", "children"])

  return (
    <div
      data-component="split-button-v2"
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
      {...rest}
    >
      {split.children}
    </div>
  )
}

export function SplitButtonAction(props: ComponentProps<"button">) {
  const [split, rest] = splitProps(props, ["class", "classList"])

  return (
    <button
      type="button"
      data-component="split-button-v2-action"
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
      {...rest}
    />
  )
}

export function SplitButtonMenuTrigger(props: ComponentProps<"button">) {
  const [split, rest] = splitProps(props, ["class", "classList"])

  return (
    <button
      type="button"
      data-component="split-button-v2-menu-trigger"
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
      {...rest}
    />
  )
}
