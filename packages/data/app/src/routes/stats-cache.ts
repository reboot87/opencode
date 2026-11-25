/**
 * 数据站路由 — StatsCache。
 * 数据站点的路由页面中负责 StatsCache 部分，提供该部分所需的实现与类型定义。
 */
import { LOCALE_HEADER } from "../lib/language"

// Stats change throughout the day; expired snapshots must refresh before reuse.
export const statsPageCacheControl = "public, max-age=60, s-maxage=300, must-revalidate"

export function setStatsPageCacheHeaders(headers: Headers | undefined) {
  if (!headers) return

  headers.set("Cache-Control", statsPageCacheControl)
  // The same URL serves Markdown to clients that ask for it.
  appendVary(headers, "Accept", LOCALE_HEADER)
}

function appendVary(headers: Headers, ...values: string[]) {
  const existing = headers
    .get("vary")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  headers.set(
    "vary",
    values
      .reduce(
        (result, value) =>
          result.some((item) => item.toLowerCase() === value.toLowerCase()) ? result : [...result, value],
        existing ?? [],
      )
      .join(", "),
  )
}
