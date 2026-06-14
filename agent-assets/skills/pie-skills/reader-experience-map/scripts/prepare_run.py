#!/usr/bin/env python3
"""读者体验图谱 · ① 准备阶段。

用法:  python prepare_run.py <小说目录>

做的事:定位手稿章节、从 idea_seed 抽取目标读者、载入或新建 reader_state、
算出待处理章节,写出 <小说目录>/04_editing/reader_map/run_plan.json。
"""
import sys
import os
import re
import json
import glob
from datetime import datetime

BASIS = ["悲伤", "想笑", "恐惧", "高兴", "愤怒", "悬念", "好奇"]


def find_chapters(manuscript_dir):
    """扫描手稿目录,返回 {章号: 文件路径};识别『第N章』命名,跳过 .bak。"""
    chapters = {}
    if not os.path.isdir(manuscript_dir):
        return chapters
    for path in sorted(glob.glob(os.path.join(manuscript_dir, "*.md"))):
        name = os.path.basename(path)
        if name.endswith(".bak"):
            continue
        m = re.match(r"第\s*(\d+)\s*章", name)
        if m:
            chapters[int(m.group(1))] = path
    return chapters


def extract_target_reader(idea_seed_path):
    """从 idea_seed.md 抽取目标读者描述。返回 (文本, 警告)。
    优先找含『目标读者/目标受众』的行;其次找读者标题段;都没有则取开头并附警告。"""
    if not os.path.isfile(idea_seed_path):
        return None, "未找到 00_memory/idea_seed.md —— 核心读者人设缺失,请人工补充"
    with open(idea_seed_path, encoding="utf-8") as f:
        lines = f.read().splitlines()

    # 优先:含『目标读者 / 目标受众』的行(通常是 bullet)+ 其下更深缩进的子条目
    for i, line in enumerate(lines):
        if "目标读者" in line or "目标受众" in line:
            base = len(line) - len(line.lstrip())
            buf = [line.strip()]
            for nxt in lines[i + 1:]:
                if not nxt.strip():
                    break
                if len(nxt) - len(nxt.lstrip()) > base:
                    buf.append(nxt.strip())
                else:
                    break
            return "\n".join(buf), None

    # 其次:含『读者 / 受众』的标题段
    for i, line in enumerate(lines):
        if line.lstrip().startswith("#") and ("读者" in line or "受众" in line):
            level = len(line) - len(line.lstrip("#"))
            buf = [line]
            for nxt in lines[i + 1:]:
                if nxt.lstrip().startswith("#") and \
                        len(nxt) - len(nxt.lstrip("#")) <= level:
                    break
                buf.append(nxt)
            return "\n".join(buf).strip(), None

    return "\n".join(lines[:40]).strip(), \
        "idea_seed.md 中未找到『目标读者』段落,已改取开头部分,请人工确认"


def empty_state(novel):
    """新建一份空的 reader_state。"""
    return {
        "novel": novel,
        "last_chapter": 0,
        "updated_at": datetime.now().isoformat(timespec="seconds"),
        "shared": {"facts_known": [], "dramatic_irony": [], "open_questions": []},
        "readers": {
            "core": {
                "engagement": 50,
                "emotion_now": {"basis": {k: 0 for k in BASIS},
                                "drivers": [],
                                "carry_note": "(尚未开始阅读)",
                                "label": "(尚未开始阅读)"},
                "recent_arc": "(尚未开始)",
                "dispositions": {},
                "fatigue": [],
            }
        },
    }


def main():
    if len(sys.argv) != 2:
        print("用法: python prepare_run.py <小说目录>", file=sys.stderr)
        sys.exit(2)
    novel_dir = os.path.abspath(sys.argv[1])
    if not os.path.isdir(novel_dir):
        print(f"错误:小说目录不存在: {novel_dir}", file=sys.stderr)
        sys.exit(1)

    manuscript_dir = os.path.join(novel_dir, "03_manuscript")
    reader_map_dir = os.path.join(novel_dir, "04_editing", "reader_map")
    os.makedirs(os.path.join(reader_map_dir, "analysis"), exist_ok=True)

    warnings = []

    # 1. 章节
    chapters = find_chapters(manuscript_dir)
    if not chapters:
        print(f"错误:{manuscript_dir} 下没找到『第N章』命名的手稿", file=sys.stderr)
        sys.exit(1)
    all_ch = sorted(chapters)
    gaps = [n for n in range(all_ch[0], all_ch[-1] + 1) if n not in chapters]
    if gaps:
        warnings.append(f"章节缺号: {gaps}")

    # 2. reader_state(载入或新建)
    state_path = os.path.join(reader_map_dir, "reader_state.json")
    if os.path.isfile(state_path):
        with open(state_path, encoding="utf-8") as f:
            last_done = json.load(f).get("last_chapter", 0)
    else:
        with open(state_path, "w", encoding="utf-8") as f:
            json.dump(empty_state(os.path.basename(novel_dir)), f,
                      ensure_ascii=False, indent=2)
        last_done = 0

    # 3. 目标读者
    reader_text, w = extract_target_reader(
        os.path.join(novel_dir, "00_memory", "idea_seed.md"))
    if w:
        warnings.append(w)

    # 4. 待处理章节
    pending = [n for n in all_ch if n > last_done]

    run_plan = {
        "novel_dir": novel_dir,
        "manuscript_dir": manuscript_dir,
        "reader_map_dir": reader_map_dir,
        "chapter_files": {str(n): chapters[n] for n in all_ch},
        "core_reader": {
            "label": "核心目标读者",
            "source_text": reader_text or "(缺失,请人工补充目标读者画像)",
        },
        "all_chapters": all_ch,
        "last_done": last_done,
        "pending_chapters": pending,
        "warnings": warnings,
    }
    plan_path = os.path.join(reader_map_dir, "run_plan.json")
    with open(plan_path, "w", encoding="utf-8") as f:
        json.dump(run_plan, f, ensure_ascii=False, indent=2)

    print(f"run_plan.json 已写出: {plan_path}")
    print(f"  已写章节 {len(all_ch)} 章 | 已分析到 第{last_done}章 | 待处理 {len(pending)} 章")
    if pending:
        print(f"  待处理章号: {pending}")
    else:
        print("  没有待处理章节(都分析过了),可直接渲染。")
    for msg in warnings:
        print(f"  ⚠ {msg}")


if __name__ == "__main__":
    main()
