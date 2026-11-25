# -*- coding: utf-8 -*-
"""
生成《从零手写 Agent 智能体》教学课件。

运行: python build_deck.py
输出: from-zero-agent.pptx
"""

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

FONT = "Microsoft YaHei"
MONO = "Consolas"

BG = RGBColor(0x0B, 0x15, 0x21)
CARD = RGBColor(0x12, 0x1F, 0x2C)
CARD_2 = RGBColor(0x16, 0x25, 0x35)
CODE_BG = RGBColor(0x0E, 0x18, 0x22)
LINE = RGBColor(0x22, 0x30, 0x3E)
INK = RGBColor(0xFF, 0xFF, 0xFF)
BODY = RGBColor(0xCB, 0xD8, 0xE5)
MUTED = RGBColor(0x8F, 0xA3, 0xB8)
ACCENT = RGBColor(0x63, 0xA7, 0xD4)
ACCENT_2 = RGBColor(0x4D, 0xA3, 0xFF)
DANGER = RGBColor(0xE0, 0x6C, 0x6C)
OK = RGBColor(0x6C, 0xC9, 0x9A)
ON_ACCENT = RGBColor(0x0F, 0x19, 0x20)

SW, SH = 13.333, 7.5
MX = 0.7
TOP = 1.72
BOTTOM = 6.82

prs = Presentation()
prs.slide_width = Inches(SW)
prs.slide_height = Inches(SH)
BLANK = prs.slide_layouts[6]
prs.core_properties.title = "从零手写 Agent 智能体"
prs.core_properties.author = "OpenCode 教学课件"
prs.core_properties.subject = "不用框架，从一个 while 循环开始"

page = 0


def style_run(run, size=16, bold=False, color=BODY, mono=False, italic=False):
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


