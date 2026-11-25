/**
 * UI 上下文 — PathFormat。
 * UI 包的上下文提供者中负责 PathFormat 部分，提供该部分所需的实现与类型定义。
 */
import { formatPath } from "../util/path-format"
import { useLocation } from "./location"
import { useTuiPaths } from "./runtime"

export function usePathFormatter() {
  const paths = useTuiPaths()
  const location = useLocation()
  return {
    path: () => location.current?.directory || paths.cwd,
    format: (input?: string) => formatPath(input, { base: location.current?.directory || paths.cwd, home: paths.home }),
  }
}
