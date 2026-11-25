/**
 * 通用组件 — DockSurface。
 * 跨场景复用的通用 UI 组件中负责 DockSurface 部分，提供该部分所需的实现与类型定义。
 */
import { type ComponentProps, splitProps } from "solid-js"

export interface DockTrayProps extends ComponentProps<"div"> {
  attach?: "none" | "top"
}

export function DockShell(props: ComponentProps<"div">) {
  const [split, rest] = splitProps(props, ["children", "class", "classList"])

  return (
    <div
      {...rest}
      data-dock-surface="shell"
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
    >
      {split.children}
    </div>
  )
}

export function DockTray(props: DockTrayProps) {
  const [split, rest] = splitProps(props, ["attach", "children", "class", "classList"])

  return (
    <div
      {...rest}
      data-dock-surface="tray"
      data-dock-attach={split.attach || "none"}
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
    >
      {split.children}
    </div>
  )
}
