/**
 * 打开 URL。
 * 以系统默认方式打开 URL 或本地文件路径。
 */
import open from "open"

export function openUrl(input: string) {
  const url = URL.canParse(input) ? new URL(input) : undefined
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:"))
    return Promise.reject(new Error(`Only http and https links can be opened in the browser: ${input}`))
  return open(url.href)
}

export function openPath(path: string) {
  return open(path)
}
