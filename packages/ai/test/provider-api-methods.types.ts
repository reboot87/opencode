/**
 * 供应商·API·方法的类型定义（类型断言用）。
 *
 * 被测模块：@opencode/ai/provider-api-methods
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { ai } from "../src/index.js"
import { DigitalOcean, OpenAI, OpenRouter, Venice, XAI } from "../src/providers.js"

for (const p of [OpenAI, XAI, Venice, OpenRouter, DigitalOcean]) {
  p.chat("x")
  p.configure().chat("x")
  void ai.generate({ model: p.chat("x"), prompt: "Say hi" })
}
