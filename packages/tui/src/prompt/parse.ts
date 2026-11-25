/**
 * 提示输入 — Parse。
 * 提示输入的解析、编辑与提交中负责 Parse 部分，提供该部分所需的实现与类型定义。
 */
export function parseFileLineRange(input: string) {
  const hash = input.lastIndexOf("#")
  if (hash <= 0) return { base: input }

  const match = input.slice(hash + 1).match(/^(\d+)(?:-(\d*))?$/)
  if (!match) return { base: input }

  const startLine = Number(match[1])
  const endLine = match[2] && startLine < Number(match[2]) ? Number(match[2]) : undefined
  return { base: input.slice(0, hash), lineRange: { startLine, endLine } }
}

export function stripFileLineRange(input: string) {
  return parseFileLineRange(input).base
}

export function parseSlashHead(text: string, separator = /[ \t\n]/) {
  if (!text.startsWith("/")) return

  const end = text.slice(1).search(separator)
  if (end === -1) return { name: text.slice(1), arguments: "", end: text.length }

  const split = end + 1
  return { name: text.slice(1, split), arguments: text.slice(split + 1), end: split }
}
