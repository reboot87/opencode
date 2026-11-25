/**
 * 浏览器插件 — ArtifactPreviewTest。
 * 内置浏览器功能的 GUI 插件中负责 ArtifactPreviewTest 部分，提供该部分所需的实现与类型定义。
 */
import { afterAll, beforeAll, expect, test } from "bun:test"
import { GlobalRegistrator } from "@happy-dom/global-registrator"
import { artifactPages } from "./artifact-preview"

beforeAll(() => GlobalRegistrator.unregister())

afterAll(() => GlobalRegistrator.register())

test("preflight asks this server for the entry before allocating a tab or granting bytes", async () => {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      const url = new URL(request.url)
      expect(request.method).toBe("HEAD")
      expect(url.searchParams.get("location[directory]")).toBe("/project")

      return new Response(null, { status: url.pathname === "/api/experimental/artifacts/art_here/view/" ? 200 : 404 })
    },
  })

  try {
    const artifacts = artifactPages(
      {
        failure: () => undefined,
        grant: () => {
          throw new Error("unexpected grant")
        },
        dispose() {},
      },
      { id: "server", url: server.url.href, headers: {}, sameMachine: false },
      "/project",
      new AbortController().signal,
    )

    expect(await artifacts.exists("artifact://art_here/")).toBe(true)
    expect(await artifacts.exists("artifact://art_elsewhere/")).toBe(false)
  } finally {
    await server.stop(true)
  }
})
