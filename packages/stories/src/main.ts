/**
 * GUI 插件 — Main。
 * GUI 插件的实现中负责 Main 部分，提供该部分所需的实现与类型定义。
 */
// Component tests navigate directly to an isolated story. Only the homepage loads the catalog and inspector.
if (new URLSearchParams(location.search).has("id")) {
  void import("./frame")
} else {
  void import("./lab")
}
