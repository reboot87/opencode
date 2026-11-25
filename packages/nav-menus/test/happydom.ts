/**
 * 终端测试 — Happydom。
 * 终端界面的测试中负责 Happydom 部分，提供该部分所需的实现与类型定义。
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator"

GlobalRegistrator.register()

// happy-dom has no Web Animations: the menus' motion runs to its end at once.
Element.prototype.animate = function () {
  return { finished: Promise.resolve(), cancel() {} } as unknown as Animation
}
