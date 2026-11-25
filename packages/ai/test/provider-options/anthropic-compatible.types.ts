/**
 * Anthropic·兼容的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/anthropic-compatible
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { AnthropicCompatible } from "../../src/providers.js"

const model = AnthropicCompatible.configure({ baseURL: "https://example.com" }).model("claude")

ai.request({ model, prompt: "Hello", providerOptions: { effort: "high" } })

ai.request({
  model,
  prompt: "Hello",
  // @ts-expect-error Anthropic effort must be a string.
  providerOptions: { effort: 1 },
})
