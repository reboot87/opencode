/**
 * 工具展示 — ProjectPath。
 * 工具调用与结果的展示组件中负责 ProjectPath 部分，提供该部分所需的实现与类型定义。
 */
import { comparablePath, containsDirectory } from "@opencode/util/path"

/** `path` relative to the project `directory`, or `path` itself when it is outside the project. */
export function relativizeProjectPath(path: string, directory?: string) {
  if (!path) return ""

  if (!directory) return path

  if (directory === "/") return path

  if (directory === "\\") return path

  // A Windows path names the same folder with either separator and any drive letter case, so `c:/repo/src` and
  // `getDirectory`'s `C:/repo/src/` are both inside `C:\repo`.
  if (!containsDirectory(directory, path)) return path

  return path.slice(comparablePath(directory).replace(/\/$/, "").length).replace(/^[/\\]+/, "")
}
