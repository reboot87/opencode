/**
 * 终端插件 — Focus。
 * 内嵌终端的 GUI 插件中负责 Focus 部分，提供该部分所需的实现与类型定义。
 */
export const focusTerminalById = (id: string) => {
  const wrapper = document.getElementById(`terminal-wrapper-${id}`)
  const terminal = wrapper?.querySelector('[data-component="terminal"]')

  if (!(terminal instanceof HTMLElement)) return false

  const textarea = terminal.querySelector("textarea")

  if (textarea instanceof HTMLTextAreaElement) {
    textarea.focus({ preventScroll: true })

    return true
  }

  terminal.focus({ preventScroll: true })
  terminal.dispatchEvent(
    typeof PointerEvent === "function"
      ? new PointerEvent("pointerdown", { bubbles: true, cancelable: true })
      : new MouseEvent("pointerdown", { bubbles: true, cancelable: true }),
  )

  return true
}
