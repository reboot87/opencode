/**
 * 终端工具 — Project。
 * 终端界面的通用工具函数中负责 Project 部分，提供该部分所需的实现与类型定义。
 */
import path from "path"

export function projectName(project?: { canonical: string; name?: string }, fallback = "") {
  const canonical = project?.canonical ?? fallback
  if (canonical === "/") return fallback ? path.basename(fallback) : undefined
  return project?.name || path.basename(canonical)
}
