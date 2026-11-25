/**
 * UI 上下文 — Epilogue。
 * UI 包的上下文提供者中负责 Epilogue 部分，提供该部分所需的实现与类型定义。
 */
import { createSimpleContext } from "./helper"
import type { SessionEpilogue } from "../util/presentation"

// What the banner printed after the TUI closes should mention.
export type Epilogue = {
  session(value?: SessionEpilogue): void
  // The version a local update installed while the TUI was running.
  updatedVersion(version: string): void
}

export const { use: useEpilogue, provider: EpilogueProvider } = createSimpleContext({
  name: "Epilogue",
  init: (props: { value: Epilogue }) => props.value,
})
