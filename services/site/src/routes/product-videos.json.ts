/**
 * 页面路由：product·视频·JSON。
 */
import { videoSets } from "~/component/site/videos"

// The product video sets in public/product-videos, from the manifests bundled at build time.
export async function GET() {
  return Response.json(videoSets)
}
