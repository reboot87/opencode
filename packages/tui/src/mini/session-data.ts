/**
 * Mini 精简界面 — SessionData。
 * 精简交互模式（mini）的界面与交互中负责 SessionData 部分，提供该部分所需的实现与类型定义。
 */
import type { FooterView, MiniFormRequest, MiniPermissionRequest } from "./types"

export function pickBlockerView(input: { permission?: MiniPermissionRequest; form?: MiniFormRequest }): FooterView {
  if (input.permission) return { type: "permission", request: input.permission }
  if (input.form) return { type: "form", request: input.form }
  return { type: "prompt" }
}

export function blockerStatus(view: FooterView) {
  if (view.type === "permission") return "awaiting permission"
  if (view.type === "form") return "awaiting form"
  return ""
}
