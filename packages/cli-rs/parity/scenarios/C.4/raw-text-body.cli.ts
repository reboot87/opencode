/**
 * 对等性应用场景：raw·文本·请求体·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `api put /api/thing -d text -H content-type:text/plain`: the caller's content type stays, and a reply that
// ends with a newline is printed as it is.
import { defineCli } from "../../cli/run"

export default defineCli({
  args: ["api", "put", "/api/thing", "-d", "plain text", "-H", "Content-Type: text/plain"],
  server: { routes: [{ method: "PUT", path: "/api/thing", body: "ok\n" }] },
})
