/**
 * 运行时平台 — ExternalLink。
 * 识别浏览器平台能力并做适配中负责 ExternalLink 部分，提供该部分所需的实现与类型定义。
 */
import { ComponentProps, splitProps } from "solid-js"

export interface ExternalLinkProps extends Omit<ComponentProps<"a">, "href"> {
  href: string
}

export function ExternalLink(props: ExternalLinkProps) {
  const [local, rest] = splitProps(props, ["href", "children", "class", "target", "rel"])

  return (
    <a
      href={local.href}
      class={`text-text-strong underline ${local.class ?? ""}`}
      target={local.target ?? "_blank"}
      rel={local.rel ?? "noopener noreferrer"}
      {...rest}
    >
      {local.children}
    </a>
  )
}
