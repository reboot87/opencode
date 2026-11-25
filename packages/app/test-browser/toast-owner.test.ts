/**
 * 浏览器测试 — ToastOwnerTest。
 * 浏览器环境下的测试中负责 ToastOwnerTest 部分，提供该部分所需的实现与类型定义。
 */
import { beforeEach, describe, expect, test } from "bun:test"
import { createSignal, type JSX } from "solid-js"
import { showToast, toaster } from "@opencode/ui/toast"

describe("showToast", () => {
  // The toast registry is module state, so each test starts from an empty stack.
  beforeEach(() => {
    toaster.dismiss()
  })

  test("coalesces exact active content", () => {
    const first = showToast({ title: "Repeated error", description: "Try again" })
    const second = showToast({ title: "Repeated error", description: "Try again" })
    const different = showToast({ title: "Repeated error", description: "A different error" })

    expect(second).toBe(first)
    expect(different).not.toBe(first)

    toaster.dismiss(first)
    toaster.dismiss(different)
  })

  test("allows dismissed content to appear again", () => {
    const first = showToast("Dismiss and retry")
    toaster.dismiss(first)

    const second = showToast("Dismiss and retry")
    expect(second).not.toBe(first)

    toaster.dismiss(second)
  })

  test("recreates matching content when it is not the topmost toast", () => {
    const first = showToast("First toast")
    const topmost = showToast("Topmost toast")
    const repeated = showToast("First toast")

    expect(repeated).not.toBe(first)

    toaster.dismiss(topmost)
    toaster.dismiss(repeated)
  })

  test("creates no reactive computations at call time", () => {
    const [tick, setTick] = createSignal(0)
    let reads = 0

    const icon = (() => {
      reads++
      tick()

      return undefined
    }) as unknown as JSX.Element

    const id = showToast({ description: "test", icon })

    // Resolving the icon at call time creates an ownerless computation that is
    // never disposed and tracks its dependencies forever; it must only resolve
    // once the toast component renders.
    expect(reads).toBe(0)
    setTick(1)
    expect(reads).toBe(0)

    toaster.dismiss(id)
  })
})
