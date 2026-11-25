/**
 * PTY 实现（Workerd）。
 * 在 workerd 运行时提供不可用的 PTY 占位实现。
 */
import type { Proc } from "./pty.js"

export type { Disp, Exit, Opts, Proc } from "./pty.js"

// workerd cannot spawn processes; the Pty service surfaces this as a defect if
// a terminal is ever requested on this runtime.
export function spawn(): Proc {
  throw new Error("Pseudo-terminals are unavailable on the workerd runtime")
}
