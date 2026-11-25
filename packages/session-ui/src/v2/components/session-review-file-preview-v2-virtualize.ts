/**
 * V2 组件 — SessionReviewFilePreviewV2Virtualize。
 * 第二版会话界面组件中负责 SessionReviewFilePreviewV2Virtualize 部分，提供该部分所需的实现与类型定义。
 */
import { virtualizeLineThreshold } from "../../pierre/virtualizer"

export function shouldVirtualizeReviewDiff(input: { additionLines: number; deletionLines: number }) {
  return Math.max(input.additionLines, input.deletionLines) > virtualizeLineThreshold
}
