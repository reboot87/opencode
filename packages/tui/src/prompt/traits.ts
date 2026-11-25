/**
 * 提示输入 — Traits。
 * 提示输入的解析、编辑与提交中负责 Traits 部分，提供该部分所需的实现与类型定义。
 */
import type { EditorTraits } from "@opentui/core"

export type PromptMode = "normal" | "shell"

export interface PromptTraitsInput {
  mode: PromptMode
  autocompleteVisible: boolean
}

export type PromptTraits = EditorTraits & {
  owner: "opencode"
  role: "prompt"
}

/** The managed textarea keymap owns `suspend`; these traits only describe capture and status. */
export function computePromptTraits(input: PromptTraitsInput): PromptTraits {
  const capture =
    input.mode === "normal"
      ? input.autocompleteVisible
        ? (["escape", "navigate", "submit", "tab"] as const)
        : (["tab"] as const)
      : undefined
  return {
    capture,
    status: input.mode === "shell" ? "SHELL" : undefined,
    owner: "opencode",
    role: "prompt",
  }
}
