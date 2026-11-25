/**
 * Code Mode 执行服务接口。
 * 定义 Code Mode 工具执行服务的 Context 服务标识。
 */
export * as CodeModeExecution from "./execution.js"

import type { Context as ToolContext } from "@opencode/schema/tool"
import { Context } from "effect"

/** The `execute` call a Code Mode program runs under, so extensions can act for its session like a tool does. */
export class Service extends Context.Service<Service, ToolContext & { signal: AbortSignal }>()(
  "@opencode/CodeModeExecution",
) {}
