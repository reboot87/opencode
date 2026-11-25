/**
 * xAI的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/xai
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { XAI } from "../../src/providers.js"

const model = XAI.provider.model("grok-4")

ai.request({ model, prompt: "Hello", providerOptions: { reasoningEffort: "high" } })
ai.request({ model, prompt: "Hello", providerOptions: { reasoningEffort: "experimental" } })

ai.request({
  model,
  prompt: "Hello",
  // @ts-expect-error xAI's OpenAI-compatible reasoning effort must be a string.
  providerOptions: { reasoningEffort: true },
})
