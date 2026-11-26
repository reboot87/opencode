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
//   agent.exe "读取 package.json，告诉我项目名字"     命令行模式
//   agent.exe --ui                                   浏览器模式（localhost:3000）
//
// 浏览器模式复用 ../ui.html：和 agent-ui.ts 是同一份页面，两个后端。
// TS 那边三行搞定的事，这里要自己写 socket、线程、互斥量。

#include <algorithm>
#include <atomic>
#include <cctype>
#include <chrono>
#include <condition_variable>
#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <mutex>
#include <set>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <winsock2.h>   // 必须在 windows.h 之前
#include <ws2tcpip.h>
#include <windows.h>
#include <shellapi.h>
#define popen _popen
#define pclose _pclose
#endif

#ifdef _MSC_VER
#pragma comment(lib, "shell32.lib")  // CommandLineToArgvW
#pragma comment(lib, "ws2_32.lib")   // 浏览器模式的 socket
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

// 两种模式共用的运行状态
static std::atomic<bool> STOP{false};
static bool UI_MODE = false;

// 权限：浏览器模式下等页面答复，等价于 TS 里那个还没 resolve 的 Promise
static std::mutex ASK_LOCK;
static std::condition_variable ASK_CV;
static bool ASK_ANSWERED = false;
static bool ASK_ALLOW = false;

static void uiSend(const json& event);  // 定义在浏览器模式那一节

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
    if (STOP.load()) luaL_error(L, "已停止");
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

