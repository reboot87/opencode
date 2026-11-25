/**
 * 惰性初始化。
 * 提供惰性求值包装，仅在首次访问时初始化。
 */
export function lazy<T>(fn: () => T) {
  let value: T | undefined
  let loaded = false

  return (): T => {
    if (loaded) return value as T
    loaded = true
    value = fn()
    return value as T
  }
}
