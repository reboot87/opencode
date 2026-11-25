/**
 * 标题栏 — TabTitle。
 * 自定义窗口标题栏中负责 TabTitle 部分，提供该部分所需的实现与类型定义。
 */
import { isFallbackTitle } from "@opencode/util/session-title-fallback"

// Draft, preparing, and untitled session tabs share one localized label.
export function sessionTabTitle(title: string | undefined, fallback: string) {
  return !title || isFallbackTitle(title) ? fallback : title
}
