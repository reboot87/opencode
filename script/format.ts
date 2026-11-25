#!/usr/bin/env bun

/**
 * 仓库脚本：格式化。
 */

import { $ } from "bun"

await $`bun run prettier --ignore-unknown --write .`
