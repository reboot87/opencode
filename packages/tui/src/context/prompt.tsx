/**
 * UI 上下文 — Prompt。
 * UI 包的上下文提供者中负责 Prompt 部分，提供该部分所需的实现与类型定义。
 */
import { createSimpleContext } from "./helper"
import type { PromptRef } from "../component/prompt"

export const { use: usePromptRef, provider: PromptRefProvider } = createSimpleContext({
  name: "PromptRef",
  init: () => {
    let current: PromptRef | undefined

    return {
      get current() {
        return current
      },
      set(ref: PromptRef | undefined) {
        current = ref
      },
    }
  },
})
