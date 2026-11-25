/**
 * 文件搜索工具辅助。
 * 判断搜索能力可用性、区分路径类型，并为 glob/grep 搜索提供有界（bounded）并发与结果限制。
 */
export * as ToolSearch from "./search.js"

import { ToolFailure } from "@opencode/ai/effect"
import { Effect } from "effect"
import { Environment } from "../environment/index.js"
import { FileSystem } from "../filesystem.js"

/** Refuses a search where none can run yet: it needs a ripgrep binary the environment's spawner can start. */
export const available = (environment: Environment.Interface) =>
  environment.rg
    ? Effect.void
    : Effect.fail(new ToolFailure({ message: `Search is not available on ${environment.id} yet.` }))

export const pathType = (files: Environment.Files, absolute: string, display: string) =>
  Environment.typeFollowing(files, absolute).pipe(
    Effect.catchTag("Environment.NotFound", () =>
      Effect.fail(new ToolFailure({ message: `Search path does not exist: ${display}` })),
    ),
  )

// Fetches one result past the limit so truncation can be reported without a second search.
export const bounded = <A, E, R>(limit: number, search: (limit: number) => Effect.Effect<readonly A[], E, R>) =>
  search(limit + 1).pipe(
    Effect.timeoutOrElse({
      duration: FileSystem.DEFAULT_SEARCH_TIMEOUT_MS,
      orElse: () =>
        Effect.fail(
          new ToolFailure({
            message: `Search timed out after ${FileSystem.DEFAULT_SEARCH_TIMEOUT_MS / 1_000} seconds. Consider using a more specific path or pattern.`,
          }),
        ),
    }),
    Effect.map((items) => ({ items: items.slice(0, limit), truncated: items.length > limit })),
  )
