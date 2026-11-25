/**
 * 数据站组件 — LocaleLinks。
 * 数据站点的界面组件中负责 LocaleLinks 部分，提供该部分所需的实现与类型定义。
 */
import { For } from "solid-js"
import { Link } from "@solidjs/meta"
import { LOCALES, localizedUrl, tag } from "../lib/language"
import { useLanguage } from "../context/language"

export function LocaleLinks(props: { path: string }) {
  const language = useLanguage()
  return (
    <>
      <Link rel="canonical" href={localizedUrl(language.locale(), props.path)} />
      <For each={LOCALES}>
        {(locale) => <Link rel="alternate" hreflang={tag(locale)} href={localizedUrl(locale, props.path)} />}
      </For>
      <Link rel="alternate" hreflang="x-default" href={localizedUrl("en", props.path)} />
    </>
  )
}
