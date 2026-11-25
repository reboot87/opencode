/**
 * 文件处理 — ExternalUrl。
 * 桌面端的文件打开与拖放处理中负责 ExternalUrl 部分，提供该部分所需的实现与类型定义。
 */
export function resolveExternalURL(value: string) {
  if (!URL.canParse(value)) return undefined
  const url = new URL(value)

  if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") return url.href

  return undefined
}
