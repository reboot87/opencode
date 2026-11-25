/**
 * 外壳布局 — ProjectIcon。
 * 应用外壳的布局结构中负责 ProjectIcon 部分，提供该部分所需的实现与类型定义。
 */
import {
  displayName,
  getProjectAvatarGenerated,
  getProjectAvatarSource,
  getProjectAvatarVariant,
  ProjectAvatar,
  type ProjectAvatarProps,
} from "@opencode/ui/project-avatar"
import { splitProps } from "solid-js"
import type { LocalProject } from "@/shell/state/layout"

type ProjectIconProps = Omit<ProjectAvatarProps, "fallback" | "src" | "variant"> & {
  project: Pick<LocalProject, "id" | "name" | "worktree" | "icon">
  fallback?: string
  icon?: LocalProject["icon"]
}

export function ProjectIcon(props: ProjectIconProps) {
  const [local, rest] = splitProps(props, ["project", "fallback", "icon"])
  const icon = () => local.icon ?? local.project.icon

  return (
    <ProjectAvatar
      {...rest}
      fallback={local.fallback ?? displayName(local.project)}
      src={getProjectAvatarSource(local.project.id, icon())}
      variant={getProjectAvatarVariant(icon()?.color)}
      generated={getProjectAvatarGenerated({ ...local.project, icon: icon() })}
    />
  )
}
