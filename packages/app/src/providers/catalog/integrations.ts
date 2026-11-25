/**
 * Provider 目录 — Integrations。
 * 可用模型目录的浏览界面中负责 Integrations 部分，提供该部分所需的实现与类型定义。
 */
import { useServerSDK } from "@/runtime/server/client"
import { useData } from "@/runtime/server/current"
import { createEffect, type Accessor } from "solid-js"

export function useIntegrations(directory: Accessor<string | undefined>) {
  const serverSDK = useServerSDK()
  const data = useData()

  createEffect(() => {
    if (serverSDK.connection.status() !== "connected") return
    const value = directory()
    void (async () => {
      const ref = value ? { directory: value } : undefined

      if (!ref) await data.location.syncInfo()
      await data.location.integration.sync(ref ?? data.location.default())
    })().catch(() => undefined)
  })

  const location = () => {
    const value = directory()

    return value ? { directory: value } : undefined
  }

  return {
    ready: () => data.location.integration.list(location()) !== undefined,
    list: () => data.location.integration.list(location()) ?? [],
  }
}
