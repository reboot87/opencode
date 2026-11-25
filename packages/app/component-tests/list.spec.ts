/**
 * 组件测试 — ListSpec。
 * 应用界面组件的测试中负责 ListSpec 部分，提供该部分所需的实现与类型定义。
 */
import { expect, story } from "../../stories/playwright/story"

story("reports a rejected async load instead of no results", async ({ mount }) => {
  const root = await mount("components-list--load-failed")

  await expect(root.locator('[data-slot="list-message"]')).toHaveText("Failed to load results")
})
