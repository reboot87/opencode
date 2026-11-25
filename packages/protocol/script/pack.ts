#!/usr/bin/env bun

/**
 * 打包脚本。
 *
 * 协议包的开发脚本：API 定义生成与契约校验。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

await pack(path.resolve(import.meta.dir, ".."))
