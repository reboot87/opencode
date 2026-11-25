/**
 * 应用外壳 — TimeTest。
 * 浏览器应用的窗口框架与路由外壳中负责 TimeTest 部分，提供该部分所需的实现与类型定义。
 */
import { afterEach, expect, setSystemTime, test } from "bun:test"
import { getRelativeTime } from "./time"

const now = new Date(2026, 8, 22, 12)

const t = (key: string, params?: Record<string, string | number>) => `${key}:${params?.count ?? ""}`

afterEach(() => {
  setSystemTime()
})

test.each([
  [30_000, "common.time.justNow:"],
  [5 * 60_000, "common.time.minutesAgo.short:5"],
  [3 * 3_600_000, "common.time.hoursAgo.short:3"],
  [6 * 86_400_000, "common.time.daysAgo.short:6"],
  [7 * 86_400_000, "Sep 15"],
  [400 * 86_400_000, "Aug 18, 2025"],
])("formats %pms ago", (ago, expected) => {
  setSystemTime(now)

  expect(getRelativeTime(new Date(now.getTime() - ago).toISOString(), t, "en-US")).toBe(expected)
})
