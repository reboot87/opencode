/** A web address written in a session, never a relative file, fragment, or UNC path. Desktop renderer origins
 * need not be HTTP, so use the session server's web scheme for a network-path reference.
 *
 * 插件运行时中负责 WebHref 部分：浏览器端插件运行时中与 WebHref 相关的状态、交互与渲染逻辑。
 */
export function webHref(written: string, server: string) {
  const value = written.trim()

  if (!/^(?:https?:\/\/|\/\/)(?![\/\\])/i.test(value) || !URL.canParse(value, server)) return
  const url = new URL(value, server)

  return /^https?:$/.test(url.protocol) ? url.href : undefined
}
