/**
 * 数据站图像 — ModulesD。
 * 生成社交分享图像中负责 ModulesD 部分，提供该部分所需的实现与类型定义。
 */
// Modules the OG Worker imports that script/build-og-worker.ts writes next to its bundle: compiled Wasm and binary
// font data.
declare module "*.wasm" {
  const module: WebAssembly.Module
  export default module
}

declare module "*.bin" {
  const data: ArrayBuffer
  export default data
}
