#!/usr/bin/env bun

/**
 * 构建脚本。
 *
 * 协议包的开发脚本：API 定义生成与契约校验。
 */

import { $ } from "bun"
import { fileURLToPath } from "node:url"

process.chdir(fileURLToPath(new URL("..", import.meta.url)))

await $`rm -rf dist`
await $`bun tsc -p tsconfig.build.json`
