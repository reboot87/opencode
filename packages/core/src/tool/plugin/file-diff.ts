/**
 * 文件差异工具辅助。
 * 计算文件编辑前后的行级差异与增删统计。
 */
import { FileDiff } from "@opencode/schema/file-diff"
import { createTwoFilesPatch, diffLines } from "diff"

export function fileDiff(
  file: string,
  before: string,
  after: string,
  status: typeof FileDiff.Info.Type.status = "modified",
): typeof FileDiff.Info.Type {
  const counts = diffLines(before, after).reduce(
    (result, item) => ({
      additions: result.additions + (item.added ? (item.count ?? 0) : 0),
      deletions: result.deletions + (item.removed ? (item.count ?? 0) : 0),
    }),
    { additions: 0, deletions: 0 },
  )
  return {
    file,
    patch: createTwoFilesPatch(file, file, before, after),
    status,
    ...counts,
  }
}
