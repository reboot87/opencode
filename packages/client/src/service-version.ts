/**
 * 服务版本校验。
 * 判断服务端版本是否满足要求。
 */
import type { DiscoverOptions } from "./service.js"

export function matchesVersion(version: string | undefined, options: DiscoverOptions) {
  if (options.version === undefined) return true
  if (version === undefined) return false
  if (typeof options.version === "function") return options.version(version)
  return version === options.version
}
