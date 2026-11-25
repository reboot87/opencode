/**
 * 版本控制的测试。
 *
 * 被测模块：@opencode/schema/vcs
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { expect, test } from "bun:test"
import { Schema } from "effect"
import { Vcs } from "../src/vcs.js"

test("review base preserves its stable identity and local provenance", () => {
  expect(Vcs.Base.ast.annotations?.identifier).toBe("Vcs.Base")
  const base = { name: "release", ref: "refs/heads/release" }
  for (const source of ["reflog", "default"] as const) {
    expect(Schema.encodeSync(Vcs.Base)(Schema.decodeUnknownSync(Vcs.Base)({ ...base, source }))).toEqual({
      ...base,
      source,
    })
  }
  expect(() => Schema.decodeUnknownSync(Vcs.Base)({ ...base, source: "configured" })).toThrow()
  expect(() => Schema.decodeUnknownSync(Vcs.Base)({ ...base, source: "worktree" })).toThrow()
})

test("review modes preserve shipped working and combined branch names", () => {
  for (const mode of ["working", "branch", "committed"] as const) {
    expect(Schema.decodeUnknownSync(Vcs.Mode)(mode)).toBe(mode)
  }
  expect(() => Schema.decodeUnknownSync(Vcs.Mode)("unknown")).toThrow()
})
