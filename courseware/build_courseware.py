# -*- coding: utf-8 -*-
"""
生成《从零开始写一个智能体》教学课件（基于 OpenCode 文档）。

运行: python build_courseware.py
输出: opencode-agent-course.pptx
"""

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

# ---------------------------------------------------------------- 基础样式

FONT = "Microsoft YaHei"
MONO = "Consolas"

INK = RGBColor(0x14, 0x18, 0x1F)
DARK = RGBColor(0x0F, 0x13, 0x1A)
DARK_2 = RGBColor(0x1A, 0x20, 0x2A)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
MUTED = RGBColor(0x5D, 0x66, 0x75)
MUTED_DARK = RGBColor(0x8B, 0x95, 0xA5)
LINE = RGBColor(0xE3, 0xE8, 0xEF)
SOFT = RGBColor(0xF5, 0xF7, 0xFA)
ACCENT = RGBColor(0xF2, 0x6B, 0x21)
ACCENT_SOFT = RGBColor(0xFD, 0xF0, 0xE9)
BLUE = RGBColor(0x2F, 0x6F, 0xEB)
CODE_BG = RGBColor(0x11, 0x16, 0x1E)
CODE_TEXT = RGBColor(0xE6, 0xED, 0xF3)
CODE_MUTED = RGBColor(0x8B, 0x98, 0xA9)

SW, SH = 13.333, 7.5
MX = 0.7
BODY_TOP = 1.72
BODY_BOTTOM = 6.82

prs = Presentation()
prs.slide_width = Inches(SW)
prs.slide_height = Inches(SH)
BLANK = prs.slide_layouts[6]

prs.core_properties.title = "从零开始写一个智能体"
prs.core_properties.author = "OpenCode 教学课件"
prs.core_properties.subject = "基于 OpenCode 的 Agent 入门实战"

page = 0


# ---------------------------------------------------------------- 工具函数

def style_run(run, size=17, bold=False, color=INK, mono=False, italic=False):
    f = run.font
    f.size = Pt(size)
    f.bold = bold
    f.italic = italic
    f.name = MONO if mono else FONT
    f.color.rgb = color
    rPr = run._r.get_or_add_rPr()
    for tag in ("a:ea", "a:cs"):
        el = rPr.find(qn(tag))
        if el is None:
            el = etree.SubElement(rPr, qn(tag))
        el.set("typeface", FONT)


def add_p(tf, text="", size=17, bold=False, color=INK, before=0, after=8,
          line=1.3, mono=False, align=PP_ALIGN.LEFT, bullet=False,
          bullet_color=ACCENT, indent=0.30, italic=False):
    first = len(tf.paragraphs) == 1 and tf.paragraphs[0].text == "" and not tf.paragraphs[0].runs
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment = align
    p.space_before = Pt(before)
    p.space_after = Pt(after)
    p.line_spacing = line
    if text:
        for i, part in enumerate(text.split("\n")):
            if i:
                p.add_line_break()
            if part:
                r = p.add_run()
                r.text = part
                style_run(r, size, bold, color, mono, italic)
    if bullet:
        pPr = p._p.get_or_add_pPr()
        pPr.set("marL", str(int(Inches(indent))))
        pPr.set("indent", str(int(Inches(-indent))))
        buClr = etree.SubElement(pPr, qn("a:buClr"))
        srgb = etree.SubElement(buClr, qn("a:srgbClr"))
        srgb.set("val", str(bullet_color))
        buFont = etree.SubElement(pPr, qn("a:buFont"))
        buFont.set("typeface", "Arial")
        buChar = etree.SubElement(pPr, qn("a:buChar"))
        buChar.set("char", "•")
    return p


