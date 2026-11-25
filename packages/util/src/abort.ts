/**
 * 中止工具。
 * 以 DOMException 作为中止原因中止 AbortController，便于统一识别取消信号。
 */
// `controller.abort()` makes a new DOMException that records the caller's stack, and V8 keeps every frame's function
// and closure alive until something reads `.stack`. Aborting from a Solid cleanup or update then pins the whole batch
// it ran in, disposed computations and detached DOM included, for as long as the signal is reachable. This reason is
// made once, so its stack holds only this module's load.
const reason = new DOMException("signal is aborted without reason", "AbortError")

export function abort(controller: AbortController | undefined) {
  controller?.abort(reason)
}
