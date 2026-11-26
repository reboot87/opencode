"""读文件。参数从 stdin 读 JSON，内容写 stdout。

这个文件就是「工具协议」的全部：谁调用不重要，C++ / Python / shell 都一样。
"""

import json
import sys

# 工具的输入输出一律是 UTF-8，跟 Windows 控制台的默认编码（936）无关
sys.stdin.reconfigure(encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")

args = json.load(sys.stdin)
try:
    with open(args["path"], encoding="utf-8", errors="replace") as f:
        sys.stdout.write(f.read())
except OSError as error:
    print(f"读取失败：{error}")
