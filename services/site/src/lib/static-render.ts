import { getRequestEvent } from "solid-js/web"

/** Whether the Worker is rendering a static page (src/static/render.tsx), which never hydrates.
 *
 * 站点共享逻辑：静态·render。
 */
export function staticRender() {
  return import.meta.env.SSR && !!getRequestEvent()?.locals.staticPass
}
