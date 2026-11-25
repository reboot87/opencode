/**
 * 对等性应用场景：代码围栏·折行·模拟。
 *
 * 规格编号：E.6b。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A reply with a fence that holds one shell line wider than the transcript, at the top level and in a list item.
// Both clients wrap the line by word inside the fence (Core's default `wrapMode: "word"`, OpenTUI #2089 in Rust).
import { defineSim } from "../../sim/scenario"

const duration = { line: "· \\d.*", reason: "the turn duration depends on timing, also in length; the row ends there" }
const command =
  "OPENCODE_STORY_MEDIA=/home/user/src/opencode/packages/tui/fixtures/story-media.json OPENCODE_STORY=transcript-fences bun run dev:live /home/user/src/project"

export default defineSim({
  height: 40,
  model: [
    {
      items: [
        { type: "textDelta", text: "Run the story:\n\n```sh\n" },
        { type: "textDelta", text: `${command}\n\`\`\`\n\n` },
        { type: "textDelta", text: `1. Then in a list:\n\n   \`\`\`sh\n   ${command}\n   \`\`\`\n\nDone.` },
      ],
    },
  ],
  steps: [
    { until: "Simulated Model" },
    { type: "Show the story command" },
    { until: "story command" },
    { enter: true },
    { checkpoint: "done", until: "Done.", masks: [duration] },
  ],
})
