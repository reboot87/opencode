/**
 * Extension-supplied text on a browser-owned surface must fit one line and cannot reorder adjacent labels.
 *
 * 扩展 API中负责 Label 部分：浏览器扩展接口中与 Label 相关的状态、交互与渲染逻辑。
 */
export function extensionLabel(text: string) {
  return text.slice(0, 256).replace(/[\p{Cc}\p{Bidi_Control}\p{Zl}\p{Zp}]/gu, " ").trim().slice(0, 128)
}
