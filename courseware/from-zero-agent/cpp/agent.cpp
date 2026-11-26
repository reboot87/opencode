// 从零手写 Agent · C++ 版
//
// 分工：
//   C++   管循环、请求、权限、回灌
//   脚本  管工具本身（read_file / write_file / run_shell）
//
// 工具是一个独立进程：参数从 stdin 读 JSON，结果写 stdout。
// 所以工具可以用任何语言写，C++ 一行都不用改。
//
// 编译 (Windows / MSVC):
//   build.bat
// 编译 (Linux / macOS):
//   c++ -std=c++17 -O2 agent.cpp -o agent
//
// 运行:
//   set OPENAI_API_KEY=sk-...
//   agent.exe "读取 package.json，告诉我项目名字"

#include <algorithm>
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
    string command;     // 从 stdin 读参数 JSON 的命令
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
        tool.command = data.at("command");
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
