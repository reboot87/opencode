/**
 * 运行时持久化 — Equality。
 * 浏览器端配置的本地持久化中负责 Equality 部分，提供该部分所需的实现与类型定义。
 */
export function same<T>(a: readonly T[] | undefined, b: readonly T[] | undefined) {
  if (a === b) return true

  if (!a || !b) return false

  if (a.length !== b.length) return false

  return a.every((x, i) => x === b[i])
}
