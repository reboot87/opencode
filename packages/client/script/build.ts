#!/usr/bin/env bun

/**
 * 构建脚本。
 *
 * 客户端包的开发脚本：类型生成与 API 对齐检查。
 */

import { $ } from "bun"
import path from "node:path"
import { fileURLToPath } from "node:url"

process.chdir(fileURLToPath(new URL("..", import.meta.url)))

await $`rm -rf dist`
await $`bun tsc -p tsconfig.build.json`
const root = path.resolve("src")
const result = await Bun.build({
  entrypoints: await Array.fromAsync(new Bun.Glob("**/*.ts").scan({ cwd: root, absolute: true })).then((files) =>
    files.filter((file) => !file.endsWith(".d.ts")),
  ),
  root,
  outdir: "dist",
  target: "node",
  format: "esm",
  packages: "external",
  splitting: true,
  naming: {
    entry: "[dir]/[name].[ext]",
    chunk: "chunks/[name]-[hash].[ext]",
  },
})
if (!result.success) throw new AggregateError(result.logs, "Failed to build Client")
