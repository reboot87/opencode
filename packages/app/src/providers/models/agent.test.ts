/**
 * Provider 模型 — AgentTest。
 * provider 下模型的展示与配置中负责 AgentTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { hasCustomAgent, resolveAgent } from "./agent"

test("hasCustomAgent detects only explicitly custom agents", () => {
  expect(hasCustomAgent([{ native: true }, { native: false }])).toBe(true)
  expect(hasCustomAgent([{ native: true }, {}])).toBe(false)
})

const agents = [{ name: "plan" }, { name: "build" }, { name: "custom" }]

const rows: { name: string; agents: { name: string }[]; requested?: string; expected: string }[] = [
  { name: "the requested available agent", agents, requested: "custom", expected: "custom" },
  { name: "build without a request", agents, requested: undefined, expected: "build" },
  { name: "build for a missing agent", agents, requested: "missing", expected: "build" },
  {
    name: "the first agent when build is unavailable",
    agents: [{ name: "custom" }],
    requested: "missing",
    expected: "custom",
  },
]

test.each(rows)("resolveAgent uses $name", (row) => {
  expect(resolveAgent(row.agents, row.requested)?.name).toBe(row.expected)
})
