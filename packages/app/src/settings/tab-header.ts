/**
 * 设置界面 — TabHeader。
 * 应用设置页面的框架中负责 TabHeader 部分，提供该部分所需的实现与类型定义。
 */
// A settings page's header sticks over its body, and the browser does not count sticky elements when it scrolls focus
// into view. settings.css offsets each focusable control by `--settings-tab-header-height`, which this keeps equal to
// the header's height on `scope`. Returns the cleanup.
export function trackTabHeader(scope: HTMLElement, header: HTMLElement) {
  const observer = new ResizeObserver(() =>
    scope.style.setProperty("--settings-tab-header-height", `${header.offsetHeight}px`),
  )

  observer.observe(header)

  return () => observer.disconnect()
}
