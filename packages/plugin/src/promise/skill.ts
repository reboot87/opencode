/**
 * Promise 风格插件 API — 技能领域。
 * 插件对技能的编辑与查询能力。此文件定义 Promise 风格 下该领域的接口与类型，与其它领域共同构成插件 API 表面。
 */
import type { SkillApi } from "@opencode/client/promise/api"
import type { Skill } from "@opencode/schema/skill"
import type { Types } from "effect"
import type { Transform } from "./registration.js"

export interface SkillEditor {
  list(): readonly Types.DeepMutable<Skill.Info>[]
  get(id: string): Types.DeepMutable<Skill.Info> | undefined
  add(skill: Skill.Info): void
  update(id: string, update: (skill: Types.DeepMutable<Skill.Info>) => void): void
  remove(id: string): void
}

export interface SkillDomain extends SkillApi {
  readonly transform: Transform<SkillEditor>
  readonly reload: () => Promise<void>
}
