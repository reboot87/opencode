/**
 * 终端界面 — CustomElementsD。
 * OpenCode 终端界面的整体骨架与入口中负责 CustomElementsD 部分，提供该部分所需的实现与类型定义。
 */
import { DIFFS_TAG_NAME } from "@pierre/diffs"

/**
 * TypeScript declaration for the <diffs-container> custom element.
 * This tells TypeScript that <diffs-container> is a valid JSX element in SolidJS.
 * Required for using the @pierre/diffs web component in .tsx files.
 */

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      [DIFFS_TAG_NAME]: HTMLAttributes<HTMLElement>
    }
  }
}

export {}