def textbox(slide, x, y, w, h, anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    return tf


def rect(slide, x, y, w, h, fill, line_color=None, radius=None, shape=MSO_SHAPE.RECTANGLE):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if radius is not None and shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        s.adjustments[0] = radius
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    if line_color is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line_color
        s.line.width = Pt(1)
    s.shadow.inherit = False
    return s


def bg(slide, color):
    rect(slide, 0, 0, SW, SH, color)


def footer(slide):
    global page
    page += 1
    rect(slide, MX, 6.98, SW - MX * 2, 0.012, LINE)
    tf = textbox(slide, MX, 7.06, 8.0, 0.3)
    add_p(tf, "OpenCode · 从零开始写一个智能体", size=9, color=MUTED, after=0)
    tf = textbox(slide, SW - MX - 1.2, 7.06, 1.2, 0.3)
    add_p(tf, f"{page:02d}", size=9, color=MUTED, align=PP_ALIGN.RIGHT, after=0)


def slide_body(title, kicker=None):
    s = prs.slides.add_slide(BLANK)
    bg(s, WHITE)
    rect(s, 0.42, 0.44, 0.09, 1.0, ACCENT)
    if kicker:
        tf = textbox(s, MX, 0.30, 11.5, 0.3)
        add_p(tf, kicker, size=11, bold=True, color=ACCENT, after=0)
    tf = textbox(s, MX, 0.55 if kicker else 0.62, SW - MX * 2, 0.85)
    add_p(tf, title, size=27, bold=True, color=INK, line=1.05, after=0)
    footer(s)
    return s


def bullets(slide, items, x=MX, y=BODY_TOP, w=11.9, size=17, gap=10, line=1.35):
    tf = textbox(slide, x, y, w, BODY_BOTTOM - y)
    for item in items:
        add_p(tf, item, size=size, bullet=True, after=gap, line=line)
    return tf


def code_panel(slide, x, y, w, h, filename, code, size=12, line=1.26):
    rect(slide, x, y, w, h, CODE_BG, radius=0.035, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(slide, x + 0.28, y + 0.24, w - 0.52, h - 0.45)
    if filename:
        add_p(tf, filename, size=10.5, bold=True, color=ACCENT, mono=True, after=10, line=1.0)
    for ln in code.split("\n"):
        color = CODE_MUTED if ln.strip().startswith(("#", "//")) else CODE_TEXT
        add_p(tf, ln if ln else " ", size=size, color=color, mono=True,
              after=0, line=line, before=0)


def card(slide, x, y, w, h, title, body, accent=ACCENT, title_size=18, body_size=14):
    rect(slide, x, y, w, h, SOFT, line_color=LINE, radius=0.06,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    rect(slide, x, y + 0.22, 0.05, h - 0.44, accent)
    tf = textbox(slide, x + 0.28, y + 0.24, w - 0.5, h - 0.42)
    add_p(tf, title, size=title_size, bold=True, color=INK, after=6, line=1.1)
    add_p(tf, body, size=body_size, color=MUTED, line=1.4, after=0)


def table(slide, x, y, w, headers, rows, widths, row_h=0.46, head_h=0.48,
          size=14, head_size=13):
    shape = slide.shapes.add_table(len(rows) + 1, len(headers), Inches(x), Inches(y),
                                   Inches(w), Inches(head_h + row_h * len(rows)))
    tbl = shape.table
    tbl.first_row = False
    tbl.horz_banding = False
    for i, cw in enumerate(widths):
        tbl.columns[i].width = Inches(cw)
    tbl.rows[0].height = Inches(head_h)
    for i in range(1, len(rows) + 1):
        tbl.rows[i].height = Inches(row_h)

    def fill_cell(cell, text, bold, color, size_, bg_color):
        cell.fill.solid()
        cell.fill.fore_color.rgb = bg_color
        cell.margin_left = Inches(0.16)
        cell.margin_right = Inches(0.12)
        cell.margin_top = Inches(0.05)
        cell.margin_bottom = Inches(0.05)
        tf = cell.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        add_p(tf, text, size=size_, bold=bold, color=color, after=0, line=1.15)

    for c, htext in enumerate(headers):
        fill_cell(tbl.cell(0, c), htext, True, WHITE, head_size, INK)
    for r, row in enumerate(rows, start=1):
        fill = WHITE if r % 2 else SOFT
        for c, text in enumerate(row):
            fill_cell(tbl.cell(r, c), text, c == 0, INK if c == 0 else MUTED, size, fill)
    return tbl


def note(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def section(number, title, subtitle, notes):
    s = prs.slides.add_slide(BLANK)
    bg(s, DARK)
    tf = textbox(s, 0.9, 1.55, 4.0, 1.6)
    add_p(tf, number, size=96, bold=True, color=RGBColor(0x26, 0x2D, 0x3A), after=0, line=1.0)
    rect(s, 0.94, 3.12, 1.15, 0.06, ACCENT)
    tf = textbox(s, 0.9, 3.35, 11.2, 0.8)
    add_p(tf, title, size=38, bold=True, color=WHITE, after=0, line=1.1)
    tf = textbox(s, 0.94, 4.35, 10.8, 0.6)
    add_p(tf, subtitle, size=15, color=MUTED_DARK, after=0)
    note(s, notes)
    return s


# ---------------------------------------------------------------- 01 封面

s = prs.slides.add_slide(BLANK)
bg(s, DARK)
rect(s, 0.9, 0.95, 0.06, 0.28, ACCENT)
tf = textbox(s, 1.12, 0.93, 8.0, 0.32)
add_p(tf, "OPENCODE  ·  实战课", size=12, bold=True, color=ACCENT, after=0)

tf = textbox(s, 0.86, 1.5, 11.9, 1.1)
add_p(tf, "从零开始写一个智能体", size=52, bold=True, color=WHITE, after=0, line=1.0)

tf = textbox(s, 0.9, 2.62, 11.4, 0.55)
add_p(tf, "一门给完全小白的 Agent 入门课", size=23, color=RGBColor(0xC7, 0xCE, 0xDA), after=0)

tf = textbox(s, 0.9, 3.35, 9.6, 0.9)
add_p(tf, "不用先学编程。一个 Markdown 文件，加上几个配置字段，\n就是一个能读文件、能干活、有权限边界的智能体。",
      size=15, color=MUTED_DARK, after=0, line=1.55)

rect(s, 0.92, 4.55, 3.3, 0.055, ACCENT)

pills = [("31 页 · 约 90 分钟", 2.95), ("全部示例可复制", 2.05), ("基于 OpenCode 真实文档", 3.05)]
x = 0.9
for p, pw in pills:
    t = textbox(s, x + 0.26, 5.055, pw - 0.4, 0.3)
    add_p(t, p, size=11.5, color=RGBColor(0xC7, 0xCE, 0xDA), after=0)
    rect(s, x, 4.92, pw, 0.5, DARK, line_color=RGBColor(0x30, 0x38, 0x46), radius=0.5,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    x += pw + 0.22

tf = textbox(s, 0.9, 6.35, 11.6, 0.35)
add_p(tf, "目标  →  计划  →  动手  →  观察  →  再来一轮", size=12, color=RGBColor(0x5F, 0x6B, 0x7C),
      mono=True, after=0)
note(s, "开场先破题：今天不讲模型原理，也不写代码。我们只做一件事——把一个「会自己干活」的助手配置出来。"
        "先让学员放心：跟着做，90 分钟后每个人都能有一个能用的智能体。")

# ---------------------------------------------------------------- 02 学完你会什么

s = slide_body("学完这门课，你会有三样东西", "课程目标")
card(s, MX, 1.78, 3.75, 2.5, "①  看懂", "知道智能体由哪几部分组成，\n听到「提示词」「工具」「权限」不再发懵。")
card(s, 4.79, 1.78, 3.75, 2.5, "②  写出来", "独立写出一个能用的 agent：\n有人设、有工具、有边界、有固定输出。", accent=BLUE)
card(s, 8.58, 1.78, 3.75, 2.5, "③  用起来", "把它封装成命令和技能，\n在真实项目里反复使用、分享给同事。", accent=RGBColor(0x1F, 0x9D, 0x6B))

tf = textbox(s, MX, 4.75, 11.9, 1.2)
add_p(tf, "整门课只用到两种东西", size=15, bold=True, color=INK, after=6)
add_p(tf, "Markdown 文件（写人设和流程） + 一份 JSON/JSONC 配置（写模型和权限）。不用写代码。",
      size=17, color=MUTED, after=0, line=1.4)

box = rect(s, MX, 5.95, 11.9, 0.72, ACCENT_SOFT, line_color=None, radius=0.12,
           shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 1.0, 6.13, 11.4, 0.4)
add_p(tf, "先跑通，再优化。第一版能干活，比「设计完美」重要得多。", size=15, bold=True, color=ACCENT, after=0)
note(s, "强调产出：不是听完就完了，而是带走一个能跑的 agent。"
        "顺便降低预期：不需要学 Python、不需要调 API，配置本身就是编程。")

# ---------------------------------------------------------------- 03 名词表

s = slide_body("先对齐 6 个词，后面就不绕了", "开课前")
table(s, MX, 1.76, 11.9,
      ["名词", "一句话解释"],
      [
          ["Agent（智能体）", "配置好的 AI 助手：固定人设 + 可用工具 + 行为边界"],
          ["Prompt（提示词）", "你写给模型的任务说明，说清要什么、不要什么"],
          ["System prompt（系统提示词）", "agent 的岗位说明书，每次对话都随请求带上"],
          ["Tool（工具）", "agent 能做的动作，比如读文件、改文件、跑命令"],
          ["Permission（权限）", "每个动作的放行规则：允许 / 询问 / 禁止"],
          ["Context（上下文）", "模型这一次能看到的全部内容，越多越慢越贵"],
      ],
      widths=[3.4, 8.5], row_h=0.66, head_h=0.46, size=14.5)
tf = textbox(s, MX, 6.42, 11.9, 0.35)
add_p(tf, "记住一个比喻：模型是大脑，提示词是岗位说明书，工具是手脚，权限是门禁卡。",
      size=13, color=MUTED, italic=True, after=0)
note(s, "这一页不要展开讲技术细节，只建立直觉。可以现场提问：谁能用自己的话说说「工具」是什么？"
        "比喻要重复用，后面每一页都能挂回这四个词。")

# ---------------------------------------------------------------- 04 目录

s = slide_body("课程地图：四个模块，一条主线", "目录")
mods = [
    ("01", "认识智能体", "它是什么、由什么组成、为什么用 OpenCode", "3 节"),
    ("02", "写下第一个 Agent", "安装、文件位置、最小示例、提示词、模型", "7 节"),
    ("03", "给它手和边界", "工具、权限、子智能体、命令、技能", "6 节"),
    ("04", "做成产品", "完整案例、进阶扩展、调试、安全、上线", "6 节"),
]
for i, (num, title, desc, count) in enumerate(mods):
    x = MX + (i % 2) * 6.0
    y = 1.8 + (i // 2) * 2.35
    rect(s, x, y, 5.7, 2.05, SOFT, line_color=LINE, radius=0.06, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, x + 0.3, y + 0.28, 1.4, 0.7)
    add_p(tf, num, size=34, bold=True, color=ACCENT, after=0, line=1.0)
    tf = textbox(s, x + 1.35, y + 0.3, 4.1, 0.45)
    add_p(tf, title, size=19, bold=True, color=INK, after=0)
    tf = textbox(s, x + 1.35, y + 0.8, 4.05, 0.8)
    add_p(tf, desc, size=12.5, color=MUTED, after=0, line=1.4)
    tf = textbox(s, x + 4.65, y + 0.32, 0.8, 0.3)
    add_p(tf, count, size=10.5, color=MUTED, align=PP_ALIGN.RIGHT, after=0)

tf = textbox(s, MX, 6.55, 11.9, 0.3)
add_p(tf, "每节都有可复制的文件内容；跟着敲一遍，比只看一遍强十倍。", size=12, color=MUTED, after=0)
note(s, "先给全貌再进细节。告诉学员：模块二结束就具备「写 agent」的能力，模块三、四是让它更安全、更耐用。")

# ---------------------------------------------------------------- 05 章节一

section("01", "认识智能体", "先把概念说清楚：它和聊天机器人到底差在哪", 
        "进入第一部分。这一部分不碰电脑，只建立概念，大约 10 分钟。")

# ---------------------------------------------------------------- 06 智能体 vs 聊天

s = slide_body("智能体 = 会自己干活的 AI", "01 · 概念")
table(s, MX, 1.76, 11.9,
      ["", "聊天机器人", "智能体"],
      [
          ["你给什么", "一个问题", "一个目标"],
          ["它怎么做", "直接生成一段回答", "自己拆步骤、调用工具、看结果"],
          ["交付什么", "文字", "改好的文件、跑完的任务、查到的资料"],
          ["出错时", "换个问法再问", "读错误、改方案、再试一次"],
      ],
      widths=[2.2, 4.55, 5.15], row_h=0.56, head_h=0.5, size=14.5)

tf = textbox(s, MX, 4.58, 11.9, 0.35)
add_p(tf, "智能体的工作循环", size=14, bold=True, color=INK, after=0)
steps = ["目标", "计划", "动手", "观察", "再来一轮"]
x = MX
for i, st in enumerate(steps):
    w = 1.55
    rect(s, x, 5.05, w, 0.62, SOFT if i < 4 else ACCENT_SOFT, line_color=LINE, radius=0.4,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, x, 5.19, w, 0.32)
    add_p(tf, st, size=13, bold=True, color=INK if i < 4 else ACCENT, align=PP_ALIGN.CENTER, after=0)
    x += w
    if i < 4:
        tf = textbox(s, x, 5.16, 0.55, 0.35)
        add_p(tf, "→", size=15, bold=True, color=MUTED, align=PP_ALIGN.CENTER, after=0)
        x += 0.55

tf = textbox(s, MX, 6.0, 11.9, 0.55)
add_p(tf, "关键差别：它会「动手」，而且做完会看结果决定下一步。所以工具和权限才是重点。",
      size=14, color=MUTED, after=0)
note(s, "用「让实习生帮你改一份文档」类比：你说目标，他自己打开文件、改、保存、告诉你改了什么。"
        "现场演示一次「找文件→读→改→跑测试」，比讲十句定义有效。")

# ---------------------------------------------------------------- 07 三件套

s = slide_body("一个 agent 的三件套", "01 · 组成")
card(s, MX, 1.8, 3.75, 3.2, "人设\nSystem Prompt", "它知道自己是谁、\n要交付什么、\n哪些事不能做。\n\n决定「像不像专家」。")
card(s, 4.79, 1.8, 3.75, 3.2, "工具\nTools", "读文件、搜代码、\n改文件、跑命令、\n上网查资料。\n\n决定「能不能干活」。", accent=BLUE)
card(s, 8.58, 1.8, 3.75, 3.2, "权限\nPermissions", "每个动作允许、\n询问还是禁止。\n\n决定「出了事谁兜底」。", accent=RGBColor(0x1F, 0x9D, 0x6B))

tf = textbox(s, MX, 5.35, 11.9, 1.2)
add_p(tf, "一句话记住", size=13, bold=True, color=ACCENT, after=5)
add_p(tf, "模型是大脑，提示词是岗位说明书，工具是手脚，权限是门禁卡。四样配齐，才是一个能放心用的智能体。",
      size=17, color=INK, after=0, line=1.4)
note(s, "三张卡按顺序讲：先有人设，再给工具，最后收紧权限。"
        "提醒：很多人只写提示词，不给工具也不设权限，那只是一个「聊天机器人皮肤」。")

# ---------------------------------------------------------------- 08 为什么 OpenCode

s = slide_body("为什么用 OpenCode 来学写 agent", "01 · 选型")
bullets(s, [
    "agent 就是一个 Markdown 文件，写在项目里，跟着 Git 走",
    "读文件、改文件、跑命令、搜网页、开子智能体，工具都是内置的",
    "权限可以精确到命令：git status 放行，git push 直接禁止",
    "技能（Skill）、命令（Command）都能复用，团队共享同一套配置",
    "开源，规则看得见、改得动，不依赖某个黑盒平台",
], y=1.78, w=7.2, size=16.5, gap=13)

rect(s, 8.3, 1.8, 4.3, 3.5, DARK, radius=0.05, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 8.6, 2.05, 3.7, 3.0)
add_p(tf, "它已经在做这些事", size=11.5, bold=True, color=ACCENT, after=12)
for t in ["读懂整个仓库", "改代码并跑测试", "按你的规范提交", "把重复流程写成技能"]:
    add_p(tf, t, size=14, color=CODE_TEXT, bullet=True, bullet_color=ACCENT, after=9, line=1.3)

tf = textbox(s, 8.3, 5.55, 4.3, 0.8)
add_p(tf, "我们要学的，就是它背后那份「配置」怎么写。", size=12.5, color=MUTED, after=0, line=1.4)
note(s, "如果学员用过 Cursor / Copilot，可以对比：那些是「一个通用助手」，OpenCode 可以按角色拆成多个专家。"
        "强调可迁移：学的是 agent 的结构，换平台也成立。")

# ---------------------------------------------------------------- 09 章节二

section("02", "写下第一个 Agent", "从安装到跑通，只需要一个 Markdown 文件",
        "进入实操部分。从这里开始，建议学员跟着一起敲，卡住就举手。")

# ---------------------------------------------------------------- 10 安装

s = slide_body("准备：三步进入工作状态", "02 · 安装")

rows = [
    ("1", "安装 OpenCode", "macOS / Linux 一条命令；Windows 下载 standalone 压缩包，解压后加入 PATH。",
     "curl -fsSL https://opencode.ai/v2/install | bash"),
    ("2", "连接模型账号", "在终端登录 provider，也可以进 TUI 后用 /connect 按提示选择。",
     "opencode auth login"),
    ("3", "在项目目录启动", "agent 会读取当前项目里的 .opencode 配置，所以一定要在项目根目录启动。",
     "cd my-project && opencode"),
]
for i, (n, title, desc, cmd) in enumerate(rows):
    y = 1.78 + i * 1.62
    rect(s, MX, y, 11.9, 1.42, SOFT, line_color=LINE, radius=0.06,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    rect(s, MX + 0.28, y + 0.38, 0.62, 0.62, ACCENT, radius=0.5, shape=MSO_SHAPE.OVAL)
    tf = textbox(s, MX + 0.28, y + 0.49, 0.62, 0.4)
    add_p(tf, n, size=17, bold=True, color=WHITE, align=PP_ALIGN.CENTER, after=0)
    tf = textbox(s, MX + 1.12, y + 0.22, 5.6, 0.4)
    add_p(tf, title, size=17, bold=True, color=INK, after=0)
    tf = textbox(s, MX + 1.12, y + 0.66, 6.1, 0.6)
    add_p(tf, desc, size=12, color=MUTED, after=0, line=1.35)
    rect(s, MX + 6.9, y + 0.30, 4.95, 0.82, CODE_BG, radius=0.08, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, MX + 7.12, y + 0.46, 4.6, 0.55)
    add_p(tf, cmd, size=9.5, color=CODE_TEXT, mono=True, after=0, line=1.2)

tf = textbox(s, MX, 6.55, 11.9, 0.3)
add_p(tf, "Windows 暂不支持用包管理器安装，直接下载 x64 / ARM64 压缩包即可。",
      size=11, color=MUTED, after=0)
note(s, "现场最好提前装好一台演示机。提醒 Windows 用户走压缩包，不要卡在 npm 上。"
        "登录模型时强调：没有订阅也可以用兼容 provider 或本地模型。")

# ---------------------------------------------------------------- 11 放哪

s = slide_body("agent 文件放在哪，叫什么名字", "02 · 文件位置")
code_panel(s, MX, 1.8, 6.4, 3.55, "项目结构", """my-project/
├── .opencode/
│   ├── agents/
│   │   └── reviewer.md
│   ├── commands/
│   └── skills/
└── src/""")

tf = textbox(s, 7.5, 1.78, 5.1, 4.5)
add_p(tf, "两个位置，按作用范围选", size=14, bold=True, color=INK, after=10)
add_p(tf, "项目级  .opencode/agents/<名字>.md", size=13, color=INK, mono=True, after=3)
add_p(tf, "跟着项目走，提交到 Git，团队共用。", size=12.5, color=MUTED, after=14)
add_p(tf, "全局级  ~/.config/opencode/agents/<名字>.md", size=13, color=INK, mono=True, after=3)
add_p(tf, "所有项目都能用，适合个人习惯。", size=12.5, color=MUTED, after=16)
add_p(tf, "文件名 = agent 的 ID", size=14, bold=True, color=ACCENT, after=4)
add_p(tf, "reviewer.md → 叫 reviewer；嵌套目录会变成 team/reviewer。", size=12.5, color=MUTED, after=0, line=1.4)

tf = textbox(s, MX, 5.62, 11.9, 0.9)
add_p(tf, "命名建议：小写、用连字符，见名知意。reviewer、weekly-report、docs-writer。",
      size=13, color=MUTED, after=0, line=1.4)
note(s, "让学员现在就在自己的项目里建出 .opencode/agents 目录。"
        "强调 ID 由文件名决定，后面调用、写权限都用这个 ID。")

# ---------------------------------------------------------------- 12 最小 agent

s = slide_body("最小可用 agent：一个文件，六行", "02 · 第一个 agent")
code_panel(s, 1.15, 1.76, 11.0, 3.9, ".opencode/agents/explainer.md", """---
description: 用中文解释代码，不修改文件
mode: subagent
---
你是一个耐心的代码讲解员。
先讲整体流程，再讲关键函数，最后指出容易踩的坑。""", size=13, line=1.3)

rect(s, 1.15, 5.9, 11.0, 0.75, ACCENT_SOFT, radius=0.12, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 1.45, 6.06, 10.4, 0.45)
add_p(tf, "上面是配置（frontmatter），下面是它的人设。保存即生效，新开一个会话就能用。",
      size=13, bold=True, color=ACCENT, after=0)
note(s, "带学员逐行读：两条横线之间是配置，三横线之后是系统提示词。"
        "说明 mode: subagent 表示它不直接面对用户，而是被主智能体派活。保存后不需要编译。")

# ---------------------------------------------------------------- 13 字段

s = slide_body("最常用的四个字段，够用很久", "02 · 配置")
table(s, MX, 1.76, 11.9,
      ["字段", "作用", "例子"],
      [
          ["description", "一句话说明用途；子智能体靠它被选中", "审查改动，找回归问题"],
          ["mode", "primary 主助手 / subagent 子智能体 / all 两者都行", "subagent"],
          ["model", "用哪个模型，可加 #variant 选推理强度", "anthropic/claude-sonnet-5-5#high"],
          ["steps", "一次任务最多跑几步，防止无限循环", "8"],
      ],
      widths=[2.3, 6.0, 3.6], row_h=0.72, head_h=0.5, size=14)

tf = textbox(s, MX, 5.35, 11.9, 1.5)
add_p(tf, "三个容易踩的坑", size=14, bold=True, color=INK, after=7)
add_p(tf, "新 agent 不写 mode 默认是 primary，会直接出现在主界面的 agent 列表里；", size=13.5, color=MUTED, bullet=True, after=5)
add_p(tf, "description 不是写给人看的装饰，是写给「派活的模型」看的，写清场景；", size=13.5, color=MUTED, bullet=True, after=5)
add_p(tf, "model 不写就继承当前会话的模型，不确定时留空最稳。", size=13.5, color=MUTED, bullet=True, after=0)
note(s, "重点讲 description 和 mode。可以现场把 description 改成「帮助处理代码」，"
        "再让主智能体选人，观察它选不中——用失败案例说明描述的重要性。")

# ---------------------------------------------------------------- 14 提示词

s = slide_body("提示词五段式：照着填空就不会差", "02 · 提示词")
tf = textbox(s, MX, 1.78, 6.2, 4.7)
add_p(tf, "① 角色", size=15, bold=True, color=ACCENT, after=2)
add_p(tf, "你是谁，用什么语气和标准工作。", size=13, color=MUTED, after=12)
add_p(tf, "② 目标", size=15, bold=True, color=ACCENT, after=2)
add_p(tf, "这次要交付什么，越具体越好。", size=13, color=MUTED, after=12)
add_p(tf, "③ 步骤", size=15, bold=True, color=ACCENT, after=2)
add_p(tf, "先做什么、再做什么，把顺序写死。", size=13, color=MUTED, after=12)
add_p(tf, "④ 输出格式", size=15, bold=True, color=ACCENT, after=2)
add_p(tf, "用表格还是清单，标题怎么写，给一个样板。", size=13, color=MUTED, after=12)
add_p(tf, "⑤ 边界", size=15, bold=True, color=ACCENT, after=2)
add_p(tf, "哪些不能做；拿不准时先问，不要猜。", size=13, color=MUTED, after=0)

code_panel(s, 7.15, 1.78, 5.45, 4.75, "提示词示例", """你是发布助手。

目标：根据 git 记录生成发布说明。

步骤：
1. 读上一个 tag 之后的提交
2. 汇总合并的 PR，按类型分组
3. 先给我大纲，确认后再写

输出：Markdown，三级标题 + 列表
边界：不改代码；版本号先问我""", size=11, line=1.26)

tf = textbox(s, MX, 6.42, 11.9, 0.35)
add_p(tf, "提示词不是越玄越好：具体、可检查、有边界，就是好提示词。", size=12.5, color=MUTED, italic=True, after=0)
note(s, "带学员一起把左边五段套进右边模板。强调「先给大纲再动手」这种步骤，能省掉大量返工。"
        "如果时间紧，只讲②③④，这三段最能提升效果。")

# ---------------------------------------------------------------- 15 模型

s = slide_body("模型怎么选：先跑通，再调优", "02 · 模型")
bullets(s, [
    "写法是 provider/model，例如 anthropic/claude-sonnet-5-5",
    "后面可以加 #variant 选推理强度，重活给 high，轻活给 low",
    "不确定就用默认：不写 model，直接继承当前会话",
    "重活（写代码、长任务）用强模型；轻活（分类、摘要）用快模型省钱",
    "一个 agent 固定一个模型，出问题好定位、好对比",
], y=1.78, w=7.4, size=16, gap=13)

code_panel(s, 8.45, 1.8, 4.15, 1.35, "agent 里", "model: anthropic/claude-sonnet-5-5#high", size=10, line=1.3)

rect(s, 8.45, 3.95, 4.15, 2.2, ACCENT_SOFT, radius=0.08, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 8.72, 4.2, 3.65, 1.8)
add_p(tf, "给小白的一句话", size=12, bold=True, color=ACCENT, after=8)
add_p(tf, "先用你现在能用的模型把流程跑通。等 agent 的行为稳定了，再换更强的模型提升质量。",
      size=12.5, color=INK, after=0, line=1.45)

tf = textbox(s, MX, 5.75, 7.4, 0.8)
add_p(tf, "提示：模型名写错不会报「配置错误」，而是直接调用失败。改完先发一句「你好」验证。",
      size=12, color=MUTED, after=0, line=1.4)
note(s, "不要陷入选型焦虑。课程里统一用讲师演示机上的模型，学员跟着用同一个即可。"
        "提醒改完模型先做一次最小验证。")

# ---------------------------------------------------------------- 16 检查点

s = slide_body("检查点：你的第一个 agent 应该能跑了", "02 · 验收")
items = [
    ("1", "建文件", ".opencode/agents/explainer.md，把上一页内容粘进去"),
    ("2", "新开会话", "重启 TUI 或开新会话，配置会被重新读取"),
    ("3", "派活", "对主智能体说：用 explainer 解释 src/index.ts"),
    ("4", "观察", "看它调了哪些工具、输出结构对不对、有没有越权"),
    ("5", "迭代", "不满意就改提示词，不要改代码，也不要加更多工具"),
]
for i, (n, title, desc) in enumerate(items):
    y = 1.78 + i * 0.98
    rect(s, MX, y, 0.42, 0.42, ACCENT if i == 4 else INK, radius=0.5, shape=MSO_SHAPE.OVAL)
    tf = textbox(s, MX, y + 0.07, 0.42, 0.3)
    add_p(tf, n, size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER, after=0)
    tf = textbox(s, MX + 0.68, y - 0.02, 2.3, 0.45)
    add_p(tf, title, size=15.5, bold=True, color=INK, after=0)
    tf = textbox(s, MX + 2.9, y, 8.9, 0.5)
    add_p(tf, desc, size=13.5, color=MUTED, after=0)

rect(s, MX, 6.32, 11.9, 0.001, LINE)
tf = textbox(s, MX, 6.4, 11.9, 0.35)
add_p(tf, "跑到第 4 步成功，你已经会写 agent 了。剩下的是让它更强、更安全。", size=13, bold=True, color=ACCENT, after=0)
note(s, "这是全课最重要的检查点，一定要留时间让学员自己跑。"
        "常见失败：路径不在项目根、文件没保存、ID 拼错。逐个帮他们排查。")

# ---------------------------------------------------------------- 17 章节三

section("03", "给它手和边界", "工具决定能干什么，权限决定不能干什么",
        "第三部分是分水岭。从这里开始，agent 从「会说」变成「会做」，也开始有风险。")

# ---------------------------------------------------------------- 18 工具

s = slide_body("工具：agent 的手脚，已经内置好了", "03 · 工具")
table(s, MX, 1.7, 11.9,
      ["工具", "能做什么"],
      [
          ["read", "读文件，也能看图片和 PDF"],
          ["glob / grep", "按文件名找 / 按内容搜，找代码全靠它"],
          ["edit / write / patch", "精确替换 / 整份重写 / 一次改多个文件"],
          ["shell", "执行命令，跑测试、构建、git 操作"],
          ["webfetch / websearch", "抓取指定网页 / 联网搜索最新资料"],
          ["subagent", "派一个子智能体去干独立的活"],
          ["skill", "按需加载一份技能手册"],
      ],
      widths=[3.5, 8.4], row_h=0.55, head_h=0.46, size=14)

tf = textbox(s, MX, 6.12, 11.9, 0.6)
add_p(tf, "你不需要点名工具：说清目标，模型自己选。需要固定做法时，才明确说「用 grep 找」。",
      size=13, color=MUTED, after=0, line=1.4)
note(s, "快速过一遍表，不要逐个演示。重点说 glob/grep 和 shell：找代码、跑验证是 agent 最常用的两件事。"
        "顺便解释：工具不是越多越好，每多一个就多一份权限风险。")

# ---------------------------------------------------------------- 19 权限

s = slide_body("权限：先收紧，再按需放开", "03 · 权限")
code_panel(s, 0.55, 1.76, 7.85, 4.45, ".opencode/opencode.jsonc", """{
  "permissions": [
    { "action": "shell", "resource": "*",
      "effect": "ask" },
    { "action": "shell", "resource": "git status *",
      "effect": "allow" },
    { "action": "shell", "resource": "git push *",
      "effect": "deny" }
  ]
}""", size=11.5, line=1.3)

tf = textbox(s, 8.72, 1.78, 3.9, 4.6)
add_p(tf, "三个字段", size=13, bold=True, color=INK, after=4)
add_p(tf, "action  动作：shell / edit / read …", size=11.5, mono=True, color=MUTED, after=3)
add_p(tf, "resource  作用对象：命令、路径、ID", size=11.5, mono=True, color=MUTED, after=3)
add_p(tf, "effect  允许 allow / 询问 ask / 禁止 deny", size=11.5, mono=True, color=MUTED, after=14)
add_p(tf, "两条铁律", size=13, bold=True, color=ACCENT, after=4)
add_p(tf, "① 最后一条命中的规则生效：宽规则在前，例外在后。", size=12, color=INK, after=8, line=1.35)
add_p(tf, "② 没有规则命中时默认 ask，所以宁可少写 allow。", size=12, color=INK, after=0, line=1.35)

tf = textbox(s, 0.55, 6.35, 12.2, 0.35)
add_p(tf, "只读 agent 的写法：edit 和 shell 全部 deny，它就只能看、只能说。", size=12.5, color=MUTED, after=0)
note(s, "这页要讲慢一点。用「门禁卡」比喻：allow 是刷卡直接进，ask 是要你按确认，deny 是门焊死。"
        "强调规则顺序，现场把两条规则调换，演示为什么 push 又被放行了。")

# ---------------------------------------------------------------- 20 审查员

s = slide_body("实战：一个只读的代码审查员", "03 · 实战")
code_panel(s, MX, 1.76, 7.5, 4.5, ".opencode/agents/reviewer.md", """---
description: 审查改动，找正确性和回归问题
mode: subagent
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
---
审查当前改动。按严重程度排序，
给出文件与行号，不要修改文件。""", size=11.5, line=1.29)

tf = textbox(s, 8.5, 1.78, 4.1, 4.6)
add_p(tf, "为什么这样写", size=14, bold=True, color=INK, after=10)
add_p(tf, "· 两个 deny 把「改」和「跑」都关掉，只剩读。", size=12.5, color=MUTED, after=8, line=1.4)
add_p(tf, "· 它的输出明确要求排序 + 行号，结果直接能用。", size=12.5, color=MUTED, after=8, line=1.4)
add_p(tf, "· 子智能体有独立上下文，审查不污染主线对话。", size=12.5, color=MUTED, after=8, line=1.4)
add_p(tf, "· 主智能体只能按 ID 派活，不能绕过它的权限。", size=12.5, color=MUTED, after=18, line=1.4)
add_p(tf, "调用", size=12, bold=True, color=ACCENT, after=4)
add_p(tf, "让 reviewer 审查我当前的改动。", size=12.5, color=INK, after=0, line=1.4)
note(s, "让学员照抄一遍，然后在自己的项目里跑。这是第一个「真正有用」的 agent。"
        "强调：权限写在 agent 里，比写在全局配置更安全，因为它只影响这个角色。")

# ---------------------------------------------------------------- 21 主 vs 子

s = slide_body("primary 还是 subagent：一句话分清", "03 · 角色")
card(s, MX, 1.78, 5.8, 2.45, "primary  主助手", "你直接对话的那一个。负责统筹全局、\n改文件、跑任务。一个会话一个。")
card(s, 6.75, 1.78, 5.8, 2.45, "subagent  子智能体", "被主智能体派活的专家。独立上下文、\n独立权限，干完只交回一份报告。", accent=BLUE)

tf = textbox(s, MX, 4.42, 11.9, 0.4)
add_p(tf, "拆角色的判断标准", size=13, bold=True, color=INK, after=0)
for i, (t, d) in enumerate([
    ("任务独立", "不需要来回追问，给清输入就能干"),
    ("职责单一", "只做审查 / 只做翻译 / 只查资料"),
    ("权限更小", "它只需要读，就不给它写"),
    ("会污染主线", "大量搜索结果，不该塞进主对话"),
]):
    x = MX + i * 3.0
    tf = textbox(s, x, 4.85, 2.75, 0.35)
    add_p(tf, t, size=12.5, bold=True, color=ACCENT, after=0)
    tf = textbox(s, x, 5.2, 2.75, 0.7)
    add_p(tf, d, size=11, color=MUTED, after=0, line=1.35)

code_panel(s, MX, 5.98, 11.9, 0.85, None,
           'permissions: { action: "subagent", resource: "reviewer", effect: "allow" }',
           size=10.5, line=1.2)
note(s, "判断标准给四条，学员对照自己的场景套。"
        "补充：默认子智能体只能再嵌套一层，别设计太深的调用链。")

# ---------------------------------------------------------------- 22 命令

s = slide_body("命令：把常用提示词变成 / 命令", "03 · 命令")
code_panel(s, MX, 1.78, 7.2, 3.35, ".opencode/commands/review.md", """---
description: 审查代码
agent: reviewer
---
审查 $ARGUMENTS 的正确性，
并指出缺失的测试。""", size=12, line=1.3)

rect(s, MX, 5.35, 7.2, 0.72, ACCENT_SOFT, radius=0.12, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, MX + 0.28, 5.51, 6.6, 0.4)
add_p(tf, "/review src/auth.ts", size=15, bold=True, color=ACCENT, mono=True, after=0)

tf = textbox(s, 8.2, 1.8, 4.4, 4.3)
add_p(tf, "三个要点", size=14, bold=True, color=INK, after=10)
add_p(tf, "$ARGUMENTS 是整串参数，$1 $2 是分位置参数。", size=12.5, color=MUTED, after=10, line=1.4)
add_p(tf, "agent 字段可以指定由哪个 agent 执行，比如 reviewer。", size=12.5, color=MUTED, after=10, line=1.4)
add_p(tf, "命令就是「预填好的提示词」，适合每天重复的动作。", size=12.5, color=MUTED, after=16, line=1.4)
add_p(tf, "适合做成命令", size=12, bold=True, color=ACCENT, after=4)
add_p(tf, "审查、写测试、生成周报、解释报错。", size=12.5, color=INK, after=0, line=1.4)
note(s, "命令是性价比最高的一层封装：一个文件、三行配置。"
        "让学员把自己每天重复的一句话写成命令。")

# ---------------------------------------------------------------- 23 技能

s = slide_body("技能：可复用的操作手册", "03 · 技能")
code_panel(s, MX, 1.78, 5.3, 2.05, "目录结构", """.opencode/skills/weekly-report/
├── SKILL.md
└── references/
    └── report-template.md""", size=10.5, line=1.26)

tf = textbox(s, MX, 4.05, 5.3, 2.5)
add_p(tf, "为什么用技能", size=13, bold=True, color=INK, after=8)
add_p(tf, "· 平时不占上下文，需要时才加载", size=12, color=MUTED, after=6, line=1.35)
add_p(tf, "· 流程、模板、脚本放在一起，跟着技能走", size=12, color=MUTED, after=6, line=1.35)
add_p(tf, "· 同一套流程，所有 agent 都能复用", size=12, color=MUTED, after=0, line=1.35)

code_panel(s, 6.4, 1.78, 6.2, 4.4, "SKILL.md", """---
name: Weekly Report
description: 生成团队周报
---
1. 读 references/report-template.md
2. 汇总本周合并的 PR 和未完成事项
3. 先给大纲，确认后再写文件
4. 输出 Markdown，按模板分节""", size=11, line=1.28)

tf = textbox(s, MX, 6.4, 11.9, 0.35)
add_p(tf, "技能 vs 提示词：提示词是「你是谁」，技能是「这类活具体怎么干」。",
      size=12.5, color=MUTED, italic=True, after=0)
note(s, "说明加载机制：agent 平时只看到技能的名字和描述，确定要用时才读全文，所以可以写得很长。"
        "ID 由目录名决定，name 只是显示名，这点容易错。")

# ---------------------------------------------------------------- 24 章节四

section("04", "做成产品", "把散落的配置，拼成一个能长期用的东西",
        "最后一部分讲组合、调试和安全。目标是交给同事也能用。")

# ---------------------------------------------------------------- 25 周报案例

s = slide_body("完整案例：一个周报智能体", "04 · 案例")
tf = textbox(s, MX, 1.7, 11.9, 0.35)
add_p(tf, "三个文件，各管一件事", size=13, color=MUTED, after=0)

files = [
    ("agents/reporter.md", "人设", "写周报的语气、结构、\n哪些信息必须包含。", ACCENT),
    ("commands/weekly.md", "触发", "/weekly 一键执行，\n把参数传给它。", BLUE),
    ("skills/weekly-report/SKILL.md", "流程", "取数、汇总、先给大纲、\n确认后落盘。", RGBColor(0x1F, 0x9D, 0x6B)),
]
for i, (f, tag, desc, color) in enumerate(files):
    x = MX + i * 4.0
    rect(s, x, 2.2, 3.75, 2.5, SOFT, line_color=LINE, radius=0.06, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    rect(s, x, 2.2, 0.05, 2.5, color)
    tf = textbox(s, x + 0.28, 2.42, 3.2, 0.3)
    add_p(tf, tag, size=11, bold=True, color=color, after=0)
    tf = textbox(s, x + 0.28, 2.72, 3.25, 0.55)
    add_p(tf, f, size=10.5, bold=True, color=INK, mono=True, after=0, line=1.25)
    tf = textbox(s, x + 0.28, 3.42, 3.2, 1.0)
    add_p(tf, desc, size=12, color=MUTED, after=0, line=1.4)

tf = textbox(s, MX, 5.0, 11.9, 0.35)
add_p(tf, "一次完整的运行", size=13, bold=True, color=INK, after=0)
flow = ["/weekly", "加载技能", "拉 git 记录", "按模板写", "你确认", "保存文件"]
x = MX
for i, st in enumerate(flow):
    w = 1.55 if i != 3 else 1.7
    rect(s, x, 5.42, w, 0.6, ACCENT_SOFT if i == 0 else SOFT, line_color=LINE, radius=0.4,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, x, 5.56, w, 0.3)
    add_p(tf, st, size=11.5, bold=True, color=ACCENT if i == 0 else INK, align=PP_ALIGN.CENTER, after=0)
    x += w
    if i < len(flow) - 1:
        tf = textbox(s, x, 5.53, 0.35, 0.3)
        add_p(tf, "→", size=13, color=MUTED, align=PP_ALIGN.CENTER, after=0)
        x += 0.35

tf = textbox(s, MX, 6.35, 11.9, 0.5)
add_p(tf, "开发顺序：先写 agent 把人设跑顺 → 再写命令省掉重复输入 → 最后把流程沉淀成技能。",
      size=12, color=MUTED, after=0)
note(s, "这是全课的收束案例，把前面所有零件串起来。"
        "建议现场演示一次 /weekly，让学员看到「一个命令跑完一条流水线」。")

# ---------------------------------------------------------------- 26 进阶

s = slide_body("再往上走：三个扩展方向", "04 · 进阶")
bullets(s, [
    "自定义工具：用插件注册一个函数，让 agent 会调你的内部 API、查数据库",
    "MCP：接外部服务（Jira、Sentry、浏览器），现成工具直接出现在 agent 手里",
    "插件：在会话、请求、工具调用上加钩子，统一加规则或改行为",
    "SDK / Server：把同一个 agent 做成产品里的功能，而不是只在终端里用",
], y=1.78, w=11.6, size=15.5, gap=13)

code_panel(s, MX, 4.2, 7.3, 1.72, "自定义工具（V2）", """await ctx.tool.transform((editor) => {
  editor.add({ name: "greeting", description: "...",
    input: { type: "object", properties: { ... } },
    async execute(input) { return { content: "..." } } })
})""", size=9, line=1.22)

rect(s, 8.3, 4.2, 4.3, 1.72, ACCENT_SOFT, radius=0.08, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 8.58, 4.42, 3.8, 1.2)
add_p(tf, "小白可以先跳过", size=12, bold=True, color=ACCENT, after=6)
add_p(tf, "提示词、权限、技能用熟，已经能覆盖 80% 的场景。", size=11.5, color=INK, after=0, line=1.4)

tf = textbox(s, MX, 6.18, 11.9, 0.5)
add_p(tf, "判断标准：当「模型不知道该调什么」时，才需要自定义工具；当「不知道该怎么做」时，写技能就够。",
      size=12, color=MUTED, after=0, line=1.4)
note(s, "点到为止，不现场写代码。给学员一个心理地图：知道有这条路，需要时再查文档。")

# ---------------------------------------------------------------- 27 调试

s = slide_body("agent 不听话？按这张表排查", "04 · 调试")
table(s, MX, 1.72, 11.9,
      ["现象", "先检查什么"],
      [
          ["它根本没被选中", "description 是否写清场景；mode 是否是 subagent"],
          ["它乱改文件", "edit 权限是否设成 deny 或 ask"],
          ["它不按格式输出", "输出格式是否具体；最好给一个样板"],
          ["它答得很空泛", "目标是否写窄；有没有给文件路径和范围"],
          ["它跑到一半停了", "steps 是否太小；任务是否该拆成两步"],
          ["它说没有某个工具", "对应权限被 deny，或 MCP 服务没连上"],
      ],
      widths=[4.2, 7.7], row_h=0.66, head_h=0.46, size=14)

tf = textbox(s, MX, 6.26, 11.9, 0.6)
add_p(tf, "通用方法：先看它调了什么工具、读了哪些文件，再改提示词。不要一上来就重写整个 agent。",
      size=12.5, color=MUTED, after=0, line=1.4)
note(s, "把排查表当成课堂工具：学员卡住时，让他先说「属于哪一行」。"
        "强调调试顺序：先看行为轨迹，再改提示词，最后才考虑换模型。")

# ---------------------------------------------------------------- 28 安全

s = slide_body("安全与成本：四条底线", "04 · 安全")
bullets(s, [
    "最小权限：默认 ask，能 deny 就 deny；只读角色永远不给 edit",
    "密钥不进提示词、不进仓库，用环境变量传给工具",
    "给长任务设 steps 上限，避免死循环烧钱",
    "改完先看 diff 再提交；重要分支禁止直推",
], y=1.78, w=7.6, size=15.5, gap=14)

rect(s, 8.55, 1.78, 4.05, 3.55, DARK, radius=0.05, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 8.82, 2.02, 3.5, 3.1)
add_p(tf, "写进 agent 里", size=11.5, bold=True, color=ACCENT, after=10)
add_p(tf, 'action: "shell"', size=10.5, mono=True, color=CODE_TEXT, after=2)
add_p(tf, 'resource: "git push *"', size=10.5, mono=True, color=CODE_TEXT, after=2)
add_p(tf, 'effect: "deny"', size=10.5, mono=True, color=CODE_TEXT, after=12)
add_p(tf, "让「危险动作」在配置层面就不可能发生，比在提示词里写「请不要」可靠一百倍。",
      size=11.5, color=CODE_MUTED, after=0, line=1.45)

tf = textbox(s, MX, 5.6, 7.6, 1.0)
add_p(tf, "一个真实教训", size=12.5, bold=True, color=ACCENT, after=5)
add_p(tf, "提示词是建议，权限是法律。模型可能忽略你的嘱咐，但绕不过 deny。",
      size=14, color=INK, after=0, line=1.4)
note(s, "这页语气要重一点。用「提示词是建议，权限是法律」这句话收尾，学员记得住。"
        "如果时间允许，讲一个误删/误推的案例。")

# ---------------------------------------------------------------- 29 清单

s = slide_body("上线前检查清单", "04 · 交付")
left = [
    ("文件名就是 ID，路径没放错", "agents/ 还是 skills/，别混"),
    ("description 一句话说清用途", "主智能体靠它选人"),
    ("提示词含角色、目标、步骤、格式、边界", "五段式至少占三段"),
    ("权限最小化，危险命令已 deny", "push、rm、部署命令"),
]
right = [
    ("在真实项目里跑过 3 个不同任务", "不要只测「你好」"),
    ("输出格式稳定，能直接用", "表格、清单、固定标题"),
    ("失败时知道去哪看", "会话记录、日志、工具调用"),
    ("要共享就提交到 Git", "团队用同一版本"),
]
for col, items in enumerate([left, right]):
    x = MX + col * 6.1
    for i, (t, d) in enumerate(items):
        y = 1.85 + i * 1.15
        rect(s, x, y + 0.05, 0.34, 0.34, WHITE, line_color=ACCENT, radius=0.15,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        tf = textbox(s, x + 0.55, y - 0.02, 5.1, 0.45)
        add_p(tf, t, size=14, bold=True, color=INK, after=0, line=1.25)
        tf = textbox(s, x + 0.55, y + 0.42, 5.1, 0.4)
        add_p(tf, d, size=11.5, color=MUTED, after=0)

tf = textbox(s, MX, 6.55, 11.9, 0.3)
add_p(tf, "八项全过，再交给同事。少一项，就等着别人来问你「为什么它不工作」。",
      size=12, color=MUTED, after=0)
note(s, "清单可以直接截图发群里，让学员当验收标准用。"
        "提醒「真实任务」那条最重要，很多人只在玩具项目里测过。")

# ---------------------------------------------------------------- 30 作业

s = slide_body("课后作业：把课上的东西变成你的", "04 · 作业")
items = [
    ("必做 1", "写一个只读审查员", "在真实 PR 上跑一次，记录它漏掉和误报的问题。"),
    ("必做 2", "封装成 /review 命令", "支持传文件路径，自动带上 agent。"),
    ("必做 3", "写一个 SKILL.md", "把审查流程固定下来：先看什么、按什么排序、怎么输出。"),
    ("选做", "做一个翻译官 subagent", "禁止它改任何文件，只输出译文。"),
]
for i, (tag, title, desc) in enumerate(items):
    y = 1.8 + i * 1.1
    rect(s, MX, y, 7.2, 0.95, SOFT, line_color=LINE, radius=0.08, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, MX + 0.25, y + 0.13, 1.1, 0.3)
    add_p(tf, tag, size=10.5, bold=True, color=ACCENT, after=0)
    tf = textbox(s, MX + 0.25, y + 0.36, 6.7, 0.3)
    add_p(tf, title, size=14.5, bold=True, color=INK, after=0)
    tf = textbox(s, MX + 0.25, y + 0.66, 6.7, 0.26)
    add_p(tf, desc, size=10.5, color=MUTED, after=0, line=1.2)

rect(s, 8.25, 1.8, 4.35, 3.7, ACCENT_SOFT, radius=0.06, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 8.55, 2.02, 3.8, 3.3)
add_p(tf, "交作业的方式", size=12, bold=True, color=ACCENT, after=10)
add_p(tf, "录一段 1 分钟演示：", size=12, color=INK, after=4)
add_p(tf, "跑一次 /review，说出你改了哪条提示词、为什么改、结果差在哪。", size=12, color=INK, after=12, line=1.45)
add_p(tf, "能讲清「为什么」，才算真的会写 agent。", size=11.5, color=MUTED, italic=True, after=0, line=1.4)

tf = textbox(s, 8.25, 5.75, 4.35, 0.7)
add_p(tf, "进阶：把三个作业合成一个仓库，就是你的第一个 agent 工具箱。",
      size=11.5, color=MUTED, after=0, line=1.4)
note(s, "作业不要贪多，三个必做都围绕同一个 agent，学员改起来有连续性。"
        "强调演示要讲「为什么改」，这是区分「会抄」和「会写」的地方。")

# ---------------------------------------------------------------- 31 结语

s = prs.slides.add_slide(BLANK)
bg(s, DARK)
rect(s, 0.9, 1.42, 0.06, 0.55, ACCENT)
tf = textbox(s, 0.9, 2.15, 11.6, 2.0)
add_p(tf, "智能体不是魔法。", size=38, bold=True, color=WHITE, after=10, line=1.15)
add_p(tf, "它只是一份写清楚的岗位说明书，加上一套受控的工具权限。", size=30, bold=True,
      color=RGBColor(0xC7, 0xCE, 0xDA), after=0, line=1.25)

rect(s, 0.92, 4.72, 3.3, 0.055, ACCENT)

tf = textbox(s, 0.9, 5.02, 8.0, 0.9)
add_p(tf, "接下来，把它用在你明天的工作里。", size=16, color=MUTED_DARK, after=0)
add_p(tf, "官方文档  opencode.ai/docs", size=13, color=ACCENT, mono=True, after=0)

tf = textbox(s, 9.6, 6.55, 2.9, 0.4)
add_p(tf, "谢谢", size=15, bold=True, color=RGBColor(0x5F, 0x6B, 0x7C), align=PP_ALIGN.RIGHT, after=0)
note(s, "收尾回到核心观点，不要总结技术点。留 5 分钟答疑，鼓励学员现场把自己的 agent 跑起来。")

out = "opencode-agent-course.pptx"
prs.save(out)
print(f"saved {out}: {len(prs.slides._sldIdLst)} slides")
