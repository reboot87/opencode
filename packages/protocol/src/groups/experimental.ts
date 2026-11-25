/**
 * 实验性 API 分组汇总。
 * 把各实验性分组（持久 PTY 等）合并为统一的实验性入口。
 */
import { ArtifactEndpoints } from "./artifact.js"
import { BlobGetEndpoint } from "./blob.js"
import { AutomationEndpoints } from "./automation.js"
import { JobEndpoints } from "./job.js"
import { MachineEndpoints } from "./machine.js"
import { MediaGetEndpoint } from "./media.js"
import { PersistentPtyGroup } from "./persistent-pty.js"

/** `server.experimental`: routes under /api/experimental, without compatibility guarantees. */
export const ExperimentalGroup = PersistentPtyGroup.add(
  MediaGetEndpoint,
  BlobGetEndpoint,
  ...AutomationEndpoints,
  ...ArtifactEndpoints,
  ...JobEndpoints,
  ...MachineEndpoints,
)
