/**
 * 浏览器插件 — ElectronWorkersTest。
 * 内置浏览器功能的 GUI 插件中负责 ElectronWorkersTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import path from "node:path"
import { runElectronFixture } from "./electron-run"

// A tab pauses its page's children at start to guard them (`attachChildren` in child-targets.ts). Chromium pauses the
// page's workers too, so this runs the policy in the pinned Electron: a worker the tab does not release never starts.
test.each([
  { fixture: "electron-workers", expected: { started: "nested,worker" } },
  { fixture: "profile/filter-startup", expected: { worker: true, emptyRules: true } },
])("the pinned Electron honors $fixture", async ({ fixture, expected }) => {
  const line = await runElectronFixture({ fixture: path.join(import.meta.dir, `${fixture}.fixture.ts`) })

  expect(JSON.parse(line)).toEqual(expected)
}, // Starting Electron takes seconds on a loaded runner.
60_000)
