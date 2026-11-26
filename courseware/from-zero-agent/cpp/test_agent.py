"""自测：用本地假模型跑通「请求 → 工具脚本 → 回灌 → 收尾」，不需要 API key。

    python test_agent.py

覆盖两件事：
  1. read_file 命中 allow，直接执行，结果回到模型
  2. write_file 命中 ask，用户回答 n，拒绝信息回到模型而不是崩溃
"""

import json
import os
import shutil
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


def run(task, stdin=""):
    return subprocess.run(
        ["./agent.exe", task],
        input=stdin, capture_output=True, text=True, encoding="utf-8", errors="replace", env=env,
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

if shutil.which("lua"):
    CALL.update(name="grep", args={"pattern": "int main", "path": "agent.cpp"})
    out = run("找一下 main").stdout
    passed &= check("lua: 同一个协议换个语言也能跑", "OK:" in out and "int main" in out, out[-200:])
else:
    print("SKIP lua 未安装，跳过 grep.lua 用例")

server.shutdown()
print("ALL PASS" if passed else "FAILED")
sys.exit(0 if passed else 1)
