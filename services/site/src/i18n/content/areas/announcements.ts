import { announcements } from "~/component/site/announcement"

/** The home announcement's English copy, when Settings turns it on. Matched by its English text.
 *
 * 多语言分区文案：公告。
 */
export const announcementsSource = announcements.map((item) => ({ text: item.text, link: item.link }))
