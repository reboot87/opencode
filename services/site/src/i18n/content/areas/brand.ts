import { interpolate } from "~/i18n"
import { english } from "~/i18n/english"
import { brandContent } from "~/lib/brand-content"

/** The Brand page's English copy (its heading ids follow the English in every language).
 *
 * 多语言分区文案：品牌。
 */
export const brandSource = brandContent((key, params) => interpolate(english[key], params))
