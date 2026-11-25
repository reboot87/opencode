/**
 * 共享代码 — WindowBootstrapTest。
 * 主进程与渲染进程共用的类型与工具中负责 WindowBootstrapTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { windowBootstrapArgument, windowBootstrapFromArguments } from "./window-bootstrap"

describe("window bootstrap", () => {
  test("round-trips through argv and keeps unknown values absent", () => {
    const bootstrap = { id: "win a/b ü", firstLaunchPending: false, packaged: true }
    expect(windowBootstrapFromArguments(["electron", windowBootstrapArgument(bootstrap)])).toEqual(bootstrap)
    // Absent means "ask over IPC", so a value must not appear on the way through.
    expect(windowBootstrapFromArguments([windowBootstrapArgument({ id: "x" })])).toEqual({ id: "x" })
    expect(() => windowBootstrapFromArguments(["electron"])).toThrow("Window bootstrap argument not found")
  })
})
