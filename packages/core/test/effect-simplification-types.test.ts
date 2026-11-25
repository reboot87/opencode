/**
 * Effect·simplification·类型定义的测试。
 *
 * 被测模块：@opencode/core/effect-simplification-types
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect, test } from "bun:test"
import { Effect } from "effect"

const source = Effect.succeed(1)
const exactUndefined: Effect.Effect<undefined> = source.pipe(Effect.as(undefined))
// @ts-expect-error Effect.asVoid widens the success type to void.
const voidSuccess: Effect.Effect<undefined> = source.pipe(Effect.asVoid)

test("Effect.as preserves the exact undefined success type", () => {
  expect(Effect.runSync(exactUndefined)).toBeUndefined()
  expect(Effect.runSync(voidSuccess)).toBeUndefined()
})
