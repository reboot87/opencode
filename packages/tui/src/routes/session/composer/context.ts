/**
 * 输入组合器 — Context。
 * 会话输入区的组合与快捷键中负责 Context 部分，提供该部分所需的实现与类型定义。
 */
import { createContext, useContext } from "solid-js"

export interface ComposerHint {
  label: string
  shortcut: string
}

export interface ComposerTab {
  id: string
  label: string
  hints?: () => ComposerHint[]
}

export const ComposerContext = createContext<{
  register: (tab: ComposerTab) => () => void
  active: (id: string) => boolean
  close: () => void
}>()

export function useComposerTab() {
  const ctx = useContext(ComposerContext)
  if (!ctx) throw new Error("useComposerTab must be used within a Composer")
  return ctx
}
