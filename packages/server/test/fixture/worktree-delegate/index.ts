/**
 * 索引测试夹具。
 *
 * 提供工作树委派场景的样例数据。
 */
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "test.worktree-delegate",
  async setup(ctx) {
    const projectID = ctx.options.projectID ?? ctx.location.project.id
    if (typeof projectID !== "string") throw new Error("Missing target project")
    await ctx.worktree.create({
      projectID,
      name: "delegated",
    })
  },
})
