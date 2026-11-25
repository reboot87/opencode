#!/usr/bin/env bun

/**
 * 打包脚本。
 *
 * 服务端的开发脚本：路由生成与联调环境准备。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

await pack(path.resolve(import.meta.dir, ".."))
