#!/usr/bin/env bun

/**
 * 构建脚本。
 *
 * 模式定义包的开发脚本：类型生成与版本对齐。
 */

import { $ } from "bun"
import { fileURLToPath } from "node:url"

process.chdir(fileURLToPath(new URL("..", import.meta.url)))

await $`rm -rf dist`
await $`bun tsc -p tsconfig.build.json`
