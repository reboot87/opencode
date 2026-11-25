/**
 * 会话请求 — JobListTest。
 * 会话界面的请求发起与状态跟踪中负责 JobListTest 部分，提供该部分所需的实现与类型定义。
 */
import { describe, expect, test } from "bun:test"
import { mergeJobList } from "./background"

const job = (id: string, status: string) => ({ id, status })

describe("mergeJobList", () => {
  test("drops a listed job that settled while the list loaded", () => {
    const jobs = mergeJobList([job("job_a", "running")], new Map([["job_a", job("job_a", "completed")]]))

    expect([...jobs.keys()]).toEqual([])
  })

  test("keeps a job that started while the list loaded", () => {
    const jobs = mergeJobList([job("job_a", "running")], new Map([["job_b", job("job_b", "running")]]))

    expect([...jobs.keys()]).toEqual(["job_a", "job_b"])
  })
})
