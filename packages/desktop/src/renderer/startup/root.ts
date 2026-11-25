/**
 * 模块 — Root。
 * 该目录下的功能模块中负责 Root 部分，提供该部分所需的实现与类型定义。
 */
export function requireRendererRoot() {
  const root = document.getElementById("root")

  if (root instanceof HTMLElement) return root

  if (import.meta.env.DEV)
    throw new Error(
      "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
    )

  return root!
}
