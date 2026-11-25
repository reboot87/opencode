/**
 * 数据站上下文 — I18n。
 * 数据站点的上下文提供者中负责 I18n 部分，提供该部分所需的实现与类型定义。
 */
import { createSimpleContext } from "@opencode/ui/context"
import { translate, type Key } from "../i18n"
import { useLanguage } from "./language"

export const { use: useI18n, provider: I18nProvider } = createSimpleContext({
  name: "StatsI18n",
  init: () => {
    const language = useLanguage()

    return {
      t(key: Key, params?: Record<string, string | number>) {
        return translate(language.locale(), key, params)
      },
    }
  },
})
