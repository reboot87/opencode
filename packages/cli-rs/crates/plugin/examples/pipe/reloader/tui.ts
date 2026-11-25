/**
 * 管道示例：TUI。
 *
 * 管道示例：演示插件管道各阶段的串联方式。
 */
// Toasts an imported helper's value so changing just that helper tests the module cache on reload.

import { label } from "./label"

export default {
  id: "example.reloader",
  setup(api: any) {
    const carrier = api[Symbol.for("opencode.carrier")]
    carrier.command({ name: "reloader.say", title: "reloader.say" }, () => api.ui.toast.show({ message: label() }))
  },
}
