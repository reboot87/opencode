/**
 * 桌面端主进程 — EnvD。
 * Electron 主进程的核心逻辑中负责 EnvD 部分，提供该部分所需的实现与类型定义。
 */
interface ImportMetaEnv {
  readonly OPENCODE_CHANNEL: string
  readonly OPENCODE_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
