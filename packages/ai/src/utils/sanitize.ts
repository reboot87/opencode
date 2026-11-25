/**
 * 文本清理工具。
 * 去除字符串与键中的孤立 UTF-16 代理项，避免部分 provider 拒绝非法 JSON；未变化子树按引用返回以减少拷贝。
 */
import { Schema } from "effect"
import { Media } from "../media.js"
import { isRecord } from "./record.js"

/**
 * 清理所有字符串、键和嵌套值里的孤立 UTF-16 代理项（lone surrogate）。
 * 某些 provider 拒绝含非法代理对的 JSON，发送前需要修正。
 * 未变化的子树按引用返回，因此含大量历史消息的请求不会被整体拷贝。
 */
export const sanitizeSurrogates = <T>(value: T): T => {
  if (typeof value === "string") return (value.isWellFormed() ? value : value.toWellFormed()) as T
  if (Array.isArray(value)) {
    const items = value.map(sanitizeSurrogates)
    return (
      Object.getPrototypeOf(value) === Array.prototype && items.every((item, index) => item === value[index])
        ? value
        : items
    ) as T
  }
  // Media assets carry binary or base64 payloads and a lazy byte cache; flattening them into a record would drop both.
  if (value instanceof Uint8Array || value instanceof Error || value instanceof Media.Asset) return value
  if (!isRecord(value)) return value
  const entries = Object.entries(value)
  const sanitized = entries.map(([key, entry]) => [sanitizeSurrogates(key), sanitizeSurrogates(entry)] as const)
  // Changed nodes and other objects (such as Date) are copied into plain records as before. Unchanged plain
  // records and Schema class instances are kept: a copy would hold the same fields, and Schema constructors
  // decode such a copy back into an equal instance.
  if (
    sanitized.every(([key, entry], index) => key === entries[index][0] && entry === entries[index][1]) &&
    (Object.getPrototypeOf(value) === Object.prototype || Schema.isSchema(value.constructor))
  )
    return value
  return Object.fromEntries(sanitized) as T
}
