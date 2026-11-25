/**
 * 数据站 API — Health。
 * 数据站点的 HTTP 接口中负责 Health 部分，提供该部分所需的实现与类型定义。
 */
export async function GET() {
  return Response.json({ ok: true, app: "stats" })
}
