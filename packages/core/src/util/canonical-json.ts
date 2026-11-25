/**
 * 规范化 JSON 序列化。
 * 按稳定键序输出 JSON，便于哈希与比较。
 */
import type { Schema } from "effect"

export function canonicalJson(value: Schema.Json): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`
  return JSON.stringify(value)
}
