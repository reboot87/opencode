-- tools/run_shell.lua
-- 跑什么由模型给，怎么跑由这里定；平台差异（PowerShell / sh）在 host.exec 里抹平。
function run(args)
  local output = host.exec(args.command)
  if output == "" then
    return "(命令没有输出)"
  end
  return output
end
