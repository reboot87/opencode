/**
 * The New timeline, as the app sees it: its rows, how they draw, and the status line below a working turn.
 *
 * 新版时间线在应用层的对外形态：包含其行结构、绘制方式，以及运行中轮次下方的状态行。
 */
export { createNextTimelineProjection } from "./projection"

export { createNextTimelineRowRenderer } from "./row"

export { laneGap } from "./spacing"

export { timelineStatus } from "./status"

export { StatusLane } from "./status-line"
