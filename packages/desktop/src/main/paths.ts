/**
 * 桌面端主进程 — Paths。
 * Electron 主进程的核心逻辑中负责 Paths 部分，提供该部分所需的实现与类型定义。
 */
export * as DesktopPaths from "./paths"

import { Effect, Path } from "effect"

export interface Resolved {
  readonly developmentResourcesRoot: string
  readonly preloadPath: string
  readonly rendererRoot: string
}

export const resolve = Effect.gen(function* () {
  const path = yield* Path.Path
  const root = path.dirname(yield* path.fromFileUrl(new URL(import.meta.url)))

  return {
    developmentResourcesRoot: path.join(root, "../../resources"),
    preloadPath: path.join(root, "../preload/index.cjs"),
    rendererRoot: path.join(root, "../renderer"),
  } satisfies Resolved
}).pipe(Effect.orDie)
