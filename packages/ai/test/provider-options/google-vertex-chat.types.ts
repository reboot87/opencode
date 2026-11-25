/**
 * Google·Vertex AI·chat的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/google-vertex-chat
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { GoogleVertexChat } from "../../src/providers.js"

const model = GoogleVertexChat.configure({ accessToken: "test", project: "project" }).model("gemini")

ai.request({ model, prompt: "Hello", providerOptions: { serviceTier: "priority" } })
ai.request({ model, prompt: "Hello", providerOptions: { serviceTier: "future-tier" } })
