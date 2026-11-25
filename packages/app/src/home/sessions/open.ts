/**
 * 主页会话 — Open。
 * 主页中会话列表的展示中负责 Open 部分，提供该部分所需的实现与类型定义。
 */
export function shouldOpenSessionInBackground(input: {
  button: number
  mac: boolean
  meta: boolean
  ctrl: boolean
  shift: boolean
  alt: boolean
}) {
  if (input.button === 1) return true

  if (input.button !== 0) return false

  if (input.shift || input.alt) return false

  if (input.mac) return input.meta && !input.ctrl

  return input.ctrl && !input.meta
}
