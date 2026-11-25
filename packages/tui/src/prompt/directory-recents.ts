/**
 * 提示输入 — DirectoryRecents。
 * 提示输入的解析、编辑与提交中负责 DirectoryRecents 部分，提供该部分所需的实现与类型定义。
 */
import { useStorage } from "../context/storage"

type RecentDirectory = {
  directory: string
  usedAt: number
}

type PersistedState = {
  projects: Record<string, RecentDirectory[]>
}

export function useDirectoryRecents() {
  const [store, updateStore] = useStorage().store<PersistedState>("directory-recents", {
    initial: { projects: {} },
    key: "directory",
  })

  return {
    list(projectID: string) {
      return (store.projects[projectID] ?? []).toSorted((a, b) => b.usedAt - a.usedAt)
    },
    touch(projectID: string, directory: string) {
      void updateStore((draft) => {
        draft.projects[projectID] = [
          { directory, usedAt: Date.now() },
          ...(draft.projects[projectID] ?? []).filter((item) => item.directory !== directory),
        ].slice(0, 10)
      }).catch((error) => console.error("Failed to persist directory recents", error))
    },
    remove(projectID: string, directory: string) {
      void updateStore((draft) => {
        draft.projects[projectID] = (draft.projects[projectID] ?? []).filter((item) => item.directory !== directory)
      }).catch((error) => console.error("Failed to remove directory recent", error))
    },
  }
}
