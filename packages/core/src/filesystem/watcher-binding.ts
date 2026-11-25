/**
 * 监听器绑定。
 * 按 libc 差异解析原生文件监听模块。
 */
import { createRequire } from "node:module"

declare const OPENCODE_LIBC: string | undefined

// Lazy: on workerd import.meta.url is undefined and the watcher is never
// loaded, so createRequire must not run at module scope.
export default function load() {
  const require = createRequire(import.meta.url)
  const libc = typeof OPENCODE_LIBC === "undefined" ? undefined : OPENCODE_LIBC
  return require(
    process.env.OPENCODE_PARCEL_WATCHER_PATH ??
      `@parcel/watcher-${process.platform}-${process.arch}${process.platform === "linux" ? `-${libc || "glibc"}` : ""}`,
  )
}
