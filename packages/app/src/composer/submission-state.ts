/**
 * 输入组合器 — SubmissionState。
 * 会话输入区的组合逻辑与附件处理中负责 SubmissionState 部分，提供该部分所需的实现与类型定义。
 */
import type { ComposerState } from "./state"

export type ComposerStateTarget = ReturnType<ComposerState["capture"]>
