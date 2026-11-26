"""自测：用本地假模型跑通「请求 → 工具脚本 → 回灌 → 收尾」，不需要 API key。

    python test_agent.py

覆盖两件事：
  1. read_file 命中 allow，直接执行，结果回到模型
  2. write_file 命中 ask，用户回答 n，拒绝信息回到模型而不是崩溃
"""

import json
import os
import subprocess
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

CALL = {}


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["content-length"])))
        results = [m for m in body["messages"] if m["role"] == "tool"]
        if not results:
            reply = {
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": None,
                        "tool_calls": [{"id": "call_1", "type": "function",
                                        "function": {"name": CALL["name"],
                                                     "arguments": json.dumps(CALL["args"])}}],
                    }
                }]
            }
        else:
            reply = {"choices": [{"message": {"role": "assistant",
                                              "content": "OK:" + results[-1]["content"][:40]}}]}
        data = json.dumps(reply).encode()
        self.send_response(200)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}/v1"

env = {**os.environ, "OPENAI_BASE_URL": base, "OPENAI_API_KEY": "test", "MODEL": "mock"}


def run(task, stdin="", path=None, extra=None):
    merged = {**env, **(extra or {})}
    if path:
        merged["PATH"] = path
    return subprocess.run(
        ["./agent.exe", task],
        input=stdin, capture_output=True, text=True, encoding="utf-8", errors="replace",
        env=merged,
    )


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (("  " + detail) if not ok else ""))
    return ok


passed = True

CALL.update(name="read_file", args={"path": "agent.cpp"})
out = run("读一下 agent.cpp").stdout
passed &= check("allow: 工具结果原样回到模型", "OK:" in out and "从零手写" in out, out[-200:])

CALL.update(name="write_file", args={"path": "should_not_exist.txt", "content": "x"})
out = run("写一个文件", stdin="n\n").stdout
passed &= check("ask: 拒绝后不落盘", "用户拒绝执行该操作" in out, out[-200:])
passed &= check("ask: 文件没有被创建", not os.path.exists("should_not_exist.txt"))

# 关键用例：运行期往 tools/ 里丢两个文件，不重新编译也能用
ECHO = '''import json, sys
sys.stdin.reconfigure(encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")
print(json.load(sys.stdin)["text"])
'''
DESC = json.dumps({
    "name": "echo",
    "description": "原样返回传入的文本。",
    "parameters": {"type": "object", "properties": {"text": {"type": "string"}}, "required": ["text"]},
    "command": "python tools/_test_echo.py",
    "effect": "allow",
}, ensure_ascii=False)

with open("tools/_test_echo.py", "w", encoding="utf-8") as f:
    f.write(ECHO)
with open("tools/_test_echo.json", "w", encoding="utf-8") as f:
    f.write(DESC)
try:
    CALL.update(name="echo", args={"text": "hi"})
    out = run("回显一下").stdout
    passed &= check("新增工具：只加文件，不重新编译", "OK:hi" in out, out[-200:])
finally:
    for name in ("tools/_test_echo.py", "tools/_test_echo.json"):
        os.remove(name)

# 进程内 Lua：PATH 里只留 System32（有 curl，没有 lua.exe，也没有 python）
CALL.update(name="grep", args={"pattern": "int main", "path": "agent.cpp"})
bare = r"C:\Windows\System32;C:\Windows" if sys.platform == "win32" else "/usr/bin:/bin"
out = run("找一下 main", path=bare).stdout
passed &= check("lua 进程内：不依赖 lua.exe", "OK:" in out and "int main" in out, out[-200:])

# host.exec：Lua 调命令，走临时脚本 + PowerShell / sh
CALL.update(name="run_shell", args={"command": "echo hi"})
out = run("跑一条命令", stdin="y\n").stdout
passed &= check("ask: 同意后由 Lua 执行命令", "OK:hi" in out, out[-200:])

# 脚本跑飞：超时打断，回一条错误，agent 继续
with open("tools/_test_loop.lua", "w", encoding="utf-8") as f:
    f.write("function run(args)\n  while true do end\nend\n")
with open("tools/_test_loop.json", "w", encoding="utf-8") as f:
    f.write(json.dumps({
        "name": "loop",
        "description": "死循环，用来测超时。",
        "parameters": {"type": "object", "properties": {}},
        "script": "tools/_test_loop.lua",
        "effect": "allow",
    }, ensure_ascii=False))
try:
    CALL.update(name="loop", args={})
    out = run("跑飞一下", extra={"TOOL_TIMEOUT_MS": "200"}).stdout
    passed &= check("Lua 死循环：超时打断，不卡死进程", "执行超时" in out, out[-200:])
finally:
    for name in ("tools/_test_loop.lua", "tools/_test_loop.json"):
        os.remove(name)

server.shutdown()
print("ALL PASS" if passed else "FAILED")
sys.exit(0 if passed else 1)
