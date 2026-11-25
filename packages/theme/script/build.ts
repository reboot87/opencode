#!/usr/bin/env bun

/**
 * UI 构建脚本 — Build。
 * 前端 UI 包的构建与生成脚本中负责 Build 部分，提供该部分所需的实现与类型定义。
 */
import { $ } from "bun"
import { fileURLToPath } from "node:url"

process.chdir(fileURLToPath(new URL("..", import.meta.url)))

await $`rm -rf dist`
await $`bun tsc -p tsconfig.build.json`
