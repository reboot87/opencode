-- tools/read_file.lua
-- 进程内工具：C++ 只提供 host.read，要不要截断、怎么报错，由这里决定。
function run(args)
  local text = host.read(args.path)
  if not text then
    return "读取失败：" .. tostring(args.path) .. "（不存在或没有权限）"
  end
  return text
end
