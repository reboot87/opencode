/**
 * Plain-record narrowing. Excludes arrays so JSON object checks don't accept tuples as key/value bags.
 *
 * 收窄为普通对象记录：排除数组，避免 JSON 对象判定把元组误当作键值对容器。
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
