/**
 * 模块 — PlaywrightLocalConfig。
 * 该目录下的功能模块中负责 PlaywrightLocalConfig 部分，提供该部分所需的实现与类型定义。
 */
import base from "./playwright.components.config"
export default { ...base, projects: base.projects?.map((p) => ({ ...p, use: { ...p.use, channel: "chrome" } })) }
