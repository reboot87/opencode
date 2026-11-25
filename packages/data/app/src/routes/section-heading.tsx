/**
 * 数据站路由 — SectionHeading。
 * 数据站点的路由页面中负责 SectionHeading 部分，提供该部分所需的实现与类型定义。
 */
import type { JSX } from "solid-js"

export function SectionHeading(props: {
  href: string
  title: string
  description?: string
  slot?: string
  action?: JSX.Element
}) {
  const heading = (
    <h2 data-slot={props.slot ?? "section-title"}>
      <strong>
        <a data-slot="heading-link" href={props.href}>
          <span data-slot="heading-anchor" aria-hidden="true">
            #
          </span>
          {props.title}
          {props.description ? "." : ""}
        </a>
      </strong>
      {props.description && (
        <>
          {" "}
          <span>{props.description}</span>
        </>
      )}
    </h2>
  )
  // Read once: every read of a JSX prop renders it again.
  const action = props.action
  if (!action) return heading
  return (
    <div data-slot="section-heading-row">
      {heading}
      {action}
    </div>
  )
}
