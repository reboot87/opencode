/**
 * Provider 模型 — SpeedTest。
 * provider 下模型的展示与配置中负责 SpeedTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { cycleModelSpeed, orderedSpeeds } from "./speed"

const speeds = [
  { id: "fast", faster: true },
  { id: "flex", faster: false },
  { id: "ultrafast", faster: true },
]

test("orders speeds from slowest to fastest around the standard speed, and cycles through them", () => {
  expect(orderedSpeeds(speeds)).toEqual(["flex", undefined, "fast", "ultrafast"])
  expect(cycleModelSpeed("flex", speeds)).toBeUndefined()
  expect(cycleModelSpeed(undefined, speeds)).toBe("fast")
  expect(cycleModelSpeed("ultrafast", speeds)).toBe("flex")
  // A speed the model no longer has starts over from the slowest.
  expect(cycleModelSpeed("gone", speeds)).toBe("flex")
})
