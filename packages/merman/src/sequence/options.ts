/**
 * 模块 — Options。
 * 该目录下的功能模块中负责 Options 部分，提供该部分所需的实现与类型定义。
 */
import type { BorderStyle } from "@opentui/core"

export const DEFAULT_MIN_PARTICIPANT_GAP = 18
export const DEFAULT_FRAGMENT_BORDER_STYLE = "rounded" satisfies BorderStyle

export function normalizeSequenceMinParticipantGap(value: number | undefined): number {
  return value === undefined || !Number.isFinite(value) ? DEFAULT_MIN_PARTICIPANT_GAP : Math.max(1, Math.floor(value))
}
