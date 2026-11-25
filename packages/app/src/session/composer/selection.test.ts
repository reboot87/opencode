/**
 * 会话输入区 — SelectionTest。
 * 会话界面输入区的实现中负责 SelectionTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { resolveSessionComposerSelection } from "./selection"

describe("resolveSessionComposerSelection", () => {
  test("prefers durable Session state over historical message metadata", () => {
    expect(
      resolveSessionComposerSelection(
        { agent: "build", model: { id: "claude", providerID: "anthropic" } },
        { agent: "review", model: { modelID: "gpt", providerID: "openai" } },
      ),
    ).toEqual({
      agent: "build",
      model: { modelID: "claude", providerID: "anthropic", variant: undefined },
    })
  })

  test("falls back to historical metadata while durable state is unavailable", () => {
    expect(
      resolveSessionComposerSelection(undefined, {
        agent: "review",
        model: { modelID: "gpt", providerID: "openai", variant: "high" },
      }),
    ).toEqual({
      agent: "review",
      model: { modelID: "gpt", providerID: "openai", variant: "high" },
    })
  })
})
