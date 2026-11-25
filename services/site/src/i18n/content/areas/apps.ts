import { anomalyProducts } from "~/component/site/links"

/** Anomaly's other apps' English copy, by app.
 *
 * 多语言分区文案：`apps`。
 */
export const appsSource = Object.fromEntries(
  anomalyProducts.map((app) => [app.id, { category: app.category, body: app.body }]),
) as Record<(typeof anomalyProducts)[number]["id"], { category: string; body: string }>
