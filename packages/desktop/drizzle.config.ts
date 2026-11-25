/**
 * 模块 — DrizzleConfig。
 * 该目录下的功能模块中负责 DrizzleConfig 部分，提供该部分所需的实现与类型定义。
 */
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/main/storage/schema.ts",
  out: "./src/main/storage/migration",
})
