/**
 * Google·Vertex AI·响应的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/google-vertex-responses
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { GoogleVertexResponses } from "../../src/providers.js"

const model = GoogleVertexResponses.configure({ accessToken: "test", project: "project" }).model("gemini")

ai.request({ model, prompt: "Hello", providerOptions: { textVerbosity: "high" } })
ai.request({ model, prompt: "Hello", providerOptions: { textVerbosity: "verbose" } })

ai.request({
  model,
  prompt: "Hello",
  // @ts-expect-error Vertex Responses verbosity must be a string.
  providerOptions: { textVerbosity: 1 },
})
