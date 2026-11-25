/**
 * 快捷键 — Keybind。
 * 展示按键绑定的组件中负责 Keybind 部分，提供该部分所需的实现与类型定义。
 */
import { type ComponentProps, For, splitProps } from "solid-js"
import "./keybind.css"

export interface KeybindProps extends ComponentProps<"div"> {
  keys: string[]
  variant?: "neutral" | "ghost" | "outline"
}

export function Keybind(props: KeybindProps) {
  const [local, rest] = splitProps(props, ["keys", "variant", "class", "classList"])

  return (
    <div
      {...rest}
      data-component="keybind-v2"
      data-variant={local.variant || "neutral"}
      classList={{
        ...local.classList,
        [local.class ?? ""]: !!local.class,
      }}
    >
      <For each={local.keys}>
        {(key) => (
          <div data-slot="keybind-v2-key">
            <span data-slot="keybind-v2-label">{key}</span>
          </div>
        )}
      </For>
    </div>
  )
}
