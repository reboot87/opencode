/**
 * Mistral的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/mistral
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { Mistral } from "../../src/providers.js"

const selected = Mistral.provider.model("mistral-small-latest")

ai.request({ model: selected, prompt: "Hello", providerOptions: { reasoningEffort: "high" } })
ai.request({ model: selected, prompt: "Hello", providerOptions: { reasoningEffort: "future-effort" } })
ai.request({ model: selected, prompt: "Hello", providerOptions: { promptMode: "reasoning" } })
ai.request({ model: selected, prompt: "Hello", providerOptions: { parallelToolCalls: false } })
ai.request({ model: selected, prompt: "Hello", providerOptions: { promptCacheKey: "session-1" } })

ai.request({
  model: selected,
  prompt: "Hello",
  // @ts-expect-error Mistral reasoning effort must be a string.
  providerOptions: { reasoningEffort: 1 },
})

ai.request({
  model: selected,
  prompt: "Hello",
  // @ts-expect-error Mistral prompt mode only supports reasoning.
  providerOptions: { promptMode: "standard" },
})
