/**
 * 主机·d（开发期支持）。
 *
 * CLI 开发服务器的热更新支持：按需刷新与错误浮层。
 */
import type { Effect, Fiber, FileSystem } from "effect"
import type { TuiInput } from "@opencode/tui"
import type { Global } from "@opencode/util/global"
import type { Route } from "../../tui/src/context/route"

export type Run = (input: TuiInput) => Effect.Effect<void, unknown, Global.Service | FileSystem.FileSystem>

export declare const host: {
  active?: Fiber.Fiber<void, unknown>
  mount?: (app: Run) => Promise<void>
  stop?: () => Promise<void>
  reset?: () => void
  recover?: () => boolean
  settle?: () => void
  route?: Route
}
