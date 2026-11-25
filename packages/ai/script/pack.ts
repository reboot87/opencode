#!/usr/bin/env bun

/**
 * 打包脚本。
 *
 * AI 包的开发脚本：生成代码、校验供应商适配与跑基准。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

await pack(path.resolve(import.meta.dir, ".."))
