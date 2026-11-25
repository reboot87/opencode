/**
 * 工具展示 — ProjectPathTest。
 * 工具调用与结果的展示组件中负责 ProjectPathTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { getDirectory } from "@opencode/util/path"
import { relativizeProjectPath } from "./project-path"

describe("relativizeProjectPath", () => {
  test("shows a Windows path relative to the project whatever its separators or drive letter case", () => {
    expect(relativizeProjectPath("C:\\repo\\src", "C:\\repo")).toBe("src")
    expect(relativizeProjectPath("C:/repo/src", "C:\\repo")).toBe("src")
    expect(relativizeProjectPath("c:\\repo\\src", "C:\\repo")).toBe("src")
    expect(relativizeProjectPath("C:\\Repo\\src", "c:\\repo")).toBe("src")
    expect(relativizeProjectPath(getDirectory("C:\\repo\\src\\util\\format.ts"), "C:\\repo")).toBe("src/util/")
    expect(relativizeProjectPath("C:\\repo", "c:\\repo\\")).toBe("")
    expect(relativizeProjectPath("C:\\other\\src", "C:\\repo")).toBe("C:\\other\\src")
    expect(relativizeProjectPath("C:\\repository\\src", "C:\\repo")).toBe("C:\\repository\\src")
    expect(relativizeProjectPath("\\\\server\\share\\repo\\src", "\\\\SERVER\\share\\repo")).toBe("src")
  })

  test("keeps POSIX paths case-sensitive", () => {
    expect(relativizeProjectPath("/repo/src", "/repo")).toBe("src")
    expect(relativizeProjectPath("/repo/src/", "/repo/")).toBe("src/")
    expect(relativizeProjectPath("/repo", "/repo")).toBe("")
    expect(relativizeProjectPath("/Repo/src", "/repo")).toBe("/Repo/src")
    expect(relativizeProjectPath("/repository/src", "/repo")).toBe("/repository/src")
    expect(relativizeProjectPath("src/a.ts", "/repo")).toBe("src/a.ts")
  })
})
