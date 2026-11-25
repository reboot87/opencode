/**
 * 对等性应用场景：raw·后置·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `api post /api/thing?x=1 -d ... -H ...`: a raw method and path, the body sent as given, JSON by default,
// and a text reply without a final newline gets one.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["api", "POST", "/api/thing?x=1", "-d", '{"name":"value"}', "-H", " X-Test : one "],
  server: { routes: [{ method: "POST", path: "/api/thing", status: 201, body: "created" }] },
})
