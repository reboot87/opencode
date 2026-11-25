/**
 * 模块 — TextLines。
 * 该目录下的功能模块中负责 TextLines 部分，提供该部分所需的实现与类型定义。
 */
export interface DiagramTextRun {
  text: string
  italic: boolean
}

export interface DiagramTextLine {
  text: string
  runs: DiagramTextRun[]
}

export function parseDiagramTextLines(value: string): DiagramTextLine[] {
  return value.split(/<br\s*\/?>/i).map((line) => {
    const runs: DiagramTextRun[] = []
    const source = line.trim()
    const tag = /<\/?(?:i|em)\s*>/gi
    let italic = false
    let offset = 0

    for (const match of source.matchAll(tag)) {
      if (match.index > offset) runs.push({ text: source.slice(offset, match.index), italic })
      italic = !match[0].startsWith("</")
      offset = match.index + match[0].length
    }
    if (offset < source.length) runs.push({ text: source.slice(offset), italic })

    return { text: runs.map((run) => run.text).join(""), runs }
  })
}

export function splitDiagramLines(value: string): string[] {
  return parseDiagramTextLines(value).map((line) => line.text)
}
