/**
 * 动态导入（Bun）。
 * 在 Bun 运行时动态导入模块。
 */
import { pathToFileURL } from "node:url"

export function importModule(specifier: string) {
  return import(specifier) as Promise<unknown>
}

export function resolveModule(specifier: string, directory: string) {
  const resolved = Bun.resolveSync(specifier, directory)
  return resolved.startsWith("node:") ? resolved : pathToFileURL(resolved).href
}
