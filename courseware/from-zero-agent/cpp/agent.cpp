// 从零手写 Agent · C++ 版
//
// 分工：
//   C++   框架：请求模型、跑循环、查权限、回灌结果，外加一个嵌入的 Lua 解释器
//   Lua   工具：每个 tools/*.lua 实现一个工具，函数 run(args) 决定具体怎么做
//
// 两种工具形态，同一个协议：
//   进程内   script: "read_file.lua"   静态链接的 Lua 直接调用，不启子进程
//   进程外   command: "python x.py"    参数走 stdin、结果走 stdout，任意语言
//
// 编译 (Windows / MSVC):
//   build.bat
// 编译 (Linux / macOS):
//   sh build.sh
//
// 运行:
//   set OPENAI_API_KEY=sk-...
//   agent.exe "读取 package.json，告诉我项目名字"

#include <algorithm>
#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

#ifdef _WIN32
#include <windows.h>
#include <shellapi.h>
#define popen _popen
#define pclose _pclose
#endif

#ifdef _MSC_VER
#pragma comment(lib, "shell32.lib")  // CommandLineToArgvW
#endif

// Lua 是 C 库：头文件包在 extern "C" 里，链接时才不会按 C++ 规则改名
extern "C" {
#include "third_party/lua/lauxlib.h"
#include "third_party/lua/lua.h"
#include "third_party/lua/lualib.h"
}

#include "third_party/json.hpp"

using json = nlohmann::json;
using std::string;
using std::vector;

const int MAX_STEPS = 20;
const int MAX_OUTPUT = 8000;

// ---------------------------------------------------------------- 基础设施

static string env(const char* key, const string& fallback) {
    const char* value = std::getenv(key);
    return value && *value ? string(value) : fallback;
}

static string readFile(const string& path) {
    FILE* file = std::fopen(path.c_str(), "rb");
    if (!file) return "";
    string out;
    char buffer[8192];
    size_t n;
    while ((n = std::fread(buffer, 1, sizeof buffer, file)) > 0) out.append(buffer, n);
    std::fclose(file);
    return out;
}

static void writeFile(const string& path, const string& text) {
    FILE* file = std::fopen(path.c_str(), "wb");
    if (!file) return;
    std::fwrite(text.data(), 1, text.size(), file);
    std::fclose(file);
}

// 跑一条命令，把 stdout 和 stderr 一起收回来
static string sh(const string& command) {
    FILE* pipe = popen(command.c_str(), "rb");
    if (!pipe) return "";
    string out;
    char buffer[4096];
    size_t n;
    while ((n = std::fread(buffer, 1, sizeof buffer, pipe)) > 0) out.append(buffer, n);
    pclose(pipe);
    return out;
}

static string tmpPath(const string& name) {
#ifdef _WIN32
    string dir = env("TEMP", env("TMP", "."));
#else
    string dir = env("TMPDIR", "/tmp");
#endif
    return dir + "/" + name;
}

// 按字节截断会把 UTF-8 汉字切成两半，所以退到字符边界
static string truncate(const string& text) {
    if (static_cast<int>(text.size()) <= MAX_OUTPUT) return text;
    size_t cut = MAX_OUTPUT;
    while (cut > 0 && (static_cast<unsigned char>(text[cut]) & 0xC0) == 0x80) --cut;
    return text.substr(0, cut) + "\n…（已截断 " + std::to_string(text.size() - cut) + " 字节）";
}

// ---------------------------------------------------------------- 嵌入的 Lua

// C++ 只提供"手"：读、写、跑命令。用不用、怎么用、先做什么，由 Lua 脚本决定。
// 沙箱：不开 io / os / package，脚本拿不到文件系统，只能走下面这三个函数。

static lua_State* LUA = nullptr;

