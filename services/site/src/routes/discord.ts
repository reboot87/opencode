/**
 * 页面路由：`discord`。
 */
import { redirect } from "@solidjs/router"

export async function GET() {
  return redirect("https://discord.gg/opencode")
}
