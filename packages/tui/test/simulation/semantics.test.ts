/**
 * 仿真测试 — SemanticsTest。
 * 会话仿真的测试中负责 SemanticsTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { BoxRenderable } from "@opentui/core"
import { Effect } from "effect"
import { SimulationSemantics as Reader } from "@opencode/simulation/frontend/semantics"
import { SimulationRenderer } from "@opencode/simulation/frontend/renderer"
import { SimulationSemantics } from "../../src/simulation/semantics"

test("shares lazy semantic annotations with the simulation renderer", async () => {
  await Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const renderer = yield* SimulationRenderer.create({})
        const renderable = new BoxRenderable(renderer, { id: "permission" })
        let selected = false
        SimulationSemantics.bind(() => ({ role: "option", selected }))(renderable)

        expect(Reader.read(renderable)?.()).toEqual({ role: "option", selected: false })
        selected = true
        expect(Reader.read(renderable)?.()).toEqual({ role: "option", selected: true })
      }),
    ),
  )
})