def add_p(tf, text="", size=16, bold=False, color=BODY, before=0, after=8,
          line=1.32, mono=False, align=PP_ALIGN.LEFT, bullet=False,
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


def bg(slide, color=BG):
    rect(slide, 0, 0, SW, SH, color)


def footer(slide):
    # 页码 = 实际页序，章节页不编号但占位
    page = len(prs.slides._sldIdLst)
    rect(slide, MX, 6.98, SW - MX * 2, 0.01, LINE)
    tf = textbox(slide, MX, 7.07, 8.0, 0.28)
    add_p(tf, "从零手写 Agent 智能体", size=9, color=MUTED, after=0)
    tf = textbox(slide, SW - MX - 1.2, 7.07, 1.2, 0.28)
    add_p(tf, f"{page:02d}", size=9, color=MUTED, align=PP_ALIGN.RIGHT, after=0)


def slide_body(title, kicker=None):
    s = prs.slides.add_slide(BLANK)
    bg(s)
    rect(s, 0.42, 0.44, 0.09, 1.0, ACCENT)
    if kicker:
        tf = textbox(s, MX, 0.30, 11.5, 0.3)
        add_p(tf, kicker, size=10.5, bold=True, color=ACCENT, after=0)
    tf = textbox(s, MX, 0.55 if kicker else 0.62, SW - MX * 2, 0.85)
    add_p(tf, title, size=27, bold=True, color=INK, line=1.05, after=0)
    footer(s)
    return s


def bullets(slide, items, x=MX, y=TOP, w=11.9, size=16, gap=10, line=1.4):
    tf = textbox(slide, x, y, w, BOTTOM - y)
    for item in items:
        add_p(tf, item, size=size, color=BODY, bullet=True, after=gap, line=line)
    return tf


def code_panel(slide, x, y, w, h, filename, code, size=10.5, line=1.24, label_color=ACCENT):
    rect(slide, x, y, w, h, CODE_BG, line_color=LINE, radius=0.035,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(slide, x + 0.26, y + 0.2, w - 0.48, h - 0.4)
    if filename:
        add_p(tf, filename, size=10, bold=True, color=label_color, mono=True, after=8, line=1.0)
    for ln in code.split("\n"):
        color = MUTED if ln.strip().startswith(("//", "#")) else BODY
        add_p(tf, ln if ln else " ", size=size, color=color, mono=True, after=0, line=line, before=0)


def card(slide, x, y, w, h, title, body, accent=ACCENT, title_size=17, body_size=13):
    rect(slide, x, y, w, h, CARD, line_color=LINE, radius=0.05,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    rect(slide, x, y + 0.22, 0.05, h - 0.44, accent)
    tf = textbox(slide, x + 0.27, y + 0.22, w - 0.48, h - 0.4)
    add_p(tf, title, size=title_size, bold=True, color=INK, after=6, line=1.12)
    add_p(tf, body, size=body_size, color=MUTED, line=1.45, after=0)


def table(slide, x, y, w, headers, rows, widths, row_h=0.5, head_h=0.46,
          size=13.5, head_size=12.5):
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

    def fill(cell, text, bold, color, size_, fill_color):
        cell.fill.solid()
        cell.fill.fore_color.rgb = fill_color
        cell.margin_left = Inches(0.16)
        cell.margin_right = Inches(0.12)
        cell.margin_top = Inches(0.05)
        cell.margin_bottom = Inches(0.05)
        tf = cell.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        add_p(tf, text, size=size_, bold=bold, color=color, after=0, line=1.15)

    for c, htext in enumerate(headers):
        fill(tbl.cell(0, c), htext, True, MUTED, head_size, CARD_2)
    for r, row in enumerate(rows, start=1):
        fill_color = BG if r % 2 else CARD
        for c, text in enumerate(row):
            fill(tbl.cell(r, c), text, c == 0, INK if c == 0 else BODY, size, fill_color)
    return tbl


def note(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def section(number, title, subtitle, notes):
    s = prs.slides.add_slide(BLANK)
    bg(s)
    tf = textbox(s, 0.9, 1.5, 4.0, 1.6)
    add_p(tf, number, size=96, bold=True, color=RGBColor(0x1B, 0x2A, 0x38), after=0, line=1.0)
    rect(s, 0.94, 3.1, 1.15, 0.06, ACCENT)
    tf = textbox(s, 0.9, 3.33, 11.2, 0.8)
    add_p(tf, title, size=38, bold=True, color=INK, after=0, line=1.1)
    tf = textbox(s, 0.94, 4.33, 10.8, 0.6)
    add_p(tf, subtitle, size=15, color=MUTED, after=0)
    tf = textbox(s, 0.94, 6.1, 11.0, 0.4)
    add_p(tf, "AGENT · FROM ZERO", size=10, color=RGBColor(0x35, 0x48, 0x5C), mono=True, after=0)
    note(s, notes)
    return s


# ---------------------------------------------------------------- 01 封面

s = prs.slides.add_slide(BLANK)
bg(s)
rect(s, 0.9, 0.95, 0.06, 0.28, ACCENT)
tf = textbox(s, 1.12, 0.93, 8.0, 0.32)
add_p(tf, "HANDWRITE AN AGENT", size=11.5, bold=True, color=ACCENT, mono=True, after=0)

tf = textbox(s, 0.86, 1.45, 12.0, 1.1)
add_p(tf, "从零手写 Agent 智能体", size=50, bold=True, color=INK, after=0, line=1.0)

tf = textbox(s, 0.9, 2.55, 11.4, 0.55)
add_p(tf, "不用框架，不用平台，从一个 while 循环开始", size=22, color=RGBColor(0xA9, 0xCF, 0xE7), after=0)

tf = textbox(s, 0.9, 3.25, 9.8, 0.95)
add_p(tf, "90 分钟，写一个能读文件、改代码、跑命令，\n并且危险操作会先征求你同意的智能体。",
      size=15, color=MUTED, after=0, line=1.55)

rect(s, 0.92, 4.45, 3.3, 0.05, ACCENT)

pills = [("26 页 · 约 90 分钟", 2.95), ("TypeScript + Bun", 2.35), ("代码全部可运行", 2.45)]
x = 0.9
for text, pw in pills:
    rect(s, x, 4.82, pw, 0.48, CARD, line_color=LINE, radius=0.5,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, x + 0.24, 4.95, pw - 0.4, 0.28)
    add_p(tf, text, size=11, color=RGBColor(0xA9, 0xCF, 0xE7), after=0)
    x += pw + 0.2

tf = textbox(s, 0.9, 6.15, 11.6, 0.4)
add_p(tf, "模型只负责出主意，循环负责把事做完。", size=13, color=ACCENT, after=0)

tf = textbox(s, 8.1, 5.9, 4.6, 0.5)
add_p(tf, "while (step <= MAX_STEPS)", size=18, color=RGBColor(0x16, 0x27, 0x36), mono=True,
      align=PP_ALIGN.RIGHT, after=0)
note(s, "开场先破题：今天不训练模型，也不装任何 agent 框架。"
        "我们只写一个循环：把模型、工具、权限接起来。完事你就有自己的 opencode 雏形。")

# ---------------------------------------------------------------- 02 学完你会什么

s = slide_body("学完你会什么", "课程目标")
card(s, MX, 1.78, 3.75, 2.55, "①  写出来", "一个 200 行左右的 TypeScript 文件，\n能读文件、改文件、跑命令。")
card(s, 4.79, 1.78, 3.75, 2.55, "②  管得住", "危险操作默认先问你；\nallow / ask / deny 三档权限。", accent=ACCENT_2)
card(s, 8.58, 1.78, 3.75, 2.55, "③  看得懂", "再看 opencode 这类项目，\n知道每一层在解决什么问题。", accent=OK)

tf = textbox(s, MX, 4.72, 11.9, 0.4)
add_p(tf, "前置要求", size=13, bold=True, color=ACCENT, after=0)
tf = textbox(s, MX, 5.1, 11.9, 0.9)
add_p(tf, "会复制粘贴、会用终端。不要求懂 AI，也不要求会 TypeScript——代码会一行一行拆开讲。",
      size=17, color=BODY, after=0, line=1.4)

rect(s, MX, 6.15, 11.9, 0.6, CARD, line_color=LINE, radius=0.12, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 1.0, 6.29, 11.3, 0.35)
add_p(tf, "你不需要先学完 TypeScript：全篇只用到函数、对象、数组和一个 for 循环。",
      size=13, bold=True, color=RGBColor(0xA9, 0xCF, 0xE7), after=0)
note(s, "强调产出和门槛。学员最怕的是「不会写代码」，先把这个顾虑拿掉："
        "本课代码只有 3 个工具、1 个循环，剩下都是配置。")

# ---------------------------------------------------------------- 03 名词表

s = slide_body("先对齐 6 个词，后面就不绕了", "开课前")
table(s, MX, 1.78, 11.9,
      ["名词", "一句话解释"],
      [
          ["LLM（大模型）", "负责理解与决策，只输出文字，自己不执行任何操作"],
          ["Token", "模型计费与长度的单位，约等于一个词或半个汉字"],
          ["Context（上下文）", "模型这一次能看到的全部内容，越多越慢越贵"],
          ["Prompt（提示词）", "你写给模型的任务说明，包括系统提示和用户消息"],
          ["Tool（工具）", "你代码里一个能被模型调用的函数"],
          ["Agent（智能体）", "模型 + 工具 + 循环 + 记忆，四样接起来"],
      ],
      widths=[3.3, 8.6], row_h=0.64, head_h=0.46, size=14)
tf = textbox(s, MX, 6.35, 11.9, 0.35)
add_p(tf, "本课不训练模型。我们写的是「调用模型，并把它的决定执行掉」的那层代码。",
      size=12.5, color=MUTED, italic=True, after=0)
note(s, "只建立直觉，不展开。重点区分「模型」和「agent」：模型是大脑，agent 是把它接上手脚和循环的系统。")

# ---------------------------------------------------------------- 04 目录

s = slide_body("课程地图：三章，一个能跑的程序", "目录")
mods = [
    ("01", "认识 Agent", "为什么它不是一个模型，而是一个循环", "4 页"),
    ("02", "手写 Agent", "7 步：工具、请求、循环、回灌、停止、权限、跑起来", "11 页"),
    ("03", "进阶与实战", "上下文、错误、分层、五个坑、课后作业", "9 页"),
]
for i, (num, title, desc, count) in enumerate(mods):
    y = 1.85 + i * 1.52
    rect(s, MX, y, 11.9, 1.28, CARD, line_color=LINE, radius=0.05,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, MX + 0.3, y + 0.32, 1.2, 0.65)
    add_p(tf, num, size=30, bold=True, color=ACCENT, after=0, line=1.0)
    tf = textbox(s, MX + 1.5, y + 0.28, 4.3, 0.4)
    add_p(tf, title, size=18, bold=True, color=INK, after=0)
    tf = textbox(s, MX + 1.5, y + 0.72, 8.8, 0.4)
    add_p(tf, desc, size=12.5, color=MUTED, after=0)
    tf = textbox(s, SW - MX - 1.2, y + 0.3, 0.9, 0.3)
    add_p(tf, count, size=10.5, color=MUTED, align=PP_ALIGN.RIGHT, after=0)

tf = textbox(s, MX, 6.45, 11.9, 0.35)
add_p(tf, "第二章是主体；第三章解释真实项目为什么会长成那样。", size=12, color=MUTED, after=0)
note(s, "先给全貌。告诉学员：第二章结束就能跑；第三章决定你能不能继续长大。")

# ---------------------------------------------------------------- 05 章节一

section("01", "认识 Agent", "模型只负责出主意，循环负责把事做完",
        "第一部分不写代码，只建立一个正确的心智模型。大约 8 分钟。")

# ---------------------------------------------------------------- 06 循环

s = slide_body("Agent 不是一个模型，是一个循环", "01 · 核心")
tf = textbox(s, MX, 1.72, 11.9, 0.4)
add_p(tf, "一次任务，实际发生的是这五步，然后回到第二步", size=13, color=MUTED, after=0)

steps = [
    ("1", "消息", "messages 数组\n系统提示 + 用户任务"),
    ("2", "模型", "决定下一步：\n回文字，还是调工具"),
    ("3", "工具调用", "返回 name +\narguments（JSON）"),
    ("4", "执行", "你的代码真正\n读文件 / 跑命令"),
    ("5", "回灌", "结果写回 messages\n进入下一轮"),
]
for i, (num, title, desc) in enumerate(steps):
    x = 0.55 + i * 2.58
    rect(s, x, 2.25, 2.3, 1.95, CARD, line_color=LINE, radius=0.06,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, x + 0.22, 2.38, 0.4, 0.3)
    add_p(tf, num, size=11, bold=True, color=ACCENT, mono=True, after=0)
    tf = textbox(s, x + 0.22, 2.72, 1.9, 0.35)
    add_p(tf, title, size=15, bold=True, color=INK, after=0)
    tf = textbox(s, x + 0.22, 3.15, 1.95, 0.85)
    add_p(tf, desc, size=10.5, color=MUTED, after=0, line=1.4)
    if i < 4:
        tf = textbox(s, x + 2.3, 3.02, 0.28, 0.3)
        add_p(tf, "→", size=14, color=ACCENT, align=PP_ALIGN.CENTER, after=0)

rect(s, 0.55, 4.45, 12.2, 0.62, CARD_2, line_color=LINE, radius=0.3,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 0.85, 4.6, 11.6, 0.35)
add_p(tf, "第 5 步回到第 2 步，直到模型不再请求工具 —— 这个圈就是 Agent。",
      size=12.5, color=ACCENT, align=PP_ALIGN.CENTER, after=0)

tf = textbox(s, MX, 5.35, 11.9, 0.55)
add_p(tf, "模型只会说「我想读 src/app.ts」。真正打开文件、把内容递回去的，是你的代码。",
      size=17, color=INK, after=0, line=1.35)
tf = textbox(s, MX, 6.0, 11.9, 0.4)
add_p(tf, "所以 Agent 的能力上限，取决于你给了它哪些工具、以及你怎么管这些工具。",
      size=13, color=MUTED, after=0, line=1.4)
note(s, "用现场演示或口述一个具体例子：让它读文件，模型返回 tool_call，你的代码读文件后回灌。"
        "反复强调：模型没有手，手是你的代码。")

# ---------------------------------------------------------------- 07 四个零件

s = slide_body("一个 Agent 的四个零件", "01 · 组成")
cards = [
    ("模型", "大脑", "理解任务、决定下一步。\n只输出文字和工具意图。"),
    ("工具", "手脚", "读写文件、跑命令、调 API。\n你写什么它才能做什么。"),
    ("循环", "心脏", "把工具结果送回模型，\n直到任务完成或步数用尽。"),
    ("记忆", "笔记本", "messages 数组。模型每一轮\n都能重新看到全部历史。"),
]
for i, (title, sub, body) in enumerate(cards):
    x = MX + i * 3.0
    rect(s, x, 1.8, 2.75, 3.1, CARD, line_color=LINE, radius=0.05,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, x + 0.25, 2.02, 2.3, 0.35)
    add_p(tf, sub, size=10.5, bold=True, color=ACCENT, after=0)
    tf = textbox(s, x + 0.25, 2.35, 2.3, 0.45)
    add_p(tf, title, size=20, bold=True, color=INK, after=0)
    tf = textbox(s, x + 0.25, 3.0, 2.25, 1.3)
    add_p(tf, body, size=11.5, color=MUTED, after=0, line=1.45)

tf = textbox(s, MX, 5.3, 11.9, 0.45)
add_p(tf, "框架帮你封装的，就是这四样。看懂它们，任何 agent 框架都不再神秘。",
      size=16, color=INK, after=0)
tf = textbox(s, MX, 5.9, 11.9, 0.6)
add_p(tf, "本课的最小实现里：模型一次 fetch，工具三个函数，循环一个 for，记忆一个数组。",
      size=13, color=MUTED, after=0, line=1.4)
note(s, "四个零件对应后面四步。让学员记住「记忆就是一个数组」，这是后面所有上下文问题的根源。")

# ---------------------------------------------------------------- 08 为什么手写

s = slide_body("为什么先手写，再用框架", "01 · 方法")
bullets(s, [
    "框架动辄几千行，出问题时你得知道该看哪一层",
    "最小实现只要一次请求、一个数组、一个循环",
    "手写一遍，再看 opencode 的分层与扩展会快很多",
    "手写不是终点，是一张地图：知道每个抽象在替代什么",
], y=1.8, size=16, w=7.4, gap=14)

rect(s, 8.45, 1.8, 4.2, 3.35, CARD, line_color=LINE, radius=0.05,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 8.72, 2.05, 3.7, 2.9)
add_p(tf, "本课的技术选择", size=11, bold=True, color=ACCENT, after=10)
for t in ["TypeScript：类型能帮你少犯错", "Bun：直接跑 .ts，不用编译", "fetch / file / spawn：Bun 自带", "零依赖：没有 node_modules"]:
    add_p(tf, t, size=12.5, color=BODY, bullet=True, after=8, line=1.35)

tf = textbox(s, MX, 5.55, 11.9, 0.8)
add_p(tf, "换成 Python、Go、Java 也一样：请求模型 → 判断工具调用 → 执行 → 回灌。差别只在语法。",
      size=13, color=MUTED, after=0, line=1.4)
note(s, "回应学员「为什么不直接学 LangChain」：先知道循环长什么样，框架才不是黑盒。"
        "同时说明语言不是重点，本课选 TypeScript 是因为项目本身是 TS。")

# ---------------------------------------------------------------- 09 章节二

section("02", "手写 Agent", "7 步，一个文件，200 行左右",
        "进入实操。建议学员现在就打开编辑器，跟着敲；每一步都可以单独运行验证。")

# ---------------------------------------------------------------- 10 环境

s = slide_body("准备：10 分钟环境", "02 · 第 0 步")
rows = [
    ("1", "安装 Bun", "Windows 用 PowerShell；macOS / Linux 用 curl。装完能跑 bun --version 即可。",
     "powershell -c \"irm bun.sh/install.ps1 | iex\""),
    ("2", "准备模型密钥", "任意 OpenAI 兼容接口都行：OpenAI、DeepSeek、通义、本地 Ollama。",
     "export OPENAI_API_KEY=sk-..."),
    ("3", "新建一个空文件", "就叫 agent.ts。Bun 直接运行 TypeScript，不需要 package.json。",
     "bun run agent.ts"),
]
for i, (n, title, desc, cmd) in enumerate(rows):
    y = 1.78 + i * 1.62
    rect(s, MX, y, 11.9, 1.42, CARD, line_color=LINE, radius=0.05,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    rect(s, MX + 0.28, y + 0.4, 0.58, 0.58, ACCENT, radius=0.5, shape=MSO_SHAPE.OVAL)
    tf = textbox(s, MX + 0.28, y + 0.5, 0.58, 0.35)
    add_p(tf, n, size=16, bold=True, color=ON_ACCENT, align=PP_ALIGN.CENTER, after=0)
    tf = textbox(s, MX + 1.08, y + 0.22, 5.5, 0.4)
    add_p(tf, title, size=16.5, bold=True, color=INK, after=0)
    tf = textbox(s, MX + 1.08, y + 0.66, 5.9, 0.6)
    add_p(tf, desc, size=11.5, color=MUTED, after=0, line=1.35)
    rect(s, MX + 6.95, y + 0.3, 4.9, 0.8, CODE_BG, line_color=LINE, radius=0.08,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, MX + 7.15, y + 0.44, 4.5, 0.5)
    add_p(tf, cmd, size=9, color=BODY, mono=True, after=0, line=1.2)

tf = textbox(s, MX, 6.55, 11.9, 0.3)
add_p(tf, "Windows 也支持 Bun；如果公司网络限制，直接下载 Bun 的 zip 包解压到 PATH 即可。",
      size=10.5, color=MUTED, after=0)
note(s, "现场提前装好。提醒：Windows 的 export 写法是 $env:OPENAI_API_KEY=\"sk-...\"，"
        "PPT 里给的是 macOS / Linux 写法，两种都写在备注里。")

# ---------------------------------------------------------------- 11 工具定义

s = slide_body("第 1 步：工具 = 函数 + 说明书", "02 · 工具")
code_panel(s, 0.55, 1.78, 7.75, 4.55, "agent.ts · 工具", """type Tool = {
  name: string
  description: string                 // 决定「什么时候用」
  parameters: Record<string, unknown> // JSON Schema
  run: (args: Record<string, string>) => Promise<string>
}

const readFile: Tool = {
  name: "read_file",
  description: "读取文件内容。路径相对于当前目录。",
  parameters: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
  },
  run: async (args) => await Bun.file(args.path).text(),
}""", size=9.5, line=1.22)

tf = textbox(s, 8.62, 1.82, 4.0, 4.4)
add_p(tf, "四个字段，各管一件事", size=13, bold=True, color=ACCENT, after=9)
add_p(tf, "name  模型调用时用的名字", size=11.5, color=BODY, after=3)
add_p(tf, "description  用自然语言写清什么时候用", size=11.5, color=BODY, after=3)
add_p(tf, "parameters  参数结构，JSON Schema", size=11.5, color=BODY, after=3)
add_p(tf, "run  真正的实现，模型永远看不到", size=11.5, color=BODY, after=14)
add_p(tf, "模型只看到前三项。所以：description 写得越清楚，它选得越准。",
      size=12, color=RGBColor(0xA9, 0xCF, 0xE7), after=0, line=1.45)

tf = textbox(s, 0.55, 6.45, 12.3, 0.3)
add_p(tf, "工具的本质：把「你的能力」翻译成「模型能读的说明书」。", size=12, color=MUTED, italic=True, after=0)
note(s, "带学员看 type 的四个字段，不要纠语法。强调 description 是给模型看的，不是注释。"
        "现场可以把 description 改成「处理文件」，看模型还会不会选它。")

# ---------------------------------------------------------------- 12 发给模型

s = slide_body("第 2 步：把工具清单发给模型", "02 · 请求")
code_panel(s, 0.55, 1.78, 7.6, 4.5, "agent.ts · chat()", """const response = await fetch(`${BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: MODEL,
    messages,
    tools: tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    })),
  }),
})""", size=9.2, line=1.2)

tf = textbox(s, 8.45, 1.82, 4.2, 4.4)
add_p(tf, "请求里只有三样东西", size=13, bold=True, color=ACCENT, after=9)
add_p(tf, "model  用哪个模型", size=11.5, color=BODY, after=4)
add_p(tf, "messages  对话历史", size=11.5, color=BODY, after=4)
add_p(tf, "tools  这次允许它用的工具", size=11.5, color=BODY, after=14)
add_p(tf, "模型返回两种结果", size=13, bold=True, color=ACCENT, after=6)
add_p(tf, "① 一段文字：任务结束了", size=11.5, color=BODY, after=4)
add_p(tf, "② tool_calls：它想用工具，给你 name + arguments", size=11.5, color=BODY, after=10, line=1.35)
add_p(tf, "注意：模型不会执行工具，它只发出请求。", size=11.5, bold=True, color=RGBColor(0xA9, 0xCF, 0xE7), after=0, line=1.4)

tf = textbox(s, 0.55, 6.42, 12.3, 0.3)
add_p(tf, "tools 是「这次允许用」的清单，不是全局注册表；每一轮都可以不同。", size=11.5, color=MUTED, after=0)
note(s, "用「点菜」比喻：模型是顾客，tools 是菜单，arguments 是「我要这个、少辣」。"
        "真正做菜的是后厨，也就是你的 run()。")

# ---------------------------------------------------------------- 13 循环

s = slide_body("第 3 步：循环是心脏", "02 · 主循环")
code_panel(s, 0.55, 1.76, 7.85, 4.65, "agent.ts · 主循环", """for (let step = 1; step <= MAX_STEPS; step++) {
  const data = await chat(messages)
  const msg = data.choices[0].message

  messages.push({
    role: "assistant",
    content: msg.content ?? null,
    tool_calls: msg.tool_calls,
  })

  if (!msg.tool_calls?.length) {
    console.log(msg.content)   // 没有工具调用 = 完成
    break
  }

  for (const call of msg.tool_calls) {
    // 执行工具，把结果 push 回 messages
  }
}""", size=9.2, line=1.2)

tf = textbox(s, 8.75, 1.8, 3.9, 4.4)
add_p(tf, "12 行，所有 Agent 的心脏", size=15, bold=True, color=INK, after=10)
add_p(tf, "① 请求模型", size=11.5, color=ACCENT, after=2)
add_p(tf, "② assistant 消息原样入数组", size=11.5, color=ACCENT, after=2)
add_p(tf, "③ 没有工具调用就结束", size=11.5, color=ACCENT, after=2)
add_p(tf, "④ 有就逐个执行，结果入数组", size=11.5, color=ACCENT, after=2)
add_p(tf, "⑤ 回到 ①，下一轮", size=11.5, color=ACCENT, after=16)
add_p(tf, "opencode 的循环复杂得多，但骨架就是这五步。", size=12, color=MUTED, after=0, line=1.4)

tf = textbox(s, 0.55, 6.52, 12.3, 0.3)
add_p(tf, "不要在这一步加并发、加重试、加流式。先让它一圈一圈转起来。", size=11.5, color=MUTED, after=0)
note(s, "带学员逐行读。特别指出 messages.push 的顺序：assistant 先入，tool 结果后入。"
        "顺序错了，模型会报「tool_call_id 不匹配」。")

# ---------------------------------------------------------------- 14 回灌

s = slide_body("第 4 步：工具结果必须回到对话里", "02 · 回灌")
code_panel(s, 0.55, 1.78, 7.5, 2.6, "正确：用 tool 角色 + id 对应", """messages.push({
  role: "tool",
  tool_call_id: call.id,   // 对应哪一次调用
  content: output,         // 工具的输出
})""", size=10.5, line=1.28, label_color=OK)

code_panel(s, 0.55, 4.55, 7.5, 1.35, "错误：塞成一条用户消息", """messages.push({ role: "user", content: output })
// 模型分不清这是谁的结果，也接不上上一次调用""", size=10, line=1.25, label_color=DANGER)

tf = textbox(s, 8.5, 1.82, 4.2, 4.6)
add_p(tf, "为什么必须这样", size=13, bold=True, color=ACCENT, after=9)
add_p(tf, "tool_calls 里每个调用都有唯一 id，tool 消息靠 tool_call_id 和它配对。", size=11.5, color=BODY, after=9, line=1.4)
add_p(tf, "assistant 那条消息也要原样放回，否则模型看不到「自己刚刚要做什么」。", size=11.5, color=BODY, after=9, line=1.4)
add_p(tf, "结果可以是成功、报错、被拒绝——都当成内容递回去，让模型决定下一步。", size=11.5, color=BODY, after=0, line=1.4)

tf = textbox(s, 0.55, 6.15, 12.3, 0.5)
add_p(tf, "最常见的 bug：工具跑了，模型却像没看见——九成是回灌格式或顺序错了。", size=12, color=MUTED, after=0, line=1.4)
note(s, "这是新手第一个大坑。现场演示一次错误写法，观察模型重复请求同一个工具，印象最深。")

# ---------------------------------------------------------------- 15 停止

s = slide_body("第 5 步：学会停下", "02 · 终止")
tf = textbox(s, MX, 1.78, 11.9, 0.4)
add_p(tf, "三种停止条件，缺一不可", size=14, bold=True, color=ACCENT, after=0)

items = [
    ("模型不再请求工具", "它给出最终回答，任务结束。", "if (!msg.tool_calls?.length) break"),
    ("步数到上限", "防止死循环和余额被跑完。", "for (let step = 1; step <= MAX_STEPS; step++)"),
    ("工具报错", "不要崩，把错误当结果回灌，让它自己改。", ".catch((e) => `工具报错：${e.message}`)"),
]
for i, (title, desc, code) in enumerate(items):
    y = 2.3 + i * 1.28
    rect(s, MX, y, 11.9, 1.08, CARD, line_color=LINE, radius=0.05,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, MX + 0.3, y + 0.18, 4.0, 0.35)
    add_p(tf, title, size=14, bold=True, color=INK, after=0)
    tf = textbox(s, MX + 0.3, y + 0.58, 5.2, 0.35)
    add_p(tf, desc, size=11, color=MUTED, after=0)
    tf = textbox(s, MX + 5.6, y + 0.34, 6.1, 0.4)
    add_p(tf, code, size=10, color=RGBColor(0x9F, 0xD8, 0xB9), mono=True, after=0)

rect(s, MX, 6.28, 11.9, 0.5, CARD_2, radius=0.3, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 1.0, 6.4, 11.3, 0.3)
add_p(tf, "没有上限的 Agent，就是一个会自己花钱的 for 循环。", size=12, color=ACCENT, after=0)
note(s, "三条都讲清。常见事故：只判断「没有 tool_calls」，但模型一直请求同一个工具。"
        "所以 maxSteps 是兜底，不是可选项。")

# ---------------------------------------------------------------- 16 权限

s = slide_body("第 6 步：给 Agent 装上刹车", "02 · 权限")
code_panel(s, 0.55, 1.78, 7.55, 4.35, "agent.ts · 权限", """type Effect = "allow" | "ask" | "deny"

// 宽泛在前，例外在后；最后一条命中的规则生效
const rules = [
  { tool: "read_file",  pattern: "*", effect: "allow" },
  { tool: "write_file", pattern: "*", effect: "ask" },
  { tool: "run_shell",  pattern: "*", effect: "ask" },
  { tool: "run_shell",  pattern: "git status*", effect: "allow" },
  { tool: "run_shell",  pattern: "rm -rf*", effect: "deny" },
]

function decide(tool: string, target: string): Effect {
  const hit = rules.findLast(
    (r) => r.tool === tool && matches(r.pattern, target),
  )
  return hit?.effect ?? "ask"   // 没命中，默认询问
}""", size=9, line=1.2)

tf = textbox(s, 8.45, 1.82, 4.2, 4.4)
add_p(tf, "三档，对应三种风险", size=13, bold=True, color=ACCENT, after=9)
add_p(tf, "allow  只读查询，直接执行", size=11.5, color=OK, after=4)
add_p(tf, "ask  写文件、跑命令，先问你", size=11.5, color=RGBColor(0xE8, 0xC4, 0x7A), after=4)
add_p(tf, "deny  删除、推送、部署，直接拒绝", size=11.5, color=DANGER, after=14)
add_p(tf, "两条规则", size=13, bold=True, color=ACCENT, after=6)
add_p(tf, "① 最后匹配生效：先宽，后具体。", size=11.5, color=BODY, after=5, line=1.35)
add_p(tf, "② 没有命中就是 ask：宁可多问一句。", size=11.5, color=BODY, after=12, line=1.35)
add_p(tf, "提示词是建议，权限是法律。", size=12, bold=True, color=RGBColor(0xA9, 0xCF, 0xE7), after=0)

tf = textbox(s, 0.55, 6.35, 12.3, 0.35)
add_p(tf, "面试题：为什么 allow 写在前面、deny 写在后面？因为后写的规则能覆盖先写的。", size=11.5, color=MUTED, after=0)
note(s, "重点讲规则顺序，现场把 rm 规则挪到最前面，演示 deny 失效。"
        "强调默认 ask：模型可以骗你，但骗不过规则。")

# ---------------------------------------------------------------- 17 三个工具

s = slide_body("第 7 步：给它一双手", "02 · 工具实现")
code_panel(s, 0.55, 1.78, 7.7, 3.55, "agent.ts · run_shell", """run: async (args) => {
  const cmd = process.platform === "win32"
    ? ["powershell", "-NoProfile", "-Command", args.command]
    : ["bash", "-lc", args.command]

  const r = Bun.spawnSync(cmd, {
    stdout: "pipe", stderr: "pipe",
  })
  return (r.stdout.toString() + r.stderr.toString()).trim()
}""", size=9.8, line=1.24)

tf = textbox(s, 8.6, 1.82, 4.1, 4.4)
add_p(tf, "三个工具，覆盖大部分事", size=13, bold=True, color=ACCENT, after=9)
add_p(tf, "read_file  看代码、看配置", size=11.5, color=BODY, after=4)
add_p(tf, "write_file  改代码、写文档", size=11.5, color=BODY, after=4)
add_p(tf, "run_shell  跑测试、git 查询、列目录", size=11.5, color=BODY, after=14)
add_p(tf, "两个必须做的保护", size=13, bold=True, color=ACCENT, after=6)
add_p(tf, "① 输出截断到 8000 字，防止一次撑爆上下文", size=11.5, color=BODY, after=5, line=1.35)
add_p(tf, "② 工作目录限制在项目内，别让它读到主目录", size=11.5, color=BODY, after=0, line=1.35)

tf = textbox(s, 0.55, 5.55, 12.3, 0.7)
add_p(tf, "工具不在多。能读、能写、能跑，已经可以完成「读代码 → 改 → 跑测试」的闭环。",
      size=13, color=MUTED, after=0, line=1.4)
note(s, "说明 Windows / Unix 的命令差异，课程代码已做判断。"
        "强调截断：没有截断，一次 grep 就能把上下文打满。")

# ---------------------------------------------------------------- 18 完整程序

s = slide_body("完整程序：一页看懂", "02 · 组装")
table(s, 0.55, 1.78, 7.4,
      ["位置", "部分", "职责"],
      [
          ["1–20", "配置", "BASE_URL / MODEL / MAX_STEPS"],
          ["21–81", "工具", "3 个 Tool 定义 + run 实现"],
          ["82–114", "权限", "rules / decide / confirm"],
          ["115–142", "模型", "chat() 一次请求"],
          ["143–203", "主循环", "messages / for / 回灌 / 停止"],
      ],
      widths=[1.3, 2.0, 4.1], row_h=0.66, head_h=0.46, size=12)

code_panel(s, 8.25, 1.78, 4.45, 2.35, "运行", 'export OPENAI_API_KEY=sk-...\nbun run agent.ts \\\n  "读 package.json，告诉我项目名"', size=9.8, line=1.3)

rect(s, 8.25, 4.35, 4.45, 2.3, CARD, line_color=LINE, radius=0.05,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 8.52, 4.55, 3.9, 1.95)
add_p(tf, "完整代码在", size=10.5, bold=True, color=ACCENT, after=4)
add_p(tf, "courseware/from-zero-agent/agent.ts", size=9.5, color=BODY, mono=True, after=10, line=1.3)
add_p(tf, "含中文注释，可以直接改、直接跑。", size=11, color=MUTED, after=0, line=1.4)

tf = textbox(s, 0.55, 6.15, 7.4, 0.6)
add_p(tf, "行号是近似值，按你的注释和空行会有一点出入。", size=11, color=MUTED, after=0)
note(s, "让学员先整体看一眼文件结构，不要逐行抄。告诉他们：看不懂的细节，后面会回来补。")

# ---------------------------------------------------------------- 19 章节三

section("03", "进阶与实战", "让循环跑得久、跑得稳、长得大",
        "最后一部分讲工程问题：上下文、错误、分层和踩坑。这部分决定它能不能用在真实项目。")

# ---------------------------------------------------------------- 20 三个任务

s = slide_body("跑起来：三个练手任务", "03 · 实战")
tasks = [
    ("只读", "解释代码", "读 src/index.ts，用三句话说明它做什么。", "只会调用 read_file，直接执行。", OK),
    ("先问", "修一个 bug", "跑 bun test，找到失败原因并修复。", "shell 与 write 都会弹 ask，先看它想干什么。", RGBColor(0xE8, 0xC4, 0x7A)),
    ("写入", "生成文档", "读 package.json，写 README 的安装章节。", "write_file 需要你确认，拒绝后它会换方案。", ACCENT_2),
]
for i, (tag, title, task, expect, color) in enumerate(tasks):
    x = MX + i * 4.0
    rect(s, x, 1.8, 3.75, 3.55, CARD, line_color=LINE, radius=0.05,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, x + 0.25, 2.0, 0.8, 0.3)
    add_p(tf, tag, size=10, bold=True, color=color, after=0)
    tf = textbox(s, x + 0.25, 2.3, 3.3, 0.4)
    add_p(tf, title, size=18, bold=True, color=INK, after=0)
    tf = textbox(s, x + 0.25, 2.85, 3.25, 0.8)
    add_p(tf, task, size=11.5, color=BODY, after=0, line=1.45)
    tf = textbox(s, x + 0.25, 3.85, 3.25, 1.2)
    add_p(tf, expect, size=10.5, color=MUTED, after=0, line=1.45)

rect(s, MX, 5.65, 11.9, 0.75, CARD_2, radius=0.12, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 1.0, 5.82, 11.3, 0.4)
add_p(tf, "每次运行都记录三件事：调了哪些工具、哪些被 ask、哪一步开始跑偏。", size=12, color=ACCENT, after=0)
tf = textbox(s, MX, 6.55, 11.9, 0.3)
add_p(tf, "任务失败不可怕，看不到它为什么失败才可怕。", size=11, color=MUTED, after=0)
note(s, "课堂至少演示第一个任务。让学员观察终端里的 tool_call 和权限提示，"
        "这是他们第一次「看见」agent 在工作。")

# ---------------------------------------------------------------- 21 上下文

s = slide_body("上下文会爆：三种处理", "03 · 上下文")
bullets(s, [
    "截断工具输出：单次最多 8000 字，超出就标一句「已截断」",
    "裁剪历史：只保留系统提示 + 最近 N 条消息",
    "大文件分段读：先 grep 定位，再按 offset / limit 读",
], y=1.8, size=15.5, w=7.6, gap=14)

code_panel(s, 8.35, 1.8, 4.35, 2.5, "裁剪历史", """const KEEP = 20
if (messages.length > KEEP + 1) {
  messages.splice(
    1, messages.length - KEEP - 1,
  )
}""", size=10, line=1.26)

rect(s, 8.35, 4.55, 4.35, 1.95, CARD, line_color=LINE, radius=0.05,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 8.62, 4.75, 3.8, 1.6)
add_p(tf, "更稳的做法", size=11, bold=True, color=ACCENT, after=6)
add_p(tf, "裁之前先让模型总结一段「目前已知什么」，把摘要放在系统消息里。", size=11, color=MUTED, after=0, line=1.45)

tf = textbox(s, MX, 5.6, 7.6, 0.9)
add_p(tf, "上下文不是越多越好：每一轮都要重新付费，而且越长越慢、越容易丢重点。",
      size=13, color=MUTED, after=0, line=1.4)
note(s, "用「工作台」比喻：桌面就那么大，堆满了就找不到东西。"
        "opencode 的 compaction 做的就是这个，只是更精细。")

# ---------------------------------------------------------------- 22 错误

s = slide_body("错误、重试与超时", "03 · 稳定性")
table(s, MX, 1.76, 11.9,
      ["情况", "错误做法", "正确做法"],
      [
          ["模型 429 / 5xx", "直接崩，任务丢失", "等 1s、2s、4s 重试 3 次"],
          ["工具抛异常", "整个进程退出", "转成字符串回灌，让模型自己改"],
          ["请求卡住", "无限等待", "AbortSignal.timeout(60_000)"],
          ["原地打转", "一直调到步数上限", "记录最近调用，重复就停"],
      ],
      widths=[3.2, 4.0, 4.7], row_h=0.72, head_h=0.46, size=13)

rect(s, MX, 5.5, 11.9, 0.95, CARD, line_color=LINE, radius=0.05,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, MX + 0.3, 5.7, 11.3, 0.6)
add_p(tf, "Agent 的稳定性，不取决于它多聪明，而取决于失败路径写得多完整。",
      size=14, bold=True, color=RGBColor(0xA9, 0xCF, 0xE7), after=0)
add_p(tf, "先让每一条失败都有去处，再谈能力。", size=11, color=MUTED, after=0)
note(s, "这一页直接决定学员做出来的东西能不能用。"
        "重点：工具错误不要 throw 到最外层，要变成 tool 消息。")

# ---------------------------------------------------------------- 23 分层

s = slide_body("像 opencode 一样分层", "03 · 架构")
layers = [
    ("入口", "CLI / TUI / Desktop / SDK", "packages/cli · packages/sdk"),
    ("会话与消息", "一个任务一个 Session，消息持久化", "packages/core · Session"),
    ("循环与执行", "决定下一步、调度工具、处理中断", "SessionRunner · SessionExecution"),
    ("模型适配", "统一不同 provider 的请求与流式返回", "packages/ai"),
    ("工具与权限", "工具注册、参数校验、allow / ask / deny", "packages/core/tool · schema"),
    ("存储与扩展", "事件、快照、插件、MCP", "packages/plugin · packages/schema"),
]
for i, (name, desc, ref) in enumerate(layers):
    y = 1.72 + i * 0.72
    rect(s, 0.55, y, 7.1, 0.6, CARD if i % 2 == 0 else CODE_BG, line_color=LINE, radius=0.04,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, 0.75, y + 0.14, 1.7, 0.32)
    add_p(tf, name, size=12, bold=True, color=INK, after=0)
    tf = textbox(s, 2.45, y + 0.15, 4.9, 0.32)
    add_p(tf, desc, size=10.5, color=MUTED, after=0)
    tf = textbox(s, 7.85, y + 0.14, 4.9, 0.32)
    add_p(tf, ref, size=9.5, color=ACCENT, mono=True, after=0)

tf = textbox(s, 0.55, 6.15, 12.3, 0.65)
add_p(tf, "你的 200 行是这六层的起点，不是替代品。每长大一次，就多一层。",
      size=13, color=INK, after=0)
add_p(tf, "你写的 while 循环，就是 SessionRunner 的祖先。", size=11, color=MUTED, after=0)
note(s, "让学员带着「分层」的视角去看 opencode 仓库。"
        "强调：不是让你重写 opencode，而是知道当需求变复杂时，该往哪一层加东西。")

# ---------------------------------------------------------------- 24 五个坑

s = slide_body("新手最常踩的五个坑", "03 · 排错")
table(s, MX, 1.76, 11.9,
      ["坑", "症状", "解法"],
      [
          ["忘记回灌工具结果", "模型反复请求同一个工具", "每次调用都 push 一条 tool 消息"],
          ["没有终止条件", "循环不停，余额下降", "maxSteps + 重复调用检测"],
          ["权限默认放行", "误删文件、误推代码", "默认 ask，危险动作 deny"],
          ["上下文无限增长", "越来越慢，最后报错", "截断输出 + 裁剪历史 + 摘要"],
          ["错误直接抛出", "一次失败，整轮任务崩溃", "把错误当工具结果回灌"],
      ],
      widths=[3.3, 4.1, 4.5], row_h=0.7, head_h=0.46, size=13)

tf = textbox(s, MX, 6.15, 11.9, 0.5)
add_p(tf, "排错顺序：先看消息数组，再看工具返回，最后才怀疑模型。", size=12, color=MUTED, after=0)
note(s, "把这张表当课堂检查表。学员卡住时，让他先说「属于哪一行」。"
        "经验：80% 的问题在第一条和第三条。")

# ---------------------------------------------------------------- 25 作业

s = slide_body("课后作业：把它变成你的", "03 · 作业")
items = [
    ("必做 1", "加一个 grep 工具", "参数 pattern、path，返回匹配行和行号。"),
    ("必做 2", "权限外置", "把 rules 搬进 permissions.json，启动时读取。"),
    ("必做 3", "加 --dry-run", "只打印要执行的操作，不真正执行。"),
    ("必做 4", "写一份 README", "让别人 5 分钟内能跑起来。"),
]
for i, (tag, title, desc) in enumerate(items):
    y = 1.78 + i * 1.12
    rect(s, MX, y, 7.45, 0.98, CARD, line_color=LINE, radius=0.05,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = textbox(s, MX + 0.25, y + 0.14, 1.1, 0.3)
    add_p(tf, tag, size=10, bold=True, color=ACCENT, after=0)
    tf = textbox(s, MX + 0.25, y + 0.36, 3.45, 0.35)
    add_p(tf, title, size=14.5, bold=True, color=INK, after=0)
    tf = textbox(s, MX + 3.75, y + 0.4, 3.5, 0.35)
    add_p(tf, desc, size=10.5, color=MUTED, after=0)

rect(s, 8.4, 1.78, 4.3, 3.65, CARD, line_color=LINE, radius=0.05,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE)
tf = textbox(s, 8.68, 2.0, 3.75, 3.25)
add_p(tf, "选做，拉开差距", size=11, bold=True, color=ACCENT, after=10)
add_p(tf, "子 Agent", size=12.5, bold=True, color=INK, after=3)
add_p(tf, "让主 Agent 通过工具再启动一个 Agent。", size=10.5, color=MUTED, after=10, line=1.4)
add_p(tf, "流式输出", size=12.5, bold=True, color=INK, after=3)
add_p(tf, "边生成边打印，体验会好很多。", size=10.5, color=MUTED, after=10, line=1.4)
add_p(tf, "会话持久化", size=12.5, bold=True, color=INK, after=3)
add_p(tf, "把 messages 存成文件，下次接着聊。", size=10.5, color=MUTED, after=0, line=1.4)

tf = textbox(s, 8.4, 5.65, 4.3, 0.7)
add_p(tf, "作业 1 是理解工具协议最快的方式：写完 grep，你就懂 parameters 了。",
      size=11, color=MUTED, after=0, line=1.4)
note(s, "作业围绕同一个程序迭代，不要开新项目。"
        "如果时间只够做一个，做 grep。")

# ---------------------------------------------------------------- 26 结语

s = prs.slides.add_slide(BLANK)
bg(s)
rect(s, 0.9, 1.5, 0.06, 0.55, ACCENT)
tf = textbox(s, 0.9, 2.2, 11.6, 2.1)
add_p(tf, "智能不是魔法。", size=36, bold=True, color=INK, after=10, line=1.2)
add_p(tf, "它是一个能正确收尾的循环。", size=36, bold=True, color=RGBColor(0xA9, 0xCF, 0xE7),
      after=0, line=1.2)

rect(s, 0.92, 4.62, 3.3, 0.05, ACCENT)

tf = textbox(s, 0.9, 4.95, 8.0, 1.0)
add_p(tf, "代码  courseware/from-zero-agent/agent.ts", size=12, color=ACCENT, mono=True, after=6)
add_p(tf, "下一步  加一个你自己的工具，然后读 opencode 的分层。", size=12, color=MUTED, after=0)

tf = textbox(s, 9.6, 6.55, 2.9, 0.35)
add_p(tf, "谢谢", size=14, bold=True, color=RGBColor(0x5A, 0x70, 0x86), align=PP_ALIGN.RIGHT, after=0)
note(s, "收尾只讲一句话：循环。不要再总结技术点。"
        "留 5 分钟答疑，鼓励学员现场跑通第一个任务。")

out = "from-zero-agent.pptx"
prs.save(out)
print(f"saved {out}: {len(prs.slides._sldIdLst)} slides")
