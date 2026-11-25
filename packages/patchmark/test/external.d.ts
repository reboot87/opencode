/**
 * 终端测试 — ExternalD。
 * 终端界面的测试中负责 ExternalD 部分，提供该部分所需的实现与类型定义。
 */
declare module "commonmark" {
  export class Parser {
    parse(input: string): unknown
  }

  export class HtmlRenderer {
    render(ast: unknown): string
  }
}

declare module "commonmark-spec" {
  export interface SpecTest {
    markdown: string
    html: string
    example: number
    start_line: number
    end_line: number
    section: string
  }

  export const tests: SpecTest[]
}
