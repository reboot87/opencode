/**
 * 端到端测试工具 — Notifications。
 * 端到端测试的公共辅助中负责 Notifications 部分，提供该部分所需的实现与类型定义。
 */
import type { Page } from "@playwright/test"

export async function recordNotifications(page: Page) {
  const notifications: { title: string; body?: string }[] = []

  const sounds: string[] = []

  await page.exposeBinding("recordNotification", (_source, notification: { title: string; body?: string }) => {
    notifications.push(notification)
  })
  await page.exposeBinding("recordNotificationSound", (_source, src: string) => {
    sounds.push(src)
  })
  await page.addInitScript(() => {
    // SAFETY: exposeBinding above installs these callbacks before the app starts.
    const host: Window & {
      recordNotification?: (notification: { title: string; body?: string }) => Promise<void>
      recordNotificationSound?: (src: string) => Promise<void>
    } = window

    document.hasFocus = () => false
    Object.defineProperty(window, "Notification", {
      value: class extends EventTarget {
        static permission = "granted"
        onclick: (() => void) | null = null

        constructor(title: string, options?: NotificationOptions) {
          super()
          void host.recordNotification!({ title, body: options?.body })
        }

        close() {}
      },
    })
    Object.defineProperty(window, "Audio", {
      value: class {
        currentTime = 0

        constructor(readonly src: string) {}

        play() {
          return host.recordNotificationSound!(this.src)
        }

        pause() {}
      },
    })
  })

  return { notifications, sounds }
}
