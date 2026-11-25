/**
 * 会话界面 — SessionModelHelpersTest。
 * 会话主界面的视图与状态中负责 SessionModelHelpersTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { syncPromptModel } from "./session-model-helpers"

const sonnet = { providerID: "anthropic", modelID: "claude-sonnet-4", variant: "high" }

test.each([
  ["stores the effective session model in prompt state", sonnet, undefined, [sonnet]],
  ["does not rewrite an unchanged prompt model", sonnet, sonnet, []],
  [
    "replaces the submission mirror without changing the effective selection",
    { providerID: "openai", modelID: "gpt", variant: undefined },
    { providerID: "anthropic", modelID: "claude", variant: "high" },
    [{ providerID: "openai", modelID: "gpt", variant: undefined }],
  ],
])("%s", (_name, effective, mirror, writes) => {
  const calls: unknown[] = []

  syncPromptModel(
    {
      model: {
        current: () => ({ id: effective.modelID, provider: { id: effective.providerID } }),
        variant: { current: () => effective.variant },
      },
    },
    { model: { current: () => mirror, set: (model) => calls.push(model) } },
  )

  expect(calls).toEqual(writes)
})
