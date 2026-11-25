/**
 * 运行时服务端连接 — Image。
 * 浏览器端与服务端的连接与同步中负责 Image 部分，提供该部分所需的实现与类型定义。
 */
import { getDirectory, getFilename } from "@opencode/util/path"
import type { OpenCodeClient } from "@opencode/client/promise"

const types = new Map([
  ["png", "image/png"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["gif", "image/gif"],
  ["webp", "image/webp"],
  ["svg", "image/svg+xml"],
  ["avif", "image/avif"],
  ["bmp", "image/bmp"],
  ["ico", "image/x-icon"],
])

export async function readLocalImage(
  api: Pick<OpenCodeClient, "file">,
  directory: string,
  path: string,
  signal: AbortSignal,
): Promise<Blob | undefined> {
  const drive = /^[a-z]:[\\/]/i.test(path)

  if (/^[\\/]{2}/.test(path) || (!drive && /^[a-z][a-z\d+.-]*:/i.test(path))) return
  const type = types.get(path.match(/\.([^./]+)$/)?.[1]?.toLowerCase() ?? "")

  if (!type) return
  const absolute = drive || path.startsWith("/")

  // Scope absolute images to their parent, including files outside the project.
  const bytes = await api.file.read(
    {
      path: absolute ? getFilename(path) : path,
      location: { directory: absolute ? getDirectory(path) : directory },
    },
    { signal },
  )

  return new Blob([new Uint8Array(bytes)], { type })
}
