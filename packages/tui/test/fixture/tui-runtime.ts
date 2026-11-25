/**
 * 测试夹具 — TuiRuntime。
 * 终端测试使用的夹具数据中负责 TuiRuntime 部分，提供该部分所需的实现与类型定义。
 */
import { resolve, type Info, type Resolved } from "../../src/config"
import { TuiKeybind } from "../../src/config/keybind"

type ResolvedInput = Omit<Info, "attention" | "keybinds" | "leader"> & {
  attention?: Partial<Resolved["attention"]>
  keybinds?: Partial<TuiKeybind.Keybinds>
  leader?: { timeout?: number }
}

// Tests were written for the previous designs and theme, so they keep new designs off and use
// opencode-classic unless they choose otherwise.
export function createTuiResolvedConfig(input: ResolvedInput = {}) {
  return resolve(
    {
      ...input,
      experimental: { "new-designs": false, ...input.experimental },
      theme: { name: "opencode-classic", ...input.theme },
    },
    { terminalSuspend: process.platform !== "win32", environment: {} },
  )
}
