/**
 * 外壳命令 — Desktop。
 * 应用外壳提供的命令中负责 Desktop 部分，提供该部分所需的实现与类型定义。
 */
import { useLanguage } from "@/runtime/i18n/language"
import { usePlatform } from "@/runtime/platform/platform"
import { useCommand, type CommandOption } from "./command"

export const exportLogsCommand = { id: "logs.export" }

export function DesktopCommands() {
  const command = useCommand()
  const language = useLanguage()
  const platform = usePlatform()

  command.register("desktop", () => {
    const commands: CommandOption[] = []

    if (platform.platform !== "desktop" || !platform.exportDebugLogs) return commands
    commands.push({
      ...exportLogsCommand,
      title: language.t("command.logs.export"),
      category: language.t("command.category.settings"),
      onSelect: () => void platform.exportDebugLogs?.(),
    })

    return commands
  })

  return null
}
