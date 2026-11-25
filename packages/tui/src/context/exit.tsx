/**
 * UI 上下文 — Exit。
 * UI 包的上下文提供者中负责 Exit 部分，提供该部分所需的实现与类型定义。
 */
import { createSimpleContext } from "./helper"

export type Exit = (reason?: unknown) => void

export const { use: useExit, provider: ExitProvider } = createSimpleContext({
  name: "Exit",
  init: (input: { exit: Exit }) => input.exit,
})
