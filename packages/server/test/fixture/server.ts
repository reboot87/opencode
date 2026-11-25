/**
 * 服务端测试夹具。
 *
 * 为服务端测试提供请求、配置与工作树样例。
 */
import { Effect } from "effect"
import { HttpServer } from "effect/http"
import { ServerProcess } from "../../src/process"

export const startServer = Effect.fnUntraced(function* (directory: string) {
  const server = yield* ServerProcess.start<never, never>({
    hostname: "127.0.0.1",
    port: 0,
    password: "secret",
    app: { version: "test-version" },
    database: { path: ":memory:" },
    config: { directory },
    fs: { filewatcher: false },
    models: { fetch: false },
  })
  return {
    base: HttpServer.formatAddress(server.address),
    headers: { authorization: `Basic ${btoa("opencode:secret")}` },
  }
})
