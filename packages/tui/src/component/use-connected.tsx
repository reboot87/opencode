/**
 * 终端组件 — UseConnected。
 * 终端界面（Solid）组件中负责 UseConnected 部分，提供该部分所需的实现与类型定义。
 */
import { createMemo } from "solid-js"
import { useData } from "../context/data"
import { hasConnectedProvider } from "../util/connected-provider"

export function useConnected() {
  const data = useData()
  return createMemo(() =>
    hasConnectedProvider({
      integrations: data.location.integration.list() ?? [],
      providers: data.location.provider.list() ?? [],
      models: data.location.model.list() ?? [],
    }),
  )
}
