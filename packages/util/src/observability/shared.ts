/**
 * 可观测性共享工具。
 * 生成运行 ID 等共享辅助。
 */
// Lazy: workerd forbids generating random values in global scope, so the id
// materializes on first call (inside a handler) and stays stable afterwards.
let generated: string | undefined

export function runID(): string {
  generated ??= crypto.randomUUID().slice(0, 8)
  return generated
}
