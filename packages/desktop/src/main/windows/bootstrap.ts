/**
 * 窗口管理 — Bootstrap。
 * 浏览器窗口的创建与布局管理中负责 Bootstrap 部分，提供该部分所需的实现与类型定义。
 */
import { app } from "electron"
import { Predicate } from "effect"
import { windowBootstrapArgument, type WindowBootstrap } from "../../shared/window-bootstrap"
import { FIRST_LAUNCH_ONBOARDING_COMPLETE_KEY } from "../storage/keys"
import { getStore } from "../storage/store"

// The settings store is already in memory when a window is created, so the renderer gets the
// answers its shell gate would otherwise ask for over IPC. A fresh install has no onboarding
// decision yet; the renderer asks once the layers have made one.
export function windowBootstrap(id: string): WindowBootstrap {
  const complete = getStore().get(FIRST_LAUNCH_ONBOARDING_COMPLETE_KEY)

  return {
    id,
    firstLaunchPending: Predicate.isBoolean(complete) ? !complete : undefined,
    packaged: app.isPackaged,
  }
}

export function windowArguments(id: string) {
  return [windowBootstrapArgument(windowBootstrap(id))]
}
