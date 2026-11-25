/**
 * Cloudflare的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/cloudflare
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { CloudflareWorkersAI } from "../../src/providers.js"

const model = CloudflareWorkersAI.configure({ accountId: "account", apiKey: "test" }).model("model")

ai.request({ model, prompt: "Hello", promptCacheKey: "cache" })

ai.request({
  model,
  prompt: "Hello",
  // @ts-expect-error Prompt cache keys must be strings.
  promptCacheKey: 1,
})
