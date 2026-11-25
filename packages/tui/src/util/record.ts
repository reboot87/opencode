/**
 * 终端工具 — Record。
 * 终端界面的通用工具函数中负责 Record 部分，提供该部分所需的实现与类型定义。
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}
