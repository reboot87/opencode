/**
 * Venice的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/venice
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { Venice } from "../../src/providers.js"

ai.request({
  model: Venice.chat("qwen3-6-27b"),
  prompt: "Hello",
  providerOptions: {
    reasoningEffort: "high",
    reasoning: { summary: "concise" },
    veniceParameters: { includeVeniceSystemPrompt: false },
  },
})
ai.request({
  model: Venice.configure({ providerOptions: { reasoningEffort: "future-effort" } }).model("future-model"),
  prompt: "Hello",
  providerOptions: {
    reasoning: { enabled: false },
    promptCacheRetention: "future-retention",
    parallelToolCalls: false,
  },
})
ai.request({
  model: Venice.chat("qwen3-6-27b"),
  prompt: "Hello",
  // @ts-expect-error Thinking toggles are boolean.
  providerOptions: { reasoning: { enabled: "false" } },
})
ai.request({
  model: Venice.chat("qwen3-6-27b"),
  prompt: "Hello",
  // @ts-expect-error Venice uses nested reasoning, not Anthropic thinking controls.
  providerOptions: { thinking: { type: "disabled" } },
})
ai.request({
  model: Venice.chat("qwen3-6-27b"),
  prompt: "Hello",
  // @ts-expect-error Venice's system-prompt toggle is boolean.
  providerOptions: { veniceParameters: { includeVeniceSystemPrompt: "false" } },
})
