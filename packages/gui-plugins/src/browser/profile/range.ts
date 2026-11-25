/**
 * 
 * Chromium's file loader streams a single byte range but does not supply HTTP range headers. 浏览器配置中负责 Range 部分：浏览器用户配置中与 Range 相关的状态、交互与渲染逻辑。
 */
export function previewRange(header: string | null, size: number) {
  if (header === null) return { status: 200, length: size }
  const match = /^bytes=(\d*)-(\d*)$/i.exec(header.trim())
  const first = match?.[1]
  const last = match?.[2]
  const start = first ? Number(first) : Math.max(0, size - Number(last))
  const end = first && last ? Math.min(size - 1, Number(last)) : size - 1

  if ((!first && !last) || !Number.isSafeInteger(start) || start > end || start >= size)
    return { status: 416, length: 0, content: `bytes */${size}` }

  return { status: 206, length: end - start + 1, content: `bytes ${start}-${end}/${size}`, range: `bytes=${start}-${end}` }
}
