/**
 * 配对插件 — Contract。
 * 设备配对流程的 GUI 插件中负责 Contract 部分，提供该部分所需的实现与类型定义。
 */
import { Schema } from "effect"
import { Ipc } from "@opencode/plugin/gui"

/**
 * Turns on remote access and keeps this machine's display awake while another device uses it. The window asks the
 * local server for its remote address and pairing codes through its own `ServerRef`; remote access, which changes
 * the background service's settings through the CLI, and the display sleep blocker need the main process.
 */
export const Pairing = Ipc.define({
  id: "pairing",
  methods: {
    /** Whether remote access is on: the background service serves an OpenTunnel address. */
    remote: { output: Schema.Boolean },
    /**
     * Turns remote access on or off, then starts the background service again. Turning it on the first time creates
     * the tunnel, which can take a minute.
     */
    setRemote: { input: Schema.Boolean },
    /** Whether main holds the display sleep blocker. */
    screenActive: { output: Schema.Boolean },
    /** Holds or releases the display sleep blocker, and remembers the choice. */
    setScreenActive: { input: Schema.Boolean },
  },
})
