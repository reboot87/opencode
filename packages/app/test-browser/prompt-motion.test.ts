/**
 * 浏览器测试 — PromptMotionTest。
 * 浏览器环境下的测试中负责 PromptMotionTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { promptMotionIssues } from "../e2e/utils/prompt-motion"

// Negative controls for the painted-prompt check in e2e/regression/mobile-timeline-scroll.spec.ts.
test.each([
  ["a prompt that disappears after it painted", [100, null, 100], [{ frame: 1, reason: "missing" }]],
  ["a prompt that moves back up", [100, 130, 120], [{ frame: 2, reason: "reversed" }]],
])("rejects %s", (_name, tops, issues) => {
  expect(promptMotionIssues(tops.map((top, frame) => ({ frame, top })))).toEqual(issues)
})
