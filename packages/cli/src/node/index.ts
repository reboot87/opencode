/**
 * Node 入口。
 * Node 运行时的 CLI 入口点。
 */
import "./plugin-runtime.promise"
import "./plugin-runtime.effect"

process.stdout.on("error", (error) => {
  if ("code" in error && error.code === "EPIPE") return
  throw error
})

await import("../index")
