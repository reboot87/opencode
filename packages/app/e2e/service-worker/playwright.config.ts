/**
 * Service Worker 测试 — PlaywrightConfig。
 * Service Worker 行为的端到端用例中负责 PlaywrightConfig 部分，提供该部分所需的实现与类型定义。
 */
import { defineConfig } from "@playwright/test"

// Tiny fixture builds do not need a Rolldown thread for every host CPU.
process.env.RAYON_NUM_THREADS ??= "2"

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  outputDir: "../test-results/service-worker",
  timeout: 60_000,
  workers: 1,
  expect: { timeout: 15_000 },
  use: { browserName: "chromium" },
})
