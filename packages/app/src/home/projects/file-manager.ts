/**
 * 主页项目 — FileManager。
 * 主页中项目列表的展示中负责 FileManager 部分，提供该部分所需的实现与类型定义。
 */
export type FileManagerOS = "macos" | "windows" | "linux" | "unknown"

export function fileManagerApp(os: FileManagerOS): {
  label: "session.header.open.finder" | "session.header.open.fileExplorer" | "session.header.open.fileManager"
  actionLabel:
    | "session.header.reveal.finder"
    | "session.header.reveal.fileExplorer"
    | "session.header.reveal.containingFolder"
  icon: "finder" | "file-explorer"
} {
  if (os === "macos")
    return { label: "session.header.open.finder", actionLabel: "session.header.reveal.finder", icon: "finder" }

  if (os === "windows")
    return {
      label: "session.header.open.fileExplorer",
      actionLabel: "session.header.reveal.fileExplorer",
      icon: "file-explorer",
    }

  return {
    label: "session.header.open.fileManager",
    actionLabel: "session.header.reveal.containingFolder",
    icon: "finder",
  }
}
