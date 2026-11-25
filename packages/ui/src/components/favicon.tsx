/**
 * 通用组件 — Favicon。
 * 跨场景复用的通用 UI 组件中负责 Favicon 部分，提供该部分所需的实现与类型定义。
 */
import { Link, Meta } from "@solidjs/meta"

export const Favicon = () => {
  return (
    <>
      <Link rel="icon" type="image/png" href="/favicon-96x96-v3.png" sizes="96x96" />
      <Link rel="shortcut icon" href="/favicon-v3.ico" />
      <Link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-v3.png" />
      <Link rel="manifest" href="/site.webmanifest" />
      <Meta name="apple-mobile-web-app-title" content="OpenCode" />
    </>
  )
}