static int l_read(lua_State* L) {
    const char* path = luaL_checkstring(L, 1);
    FILE* file = std::fopen(path, "rb");
    if (!file) {
        lua_pushnil(L);
        return 1;
    }
    string out;
    char buffer[8192];
    size_t n;
    while ((n = std::fread(buffer, 1, sizeof buffer, file)) > 0) out.append(buffer, n);
    std::fclose(file);
    lua_pushlstring(L, out.data(), out.size());
    return 1;
}

static int l_write(lua_State* L) {
    const char* path = luaL_checkstring(L, 1);
    size_t length = 0;
    const char* content = luaL_checklstring(L, 2, &length);
    FILE* file = std::fopen(path, "wb");
    if (!file) {
        lua_pushboolean(L, 0);
        return 1;
    }
    std::fwrite(content, 1, length, file);
    std::fclose(file);
    lua_pushboolean(L, 1);
    return 1;
}

// 跨平台启动一条命令：写临时脚本再交给解释器，省掉嵌套引号的所有麻烦
static string shellCommand(const string& command) {
    const string scriptPath = tmpPath("agent_cmd.ps1");
#ifdef _WIN32
    writeFile(scriptPath, "[Console]::OutputEncoding=[Text.Encoding]::UTF8\n" + command + "\n");
    return sh("powershell -NoProfile -ExecutionPolicy Bypass -File \"" + scriptPath + "\" 2>&1");
#else
    writeFile(scriptPath, command + "\n");
    return sh("sh \"" + scriptPath + "\" 2>&1");
#endif
}

static int l_exec(lua_State* L) {
    const string out = shellCommand(luaL_checkstring(L, 1));
    lua_pushlstring(L, out.data(), out.size());
    return 1;
}

// JSON 参数转成 Lua 表：脚本里就是 args.path、args.pattern
static void pushJson(lua_State* L, const json& value) {
    if (value.is_object()) {
        lua_createtable(L, 0, static_cast<int>(value.size()));
        for (auto it = value.begin(); it != value.end(); ++it) {
            pushJson(L, it.value());
            lua_setfield(L, -2, it.key().c_str());
        }
    } else if (value.is_array()) {
        lua_createtable(L, static_cast<int>(value.size()), 0);
        int index = 1;
        for (const auto& item : value) {
            pushJson(L, item);
            lua_rawseti(L, -2, index++);
        }
    } else if (value.is_string()) {
        const string text = value.get<string>();
        lua_pushlstring(L, text.data(), text.size());
    } else if (value.is_number()) {
        lua_pushnumber(L, value.get<double>());
    } else if (value.is_boolean()) {
        lua_pushboolean(L, value.get<bool>());
    } else {
        lua_pushnil(L);
    }
}

static void initLua() {
    LUA = luaL_newstate();
    if (!LUA) throw std::runtime_error("Lua 初始化失败");

    luaL_requiref(LUA, "_G", luaopen_base, 1);
    luaL_requiref(LUA, LUA_TABLIBNAME, luaopen_table, 1);
    luaL_requiref(LUA, LUA_STRLIBNAME, luaopen_string, 1);
    luaL_requiref(LUA, LUA_MATHLIBNAME, luaopen_math, 1);
    luaL_requiref(LUA, LUA_UTF8LIBNAME, luaopen_utf8, 1);
    lua_pop(LUA, 5);

    lua_createtable(LUA, 0, 3);
    lua_pushcfunction(LUA, l_read);
    lua_setfield(LUA, -2, "read");
    lua_pushcfunction(LUA, l_write);
    lua_setfield(LUA, -2, "write");
    lua_pushcfunction(LUA, l_exec);
    lua_setfield(LUA, -2, "exec");
    lua_setglobal(LUA, "host");

    lua_newtable(LUA);  // 工具表，存每个脚本的 run 函数
    lua_setfield(LUA, LUA_REGISTRYINDEX, "agent_tools");
}

