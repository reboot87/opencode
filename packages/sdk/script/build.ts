#!/usr/bin/env bun

/**
 * 构建脚本。
 *
 * SDK 包的开发脚本：文档生成与示例同步。
 */

import { $ } from "bun"
import { rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

process.chdir(fileURLToPath(new URL("..", import.meta.url)))

await rm("dist", { recursive: true, force: true })
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
if (!result.success) throw new AggregateError(result.logs, "Failed to build SDK")
