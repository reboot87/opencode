/**
 * logging的测试。
 *
 * 被测模块：@opencode/core/logging
 *
 * 覆盖该模块的核心行为与边界条件。
 */
import { describe, expect, test } from "bun:test"
import path from "path"
import { Global } from "@opencode/util/global"
import { Logging } from "@opencode/util/observability/logging"

describe("Logging", () => {
  test("uses a local-specific log file for local installs", () => {
    expect(Logging.file(true, "local")).toBe(path.join(Global.Path.log, "opencode-local.log"))
  })

  test("keeps non-local installs on the default log file", () => {
    expect(Logging.file(false, "next")).toBe(path.join(Global.Path.log, "opencode.log"))
  })
})
