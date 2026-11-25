/**
 * 法律页路由：索引。
 */
import "~/component/site/doc-list.css"
import "./legal.css"
import { LegalHub } from "~/component/site/legal"
import { legalHubMarkdown, legalPages } from "~/lib/legal-documents"

export default function Legal() {
  return <LegalHub documents={legalPages} markdown={legalHubMarkdown} />
}
