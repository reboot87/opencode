/**
 * 数据站组件 — NotFoundMeta。
 * 数据站点的界面组件中负责 NotFoundMeta 部分，提供该部分所需的实现与类型定义。
 */
import { Meta } from "@solidjs/meta"
import { HttpStatusCode } from "@solidjs/start"

// Use 503 when upstream data failed to load so crawlers retry instead of dropping the URL.
export function NotFoundMeta(props: { unavailable?: boolean }) {
  return (
    <>
      <HttpStatusCode code={props.unavailable ? 503 : 404} />
      <Meta name="robots" content="noindex,follow" />
    </>
  )
}
