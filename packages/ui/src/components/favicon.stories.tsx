/**
 * 通用组件 — FaviconStories。
 * 跨场景复用的通用 UI 组件中负责 FaviconStories 部分，提供该部分所需的实现与类型定义。
 */
// @ts-nocheck
import * as mod from "./favicon"

const docs = `### Overview
Injects favicon and app icon meta tags for the document head.

Render once near the app root (head management).

### API
- No props.

### Variants and states
- Single configuration.

### Behavior
- Registers link and meta tags via Solid Meta components.

### Accessibility
- Not applicable.

### Theming/tokens
- Not applicable.

`

export default {
  title: "UI/Favicon",
  id: "components-favicon",
  component: mod.Favicon,
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
    <div style={{ display: "grid", gap: "8px" }}>
      <mod.Favicon />
      <div style={{ color: "var(--text-weak)", "font-size": "12px" }}>
        Head tags are injected for favicon and app icons.
      </div>
    </div>
  ),
}
