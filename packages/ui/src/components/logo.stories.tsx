/**
 * 通用组件 — LogoStories。
 * 跨场景复用的通用 UI 组件中负责 LogoStories 部分，提供该部分所需的实现与类型定义。
 */
import { Logo, Mark, Splash } from "./logo"

const docs = `### Overview
OpenCode logo assets: mark, splash, and wordmark.

Use Mark for compact spaces, Logo for headers, Splash for hero sections.

### API
- \`Mark\`, \`Splash\`, and \`Logo\` accept a CSS class for sizing. \`Splash\` also accepts a ref.

### Variants and states
- Multiple logo variants for different contexts.

### Behavior
- Pure SVG rendering.

### Accessibility
- Provide title/aria-label when logos convey meaning.

### Theming/tokens
- Uses theme color tokens via CSS variables.

`

export default {
  title: "UI/Logo",
  id: "components-logo",
  component: Logo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Basic = {
  render: () => (
    <div style={{ display: "grid", gap: "16px", "align-items": "start" }}>
      <div>
        <div style={{ color: "var(--text-weak)", "font-size": "12px" }}>Mark</div>
        <Mark />
      </div>
      <div>
        <div style={{ color: "var(--text-weak)", "font-size": "12px" }}>Splash</div>
        <Splash class="h-[100px] w-20" />
      </div>
      <div>
        <div style={{ color: "var(--text-weak)", "font-size": "12px" }}>Logo</div>
        <Logo class="w-[200px]" />
      </div>
    </div>
  ),
}

export const CompactMark = { render: () => <Mark /> }

export const SplashMark = { render: () => <Splash class="h-[100px] w-20" /> }

export const Wordmark = { render: () => <Logo class="w-[200px]" /> }
