/**
 * UI 性能测试 — MotionBench。
 * UI 渲染性能基准中负责 MotionBench 部分，提供该部分所需的实现与类型定义。
 */
import { bench, script } from "@hona/strobe"

export default bench({
  targets: { ui: script("./motion.ts") },
  cases: {
    // One second of animation for 1,000 springs.
    "1,000 springs for 60 frames": {
      primary: "cpu.work",
      async run(ctx) {
        await ctx.call("frames", 60)
      },
    },
  },
})
