#!/usr/bin/env python3
"""读者体验图谱 · 把一章的 state_update 滚进 reader_state.json。

用法:  python roll_state.py <小说目录> <analysis.json 路径>

每章分析校验通过后调用。完成后 reader_state 的 last_chapter 推进一章,形成断点。
"""
import sys
import os
import json
from datetime import datetime


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def next_id(items, prefix):
    """根据已有 id 生成下一个,如 f001 / q012。"""
    nums = []
    for it in items:
        i = str(it.get("id", ""))
        if i.startswith(prefix) and i[len(prefix):].isdigit():
            nums.append(int(i[len(prefix):]))
    return f"{prefix}{(max(nums) + 1 if nums else 1):03d}"


def main():
    if len(sys.argv) != 3:
        print("用法: python roll_state.py <小说目录> <analysis.json 路径>", file=sys.stderr)
        sys.exit(2)
    novel_dir, analysis_path = sys.argv[1], sys.argv[2]
    state_path = os.path.join(novel_dir, "04_editing", "reader_map", "reader_state.json")

    with open(state_path, encoding="utf-8") as f:
        state = json.load(f)
    with open(analysis_path, encoding="utf-8") as f:
        a = json.load(f)

    ch = a["chapter"]
    su = a.get("state_update", {})
    shared = state["shared"]
    core = state["readers"]["core"]

    # 新事实
    for fact in su.get("add_facts", []):
        shared["facts_known"].append(
            {"id": next_id(shared["facts_known"], "f"), "since": ch, "fact": fact})

    # 新悬念
    for q in su.get("add_questions", []):
        shared["open_questions"].append({
            "id": next_id(shared["open_questions"], "q"),
            "since": ch, "q": q.get("q", ""), "type": q.get("type", "悬念"),
            "status": "open", "resolved_at": None})

    # 解决悬念
    to_resolve = set(su.get("resolve_questions", []))
    for q in shared["open_questions"]:
        if q["id"] in to_resolve and q["status"] == "open":
            q["status"] = "resolved"
            q["resolved_at"] = ch

    # 角色态度变化
    for name, shift in su.get("disposition_shifts", {}).get("core", {}).items():
        d = core["dispositions"].get(name, {"score": 0, "why": ""})
        d["score"] = clamp(d["score"] + shift.get("delta", 0), -100, 100)
        if shift.get("note"):
            d["why"] = shift["note"]
        core["dispositions"][name] = d

    # 近况弧线 / 投入度
    if su.get("recent_arc"):
        core["recent_arc"] = su["recent_arc"]
    if isinstance(su.get("engagement"), (int, float)):
        core["engagement"] = clamp(su["engagement"], 0, 100)

    # 当前情绪基线 = 本章最后一个 beat 的最后一个关键帧
    beats = a.get("beats", [])
    if beats:
        arc = beats[-1].get("arc", [])
        if arc:
            last = arc[-1].get("emotion", {}).get("core", {})
            if last.get("basis"):
                core["emotion_now"]["basis"] = last["basis"]
            named = last.get("named", [])
            core["emotion_now"]["label"] = (
                named[0]["name"] if named
                else a.get("chapter_rollup", {}).get("shape", ""))
    # 情绪接力棒:把 emotion_carry 滚进 emotion_now(连续性的核心)
    ec = su.get("emotion_carry", {})
    if isinstance(ec, dict):
        core["emotion_now"]["drivers"] = ec.get("drivers", [])
        if str(ec.get("carry_note", "")).strip():
            core["emotion_now"]["carry_note"] = ec["carry_note"]

    state["last_chapter"] = ch
    state["updated_at"] = datetime.now().isoformat(timespec="seconds")

    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    print(f"reader_state 已滚动到 第{ch}章 (state_health={a.get('state_health', '?')})")


if __name__ == "__main__":
    main()
