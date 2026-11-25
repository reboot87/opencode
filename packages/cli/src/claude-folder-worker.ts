/**
 * Claude 目录 Worker。
 * 在 Claude 会话目录中运行辅助脚本的桥接入口。
 */
// Third compile entrypoint: it lands next to index.js and the shared chunks in
// the executable, where ClaudeIO resolves "./claude-folder-worker.js".
import "../../core/src/plugin/provider/claude-agent/claude/claude-folder-worker"
