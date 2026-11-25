#!/usr/bin/env bun

/**
 * 仓库脚本：生成。
 */

import { $ } from "bun"

await $`bun run generate`.cwd("packages/protocol")

await $`bun run generate`.cwd("services/site")

await $`./script/format.ts`
