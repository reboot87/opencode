"""执行一条命令。参数从 stdin 读 JSON，输出写 stdout。"""

import json
import subprocess
import sys

sys.stdin.reconfigure(encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")

args = json.load(sys.stdin)
if sys.platform == "win32":
    command = ["powershell", "-NoProfile", "-Command",
               "[Console]::OutputEncoding=[Text.Encoding]::UTF8; " + args["command"]]
else:
    command = ["bash", "-lc", args["command"]]

result = subprocess.run(command, capture_output=True, text=True, errors="replace")
output = (result.stdout + result.stderr).strip()
print(output or f"(exit {result.returncode}，无输出)")