// 加载一个脚本：执行完它必须定义 run(args)
static bool loadLuaTool(const string& name, const string& script) {
    if (luaL_loadfile(LUA, script.c_str()) != LUA_OK || lua_pcall(LUA, 0, 0, 0) != LUA_OK) {
        std::cerr << "跳过工具 " << name << "：" << lua_tostring(LUA, -1) << "\n";
        lua_pop(LUA, 1);
        return false;
    }
    lua_getglobal(LUA, "run");
    if (!lua_isfunction(LUA, -1)) {
        std::cerr << "跳过工具 " << name << "：" << script << " 没有定义 run(args)\n";
        lua_pop(LUA, 1);
        return false;
    }
    lua_getfield(LUA, LUA_REGISTRYINDEX, "agent_tools");
    lua_pushvalue(LUA, -2);
    lua_setfield(LUA, -2, name.c_str());
    lua_pop(LUA, 2);
    return true;
}

// 工具跑飞了不该拖死整个 agent：每 1000 条指令查一次墙钟，超时就 luaL_error。
// 只能在 Lua 指令边界打断——host.exec 里卡住的子进程管不到。
static int toolTimeoutMs = 10000;
static long long deadlineMs = 0;

static long long nowMs() {
    using namespace std::chrono;
    return duration_cast<milliseconds>(steady_clock::now().time_since_epoch()).count();
}

static void deadlineHook(lua_State* L, lua_Debug*) {
    if (nowMs() >= deadlineMs) luaL_error(L, "执行超时，已中止（TOOL_TIMEOUT_MS）");
}

static string callLuaTool(const string& name, const json& args) {
    lua_getfield(LUA, LUA_REGISTRYINDEX, "agent_tools");
    lua_getfield(LUA, -1, name.c_str());
    lua_remove(LUA, -2);  // 栈上只剩 run
    pushJson(LUA, args);

    deadlineMs = nowMs() + toolTimeoutMs;
    lua_sethook(LUA, deadlineHook, LUA_MASKCOUNT, 1000);
    const int status = lua_pcall(LUA, 1, 1, 0);
    lua_sethook(LUA, nullptr, 0, 0);

    if (status != LUA_OK) {
        const string message = lua_tostring(LUA, -1) ? lua_tostring(LUA, -1) : "未知错误";
        lua_pop(LUA, 1);
        return "工具报错：" + message;
    }
    size_t length = 0;
    const char* result = lua_tolstring(LUA, -1, &length);
    string text = result ? string(result, length) : "(脚本没有返回值)";
    lua_pop(LUA, 1);
    return truncate(text);
}

// ---------------------------------------------------------------- 模型请求

static json post(const string& url, const string& body, const string& apiKey) {
    const string reqPath = tmpPath("agent_req.json");
    const string resPath = tmpPath("agent_res.json");
    writeFile(reqPath, body);

    // 不链接 libcurl：直接调用系统里的 curl。少一个依赖，也少一堆编译选项。
    string cmd = "curl -sS --max-time 120 ";
#ifdef _WIN32
    cmd += "--ssl-no-revoke ";  // Windows 自带的 Schannel 默认查吊销列表，内网常常查不通
#endif
    cmd += "-X POST \"" + url + "\""
           " -H \"content-type: application/json\""
           " -H \"authorization: Bearer " + apiKey + "\""
           " --data-binary @\"" + reqPath + "\""
           " -o \"" + resPath + "\"";
    sh(cmd);

    const string raw = readFile(resPath);
    if (raw.empty()) throw std::runtime_error("curl 没有返回内容，检查网络或 BASE_URL");
    return json::parse(raw);
}

// ---------------------------------------------------------------- 工具

// 每个工具 = tools/ 下的一个 .json（描述 + 命令）+ 它自己调用的脚本。
// 加工具只加文件：C++ 不用改，也不用重新编译。

struct Rule {
    string pattern;
    string effect = "ask";
};

