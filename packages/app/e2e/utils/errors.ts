/**
 * 端到端测试工具 — Errors。
 * 端到端测试的公共辅助中负责 Errors 部分，提供该部分所需的实现与类型定义。
 */
import type { Page } from "@playwright/test"

export function trackPageErrors(page: Page) {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.stack ?? error.message))
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
  })

  return errors
}
