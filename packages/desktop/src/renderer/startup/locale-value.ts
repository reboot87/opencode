/**
 * 模块 — LocaleValue。
 * 该目录下的功能模块中负责 LocaleValue 部分，提供该部分所需的实现与类型定义。
 */
export function storedLocaleValue(raw: string | null | undefined) {
  return raw?.match(/"locale"\s*:\s*"([^"]+)"/)?.[1]
}
