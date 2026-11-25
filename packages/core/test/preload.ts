/**
 * 预加载的测试辅助模块。
 *
 * 被测模块：@opencode/core/preload
 *
 * 覆盖该模块的核心行为与边界条件。
 */
process.env.OPENCODE_DB = ":memory:"
process.env.NPM_CONFIG_AUDIT = "false"
