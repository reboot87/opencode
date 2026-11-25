/**
 * 浏览器测试 — ModelSelectionTest。
 * 浏览器环境下的测试中负责 ModelSelectionTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { fileURLToPath } from "node:url"

test("LocalProvider selection integration", async () => {
  // Isolate provider module substitutions from the rest of the browser suite.
  const child = Bun.spawn(
    [
      process.execPath,
      "test",
      "--conditions=browser",
      "--preload",
      "./happydom.ts",
      "./test-browser/fixtures/model-selection.ts",
    ],
    { cwd: fileURLToPath(new URL("..", import.meta.url)), stdout: "pipe", stderr: "pipe" },
  )

  const [status, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ])

  expect(status, stdout + stderr).toBe(0)
}, 30_000)
