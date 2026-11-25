/**
 * 供应商·工厂的测试辅助模块。
 *
 * 被测模块：@opencode/core/plugin/fixtures/provider-factory
 *
 * 覆盖插件加载、生命周期钩子与能力注册的行为。
 */
export function createFixtureProvider(options: Record<string, unknown>) {
  const captured = Object.fromEntries(Object.entries(options))
  return Object.assign((modelID: string) => ({ modelID, options: captured }), {
    options: captured,
    languageModel(modelID: string) {
      return { modelID, options: captured }
    },
  })
}
