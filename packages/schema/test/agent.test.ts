/**
 * 智能体的测试。
 *
 * 被测模块：@opencode/schema/agent
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect, test } from "bun:test"
import { Schema } from "effect"
import { Agent } from "../src/agent.js"

test("Agent.Color preserves configured colors at the public boundary", () => {
  const encode = Schema.encodeSync(Agent.Color)

  expect(encode("info")).toBe("info")
  expect(encode("custom-color")).toBe("custom-color")
})
