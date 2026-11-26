-- tools/write_file.lua
-- 进程内工具：写成功没有、怎么写、怎么报错，由脚本决定，C++ 不关心。
function run(args)
  if not host.write(args.path, args.content) then
    return "写入失败：" .. tostring(args.path)
  end
  local length = utf8.len(args.content) or #args.content
  return string.format("已写入 %s（%d 字）", args.path, length)
end
