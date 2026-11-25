/**
 * 渲染进程 — EnvD。
 * Electron 渲染进程的界面逻辑中负责 EnvD 部分，提供该部分所需的实现与类型定义。
 */
import type { ElectronNative } from "../preload/types"

declare global {
  interface ImportMetaEnv {
    readonly OPENCODE_TEST_ONBOARDING: boolean
  }

  interface Window {
    electron: ElectronNative
  }
}
