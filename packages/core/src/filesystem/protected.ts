/**
 * 受保护目录判定。
 * 识别 home 等受保护目录，避免对其执行危险操作。
 */
import os from "os"
import path from "path"

const home = os.homedir()

export function isHome(directory: string) {
  return path.resolve(directory) === path.resolve(home)
}

const DARWIN_HOME = [
  "Music",
  "Pictures",
  "Movies",
  "Downloads",
  "Desktop",
  "Documents",
  "Public",
  "Applications",
  "Library",
]

const WIN32_HOME = ["AppData", "Downloads", "Desktop", "Documents", "Pictures", "Music", "Videos", "OneDrive"]

/** Directory basenames to skip when scanning the home directory. */
export function names(): ReadonlySet<string> {
  if (process.platform === "darwin") return new Set(DARWIN_HOME)
  if (process.platform === "win32") return new Set(WIN32_HOME)
  return new Set()
}

export * as Protected from "./protected.js"
