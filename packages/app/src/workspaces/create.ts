/**
 * 工作区界面 — Create。
 * 工作区的管理界面中负责 Create 部分，提供该部分所需的实现与类型定义。
 */
import type { LocationGetOutput, OpenCodeClient } from "@opencode/client/promise"
import type { Data } from "@opencode/client/solid"

export async function createWorktree(input: {
  api: Pick<OpenCodeClient, "location" | "worktree">
  data: Pick<Data, "location">
  directory: string
  project?: LocationGetOutput["project"]
  branch?: string
}) {
  const project = input.project ?? (await input.api.location.get({ location: { directory: input.directory } })).project

  const created = await input.api.worktree.create({
    projectID: project.id,
    from: project.canonical,
    branch: input.branch,
  })

  // Populate the client cache before the destination session mounts.
  await input.data.location.syncInfo({ directory: created.directory })

  return created.directory
}
