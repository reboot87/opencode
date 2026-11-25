#!/usr/bin/env node

/*
 * 守护进程 npm 包装：opencode·伪终端。
 */

/*
 * 守护进程 npm 包装：opencode·伪终端。
 */

import { spawnSync } from "node:child_process"
import { binaryPath } from "../index.js"

if (!binaryPath) {
  console.error(`opencode-pty is unavailable for ${process.platform}-${process.arch}`)
  process.exit(1)
}

const result = spawnSync(binaryPath, process.argv.slice(2), { stdio: "inherit" })
if (result.error) throw result.error
if (result.signal) process.kill(process.pid, result.signal)
process.exit(result.status ?? 1)
