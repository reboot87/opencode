/**
 * UUID 生成。
 * 优先使用加密安全随机源生成 UUID，不可用时回退。
 */
const fallback = () => Math.random().toString(16).slice(2)

export function uuid() {
  const c = globalThis.crypto

  if (!c || typeof c.randomUUID !== "function") return fallback()

  if (typeof globalThis.isSecureContext === "boolean" && !globalThis.isSecureContext) return fallback()

  try {
    return c.randomUUID()
  } catch {
    return fallback()
  }
}
