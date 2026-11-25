/**
 * 系统功能插件 — StatsData。
 * 以插件形式提供的系统级功能中负责 StatsData 部分，提供该部分所需的实现与类型定义。
 */
import type { SessionStatsInfo } from "@opencode/client"
import { TokenUsage } from "@opencode/schema/token-usage"

export function statsMetrics(stats: SessionStatsInfo) {
  return [
    {
      label: "tokens",
      value: TokenUsage.total(stats.tokens),
    },
    { label: "best streak", value: stats.streak },
    { label: "active days", value: stats.activeDays },
    { label: "sessions", value: stats.sessions },
  ]
}

export function statsNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}
