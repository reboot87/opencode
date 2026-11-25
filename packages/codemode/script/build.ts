#!/usr/bin/env bun

/**
 * 构建脚本。
 *
 * Code Mode 的开发脚本：脚本样例生成与沙箱校验。
 */

import { $ } from "bun"
import { fileURLToPath } from "node:url"

process.chdir(fileURLToPath(new URL("..", import.meta.url)))

await $`rm -rf dist`
await $`bun tsc -p tsconfig.build.json`
