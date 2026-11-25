/**
 * 对等性应用场景：TypeScript。
 *
 * 规格编号：D.1。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// The environment of the D.1 scenarios: `opencode-native` delegates to the TS CLI from source (`bin/opencode`),
// so both sides run the same TypeScript and must print the same thing. The TS side ignores these variables.
import path from "node:path"

const cli = path.resolve(import.meta.dir, "../../../../cli")

export const env = {
  OPENCODE_TS_BIN: path.join(import.meta.dir, "bin/opencode"),
  D1_CLI: cli,
  D1_PRELOAD: Bun.resolveSync("@opentui/solid/preload", cli),
}
