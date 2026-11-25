/**
 * 时间线悬疑复现 — ViteConfig。
 * 复现特定时间线渲染问题的端到端用例中负责 ViteConfig 部分，提供该部分所需的实现与类型定义。
 */
import { defineConfig } from "vite"
import solid from "vite-plugin-solid"

export default defineConfig({
  root: import.meta.dirname,
  plugins: [solid()],
})
