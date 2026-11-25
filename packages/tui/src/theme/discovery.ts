/**
 * UI 主题 — Discovery。
 * 配色、间距与字号等设计令牌中负责 Discovery 部分，提供该部分所需的实现与类型定义。
 */
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

export async function discoverThemes(directories: string[]) {
  const result: Record<string, unknown> = {}
  for (const directory of directories) {
    const themeDirectory = path.join(directory, "themes")
    const entries = await readdir(themeDirectory, { withFileTypes: true }).catch((error: unknown) => {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return []
      return Promise.reject(error)
    })
    const files = entries
      .filter((entry) => (entry.isFile() || entry.isSymbolicLink()) && path.extname(entry.name) === ".json")
      .map((entry) => path.join(themeDirectory, entry.name))
      .sort()
    for (const file of files) {
      result[path.basename(file, ".json")] = JSON.parse(await readFile(file, "utf8")) as unknown
    }
  }
  return result
}
