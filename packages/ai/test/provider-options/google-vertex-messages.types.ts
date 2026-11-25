/**
 * Google·Vertex AI·消息的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/google-vertex-messages
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { GoogleVertexMessages } from "../../src/providers.js"

const model = GoogleVertexMessages.configure({ accessToken: "test", project: "project" }).model("claude")

ai.request({ model, prompt: "Hello", providerOptions: { effort: "medium" } })

ai.request({
  model,
  prompt: "Hello",
  // @ts-expect-error Vertex Anthropic effort must be a string.
  providerOptions: { effort: false },
})
