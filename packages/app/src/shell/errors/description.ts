/**
 * 错误界面 — Description。
 * 应用级错误边界的展示中负责 Description 部分，提供该部分所需的实现与类型定义。
 */
export function errorDescriptionKey(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "localServerStartup" in error &&
    error.localServerStartup === true
  ) {
    return "error.page.description.localServerStartup" as const
  }

  return "error.page.description" as const
}

export function errorStatus(error: unknown) {
  const seen = new Set<object>()

  const visit = (value: unknown): number | undefined => {
    if (typeof value !== "object" || value === null || seen.has(value)) return
    seen.add(value)
    const item = value as Record<string, unknown>

    for (const key of ["status", "statusCode"] as const) {
      const status = item[key]

      if (typeof status === "number" && Number.isInteger(status) && status >= 100 && status <= 599) return status
    }

    return visit(item.cause) ?? visit(item.data)
  }

  return visit(error)
}
