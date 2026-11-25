/**
 * 组件测试 — OpenInBorderSpec。
 * 应用界面组件的测试中负责 OpenInBorderSpec 部分，提供该部分所需的实现与类型定义。
 */
import { expect, story } from "../../stories/playwright/story"

for (const theme of ["light", "dark"]) {
  story(`keeps the Open in border visible without hovering (${theme})`, async ({ mount, page }, testInfo) => {
    const component = await mount("ui-split-button--open-in", { globals: { theme } })
    const control = component.locator('[data-component="split-button-v2"]')
    await page.mouse.move(0, 0)
    await expect(control).toBeVisible()
    await expect(control).not.toHaveCSS("box-shadow", "none")
    const border = await control.evaluate((element) => getComputedStyle(element).boxShadow)

    await component.getByRole("button", { name: "Open options" }).hover()
    await expect(control).toHaveCSS("box-shadow", border)
    await page.mouse.move(0, 0)
    await expect(control).toHaveCSS("box-shadow", border)
    await control.screenshot({ path: testInfo.outputPath(`open-in-${theme}.png`) })
  })
}
