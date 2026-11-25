/**
 * 浏览器历史 — Index 出口。
 * 集中导出 浏览器历史 中 Index 相关的实现、组件与类型。
 */
// What the profile's side of an import uses of the history. Main process only: the store opens SQLite. The window
// imports the modules it needs by name.
export { MAX_PAGES, MAX_URL_LENGTH, webPage, type PageVisit } from "./page"

export { createHistoryStore } from "./store"
