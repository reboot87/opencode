/**
 * 应用运行时 — ArrayMove。
 * 浏览器端应用的运行时环境与服务装配中负责 ArrayMove 部分，提供该部分所需的实现与类型定义。
 */
export function arrayMove<T>(items: T[], from: number, to: number) {
  if (from === to) return items

  const next = items.slice()
  next.splice(to, 0, ...next.splice(from, 1))

  return next
}
