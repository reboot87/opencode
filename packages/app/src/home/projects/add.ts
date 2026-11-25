/**
 * 主页项目 — Add。
 * 主页中项目列表的展示中负责 Add 部分，提供该部分所需的实现与类型定义。
 */
import type { ServerCtx } from "@/runtime/server/runtime"

export async function addProjects(context: ServerCtx, directories: string[]) {
  const projects = await Promise.all(directories.map((directory) => context.projects.add(directory)))

  // Additions finish in any order; the first directory is the one the caller opens.
  if (projects[0]) context.projects.touch(projects[0].worktree)

  return projects[0]
}
