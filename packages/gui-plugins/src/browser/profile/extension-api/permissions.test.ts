/**
 * 浏览器扩展 API — PermissionsTest。
 * 浏览器插件暴露给扩展的接口中负责 PermissionsTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { holds } from "./permissions"

// `request` answers `true` only for what the manifest already requires: this browser grants nothing optional.
test("an extension holds the permissions and origins its manifest requires, and nothing more", () => {
  const granted = { permissions: ["storage", "tabs"], hosts: ["https://*.example.com/*"] }

  expect(holds(granted, { permissions: ["storage"] })).toBe(true)
  expect(holds(granted, { permissions: ["storage", "contextMenus"] })).toBe(false)
  expect(holds(granted, { origins: ["https://app.example.com/*"] })).toBe(true)
  expect(holds(granted, { origins: ["https://example.com/*"] })).toBe(true)
  expect(holds(granted, { origins: ["<all_urls>"] })).toBe(false)
  expect(holds({ permissions: [], hosts: ["<all_urls>"] }, { origins: ["<all_urls>"] })).toBe(true)
  expect(holds({ permissions: [], hosts: ["<all_urls>"] }, { origins: ["*://example.com/*"] })).toBe(true)
  // A narrow host never stands for a wildcard one.
  expect(holds({ permissions: [], hosts: ["https://x.com/x"] }, { origins: ["https://*.com/*"] })).toBe(false)
  expect(holds({ permissions: [], hosts: ["https://example.com/docs/*"] }, { origins: ["https://example.com/*"] })).toBe(
    false,
  )
  expect(holds({ permissions: [], hosts: ["*://*/*"] }, { origins: ["file:///*"] })).toBe(false)
})
