/**
 * 数据站路由 — [404]。
 * 数据站点的路由页面中负责 [404] 部分，提供该部分所需的实现与类型定义。
 */
import { Title } from "@solidjs/meta"
import { NotFoundMeta } from "../component/not-found-meta"
import { useLanguage } from "../context/language"

export default function NotFound() {
  const language = useLanguage()
  return (
    <main data-page="stats">
      <Title>Page not found</Title>
      <NotFoundMeta />
      <div data-component="empty-state">
        <strong>Page not found</strong>
        <p>This data page doesn't exist.</p>
        <a href={language.route(import.meta.env.BASE_URL)}>Model data</a>
      </div>
    </main>
  )
}
