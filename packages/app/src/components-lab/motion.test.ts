/**
 * 组件实验室 — MotionTest。
 * 用于试用与调试 UI 组件的页面中负责 MotionTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { motionTuning } from "@opencode/ui/motion-tuning"
import { sameMotion, storyMotion } from "./motion"

test("a remounted story's replay buttons rebuild the inspector, though their ids match", () => {
  const register = () => motionTuning.action({ id: "lab.test.replay", label: "Replay", group: "Lab test", run() {} })
  const unmount = register()
  const first = storyMotion(["Lab test"])

  expect(sameMotion(first, storyMotion(["Lab test"]))).toBe(true)

  unmount()
  const remount = register()

  expect(sameMotion(first, storyMotion(["Lab test"]))).toBe(false)
  remount()
})