struct Tool {
    string name;
    string description;
    string parameters;  // JSON Schema，原样发给模型
    string script;      // 进程内：tools/*.lua，实现 run(args)
    string command;     // 进程外：从 stdin 读参数 JSON 的命令
    string effect = "ask";
    vector<Rule> rules;  // 宽泛在前，例外在后；最后一条命中的生效
};

static vector<Tool> loadTools(const string& dir) {
    vector<Tool> list;
    for (const auto& entry : std::filesystem::directory_iterator(dir)) {
        if (entry.path().extension() != ".json") continue;
        const json data = json::parse(readFile(entry.path().string()));

        Tool tool;
        tool.name = data.at("name");
        tool.description = data.at("description");
        tool.parameters = data.at("parameters").dump();
        tool.script = data.value("script", "");
        tool.command = data.value("command", "");
        tool.effect = data.value("effect", "ask");
        for (const auto& rule : data.value("rules", json::array()))
            tool.rules.push_back({rule.at("pattern"), rule.value("effect", "ask")});
        list.push_back(tool);
    }
    // 按名字排序，保证每轮发给模型的菜单顺序稳定
    std::sort(list.begin(), list.end(),
              [](const Tool& a, const Tool& b) { return a.name < b.name; });
    return list;
}

static json toolsPayload(const vector<Tool>& list) {
    json arr = json::array();
    for (const auto& tool : list) {
        json fn;
        fn["name"] = tool.name;
        fn["description"] = tool.description;
        fn["parameters"] = json::parse(tool.parameters);
        json item;
        item["type"] = "function";
        item["function"] = fn;
        arr.push_back(item);
    }
    return arr;
}

// ---------------------------------------------------------------- 权限

static bool matches(const string& pattern, const string& value) {
    if (pattern == "*") return true;
    if (!pattern.empty() && pattern.back() == '*')
        return value.compare(0, pattern.size() - 1, pattern, 0, pattern.size() - 1) == 0;
    return value == pattern;
}

static string decide(const Tool& tool, const string& target) {
    string effect = tool.effect;  // 工具自己的默认档，没写就是 ask
    for (const auto& rule : tool.rules)
        if (matches(rule.pattern, target)) effect = rule.effect;
    return effect;
}

static bool confirm(const string& question) {
    std::cout << question << " [y/N] " << std::flush;
    string line;
    if (!std::getline(std::cin, line)) return false;
    return !line.empty() && (line[0] == 'y' || line[0] == 'Y');
}

// ---------------------------------------------------------------- 参数

#ifdef _WIN32
static vector<string> args() {
    int argc = 0;
    LPWSTR* wargv = CommandLineToArgvW(GetCommandLineW(), &argc);
    vector<string> out;
    for (int i = 0; i < argc; ++i) {
        int n = WideCharToMultiByte(CP_UTF8, 0, wargv[i], -1, nullptr, 0, nullptr, nullptr);
        string s(n > 1 ? n - 1 : 0, '\0');
        if (n > 1) WideCharToMultiByte(CP_UTF8, 0, wargv[i], -1, &s[0], n, nullptr, nullptr);
        out.push_back(s);
    }
    LocalFree(wargv);
    return out;
}
#else
static vector<string> args(int argc, char** argv) { return vector<string>(argv, argv + argc); }
#endif

// ---------------------------------------------------------------- 主循环

