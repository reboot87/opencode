/**
 * GUI 上下文 — Format。
 * GUI 插件的上下文与状态中负责 Format 部分，提供该部分所需的实现与类型定义。
 */
export function createSessionContextFormatter(locale: string) {
  // The fields luxon's DATETIME_MED preset passed to Intl; output is identical.
  const dateTime = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })

  return {
    number(value: number | null | undefined) {
      if (value === undefined) return "—"

      if (value === null) return "—"

      return value.toLocaleString(locale)
    },
    percent(value: number | null | undefined) {
      if (value === undefined) return "—"

      if (value === null) return "—"

      return value.toLocaleString(locale) + "%"
    },
    time(value: number | undefined) {
      if (!value) return "—"

      return dateTime.format(value)
    },
  }
}
