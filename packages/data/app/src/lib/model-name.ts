/**
 * 数据站工具 — ModelName。
 * 数据站点的通用工具中负责 ModelName 部分，提供该部分所需的实现与类型定义。
 */
import { statModel } from "@opencode/data-core/domain/model-normalization"

const glmFlashModel = "glm-5.3-flash"

// The stealth name a model was served under before its release, shown on its page as "Formerly …".
const formerNames: Record<string, string> = {
  [glmFlashModel]: "ox-alpha",
  "muse-ember-1.0": "crouton-alpha",
}

// The public name of a model that has stats but no catalog entry, such as a stealth model.
export function publicModelName(model: string) {
  if (model === "unknown") return undefined
  if (model === glmFlashModel) return "GLM-5.3-Flash"
  return model
}

export function formerModelName(model: string) {
  return formerNames[statModel(model, undefined)]
}
