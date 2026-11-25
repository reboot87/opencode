/**
 * Photon Worker 入口。
 * 启动图像处理 Worker 的入口点。
 */
// Second compile entrypoint: it lands next to index.js and the shared chunks in
// the executable, where Image.Photon resolves "./photon-worker.js".
import "../../core/src/image/photon-worker"
