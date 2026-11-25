/**
 * Shared chunk shapes for OpenAI Chat / OpenAI-compatible Chat fixture tests.
 * Multiple test files build the same `{ id, choices: [{ delta, finish_reason }], usage }`
 * envelope; consolidating here keeps tool-call event shapes consistent.
 *
 * OpenaiChunks：该文件实现 OpenaiChunks 相关的状态与逻辑。
 */

const FIXTURE_ID = "chatcmpl_fixture"

export const deltaChunk = (delta: object, finishReason: string | null = null) => ({
  id: FIXTURE_ID,
  choices: [{ delta, finish_reason: finishReason }],
  usage: null,
})

export const usageChunk = (usage: object) => ({
  id: FIXTURE_ID,
  choices: [],
  usage,
})

export const finishChunk = (reason: string) => deltaChunk({}, reason)

export const toolCallChunk = (id: string, name: string, args: string, index = 0) =>
  deltaChunk({
    role: "assistant",
    tool_calls: [{ index, id, function: { name, arguments: args } }],
  })
