/**
 * A popup is about one window's selected tab, even when that window is minimized and none of its tabs are visible.
 *
 * 扩展 API中负责 TabActivity 部分：浏览器扩展接口中与 TabActivity 相关的状态、交互与渲染逻辑。
 */
export function createTabActivity() {
  const listeners = new Set<{ windowId: number; tabId?: number; leave: () => void }>()

  return {
    watch(windowId: number, tabId: number | undefined, leave: () => void) {
      const listener = { windowId, tabId, leave }
      listeners.add(listener)

      return () => listeners.delete(listener)
    },
    activated(windowId: number, tabId: number) {
      listeners.forEach((item) => {
        if (item.windowId === windowId && item.tabId !== tabId) item.leave()
      })
    },
    hidden(tabId: number) {
      listeners.forEach((item) => {
        if (item.tabId === tabId) item.leave()
      })
    },
  }
}
