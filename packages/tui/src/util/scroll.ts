/**
 * 终端工具 — Scroll。
 * 终端界面的通用工具函数中负责 Scroll 部分，提供该部分所需的实现与类型定义。
 */
import { MacOSScrollAccel, type ScrollAcceleration } from "@opentui/core"

export type ScrollConfig = {
  scroll?: {
    acceleration?: boolean
    speed?: number
  }
}

export class CustomSpeedScroll implements ScrollAcceleration {
  constructor(private speed: number) {}

  tick(_now?: number): number {
    return this.speed
  }

  reset(): void {}
}

export function getScrollAcceleration(config?: ScrollConfig): ScrollAcceleration {
  if (config?.scroll?.acceleration) {
    return new MacOSScrollAccel()
  }
  if (config?.scroll?.speed !== undefined) {
    return new CustomSpeedScroll(config.scroll.speed)
  }

  return new CustomSpeedScroll(3)
}
