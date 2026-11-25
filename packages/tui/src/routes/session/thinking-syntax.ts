/**
 * 会话界面 — ThinkingSyntax。
 * 会话主界面的视图与状态中负责 ThinkingSyntax 部分，提供该部分所需的实现与类型定义。
 */
import { SyntaxStyle, type NativeResourceOwner, type RGBA } from "@opentui/core"

export function generateThinkingSyntax(syntax: SyntaxStyle, foreground: RGBA, owner: NativeResourceOwner) {
  return SyntaxStyle.fromStyles(
    Object.fromEntries(syntax.getRegisteredNames().map((name) => [name, { ...syntax.getStyle(name), fg: foreground }])),
    owner,
  )
}
