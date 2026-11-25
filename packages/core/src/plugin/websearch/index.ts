/**
 * 网络搜索插件集合。
 * 汇总并导出所有内置的网络搜索 provider 插件。
 */
import { WebSearchExa } from "./exa.js"
import { WebSearchFirecrawl } from "./firecrawl.js"
import { WebSearchParallel } from "./parallel.js"
import { WebSearchTavily } from "./tavily.js"
import { WebSearchTinyFish } from "./tinyfish.js"

export const WebSearchPlugins = [
  WebSearchExa.Plugin,
  WebSearchFirecrawl.Plugin,
  WebSearchParallel.Plugin,
  WebSearchTavily.Plugin,
  WebSearchTinyFish.Plugin,
] as const
