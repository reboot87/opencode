/**
 * 终端测试 — KeybindTest。
 * 终端界面的测试中负责 KeybindTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { TuiKeybind } from "../src/config/keybind"

test("binds agent cycling only to shift+tab by default", () => {
  expect(TuiKeybind.Definitions["agent.cycle"].default).toBe("shift+tab")
  expect(TuiKeybind.Definitions["agent.cycle.reverse"].default).toBe("none")
})
