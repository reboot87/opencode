#!/usr/bin/env bun

/**
 * 打包脚本。
 *
 * 插件包的开发脚本：打包校验与示例生成。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

// The app's and desktop's internal protocol, the API only the built-in plugins use, and the app's own updater contract
// stay in the workspace.
await pack(path.resolve(import.meta.dir, ".."), { workspaceOnly: ["./gui/host", "./gui/builtin", "./gui/updater"] })
