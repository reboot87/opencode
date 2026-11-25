/**
 * 调试插件 — Signal。
 * 面向开发者的调试 GUI 插件中负责 Signal 部分，提供该部分所需的实现与类型定义。
 */
import path from "node:path"

/** Where SIGUSR2 writes heap snapshots while memory diagnostics are on: a caller-chosen absolute folder, or none. */
export function snapshotDirectory(env: NodeJS.ProcessEnv) {
  const directory = env.OPENCODE_DESKTOP_HEAP_DIRECTORY

  return directory && path.isAbsolute(directory) ? directory : undefined
}

/** Server heap serialization blocks all of its sessions; signal captures require a separate opt-in. */
export function signalIncludesServer(env: NodeJS.ProcessEnv) {
  return env.OPENCODE_DESKTOP_HEAP_INCLUDE_SERVER === "1"
}
