/**
 * 模块 — PlaywrightComponentsConfig。
 * 该目录下的功能模块中负责 PlaywrightComponentsConfig 部分，提供该部分所需的实现与类型定义。
 */
import { fileURLToPath } from "node:url"
import type { PlaywrightTestConfig } from "@playwright/test"
import { componentConfig } from "../stories/playwright/config"

const config: PlaywrightTestConfig = componentConfig(fileURLToPath(new URL(".", import.meta.url)))

export default config
