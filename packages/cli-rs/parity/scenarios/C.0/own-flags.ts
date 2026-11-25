/**
 * 对等性应用场景：自有·开关。
 *
 * 规格编号：C.0。
 *
 * 对等性应用场景：录制整段交互流程的期望输出，供 Rust 实现比对。
 */
// opencode-native's own root flag, `--no-plugins`, which the TypeScript CLI does not have
// (`parity/deviations/D01-no-plugins.md`): each shell's script names it on lines of its own, which the first mask
// takes out of both sides before they are compared. Bash also declares a "used" variable for each root flag, and the
// flag is the root's seventh: the second mask drops `_used_6` where it ends a declaration, on both sides alike. Every
// other line keeps its place and numbering.
export const ownFlags = [
  { pattern: /^.*\bno-plugins\b.*\n/gm, replacement: "" },
  { pattern: / _used_6=""$/gm, replacement: "" },
]
