/**
 * 运行时插件 — Attachment。
 * 浏览器端的插件加载与扩展点中负责 Attachment 部分，提供该部分所需的实现与类型定义。
 */
import { createContext, useContext } from "solid-js"
import type { createPluginAttachment } from "./host-apis"

// Apart from `host-apis.tsx`, so session code such as the side panels reads the attachment without loading the HostApis.
const AttachmentContext = createContext<ReturnType<typeof createPluginAttachment>>()

export function usePluginAttachment() {
  const value = useContext(AttachmentContext)

  if (!value) throw new Error("Plugin attachment is unavailable")

  return value
}

export const PluginAttachmentProvider = AttachmentContext.Provider
