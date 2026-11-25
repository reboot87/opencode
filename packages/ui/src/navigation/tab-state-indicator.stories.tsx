/**
 * 导航 — TabStateIndicatorStories。
 * 界面导航组件中负责 TabStateIndicatorStories 部分，提供该部分所需的实现与类型定义。
 */
import { TabStateIndicator } from "./tab-state-indicator"

export default {
  title: "UI/TabStateIndicator",
  id: "ui-tab-state-indicator",
  component: TabStateIndicator,
  args: { size: 16 },
  argTypes: { size: { control: { type: "range", min: 8, max: 32, step: 1 } } },
  tags: ["autodocs"],
}

export const Basic = {
  render: (props: { size: number }) => <TabStateIndicator width={props.size} height={props.size} />,
}

export const Sizes = {
  render: (props: { size: number }) => (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <TabStateIndicator width={12} height={12} />
      <TabStateIndicator width={props.size} height={props.size} />
      <TabStateIndicator width={24} height={24} />
    </div>
  ),
}
