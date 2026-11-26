"""写文件。参数从 stdin 读 JSON，结果写 stdout。"""

import json
import sys

sys.stdin.reconfigure(encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")

args = json.load(sys.stdin)
try:
    with open(args["path"], "w", encoding="utf-8", newline="") as f:
        f.write(args["content"])
    print(f'已写入 {args["path"]}（{len(args["content"])} 字）')
except OSError as error:
    print(f"写入失败：{error}")
