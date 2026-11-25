/**
 * 运行时平台 — Pwa。
 * 识别浏览器平台能力并做适配中负责 Pwa 部分，提供该部分所需的实现与类型定义。
 */
import { useLocation } from "@solidjs/router"
import { createEffect } from "solid-js"
import { stripBasePath, withBasePath } from "./base-path"

const LAST_ROUTE_KEY = "opencode.pwa.last-route"

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone === true)
  )
}

export function restorePwaRoute() {
  if (stripBasePath(location.pathname) !== "/" || location.search || location.hash) return

  try {
    const value = localStorage.getItem(LAST_ROUTE_KEY)

    if (!value) return
    const url = new URL(value, location.origin)

    if (url.origin !== location.origin || url.searchParams.has("auth_token")) return

    if (
      url.pathname !== "/" &&
      url.pathname !== "/new-session" &&
      !/^\/server\/[^/]+\/session\/[^/]+$/.test(url.pathname)
    )
      return
    history.replaceState(history.state, "", withBasePath(url.pathname) + url.search + url.hash)
  } catch {
    // Storage may be unavailable; keep the launch URL in that case.
  }
}

export function PwaRoutePersistence() {
  const location = useLocation()
  createEffect(() => {
    const value = location.pathname + location.search + location.hash

    try {
      localStorage.setItem(LAST_ROUTE_KEY, value)
    } catch {
      // Navigation must still work when storage is unavailable or full.
    }
  })

  return null
}
