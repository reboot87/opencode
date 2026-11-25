#!/usr/bin/env bun

/**
 * 打包脚本。
 *
 * 客户端包的开发脚本：类型生成与 API 对齐检查。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

await pack(path.resolve(import.meta.dir, ".."))
