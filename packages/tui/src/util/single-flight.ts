/**
 * 终端工具 — SingleFlight。
 * 终端界面的通用工具函数中负责 SingleFlight 部分，提供该部分所需的实现与类型定义。
 */
export function createSingleFlight<Key>() {
  const pending = new Set<Key>()
  return async <Value>(key: Key, run: () => Promise<Value>) => {
    if (pending.has(key)) return
    pending.add(key)
    try {
      return await run()
    } finally {
      pending.delete(key)
    }
  }
}
