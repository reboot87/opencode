/**
 * Photon WASM 加载（Node）。
 * 在 Node 运行时加载 Photon 的 WASM 图像处理模块。
 */
import { createRequire } from "node:module"

export default process.env.OPENCODE_PHOTON_WASM_PATH ??
  createRequire(import.meta.url).resolve("@silvia-odwyer/photon-node/photon_rs_bg.wasm")
