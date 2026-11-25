/**
 * 请求类型标识。
 * 定义用于区分请求用途的自定义请求头。
 */
export * as RequestKind from "./request-kind.js"

export const HEADER = "x-opencode-claude-agent-kind"
export const SESSION_HEADER = "x-opencode-session-id"
export const FORK_HEADER = "x-opencode-claude-agent-fork-source"
