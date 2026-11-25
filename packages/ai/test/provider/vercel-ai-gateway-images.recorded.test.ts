/**
 * Vercel·AI·网关·图片·录制的的测试。
 *
 * 被测模块：@opencode/ai/provider/vercel-ai-gateway-images.recorded
 *
 * 覆盖各家供应商的接入实现：请求构造、响应解析与错误映射。
 */
import { describe, expect } from "bun:test"
import { Effect } from "effect"
import { ai } from "../../src/effect.js"
import { VercelAIGateway } from "../../src/providers.js"
import { dimensions } from "../lib/image.js"
import { recordedTests } from "../recorded-test.js"

const model = VercelAIGateway.configure({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "fixture",
}).image("meta/muse-image-1.0")

const recorded = recordedTests({
  prefix: "vercel-ai-gateway-images",
  provider: "vercel-ai-gateway",
  protocol: "openai-images",
  requires: ["AI_GATEWAY_API_KEY"],
})

describe("Vercel AI Gateway Images recorded", () => {
  recorded.effect("generates an image", () =>
    Effect.gen(function* () {
      const response = yield* ai.image.generate({
        model,
        prompt: "A simple flat black circle centered on a plain white background.",
        providerOptions: { outputFormat: "webp" },
      })

      expect(response.images).toHaveLength(1)
      expect(response.images[0].mediaType).toBe("image/webp")
      expect(new TextDecoder().decode((yield* response.images[0].bytes()).subarray(8, 12))).toBe("WEBP")
      expect(model.provider).toBe("vercel-ai-gateway")
      expect(response.usage?.details).toHaveProperty("vercel-ai-gateway")
      expect(response.providerMetadata).toHaveProperty("vercel-ai-gateway")
    }),
  )

  // Grok ignores `size` behind the Gateway; replay matches the recorded `providerOptions.xai` body.
  recorded.effect(
    "sizes Grok through xAI provider options",
    () =>
      Effect.gen(function* () {
        const response = yield* ai.image.generate({
          model: VercelAIGateway.configure({ apiKey: process.env.AI_GATEWAY_API_KEY ?? "fixture" }).image(
            "spacexai/grok-imagine-image",
          ),
          prompt: "A simple flat black circle centered on a plain white background.",
          aspect: "16:9",
          resolution: "1K",
        })

        expect(dimensions(yield* response.images[0].bytes())).toEqual({ width: 1280, height: 720 })
      }),
    { timeout: 120_000 },
  )
})
