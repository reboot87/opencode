/**
 * 视觉稳定性工具 — Scenario。
 * 比较界面渲染稳定性差异的辅助函数中负责 Scenario 部分，提供该部分所需的实现与类型定义。
 */
import type { Page, TestInfo } from "@playwright/test"
import type { VisualPlan } from "./invariant"
import { startVisualProbe, stopVisualProbe } from "./probe"
import type { VisualRegionDefinition } from "./regions"
import { reportVisualStability } from "./reporter"

export async function runVisualStabilityScenario<const Regions extends Record<string, VisualRegionDefinition>>(input: {
  page: Page
  testInfo: TestInfo
  name: string
  regions: Regions
  plan: VisualPlan<Extract<keyof Regions, string>>
  run: () => Promise<void>
}) {
  await startVisualProbe(input.page, input.regions)
  await input.run()
  const result = await stopVisualProbe<Extract<keyof Regions, string>>(input.page)
  await reportVisualStability(input.testInfo, input.name, result, input.plan)

  return result
}
