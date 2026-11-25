/**
 * 动态导入（Workerd）。
 * 在 workerd 运行时提供不可用的动态导入占位实现。
 */
const unavailable = () => new Error("Dynamic module loading is unavailable on workerd")

export function importModule(_specifier: string): Promise<unknown> {
  return Promise.reject(unavailable())
}

export function resolveModule(_specifier: string, _directory: string): string {
  throw unavailable()
}
