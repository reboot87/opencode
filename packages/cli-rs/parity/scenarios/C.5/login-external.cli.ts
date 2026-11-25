/**
 * 对等性应用场景：登录·external·CLI。
 *
 * 规格编号：C.5。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
import { defineCli } from "../../cli/run"
import { integrationRoutes, sink } from "./fixture"

// `auth login` with every form answer given as `--answer`: JSON values, a hidden default, a `when` field.
export default defineCli({
  args: [
    "auth",
    "login",
    "acme",
    "--answer",
    "region=eu",
    "--answer",
    "team=core",
    "--answer",
    "seats=3",
    "--answer",
    "beta=true",
    "--answer",
    'scopes=["read","write"]',
    "--answer",
    "eu-only=yes",
  ],
  env: sink,
  server: {
    routes: [...integrationRoutes(), { method: "POST", path: "/api/integration/acme/connect/external", status: 204 }],
  },
})
