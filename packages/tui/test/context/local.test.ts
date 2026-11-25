/**
 * 上下文测试 — LocalTest。
 * 终端上下文的测试中负责 LocalTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { recentModels } from "../../src/model-preference"

test("moves a model to the front, deduplicates, and limits recents", () => {
  const recent = Array.from({ length: 12 }, (_, index) => ({
    providerID: "provider",
    modelID: `model-${index}`,
  }))

  expect(recentModels({ providerID: "provider", modelID: "model-5" }, recent)).toEqual([
    { providerID: "provider", modelID: "model-5" },
    ...recent.slice(0, 5),
    ...recent.slice(6, 10),
  ])
})
