/**
 * 浏览器测试 — ThemePreloadTest。
 * 浏览器环境下的测试中负责 ThemePreloadTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { inlineThemePreload } from "../vite.js"

// The production HTML carries the theme preload inline, so the first paint already has the user's color scheme.
test.each(["/oc-theme-preload.js", "./oc-theme-preload.js"])("inlines %s before the renderer runs", (path) => {
  const html = inlineThemePreload(`<script id="oc-theme-preload-script" src="${path}"></script>`)
  expect(html).not.toContain(" src=")
  expect(html).toContain("opencode-color-scheme")
})
