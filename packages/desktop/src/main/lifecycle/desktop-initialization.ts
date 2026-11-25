/**
 * 生命周期 — DesktopInitialization。
 * 桌面端窗口与应用的启动退出流程中负责 DesktopInitialization 部分，提供该部分所需的实现与类型定义。
 */
export * as DesktopInitialization from "./desktop-initialization"

import { app } from "electron"
import { Context, Effect, Layer } from "effect"
import { DesktopLogging } from "../native/logging"
import { marks } from "./marks"
import {
  loadProxyEnvironment,
  preferApplicationEnvironment,
  prepareApplicationEnvironment,
  prepareDesktop,
} from "./environment"

export interface Interface {
  readonly version: string
}

export class Service extends Context.Service<Service, Interface>()("opencode/desktop/DesktopInitialization") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const logging = yield* DesktopLogging.Service
    yield* preferApplicationEnvironment
    // System certificates, the proxy and the net log serve later network work; the first window and
    // its IPC port do not wait for them.
    yield* Effect.forkScoped(
      prepareApplicationEnvironment.pipe(Effect.andThen(loadProxyEnvironment), Effect.andThen(logging.startNetwork)),
    )
    yield* Effect.promise(() => app.whenReady())
    yield* prepareDesktop
    marks.init = Date.now()

    return Service.of({
      version: app.getVersion(),
    })
  }),
)
