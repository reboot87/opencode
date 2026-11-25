/**
 * 文件脚本。
 *
 * CLI 包的开发脚本：构建校验、配置生成与发布准备。
 */
import { readdir } from "node:fs/promises"
import path from "node:path"

export async function collectFiles(root: string, current = root): Promise<string[]> {
  return (
    await Promise.all(
      (await readdir(current, { withFileTypes: true })).map(async (entry) => {
        const target = path.join(current, entry.name)
        return entry.isDirectory() ? collectFiles(root, target) : [path.relative(root, target)]
      }),
    )
  ).flat()
}
