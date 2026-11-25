/**
 * 对等性基准脚本：E.16·模型·JSON。
 *
 * 对等性基准脚本：产出某一步骤的期望输出，供 Rust 实现逐字比对。
 */
// P-FILE for model.json (E.16): crates/tui/tests/all/models.rs runs this against the state directory the Rust TUI
// writes. `load <state>` prints what the TypeScript client reads; `recent <state> <provider> <model>` adds a
// recent model the way the TypeScript model dialog does, under the same lock.
import path from "node:path"
import { createModelPreferenceRepository } from "../../../tui/src/model-preference"

const [command, state, providerID, modelID] = process.argv.slice(2)
// `bun run parity/fixtures.ts` runs every oracle without arguments; this one writes no fixture.
if (command && state) {
  const repository = createModelPreferenceRepository(path.join(state, "model.json"))
  if (command === "recent") await repository.addRecent({ providerID: providerID!, modelID: modelID! })
  console.log(JSON.stringify(await repository.load()))
}
