/**
 * 服务·status的测试。
 *
 * 被测模块：@opencode/server/service-status
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect } from "bun:test"
import { Effect } from "effect"
import { it } from "../../core/test/lib/effect"
import { Status } from "../src/service-status"

it.effect("moves from starting to ready", () =>
  Effect.gen(function* () {
    const status = yield* Status.make()
    expect(yield* status.current).toEqual({ type: "starting" })
    yield* status.ready
    expect(yield* status.current).toEqual({ type: "ready" })
  }),
)

it.effect("keeps a startup failure until shutdown", () =>
  Effect.gen(function* () {
    const status = yield* Status.make()
    yield* status.fail
    yield* status.ready
    yield* status.fail
    expect(yield* status.current).toEqual({ type: "failed" })
  }),
)

it.effect("keeps stopping after shutdown begins", () =>
  Effect.gen(function* () {
    const status = yield* Status.make()

    yield* status.beginStopping
    expect(yield* status.current).toEqual({ type: "stopping" })
    yield* status.beginStopping
    expect(yield* status.current).toEqual({ type: "stopping" })
  }),
)