static bool confirm(const string& name, const string& target) {
    if (!UI_MODE) {
        std::cout << "允许 " + name + " " + target + " ? [y/N] " << std::flush;
        string line;
        if (!std::getline(std::cin, line)) return false;
        return !line.empty() && (line[0] == 'y' || line[0] == 'Y');
    }
    // 浏览器模式：推一条 ask，然后睡在这个条件变量上，直到页面点按钮或停止
    std::unique_lock<std::mutex> lock(ASK_LOCK);
    ASK_ANSWERED = false;
    ASK_ALLOW = false;
    uiSend({{"type", "ask"}, {"name", name}, {"target", target}});
    ASK_CV.wait(lock, [] { return ASK_ANSWERED || STOP.load(); });
    return ASK_ANSWERED && ASK_ALLOW;
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

static vector<Tool> TOOLS;  // 启动时加载一次，两种模式共用

// 一次任务 = 一轮循环。命令行直接调用，浏览器模式把它放到线程里调用。
static int runTask(const string& task) {
    const string baseUrl = env("OPENAI_BASE_URL", "https://api.openai.com/v1");
    const string apiKey = env("OPENAI_API_KEY", "");
    const string model = env("MODEL", "gpt-4.1-mini");

    json messages = json::array();
    messages.push_back({{"role", "system"},
                        {"content", "你是一个编码助手。先读文件再动手；修改前先说计划；用工具验证结果；拿不准就问用户。"}});
    messages.push_back({{"role", "user"}, {"content", task}});

    try {
        for (int step = 1; step <= MAX_STEPS; ++step) {
            if (STOP.load()) {
                uiSend({{"type", "error"}, {"text", "已停止"}});
                return 3;
            }
            uiSend({{"type", "step"}, {"step", step}});

            json body;
            body["model"] = model;
            body["messages"] = messages;
            body["tools"] = toolsPayload(TOOLS);

            json data = post(baseUrl + "/chat/completions", body.dump(), apiKey);
            if (data.contains("error")) {
                const string detail = data["error"].dump(2);
                if (UI_MODE) {
                    uiSend({{"type", "error"}, {"text", "模型返回错误：" + detail}});
                } else {
                    std::cerr << "模型返回错误：" << detail << "\n";
                }
                return 1;
            }

            const json message = data["choices"][0]["message"];
            // 停止只能在这个请求返回后生效：popen 里的 curl 收不到信号
            if (STOP.load()) {
                uiSend({{"type", "error"}, {"text", "已停止"}});
                return 3;
            }
            const bool hasCalls = message.contains("tool_calls") && message["tool_calls"].is_array() &&
                                  !message["tool_calls"].empty();
            const string text = message.contains("content") && message["content"].is_string()
                                    ? message["content"].get<string>()
                                    : "";

            // assistant 消息必须原样放回，工具结果才能和它对应上
            json assistant;
            assistant["role"] = "assistant";
            if (!text.empty())
                assistant["content"] = text;
            else
                assistant["content"] = nullptr;
            if (hasCalls) assistant["tool_calls"] = message["tool_calls"];
            messages.push_back(assistant);
            if (!text.empty()) uiSend({{"type", "text"}, {"text", text}});

            // 没有工具调用 = 模型认为任务完成了
            if (!hasCalls) {
                if (!UI_MODE) std::cout << "\n" << text << "\n";
                uiSend({{"type", "done"}, {"text", "任务结束"}});
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

                uiSend({{"type", "tool"}, {"name", name}, {"args", args}});

                string content;
                const Tool* tool = nullptr;
                for (const auto& candidate : TOOLS)
                    if (candidate.name == name) tool = &candidate;

                if (!tool) {
                    content = "错误：没有名为 " + name + " 的工具";
                } else {
                    const string effect = decide(*tool, target);
                    const bool allowed = effect == "allow" ||
                                         (effect == "ask" && confirm(name, target));
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

                uiSend({{"type", "result"}, {"text", content}});

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
        if (UI_MODE) {
            uiSend({{"type", "error"}, {"text", error.what()}});
        } else {
            std::cerr << "出错：" << error.what() << "\n";
        }
        return 1;
    }

    uiSend({{"type", "error"}, {"text", "达到最大步数 " + std::to_string(MAX_STEPS) + "，任务仍未完成"}});
    if (!UI_MODE) std::cout << "达到最大步数 " << MAX_STEPS << "，任务仍未完成。\n";
    return 2;
}

// ---------------------------------------------------------------- 浏览器模式

// 页面是 ../ui.html，和 agent-ui.ts 共用。TS 三行写完的事，这里要自己写 socket、线程、互斥量。

#ifdef _WIN32

static SOCKET LISTEN = INVALID_SOCKET;
static std::mutex UI_LOCK;
static std::set<SOCKET> CLIENTS;
static std::string PAGE;
static std::atomic<bool> RUNNING{false};

static void uiSend(const json& event) {
    if (!UI_MODE) return;
    const string frame = "data: " + event.dump() + "\n\n";
    std::lock_guard<std::mutex> guard(UI_LOCK);
    for (SOCKET client : CLIENTS)
        ::send(client, frame.data(), static_cast<int>(frame.size()), 0);
}

static void uiReply(SOCKET socket, const string& status, const string& type, const string& body) {
    const string head = "HTTP/1.1 " + status + "\r\nContent-Type: " + type +
                        "\r\nContent-Length: " + std::to_string(body.size()) +
                        "\r\nConnection: close\r\n\r\n";
    const string response = head + body;
    ::send(socket, response.data(), static_cast<int>(response.size()), 0);
}

static void uiJson(SOCKET socket, const string& body) {
    uiReply(socket, "200 OK", "application/json", body);
}

// SSE 不能带 Content-Length：响应体靠连接关闭结束，所以头和 body 分开写
// Bun 版要每 5 秒发一行注释保活，是因为它有自己的 idle timeout；这里的 server 不设超时，所以不用
static void uiStream(SOCKET socket) {
    const string head = "HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\n"
                        "Cache-Control: no-cache\r\nConnection: close\r\n\r\n";
    ::send(socket, head.data(), static_cast<int>(head.size()), 0);
}

// 只认浏览器发来的这一种请求：请求行 + 头部 + 可选 JSON body
static bool readRequest(SOCKET socket, string& method, string& path, string& body) {
    string data;
    char buffer[4096];
    size_t head = string::npos;
    while ((head = data.find("\r\n\r\n")) == string::npos) {
        const int n = ::recv(socket, buffer, sizeof buffer, 0);
        if (n <= 0) return false;
        data.append(buffer, n);
    }

    const string headText = data.substr(0, head);
    const string line = headText.substr(0, headText.find("\r\n"));
    const size_t first = line.find(' ');
    const size_t second = line.find(' ', first + 1);
    if (first == string::npos) return false;
    method = line.substr(0, first);
    path = line.substr(first + 1, second == string::npos ? string::npos : second - first - 1);

    string lower = headText;
    std::transform(lower.begin(), lower.end(), lower.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    const size_t at = lower.find("\r\ncontent-length:");
    const size_t length = at == string::npos ? 0 : static_cast<size_t>(std::atoi(lower.c_str() + at + 17));

    body = data.substr(head + 4);
    while (body.size() < length) {
        const int n = ::recv(socket, buffer, sizeof buffer, 0);
        if (n <= 0) break;
        body.append(buffer, n);
    }
    return true;
}

static void handleClient(SOCKET socket) {
    string method, path, body;
    if (!readRequest(socket, method, path, body)) {
        closesocket(socket);
        return;
    }

    if (method == "GET" && path == "/") {
        uiReply(socket, "200 OK", "text/html; charset=utf-8", PAGE);
    } else if (method == "GET" && path == "/events") {
        uiStream(socket);
        {
            std::lock_guard<std::mutex> guard(UI_LOCK);
            CLIENTS.insert(socket);
        }
        char buffer[1024];
        while (::recv(socket, buffer, sizeof buffer, 0) > 0) {}  // 只是为了知道页面什么时候关掉
        {
            std::lock_guard<std::mutex> guard(UI_LOCK);
            CLIENTS.erase(socket);
        }
    } else if (method == "POST" && path == "/run") {
        const json request = json::parse(body, nullptr, false);
        const string task = request.is_object() && request.contains("task") && request["task"].is_string()
                                ? request["task"].get<string>()
                                : "";
        uiJson(socket, task.empty() ? "{\"ok\":false}" : "{\"ok\":true}");
        if (!task.empty()) {
            std::thread([task] {
                if (RUNNING.exchange(true)) {
                    uiSend({{"type", "error"}, {"text", "上一个任务还在跑，先点停止"}});
                    return;
                }
                STOP = false;
                runTask(task);
                RUNNING = false;
                uiSend({{"type", "idle"}});
            }).detach();
        }
    } else if (method == "POST" && path == "/answer") {
        const json request = json::parse(body, nullptr, false);
        {
            std::lock_guard<std::mutex> guard(ASK_LOCK);
            ASK_ALLOW = request.is_object() && request.value("allow", false);
            ASK_ANSWERED = true;
        }
        ASK_CV.notify_all();
        uiJson(socket, "{\"ok\":true}");
    } else if (method == "POST" && path == "/stop") {
        STOP = true;  // 正在跑的 curl 收不到，会在它返回后生效
        ASK_CV.notify_all();
        uiJson(socket, "{\"ok\":true}");
    } else {
        uiReply(socket, "404 Not Found", "text/plain", "");
    }

    closesocket(socket);
}

static void runUi() {
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) throw std::runtime_error("WSAStartup 失败");

    PAGE = readFile(env("UI_HTML", "../ui.html"));
    if (PAGE.empty()) {
        std::cerr << "找不到页面，检查 UI_HTML（默认 ../ui.html）\n";
        return;
    }

    const int port = std::atoi(env("PORT", "3000").c_str());
    LISTEN = ::socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = htonl(INADDR_LOOPBACK);  // 只绑本机：这个端口能执行命令
    address.sin_port = htons(static_cast<u_short>(port));
    if (::bind(LISTEN, reinterpret_cast<sockaddr*>(&address), sizeof address) == SOCKET_ERROR ||
        ::listen(LISTEN, 8) == SOCKET_ERROR) {
        std::cerr << "端口 " << port << " 起不来，换一个（PORT=3001）\n";
        return;
    }

    std::cout << "agent-ui: http://localhost:" << port << "\n" << std::flush;
    for (;;) {
        const SOCKET client = ::accept(LISTEN, nullptr, nullptr);
        if (client == INVALID_SOCKET) continue;
        std::thread(handleClient, client).detach();  // 一个连接一个线程：SSE 会一直占着
    }
}

#else

static void uiSend(const json&) {}

static void runUi() { std::cerr << "--ui 只实现了 Windows（Winsock），命令行模式照常可用\n"; }

#endif

// ---------------------------------------------------------------- 入口

int main(int argc, char** argv) {
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
#endif
    toolTimeoutMs = std::atoi(env("TOOL_TIMEOUT_MS", "10000").c_str());

#ifdef _WIN32
    const vector<string> argvList = args();
#else
    const vector<string> argvList = args(argc, argv);
#endif

    try {
        TOOLS = loadTools(env("TOOLS_DIR", "tools"));
        if (TOOLS.empty()) {
            std::cerr << "tools/ 里没有工具描述，检查 TOOLS_DIR\n";
            return 1;
        }

        initLua();
        for (const auto& tool : TOOLS)
            if (!tool.script.empty()) loadLuaTool(tool.name, tool.script);

        if (argvList.size() > 1 && argvList[1] == "--ui") {
            UI_MODE = true;
            runUi();
            return 0;
        }

        string task;
        for (size_t i = 1; i < argvList.size(); ++i) {
            if (!task.empty()) task += " ";
            task += argvList[i];
        }
        if (task.empty()) {
            std::cerr << "用法: agent \"你的任务\"　或者　agent --ui\n";
            return 1;
        }
        return runTask(task);
    } catch (const std::exception& error) {
        std::cerr << "出错：" << error.what() << "\n";
        return 1;
    }
}
