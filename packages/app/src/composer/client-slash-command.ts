/**
 * 输入组合器 — ClientSlashCommand。
 * 会话输入区的组合逻辑与附件处理中负责 ClientSlashCommand 部分，提供该部分所需的实现与类型定义。
 */
type ClientSlashCommand = {
  id: string
  trigger: string
  arguments?: boolean
  type: "builtin" | "custom"
}

export function parseSlashCommand(text: string) {
  if (!text.startsWith("/")) return
  const separator = text.search(/\s/)
  const name = text.slice(1, separator === -1 ? undefined : separator)

  return { name, input: separator === -1 ? "" : text.slice(separator).trim() }
}

export function parseClientSlashCommand(options: readonly ClientSlashCommand[], text: string) {
  const command = parseSlashCommand(text)

  if (!command) return
  const option = options.find((item) => item.type === "builtin" && item.arguments && item.trigger === command.name)

  if (!option) return

  return {
    id: option.id,
    input: command.input,
  }
}
