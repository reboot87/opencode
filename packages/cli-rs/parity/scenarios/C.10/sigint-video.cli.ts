/**
 * 对等性应用场景：SIGINT·视频·CLI。
 *
 * 规格编号：C.10。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// SIGINT while a video job runs (#63666): the API can't cancel a video job, so the run interrupts the session
// and exits with 130 instead of waiting for the job, as it does for image and Code Mode jobs.
import { defineCli } from "../../cli/run"
import { server, textStep } from "./fixture"

const video = {
  kind: "video",
  id: "vid_1",
  sessionID: "ses_run",
  status: "running",
  title: "a cat surfing",
  path: "videos/cat",
  time: { started: 3 },
}

export default defineCli({
  args: ["run", "hello"],
  server: server({
    events: () => textStep("Started the video."),
    routes: [
      { path: "/api/experimental/job", json: { data: [video] } },
      { method: "POST", path: "/api/session/ses_run/interrupt", json: { interrupted: true } },
    ],
  }),
  signal: { after: "/api/experimental/job", name: "SIGINT" },
})
