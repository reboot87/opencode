/**
 * 浏览器磁盘 — HandlePathTest。
 * 浏览器插件的磁盘数据存储中负责 HandlePathTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import path from "node:path"
import { runElectronFixture } from "../electron-run"

// A verifier belongs to one main instance of the plugin: a reload closes it and creates the next, which may start
// before the previous one closed. This runs that in the pinned Electron, whose libuv the Windows lookup asks.
test(
  "verifiers open, close and reopen in one process, two alive at once, and a closed one refuses",
  async () => {
    const result = JSON.parse(await runElectronFixture({ fixture: path.join(import.meta.dir, "handle-path.fixture.ts") }))

    expect(result).toEqual({
      opened: "named",
      closed: "File previews and transfers are unavailable in this build because file verification could not be loaded.",
      reopened: "named",
      overlapping: ["named", "named"],
      afterPrevious: "named",
      cycles: ["named"],
      leaked: false,
    })
  },
  // Starting Electron takes seconds on a loaded runner.
  60_000,
)
