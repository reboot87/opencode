#!/bin/sh
# Linux / macOS：Lua 必须按 C 编译（否则符号会被 C++ 改名），再和 agent.cpp 链接。
set -e
cc -O2 -c third_party/lua/*.c
c++ -std=c++17 -O2 agent.cpp *.o -o agent
rm -f *.o
echo "built: ./agent"
