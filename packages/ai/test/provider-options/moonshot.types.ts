/**
 * Moonshot的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/moonshot
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { Moonshot } from "../../src/providers.js"

const moonshot = Moonshot.configure()

ai.request({
  model: moonshot.model("kimi-k2.6"),
  prompt: "Hello",
  providerOptions: { thinking: { type: "enabled", keep: "all" } },
})
ai.request({
  model: moonshot.chat("kimi-k2.6"),
  prompt: "Hello",
  providerOptions: { thinking: { type: "disabled", keep: null } },
})
ai.request({ model: moonshot.chat("kimi-k3"), prompt: "Hello", providerOptions: { reasoningEffort: "high" } })
ai.request({
  model: moonshot.messages("kimi-k3"),
  prompt: "Hello",
  providerOptions: { effort: "low", metadata: { user_id: "fixture" } },
})
ai.request({
  model: moonshot.responses("kimi-k3"),
  prompt: "Hello",
  providerOptions: { reasoningEffort: "future-effort" },
})

ai.request({
  model: moonshot.messages("kimi-k3"),
  prompt: "Hello",
  // @ts-expect-error Messages exposes effort rather than the K2 Chat thinking parameter.
  providerOptions: { thinking: { type: "enabled" } },
})
ai.request({
  model: moonshot.chat("kimi-k2.6"),
  prompt: "Hello",
  // @ts-expect-error Preserved thinking takes a string or null.
  providerOptions: { thinking: { type: "enabled", keep: true } },
})
ai.request({
  model: moonshot.responses("kimi-k3"),
  prompt: "Hello",
  // @ts-expect-error Responses uses reasoningEffort rather than the Messages effort option.
  providerOptions: { effort: "high" },
})
