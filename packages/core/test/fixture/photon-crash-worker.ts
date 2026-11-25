/**
 * Photon·崩溃·工作单元测试夹具。
 *
 * 为核心测试提供稳定可复用的夹具数据与依赖桩。
 */
import { parentPort } from "node:worker_threads"

// Stands in for a photon worker whose wasm panics on its first request.
const port = parentPort
if (port) {
  port.on("message", () => {
    throw new Error("unreachable executed")
  })
  port.postMessage({ _tag: "Ready" })
}
