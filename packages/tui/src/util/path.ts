/**
 * 终端工具 — Path。
 * 终端界面的通用工具函数中负责 Path 部分，提供该部分所需的实现与类型定义。
 */
import { realpathSync } from "node:fs"
import { win32 } from "node:path"

export function normalizePath(input: string, platform: string) {
  if (platform !== "win32") return input
  const resolved = win32.normalize(win32.resolve(input.replaceAll("/", "\\")))
  try {
    return realpathSync.native(resolved)
  } catch {
    return resolved
  }
}
