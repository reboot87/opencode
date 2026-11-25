/**
 * 对等性应用场景：登录·回答·非法·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, sink } from "./fixture"

// `auth login --answer` with a value outside the field's options.
export default defineCli({
  args: [
    "auth",
    "login",
    "acme",
    "--answer",
    "region=mars",
    "--answer",
    "team=core",
    "--answer",
    "seats=3",
    "--answer",
    "beta=true",
    "--answer",
    "scopes=[]",
  ],
  env: sink,
  server: { routes: [...integrationRoutes()] },
})
