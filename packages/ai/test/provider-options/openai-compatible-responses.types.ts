/**
 * OpenAI·兼容·响应的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/openai-compatible-responses
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { OpenAICompatibleResponses } from "../../src/providers.js"

const model = OpenAICompatibleResponses.configure({ baseURL: "https://example.com" }).model("model")

ai.request({ model, prompt: "Hello", providerOptions: { reasoningSummary: "detailed" } })
ai.request({ model, prompt: "Hello", providerOptions: { reasoningEffort: "high" } })
ai.request({ model, prompt: "Hello", providerOptions: { reasoningEffort: "experimental" } })
ai.request({ model, prompt: "Hello", providerOptions: { textVerbosity: "low" } })
ai.request({ model, prompt: "Hello", providerOptions: { textVerbosity: "verbose" } })

ai.request({
  model,
  prompt: "Hello",
  // @ts-expect-error Open Responses reasoning summaries use a fixed union.
  providerOptions: { reasoningSummary: "full" },
})
