/**
 * 连接服务端 — Browser。
 * 添加与连接远程服务端中负责 Browser 部分，提供该部分所需的实现与类型定义。
 */
import { serverAddress } from "./pairing"

export function isMixedContent(page: string, address: string) {
  if (new URL(page).protocol !== "https:") return false
  const normalized = serverAddress(address)

  if (!normalized) return false
  const url = new URL(normalized)

  if (url.protocol !== "http:") return false
  // Secure Contexts treats loopback HTTP origins as potentially trustworthy.
  const host = url.hostname.replace(/\.$/, "")

  return !(host === "localhost" || host.endsWith(".localhost") || host === "[::1]" || /^127(?:\.\d+){3}$/.test(host))
}
