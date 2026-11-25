/**
 * 节点·静态资源的测试。
 *
 * 被测模块：@opencode/cli/node-assets
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect, test } from "bun:test"
import { fileURLToPath } from "node:url"
import { collectNodeAssets } from "../script/node-assets"
import { nodeTarget, photonWasmAsset } from "../src/node/target"

test("collects each SEA asset key once", async () => {
  const assets = await collectNodeAssets(nodeTarget(process.platform, process.arch))
  const keys = assets.map((asset) => asset.key)

  expect(new Set(keys).size).toBe(keys.length)
  expect(keys.filter((key) => key === nodeTarget(process.platform, process.arch).opencodePtyAsset)).toHaveLength(1)
  expect(assets.filter((asset) => asset.key === photonWasmAsset)).toEqual([
    {
      key: photonWasmAsset,
      source: fileURLToPath(import.meta.resolve(photonWasmAsset)),
    },
  ])
})
