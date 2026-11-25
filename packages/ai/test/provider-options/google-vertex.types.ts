/**
 * Google·Vertex AI的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/google-vertex
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { GoogleVertex } from "../../src/providers.js"

const model = GoogleVertex.provider.configure({ apiKey: "test" }).model("gemini-2.5-pro")

ai.request({
  model,
  prompt: "Hello",
  providerOptions: { thinkingConfig: { includeThoughts: true } },
})

ai.request({
  model,
  prompt: "Hello",
  // @ts-expect-error Vertex Gemini includeThoughts must be boolean.
  providerOptions: { thinkingConfig: { includeThoughts: "yes" } },
})
