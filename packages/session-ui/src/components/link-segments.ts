/**
 * Splits plain text into runs, marking each http(s) URL with its link target.
 *
 * 把纯文本切分为片段，并标记其中的 http(s) 链接及其跳转目标。
 */
export function linkSegments(text: string) {
  const result: { text: string; href?: string }[] = []
  let last = 0

  for (const match of text.matchAll(/https?:\/\/[^\s<>"'`]+/g)) {
    // Sentence punctuation and closing brackets after a URL are almost never part of it.
    const href = match[0].replace(/[),.;:!?\]]+$/, "")

    if (!URL.canParse(href)) continue

    if (match.index > last) result.push({ text: text.slice(last, match.index) })
    result.push({ text: href, href })
    last = match.index + href.length
  }

  if (last < text.length) result.push({ text: text.slice(last) })

  return result
}
