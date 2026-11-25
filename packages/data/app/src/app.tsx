/**
 * 数据站源码 — App。
 * 模型能力对比站点的实现中负责 App 部分，提供该部分所需的实现与类型定义。
 */
import { MetaProvider, Title } from "@solidjs/meta"
import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { Suspense } from "solid-js"
import { PatternRipple } from "./component/pattern-ripple"
import { I18nProvider, useI18n } from "./context/i18n"
import { LanguageProvider } from "./context/language"
import { strip } from "./lib/language"
import "./routes/index.css"

function AppMeta() {
  const i18n = useI18n()
  return <Title>{i18n.t("app.title")}</Title>
}

export default function App() {
  return (
    <Router
      base={import.meta.env.BASE_URL.replace(/\/$/, "")}
      explicitLinks={true}
      transformUrl={strip}
      root={(props) => (
        <LanguageProvider>
          <I18nProvider>
            <MetaProvider>
              <AppMeta />
              <PatternRipple />
              <Suspense>{props.children}</Suspense>
            </MetaProvider>
          </I18nProvider>
        </LanguageProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
