/**
 * 生命周期 — Shutdown。
 * 桌面端窗口与应用的启动退出流程中负责 Shutdown 部分，提供该部分所需的实现与类型定义。
 */
export * as Shutdown from "./shutdown"

import { Context, Effect, Layer } from "effect"

/** Something the app stops before it exits, and starts again when a restart handoff fails. */
export interface Participant {
  readonly stop: Effect.Effect<void>
  readonly resume: Effect.Effect<void>
}

export interface Interface {
  readonly add: (participant: Participant) => Effect.Effect<() => void>
  readonly stop: Effect.Effect<void>
  readonly resume: Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("opencode/desktop/Shutdown") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const participants = new Set<Participant>()

    const each = (step: (participant: Participant) => Effect.Effect<void>) =>
      Effect.suspend(() => Effect.forEach(participants, step, { concurrency: "unbounded", discard: true }))

    return Service.of({
      add: (participant) =>
        Effect.sync(() => {
          participants.add(participant)

          return () => participants.delete(participant)
        }),
      stop: each((participant) => participant.stop),
      resume: each((participant) => participant.resume),
    })
  }),
)
