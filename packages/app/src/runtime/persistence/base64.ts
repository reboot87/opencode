/**
 * 运行时持久化 — Base64。
 * 浏览器端配置的本地持久化中负责 Base64 部分，提供该部分所需的实现与类型定义。
 */
import { base64Decode } from "@opencode/util/encode"

export function decode64(value: string | undefined) {
  if (value === undefined) return

  try {
    return base64Decode(value)
  } catch {
    return
  }
}
