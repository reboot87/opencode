#!/usr/bin/env bun

/**
 * UI 构建脚本 — Pack。
 * 前端 UI 包的构建与生成脚本中负责 Pack 部分，提供该部分所需的实现与类型定义。
 */
import path from "node:path"
import { pack } from "@opencode/script/pack"

await pack(path.resolve(import.meta.dir, ".."))
