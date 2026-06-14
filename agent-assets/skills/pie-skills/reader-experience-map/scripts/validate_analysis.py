#!/usr/bin/env python3
"""读者体验图谱 · 校验一份 chNNNN.analysis.json 是否合规。

用法:  python validate_analysis.py <analysis.json 路径>

合规 → 退出码 0;不合规 → 退出码 1,并逐条打印问题(供主技能转告子 Agent)。
"""
import sys
import os
import re
import json

BASIS = ["悲伤", "想笑", "恐惧", "高兴", "愤怒", "悬念", "好奇"]


def validate(path):
    errs = []
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return [f"不是合法 JSON: {e}"]

    ch = data.get("chapter")
    if not isinstance(ch, int):
        errs.append("缺少整数字段 chapter")
    else:
        m = re.search(r"ch(\d+)\.analysis\.json$", os.path.basename(path))
        if m and int(m.group(1)) != ch:
            errs.append(f"chapter({ch}) 与文件名章号({int(m.group(1))})不一致")

    beats = data.get("beats")
    if not isinstance(beats, list) or not beats:
        errs.append("beats 必须是非空列表")
        beats = []
    for i, b in enumerate(beats):
        tag = f"beat[{i}]"
        if not isinstance(b, dict):
            errs.append(f"{tag} 不是对象")
            continue
        for k in ("id", "summary", "cognition", "arc"):
            if k not in b:
                errs.append(f"{tag} 缺 {k}")
        cog = b.get("cognition", {})
        for k in ("new_info", "info_gap"):
            if k not in cog:
                errs.append(f"{tag}.cognition 缺 {k}")
        # arc:关键帧序列
        arc = b.get("arc")
        if not isinstance(arc, list) or not arc:
            errs.append(f"{tag}.arc 必须是非空的关键帧列表")
            arc = []
        for j, kf in enumerate(arc):
            kt = f"{tag}.arc[{j}]"
            if not isinstance(kf, dict):
                errs.append(f"{kt} 不是对象")
                continue
            if not str(kf.get("at", "")).strip():
                errs.append(f"{kt} 缺 at")
            if not str(kf.get("why", "")).strip():
                errs.append(f"{kt} 缺 why")
            core = kf.get("emotion", {}).get("core")
            if not isinstance(core, dict):
                errs.append(f"{kt}.emotion 缺 core")
                continue
            basis = core.get("basis", {})
            for d in BASIS:
                v = basis.get(d)
                if not isinstance(v, (int, float)):
                    errs.append(f"{kt}.basis 缺『{d}』或非数值")
                elif not 0 <= v <= 100:
                    errs.append(f"{kt}.basis.{d}={v} 超出 0–100")
            for nm in core.get("named", []):
                if not isinstance(nm, dict):
                    errs.append(f"{kt} 的 named 项必须是 {{name, why}} 对象,"
                                f"不能是裸字符串: {nm!r}")
                    continue
                if not str(nm.get("why", "")).strip():
                    errs.append(f"{kt} 的 named『{nm.get('name', '?')}』缺 why")
        for j, fl in enumerate(b.get("flags", [])):
            if not isinstance(fl, dict):
                errs.append(f"{tag}.flags[{j}] 不是对象")
                continue
            for k in ("type", "why", "fix"):
                if not str(fl.get(k, "")).strip():
                    errs.append(f"{tag}.flags[{j}] 缺 {k}")

    rollup = data.get("chapter_rollup", {})
    for k in ("shape", "end_hook", "verdict"):
        if k not in rollup:
            errs.append(f"chapter_rollup 缺 {k}")
    su = data.get("state_update")
    if not isinstance(su, dict):
        errs.append("缺 state_update")
    else:
        ec = su.get("emotion_carry")
        if not isinstance(ec, dict):
            errs.append("state_update 缺 emotion_carry")
        else:
            if not str(ec.get("carry_note", "")).strip():
                errs.append("emotion_carry 缺 carry_note")
            drivers = ec.get("drivers")
            if not isinstance(drivers, list):
                errs.append("emotion_carry.drivers 必须是数组")
            else:
                for j, dr in enumerate(drivers):
                    if not isinstance(dr, dict):
                        errs.append(f"emotion_carry.drivers[{j}] 不是对象")
                        continue
                    for k in ("dim", "level", "why"):
                        if k not in dr or not str(dr.get(k, "")).strip():
                            errs.append(f"emotion_carry.drivers[{j}] 缺 {k}")
    if data.get("state_health") not in ("ok", "warn"):
        errs.append("state_health 必须是 'ok' 或 'warn'")

    return errs


def main():
    if len(sys.argv) != 2:
        print("用法: python validate_analysis.py <analysis.json 路径>", file=sys.stderr)
        sys.exit(2)
    errs = validate(sys.argv[1])
    if errs:
        print(f"✗ 校验失败,{len(errs)} 个问题:")
        for e in errs:
            print(f"  - {e}")
        sys.exit(1)
    print("✓ 校验通过")
    sys.exit(0)


if __name__ == "__main__":
    main()
