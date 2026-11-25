/**
 * Mini 测试 — FooterMenuTest。
 * 精简交互模式的测试中负责 FooterMenuTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { createRoot } from "solid-js"
import { FOOTER_MENU_ROWS, createFooterMenuState } from "../../src/mini/footer.menu"

function mount(count: number, limit = FOOTER_MENU_ROWS) {
  let dispose!: () => void
  let menu!: ReturnType<typeof createFooterMenuState>

  createRoot((nextDispose) => {
    dispose = nextDispose
    menu = createFooterMenuState({ count: () => count, limit })
    return null
  })

  return { menu, dispose }
}

test("footer menu scrolls before the selected row hits the bottom edge", () => {
  const state = mount(20)

  try {
    Array.from({ length: 6 }).forEach(() => state.menu.move(1))

    expect(state.menu.selected()).toBe(6)
    expect(state.menu.offset()).toBe(1)
  } finally {
    state.dispose()
  }
})

test("footer menu scrolls before the selected row hits the top edge", () => {
  const state = mount(20)

  try {
    Array.from({ length: 13 }).forEach(() => state.menu.move(1))
    Array.from({ length: 4 }).forEach(() => state.menu.move(-1))

    expect(state.menu.selected()).toBe(9)
    expect(state.menu.offset()).toBe(7)
  } finally {
    state.dispose()
  }
})
