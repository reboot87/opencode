/**
 * 浏览器插件 — ChildTargets。
 * 内置浏览器功能的 GUI 插件中负责 ChildTargets 部分，提供该部分所需的实现与类型定义。
 */
import type { Cdp } from "./cdp"

/**
 * Child targets of a tab's page, each paused at start so the tab can guard it (file choosers, media) before it runs.
 * A dedicated worker is attached too: with `waitForDebuggerOnStart`, Chromium pauses every child worker of the page
 * whether or not the filter attaches it, and one nobody attaches never starts. Other targets stay unattached.
 */
export function attachChildren(cdp: Cdp, sessionID?: string) {
  return cdp.send(
    "Target.setAutoAttach",
    {
      autoAttach: true,
      waitForDebuggerOnStart: true,
      flatten: true,
      filter: [{ type: "iframe", exclude: false }, { type: "worker", exclude: false }, { exclude: true }],
    },
    sessionID,
  )
}

/** A worker opens no file chooser and asks for no device: let it run and leave its session. */
export function releaseWorker(cdp: Cdp, sessionID: string) {
  return cdp
    .send("Runtime.runIfWaitingForDebugger", {}, sessionID)
    .then(() => cdp.send("Target.detachFromTarget", { sessionId: sessionID }))
    .then(
      () => undefined,
      () => undefined,
    )
}
