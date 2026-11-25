/**
 * 对等性校验入口：时钟。
 *
 * Rust 与 TypeScript 双实现的对等性校验：驱动全部 oracle / component / 场景脚本并刷新基线。
 */
// P-TUI fixed clock, preloaded into the TS server and client of a scenario that sets `now`: with
// OPENCODE_DRIVE_NOW (milliseconds since the epoch), `Date` starts at that instant and runs on, so dates the screen
// shows do not follow the day of the run. The Rust client reads the same variable in `opencode_util::time::now_ms`.
const start = Number(process.env.OPENCODE_DRIVE_NOW)
if (start) {
  const real = Date
  const offset = start - real.now()
  const now = () => real.now() + offset
  globalThis.Date = new Proxy(real, {
    construct: (target, args, newTarget) => Reflect.construct(target, args.length ? args : [now()], newTarget),
    apply: () => new real(now()).toString(),
    get: (target, key, receiver) => (key === "now" ? now : Reflect.get(target, key, receiver)),
  })
}
