#!/usr/bin/env bun

/**
 * 构建脚本。
 *
 * 工具包的开发脚本：构建产物打包与发布准备。
 */

import { $ } from "bun"
import { fileURLToPath } from "node:url"

process.chdir(fileURLToPath(new URL("..", import.meta.url)))

await $`rm -rf dist`
await $`bun tsc -p tsconfig.build.json`
