/**
 * The element that scrolls a settings page: the whole settings view in the wide layout, the page's own panel in the narrow one.
 *
 * 设置界面中负责 Scroller 部分：应用设置中与 Scroller 相关的状态、交互与渲染逻辑。
 */
export function settingsScroller(panel: HTMLElement) {
  if (getComputedStyle(panel).overflowY !== "visible") return panel

  return panel.closest<HTMLElement>(".settings") ?? panel
}
