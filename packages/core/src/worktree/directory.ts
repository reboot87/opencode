/**
 * Worktree 目录规范化。
 * 规范化 worktree 目录路径并处理不可用错误。
 */
export * as WorktreeDirectory from "./directory.js"

import { Effect, Schema } from "effect"
import { FSUtil } from "@opencode/util/fs-util"
import { AbsolutePath } from "../schema.js"

export class DirectoryUnavailableError extends Schema.TaggedError<DirectoryUnavailableError>()(
  "Worktree.DirectoryUnavailableError",
  { directory: AbsolutePath },
) {}

export const canonical = Effect.fnUntraced(function* (fs: FSUtil.Interface, input: AbsolutePath) {
  const resolved = AbsolutePath.make(yield* fs.resolve(input))
  if (!(yield* fs.isDir(resolved))) return yield* new DirectoryUnavailableError({ directory: input })
  return resolved
})
