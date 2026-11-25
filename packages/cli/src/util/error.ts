/**
 * 错误信息提取。
 * 从任意错误值中提取可读的消息文本。
 */
export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message
  }
  return String(error)
}
