/**
 * OpenAI·兼容的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/openai-compatible
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { OpenAICompatible } from "../../src/providers.js"

const model = OpenAICompatible.configure({ baseURL: "https://compatible.example/v1" }).model("test-model")

ai.request({ model, prompt: "Hello", providerOptions: { store: false } })

ai.request({
  model,
  prompt: "Hello",
  // @ts-expect-error OpenAI-compatible store must be boolean.
  providerOptions: { store: "false" },
})
