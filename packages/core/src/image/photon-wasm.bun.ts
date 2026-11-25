/**
 * Photon WASM 加载（Bun）。
 * 在 Bun 运行时加载 Photon 的 WASM 图像处理模块。
 */
// @ts-ignore Bun embeds static file imports when compiling the CLI.
import photonWasm from "@silvia-odwyer/photon-node/photon_rs_bg.wasm" with { type: "file" }

export default photonWasm
