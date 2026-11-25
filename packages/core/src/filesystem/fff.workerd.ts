/**
 * 文件查找库（Workerd 平台）。
 * 在 workerd 运行时提供不可用占位实现。
 */
import { bind } from "./fff.js"

export type { Directory, DirSearch, File, Init, Mixed, MixedSearch, Picker, Result, Search } from "./fff.js"

// No fff backend exists on workerd; every create reports unavailability and
// FileSystemSearch degrades the same way it does on a runtime without the native module.
const adapter = bind(undefined, "fff unavailable on workerd runtime")

export const available = adapter.available
export const create = adapter.create

export * as Fff from "./fff.workerd.js"
