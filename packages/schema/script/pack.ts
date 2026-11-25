#!/usr/bin/env bun

/**
 * 打包脚本。
 *
 * 模式定义包的开发脚本：类型生成与版本对齐。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

await pack(path.resolve(import.meta.dir, ".."))
