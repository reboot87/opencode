#!/usr/bin/env bun

/**
 * 打包脚本。
 *
 * SDK 包的开发脚本：文档生成与示例同步。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

await pack(path.resolve(import.meta.dir, ".."))
