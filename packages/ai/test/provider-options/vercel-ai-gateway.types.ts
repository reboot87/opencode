/**
 * Vercel·AI·网关的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/vercel-ai-gateway
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { VercelAIGateway } from "../../src/providers/vercel-ai-gateway.js"

const gateway = VercelAIGateway.configure({
  apiKey: "fixture",
  providerOptions: { gateway: { only: ["anthropic", "bedrock"], caching: "auto" }, reasoningEffort: "high" },
})
ai.request({
  model: gateway.model("meta/muse-spark-1.3"),
  prompt: "Hello",
  providerOptions: { reasoningEffort: "max" },
})
ai.request({
  model: gateway.messages("anthropic/claude-sonnet-5.5"),
  prompt: "Hello",
  providerOptions: { thinking: { type: "enabled", budgetTokens: 2048 } },
})
ai.request({
  model: gateway.responses("openai/gpt-6-luna"),
  prompt: "Hello",
  providerOptions: { reasoningSummary: "detailed", cacheTTL: "1h" },
})
VercelAIGateway.configure({
  providerOptions: {
    gateway: { byok: { anthropic: [{ apiKey: "fixture" }] } },
    upstream: { google: { thinkingConfig: { includeThoughts: true, thinkingBudget: 1024 } } },
  },
})
// @ts-expect-error A thinking budget is numeric.
VercelAIGateway.configure({ providerOptions: { thinking: { type: "enabled", budgetTokens: "many" } } })
