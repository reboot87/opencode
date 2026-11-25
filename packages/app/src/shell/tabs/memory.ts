/**
 * 标签页 — Memory。
 * 多标签页的打开与切换中负责 Memory 部分，提供该部分所需的实现与类型定义。
 */
import { createRoot, type Owner } from "solid-js"

type Entry = {
  value: unknown
  dispose: VoidFunction
}

export function createTabMemory(owner: Owner | null) {
  const entries = new Map<string, Map<string, Entry>>()

  const remove = (key: string) => {
    const state = entries.get(key)

    if (!state) return

    for (const entry of state.values()) entry.dispose()
    entries.delete(key)
  }

  return {
    get<T>(key: string, name: string) {
      return entries.get(key)?.get(name)?.value as T | undefined
    },
    ensure<T>(key: string, name: string, init: () => T) {
      const state = entries.get(key) ?? new Map<string, Entry>()

      if (!entries.has(key)) entries.set(key, state)
      const existing = state.get(name)

      if (existing) return existing.value as T
      const entry = createRoot((dispose) => ({ value: init(), dispose }), owner)
      state.set(name, entry)

      return entry.value
    },
    remove,
    dispose() {
      for (const key of entries.keys()) remove(key)
    },
  }
}
