/**
 * command 接口处理器。
 * 命令接口处理器：列举与执行自定义命令。
 */
import { Command } from "@opencode/core/command"
import { HttpApiBuilder } from "effect/http-api"
import { Api } from "../api"
import { response } from "../location"

export const CommandHandler = HttpApiBuilder.group(Api, "server.command", (handlers) =>
  handlers.handle("command.list", () => response(Command.Service.use((command) => command.list()))),
)
