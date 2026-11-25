/**
 * 模块 — Sentry。
 * 该目录下的功能模块中负责 Sentry 部分，提供该部分所需的实现与类型定义。
 */
import pkg from "../../../package.json"

export function desktopVersion() {
  return import.meta.env.OPENCODE_VERSION ?? pkg.version
}

export async function initializeSentry(version: string) {
  if (!import.meta.env.VITE_SENTRY_DSN) return
  const { init } = await import("@sentry/solid")
  init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE ?? `desktop@${version}`,
    initialScope: {
      tags: {
        platform: "desktop",
      },
    },
    integrations: (integrations) =>
      integrations.filter(
        (integration) =>
          integration.name !== "Breadcrumbs" &&
          !(
            import.meta.env.OPENCODE_CHANNEL === "prod" &&
            (integration.name === "GlobalHandlers" || integration.name === "BrowserApiErrors")
          ),
      ),
  })
}
