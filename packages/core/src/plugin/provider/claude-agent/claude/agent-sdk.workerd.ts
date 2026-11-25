/**
 * Claude Agent SDK（Workerd）。
 * 在 workerd 运行时提供类型再导出的占位实现。
 */
export type * from "@anthropic-ai/claude-agent-sdk"

// workerd cannot spawn the claude process, and the Claude Agent plugin skips itself there.
throw new Error("The Claude Agent SDK is unavailable on the workerd runtime")
