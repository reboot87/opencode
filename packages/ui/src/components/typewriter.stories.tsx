/**
 * 通用组件 — TypewriterStories。
 * 跨场景复用的通用 UI 组件中负责 TypewriterStories 部分，提供该部分所需的实现与类型定义。
 */
import { Typewriter } from "./typewriter"

const docs = `### Overview
Animated typewriter text effect for short inline messages.

Use for short status lines; avoid long paragraphs.

### API
- Optional: \`text\` string; if absent, nothing is rendered.
- Optional: \`as\` to change the rendered element.

### Variants and states
- Single animation style with cursor blink.

### Behavior
- Types one character at a time with randomized delays.

### Accessibility
- TODO: confirm if cursor should be aria-hidden in all contexts.

### Theming/tokens
- Uses \`blinking-cursor\` class for cursor styling.

`

export default {
  title: "UI/Typewriter",
  id: "components-typewriter",
  component: Typewriter,
  args: { text: "Typewriter text", as: "p" },
  argTypes: { as: { control: "select", options: ["p", "span"] } },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
}

export const Basic = {}

export const Inline = {
  args: {
    text: "Inline typewriter",
    as: "span",
  },
}

export const Empty = { args: { text: "" } }
