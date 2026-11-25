import "./tooltip.css"
import { onCleanup, onMount } from "solid-js"
import { startTooltips } from "./tooltips"

/** The site's one tooltip, hidden until an element with `data-tip` asks for it (tooltips.ts).
 *
 * 站点界面组件：悬浮提示。
 */
export function Tooltips() {
  let tip!: HTMLDivElement
  onMount(() => onCleanup(startTooltips(tip)))
  return <div ref={tip} data-component="tooltip" role="tooltip" hidden />
}
