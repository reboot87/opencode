/**
 * 数据站源码 — CloudflareWorkersD。
 * 模型能力对比站点的实现中负责 CloudflareWorkersD 部分，提供该部分所需的实现与类型定义。
 */
// The part of the Workers runtime module the site uses (lib/resource.cloudflare.ts). The full
// @cloudflare/workers-types would replace the DOM types the pages are written against.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>
  export function waitUntil(promise: Promise<unknown>): void
}
