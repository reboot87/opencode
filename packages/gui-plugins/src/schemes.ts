/**
 * GUI 插件 — Schemes。
 * GUI 插件的实现中负责 Schemes 部分，提供该部分所需的实现与类型定义。
 */
import type { CustomScheme } from "electron"

import { previewScheme } from "./browser/scheme"

// Registered before app.ready. Only the owning plugin's partition installs a handler. In particular the scheme
// is not local, cannot bypass CSP, and does not support service workers or persistent background registrations.
export const schemes: CustomScheme[] = [
  { scheme: previewScheme, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]