int main(int argc, char** argv) {
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
#endif
    const string baseUrl = env("OPENAI_BASE_URL", "https://api.openai.com/v1");
    const string apiKey = env("OPENAI_API_KEY", "");
    const string model = env("MODEL", "gpt-4.1-mini");
    toolTimeoutMs = std::atoi(env("TOOL_TIMEOUT_MS", "10000").c_str());

#ifdef _WIN32
    const vector<string> argvList = args();
#else
    const vector<string> argvList = args(argc, argv);
#endif

    string task;
    for (size_t i = 1; i < argvList.size(); ++i) {
        if (!task.empty()) task += " ";
        task += argvList[i];
    }
    if (task.empty()) {
        std::cerr << "用法: agent \"你的任务\"\n";
        return 1;
    }

    json messages = json::array();
    messages.push_back({{"role", "system"},
                        {"content", "你是一个编码助手。先读文件再动手；修改前先说计划；用工具验证结果；拿不准就问用户。"}});
    messages.push_back({{"role", "user"}, {"content", task}});

    try {
        const vector<Tool> toolList = loadTools(env("TOOLS_DIR", "tools"));
        if (toolList.empty()) {
            std::cerr << "tools/ 里没有工具描述，检查 TOOLS_DIR\n";
            return 1;
        }

        initLua();
        for (const auto& tool : toolList)
            if (!tool.script.empty()) loadLuaTool(tool.name, tool.script);

        for (int step = 1; step <= MAX_STEPS; ++step) {
            json body;
            body["model"] = model;
            body["messages"] = messages;
            body["tools"] = toolsPayload(toolList);

            json data = post(baseUrl + "/chat/completions", body.dump(), apiKey);
            if (data.contains("error")) {
                std::cerr << "模型返回错误：" << data["error"].dump(2) << "\n";
                return 1;
            }

            const json message = data["choices"][0]["message"];
            const bool hasCalls = message.contains("tool_calls") && message["tool_calls"].is_array() &&
                                  !message["tool_calls"].empty();

            // assistant 消息必须原样放回，工具结果才能和它对应上
            json assistant;
            assistant["role"] = "assistant";
            if (message.contains("content") && message["content"].is_string())
                assistant["content"] = message["content"];
            else
                assistant["content"] = nullptr;
            if (hasCalls) assistant["tool_calls"] = message["tool_calls"];
            messages.push_back(assistant);

            // 没有工具调用 = 模型认为任务完成了
            if (!hasCalls) {
                std::cout << "\n" << (message.contains("content") && message["content"].is_string()
                                          ? message["content"].get<string>()
                                          : "")
                          << "\n";
                return 0;
            }

            for (const auto& call : message["tool_calls"]) {
                const string name = call["function"]["name"];
                json args;
                try {
                    args = json::parse(call["function"]["arguments"].get<string>());
                } catch (const std::exception&) {
                    args = json::object();
                }

                string target;
                if (args.contains("path") && args["path"].is_string())
                    target = args["path"];
                else if (args.contains("command") && args["command"].is_string())
                    target = args["command"];

                string content;
                const Tool* tool = nullptr;
                for (const auto& candidate : toolList)
                    if (candidate.name == name) tool = &candidate;

                if (!tool) {
                    content = "错误：没有名为 " + name + " 的工具";
                } else {
                    const string effect = decide(*tool, target);
                    const bool allowed = effect == "allow" ||
                                         (effect == "ask" && confirm("允许 " + name + " " + target + " ?"));
                    if (!allowed) {
                        content = effect == "deny" ? "该操作被权限规则禁止" : "用户拒绝执行该操作";
                    } else if (!tool->script.empty()) {
                        content = callLuaTool(tool->name, args);  // 进程内，直接进 Lua
                    } else {
                        const string argsPath = tmpPath("agent_args.json");
                        writeFile(argsPath, args.dump());
                        content = truncate(sh(tool->command + " < \"" + argsPath + "\" 2>&1"));
                    }
                }

                json feedback;
                feedback["role"] = "tool";
                feedback["tool_call_id"] = call["id"];
                try {
                    feedback["content"] = content;  // 非 UTF-8 的工具输出在这里会抛错
                } catch (const json::exception&) {
                    feedback["content"] = "(工具输出不是 UTF-8 文本，已丢弃)";
                }
                messages.push_back(feedback);
            }
        }
    } catch (const std::exception& error) {
        std::cerr << "出错：" << error.what() << "\n";
        return 1;
    }

    std::cout << "达到最大步数 " << MAX_STEPS << "，任务仍未完成。\n";
    return 2;
}
