/**
 * Provider 模型 — Agent。
 * provider 下模型的展示与配置中负责 Agent 部分，提供该部分所需的实现与类型定义。
 */
export function hasCustomAgent(items: Array<{ native?: boolean }>) {
  return items.some((item) => item.native === false)
}

export function resolveAgent<T extends { name: string }>(items: T[], name?: string) {
  return items.find((item) => item.name === name) ?? items.find((item) => item.name === "build") ?? items[0]
}
