/**
 * 数据站工具 — Methodology。
 * 数据站点的通用工具中负责 Methodology 部分，提供该部分所需的实现与类型定义。
 */
import type { Key } from "../i18n"

export const methodologyItems = [
  ["methodology.updatesLabel", "methodology.updates"],
  ["methodology.tokensLabel", "methodology.tokens"],
  ["methodology.usersLabel", "methodology.users"],
  ["methodology.costLabel", "methodology.cost"],
  ["methodology.retentionLabel", "methodology.retention"],
  ["methodology.citeLabel", "methodology.cite"],
] as const satisfies readonly (readonly [Key, Key])[]
