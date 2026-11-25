/**
 * Photon WASM 加载（Workerd）。
 * 在 workerd 运行时加载 Photon 的 WASM 图像处理模块。
 */
// workerd has no filesystem path to a photon wasm artifact. Image.Photon only
// reads this lazily and surfaces a typed ResizerUnavailableError when loading
// fails, so an empty path degrades cleanly instead of breaking module load.
export default ""
