/**
 * 对等性应用场景：工具·失败·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// A failed shell tool with output: the output as a block, the failure line, then the error.
import { defineCli } from "../../cli/run"
import { event, server, textStep } from "./fixture"

export default defineCli({
  args: ["run", "hello"],
  server: server({
    events: () =>
      textStep("Tried.", [
        event("session.tool.input.started", { assistantMessageID: "msg_a", id: "call_2", name: "bash" }, 14),
        event("session.tool.input.delta", { assistantMessageID: "msg_a", id: "call_2", delta: '{"command":' }, 14),
        event(
          "session.tool.called",
          {
            assistantMessageID: "msg_a",
            id: "call_2",
            input: { command: "make test", description: "Run tests" },
            executed: false,
          },
          15,
        ),
        event(
          "session.tool.failed",
          {
            assistantMessageID: "msg_a",
            id: "call_2",
            error: { type: "tool", message: "exit status 2" },
            content: [{ type: "text", text: "FAIL a_test\n" }],
            executed: false,
          },
          16,
        ),
      ]),
  }),
})
