/**
 * A comment split into plain text and the `@path` mentions that travel with the prompt as attached files.
 *
 * 用户消息引用解析：把引用块拆解为可渲染的消息部件。
 */
export function commentSegments(text: string) {
  return text
    .split(/(@\S+)/)
    .map((part, index) => ({ text: part, mention: index % 2 === 1 }))
    .filter((part) => part.text !== "")
}

/** `:118-124` for a line range, `:42` for one line, nothing for a whole file. */
export function selectionLabel(selection: { startLine: number; endLine: number } | undefined) {
  if (!selection) return ""

  if (selection.startLine === selection.endLine) return `:${selection.startLine}`

  return `:${selection.startLine}-${selection.endLine}`
}
