/**
 * 浏览器插件 — PluginTabsTest。
 * 内置浏览器功能的 GUI 插件中负责 PluginTabsTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { Browser } from "@opencode/plugin-browser/rpc"
import { pluginTabs } from "./plugin-tabs"

test("only the creating consumer can close a plugin tab, using its handle, until the tab closes", () => {
  const grants = pluginTabs()
  const tab = Browser.TabID.make("tab_aaaaaaaa-1111-1111-1111-111111111111")
  const user = Browser.TabID.make("tab_bbbbbbbb-1111-1111-1111-111111111111")
  const { id, created, settled } = grants.reserve("first")
  expect(grants.resolve("first", id)).toBeUndefined()
  created(tab)
  expect(grants.resolve("first", id)).toBeUndefined()
  settled()
  expect(id).not.toBe(tab)
  expect(grants.resolve("first", id)).toBe(tab)
  expect(grants.resolve("second", id)).toBeUndefined()
  expect(grants.resolve("first", tab)).toBeUndefined()
  expect(grants.resolve("first", user)).toBeUndefined()
  grants.forget(tab)
  expect(grants.resolve("first", id)).toBeUndefined()
})
