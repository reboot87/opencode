/**
 * UI 构建脚本 — CopyIcons。
 * 前端 UI 包的构建与生成脚本中负责 CopyIcons 部分，提供该部分所需的实现与类型定义。
 */
import { $ } from "bun"
import { resolveChannel } from "./utils"

const arg = process.argv[2]

const channel = arg === "dev" || arg === "beta" || arg === "prod" ? arg : resolveChannel()

const src = `./icons/${channel}`

const dest = "resources/icons"

await $`rm -rf ${dest}`

await $`cp -R ${src} ${dest}`

console.log(`Copied ${channel} icons from ${src} to ${dest}`)
