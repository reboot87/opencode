/**
 * 文档站组件：卡片分组。
 */
import type { JSX } from "solid-js"

// Without `cols` the cards fill the row as they fit (docs-variants.css).
export function CardGroup(props: { cols?: number; children?: JSX.Element }) {
  return (
    <div data-component="card-group" style={props.cols ? `--card-columns: ${props.cols}` : undefined}>
      {props.children}
    </div>
  )
}
