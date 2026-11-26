-- tools/grep.lua
-- 用 Lua 写的工具：协议和 Python 版完全一样，参数走 stdin 的 JSON，结果走 stdout。
-- 在 agent.cpp 的 tools() 里加一行就能用：
--   {"grep", "在文件里搜索文本，返回行号。",
--    R"({"type":"object","properties":{"pattern":{"type":"string"},"path":{"type":"string"}},"required":["pattern","path"]})",
--    "lua tools/grep.lua"},
-- 依赖：装个 lua（lua.org 或 luajit）。没装的话，模型只会收到一条「找不到 lua」的错误。

-- 最小 JSON 解码，只为了读参数。生产环境用 dkjson / lua-cjson。
-- shortcut: 不支持 \u 转义，路径里有特殊字符就换库。
local function decode(text)
  local pos = 1

  local function skip()
    pos = text:find("[^%s]", pos) or #text + 1
  end

  local function value()
    skip()
    local ch = text:sub(pos, pos)

    if ch == "{" then
      local obj = {}
      pos = pos + 1
      while true do
        skip()
        if text:sub(pos, pos) == "}" then
          pos = pos + 1
          return obj
        end
        local key = value()
        skip()
        pos = pos + 1 -- 跳过冒号
        obj[key] = value()
        skip()
        if text:sub(pos, pos) == "," then pos = pos + 1 end
      end
    end

    if ch == "[" then
      local arr = {}
      pos = pos + 1
      while true do
        skip()
        if text:sub(pos, pos) == "]" then
          pos = pos + 1
          return arr
        end
        arr[#arr + 1] = value()
        skip()
        if text:sub(pos, pos) == "," then pos = pos + 1 end
      end
    end

    if ch == '"' then
      local out = {}
      pos = pos + 1
      while true do
        local c = text:sub(pos, pos)
        if c == "" then break end
        if c == '"' then
          pos = pos + 1
          break
        end
        if c == "\\" then
          local nextChar = text:sub(pos + 1, pos + 1)
          local escaped = { n = "\n", t = "\t", r = "\r", ['"'] = '"', ["\\"] = "\\", ["/"] = "/" }
          out[#out + 1] = escaped[nextChar] or nextChar
          pos = pos + 2
        else
          out[#out + 1] = c
          pos = pos + 1
        end
      end
      return table.concat(out)
    end

    local literal = text:sub(pos, pos + 4)
    if literal:sub(1, 4) == "true" then
      pos = pos + 4
      return true
    end
    if literal:sub(1, 5) == "false" then
      pos = pos + 5
      return false
    end
    if literal:sub(1, 4) == "null" then
      pos = pos + 4
      return nil
    end

    local number = text:match("^-?%d+%.?%d*[eE]?[-+]?%d*", pos)
    if not number then error("无法解析的位置 " .. pos) end
    pos = pos + #number
    return tonumber(number)
  end

  return value()
end

local ok, args = pcall(decode, io.read("a"))
if not ok or type(args) ~= "table" then
  print("参数解析失败：" .. tostring(args))
  return
end

local file, openError = io.open(args.path or "", "r")
if not file then
  print("读取失败：" .. tostring(openError))
  return
end

local hits, lineno = {}, 0
for line in file:lines() do
  lineno = lineno + 1
  if line:find(args.pattern or "", 1, true) then
    hits[#hits + 1] = lineno .. ": " .. line
  end
end
file:close()

if #hits == 0 then
  print("没有匹配：" .. (args.pattern or ""))
  return
end
print(table.concat(hits, "\n"))
