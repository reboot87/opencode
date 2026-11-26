-- tools/grep.lua
-- 进程内工具：不再需要 JSON 解码、不再需要 io，参数已经是 Lua 表。
function run(args)
  local text = host.read(args.path)
  if not text then
    return "读取失败：" .. tostring(args.path)
  end

  local hits, line = {}, 0
  for one in text:gmatch("[^\r\n]+") do
    line = line + 1
    if one:find(args.pattern, 1, true) then
      hits[#hits + 1] = line .. ": " .. one
    end
  end

  if #hits == 0 then
    return "没有匹配：" .. tostring(args.pattern)
  end
  return table.concat(hits, "\n")
end
