/**
 * 判断是否为普通记录（plain object）。排除数组，避免把 tuple 误当成键值对象。
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
