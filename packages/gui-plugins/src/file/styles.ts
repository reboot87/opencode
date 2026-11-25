/**
 * 文件插件 — Styles。
 * 文件预览与操作的 GUI 插件中负责 Styles 部分，提供该部分所需的实现与类型定义。
 */
import tree from "@opencode/ui/file-tree.css?inline"
import artifact from "./artifact-view.css?inline"
import mobile from "./mobile.css?inline"

export default [tree, artifact, mobile].join("\n")
