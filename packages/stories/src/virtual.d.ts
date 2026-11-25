/**
 * GUI 插件 — VirtualD。
 * GUI 插件的实现中负责 VirtualD 部分，提供该部分所需的实现与类型定义。
 */
declare module "virtual:story-index" {
  export function findStory(
    id: string,
  ): { load: () => Promise<{ [name: string]: unknown }>; name: string; file: string } | undefined
}
