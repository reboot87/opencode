/**
 * 选择·选项的测试辅助模块。
 *
 * 被测模块：@opencode/cli/acp/select-options
 *
 * 覆盖 ACP（Agent Client Protocol）会话的握手、消息流转与错误处理。
 */
import type { SessionConfigOption } from "@agentclientprotocol/sdk"

export function currentValue(
  result: { readonly configOptions?: readonly SessionConfigOption[] | null } | undefined,
  id: string,
) {
  return result?.configOptions?.find((option) => option.id === id)?.currentValue
}
