/**
 * 对等性应用场景：操作·CLI。
 *
 * 规格编号：C.4。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// `api session.get --param ...`: the operation from `/openapi.json`, the path parameter encoded with
// `encodeURIComponent`, the other parameters as the query in the record's key order (integer-like keys
// first, a repeated key keeps its first place and its last value).
import { defineCli } from "../../cli/run"
import { openapi } from "./fixture"

export default defineCli({
  args: [
    "api",
    "session.get",
    "--param",
    "sessionID=ses_abcdef/1 2",
    "--param",
    "workspace=a b&c",
    "--param",
    "10=x",
    "--param",
    "workspace=w",
  ],
  server: { routes: [openapi, { path: "/api/session/:id", json: { id: "ses_abcdef", title: "Fix" } }] },
})
