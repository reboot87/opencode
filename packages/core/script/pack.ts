#!/usr/bin/env bun

/**
 * 打包脚本。
 *
 * 核心包的开发脚本：本地服务桩、数据准备与问题排查。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

await pack(path.resolve(import.meta.dir, ".."), { types: "./dist/types/" })
