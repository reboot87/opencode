/**
 * 工具展示 — Ansi。
 * 工具调用与结果的展示组件中负责 Ansi 部分，提供该部分所需的实现与类型定义。
 */
// The pattern from ansi-regex 6.3.0, the one strip-ansi 7 uses: OSC sequences ending in BEL, ESC\ or 0x9c, plus CSI
// and related escapes. An OSC payload stops at its first terminator so an unterminated `ESC ]` cannot rescan the input.
const ANSI =
  /(?:\u001B\][^\u0007\u001B\u009C]*(?:\u0007|\u001B\u005C|\u009C))|[\u001B\u009B][[\]()#;?]*(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]/g

export function stripAnsi(text: string) {
  return text.replace(ANSI, "")
}
