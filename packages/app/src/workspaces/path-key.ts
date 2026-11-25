/**
 * 工作区界面 — PathKey。
 * 工作区的管理界面中负责 PathKey 部分，提供该部分所需的实现与类型定义。
 */
import { comparablePath } from "@opencode/util/path"

export type PathKey = string & { _brand: "PathKey" }

export const pathKey = (path: string) => comparablePath(path) as PathKey
