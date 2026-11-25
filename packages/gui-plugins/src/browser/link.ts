/**
 * 浏览器插件 — Link。
 * 内置浏览器功能的 GUI 插件中负责 Link 部分，提供该部分所需的实现与类型定义。
 */
import { encodeFilePath } from "@opencode/util/path"
import { workspacePrefix } from "./remote-address"

/** The file:// URL of a workspace-relative path. */
export function workspaceFileURL(root: string, path: string, remoteSession?: string) {
  if (remoteSession) return `${workspacePrefix(remoteSession)}${encodeFilePath(path)}`

  return `file://${encodeFilePath(`${root.replaceAll("\\", "/").replace(/\/+$/, "")}/${path}`)}`
}

/** Only ordinary file presentation may reuse an existing (or still opening) tab. */
export function reusableFile(url: string | undefined, intent: "present" | "new") {
  return intent === "present" && url && /^(?:file|workspace):/.test(url) ? url.split(/[?#]/, 1)[0] : undefined
}

/** The tab that already shows this file, whatever query or fragment its address has. Opening the file again reloads that tab. */
export function fileTab<Tab extends { readonly url: string }>(tabs: readonly Tab[], file: string) {
  return tabs.find((tab) => tab.url.split(/[?#]/, 1)[0] === file)
}
