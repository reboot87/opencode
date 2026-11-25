/**
 * 模块 — Router。
 * 该目录下的功能模块中负责 Router 部分，提供该部分所需的实现与类型定义。
 */
import { createMemoryHistory, MemoryRouter, type BaseRouterProps } from "@solidjs/router"
import { onCleanup } from "solid-js"
import { getLastActiveUrl, setLastActiveUrl } from "./route-storage"

export function DesktopMemoryRouter(props: BaseRouterProps & { windowID: string }) {
  const history = createMemoryHistory()
  const initialUrl = getLastActiveUrl(props.windowID)

  if (initialUrl !== "/") history.set({ value: initialUrl, replace: true, scroll: false })
  onCleanup(history.listen((value) => setLastActiveUrl(props.windowID, value)))

  return <MemoryRouter {...props} history={history} />
}
