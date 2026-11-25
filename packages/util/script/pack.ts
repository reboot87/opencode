#!/usr/bin/env bun

/**
 * 打包脚本。
 *
 * 工具包的开发脚本：构建产物打包与发布准备。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

await pack(path.resolve(import.meta.dir, ".."))
