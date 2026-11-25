/**
 * CLI 终端测试 — PermissionTest。
 * CLI 与终端界面协作的测试中负责 PermissionTest 部分，提供该部分所需的实现与类型定义。
 */
import { expect, test } from "bun:test"
import { permissionSemanticLabel } from "../../../src/routes/session/permission"

test("uses the permission action when a surface has no display title", () => {
  expect(permissionSemanticLabel("shell")).toBe("Permission required: shell")
  expect(permissionSemanticLabel("edit", "Edit fixture.txt")).toBe("Permission required: Edit fixture.txt")
})
