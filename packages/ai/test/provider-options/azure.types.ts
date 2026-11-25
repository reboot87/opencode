/**
 * Azure的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-options/azure
 *
 * 覆盖供应商级可配置项（温度、思考预算、缓存策略等）的生效行为。
 */
import { ai } from "../../src/effect.js"
import { Azure } from "../../src/providers.js"

const model = Azure.configure({ resourceName: "example" }).responses("deployment")

ai.request({ model, prompt: "Hello", providerOptions: { store: false } })

ai.request({
  model,
  prompt: "Hello",
  // @ts-expect-error Azure OpenAI store must be boolean.
  providerOptions: { store: "false" },
})
