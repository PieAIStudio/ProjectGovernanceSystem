#!/usr/bin/env python3
"""Normalize Gemini-like video review JSON into Experience Capture packets."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

SPLIT_CONNECTOR_RE = re.compile(r"(同时|并且|以及|，且|且| and | AND |;|；|\+)")
SPLIT_FIX_RE = re.compile(r"(；|;|\+| and | AND |以及|并且|同时)")

ISSUE_CLASS_PATTERNS = {
    "obstruction": re.compile(r"(obstruction|tooltip|blocked|blocking|遮挡|压头|挡住|覆盖)", re.I),
    "layout": re.compile(r"(layout|distance|cta|right|left|edge|ergonomics|距离|右下角|左下角|边缘|布局|动线)", re.I),
    "feedback": re.compile(r"(feedback|hit|combat|打击|反馈|受击|结算)", re.I),
    "timing": re.compile(r"(transition|loading|wait|timing|等待|加载|转场|节奏)", re.I),
    "copy": re.compile(r"(copy|text|wording|文字|文案|说明)", re.I),
    "hierarchy": re.compile(r"(density|hierarchy|comprehension|认知|密度|层级|理解|焦点)", re.I),
}


def parse_time_range(value: str) -> tuple[str, str]:
    text = value.strip()
    if "-" in text:
        start, end = [part.strip() for part in text.split("-", 1)]
        return start, end
    return text, text


def normalize_severity(value: Any) -> str:
    text = str(value or "Medium").strip().lower()
    if text in {"critical", "blocker"}:
        return "Blocker"
    if text == "high":
        return "High"
    if text in {"low", "later"}:
        return "Later"
    return "Medium"


def kebab(value: Any, fallback: str) -> str:
    text = str(value or fallback).strip().lower()
    text = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "-", text).strip("-")
    return text or fallback


def infer_issue_type(*parts: str) -> str:
    text = " ".join(str(part) for part in parts).lower()
    if any(word in text for word in ["audio", "sound", "silence", "音"]):
        return "audio"
    if any(word in text for word in ["obstruction", "tooltip", "blocked", "blocking", "遮挡", "压头", "挡住", "覆盖"]):
        return "obstruction_candidate"
    if any(word in text for word in ["feedback", "hit", "combat", "打击", "反馈"]):
        return "feedback"
    if any(word in text for word in ["snap", "tween", "跳变", "血条"]):
        return "state_transition"
    if any(word in text for word in ["transition", "loading", "等待", "加载"]):
        return "loading"
    if any(word in text for word in ["motion", "animation", "tween", "动效", "动画"]):
        return "motion"
    if any(word in text for word in ["density", "hierarchy", "visual hierarchy", "密度", "层级", "视觉引导", "焦点"]):
        return "visual_hierarchy"
    if any(word in text for word in ["comprehension", "cognitive", "理解", "认知", "看不懂"]):
        return "comprehension"
    return "other"


def recommended_next(issue_type: str, severity: str) -> str:
    if issue_type == "obstruction_candidate":
        return "send-to-screenwalk"
    if severity in {"Blocker", "High"}:
        return "fix-now"
    return "map-to-work-item"


def infer_evidence_level(*parts: str) -> str:
    text = " ".join(str(part) for part in parts).lower()
    if any(word in text for word in ["audio", "sound", "声音", "音效"]):
        return "audio-visible"
    if any(word in text for word in ["missing", "lack", "absent", "no ", "without", "没有", "无", "缺乏", "未"]):
        return "flow-inference"
    return "video-visible"


def issue_class_count(text: str) -> int:
    return sum(1 for pattern in ISSUE_CLASS_PATTERNS.values() if pattern.search(text))


def detect_needs_split(item: dict[str, Any]) -> tuple[bool, str]:
    observation = str(item.get("observation", ""))
    suggested_fix = str(item.get("suggested_fix", ""))
    combined = f"{observation} {suggested_fix}"
    if SPLIT_CONNECTOR_RE.search(combined) and SPLIT_FIX_RE.search(suggested_fix) and issue_class_count(combined) >= 2:
        return True, "reviewer issue appears to combine multiple phenomena or fixes"
    return False, ""


def normalize_lookup_key(value: Any) -> str:
    return kebab(value, "")


def parse_hint_cell(cell: str) -> list[dict[str, str]]:
    cleaned = cell.replace("`", "").strip()
    if not cleaned or cleaned.lower() in {"none", "n/a", "-"}:
        return []
    hints: list[dict[str, str]] = []
    for raw_part in re.split(r"\s*;\s*", cleaned):
        part = raw_part.strip()
        if not part:
            continue
        kind = "code-path"
        path = part
        if part.startswith("asset:"):
            kind = "asset"
            path = part.removeprefix("asset:").strip()
        elif part.startswith("config:"):
            kind = "config"
            path = part.removeprefix("config:").strip()
        elif part.startswith("code-path:"):
            path = part.removeprefix("code-path:").strip()
        hints.append({"kind": kind, "path": path})
    return hints


def load_adapter_hints(path: Path | None) -> dict[str, list[dict[str, str]]]:
    if path is None:
        return {}
    text = path.read_text(encoding="utf-8")
    in_source_hints = False
    hints: dict[str, list[dict[str, str]]] = {}
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line.startswith("## "):
            in_source_hints = line.lower().startswith("## source hints")
            continue
        if not in_source_hints or not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 2 or set(cells[0]) <= {"-", ":"}:
            continue
        header = cells[0].lower()
        if "key" in header or "surface" in header:
            continue
        keys = [normalize_lookup_key(key) for key in re.split(r"\s*,\s*", cells[0]) if key.strip()]
        parsed = parse_hint_cell(cells[-1])
        for key in keys:
            if key and parsed:
                hints[key] = parsed
    return hints


def hints_for_packet(adapter_hints: dict[str, list[dict[str, str]]], *keys: str) -> list[dict[str, str]]:
    seen: set[tuple[str, str]] = set()
    selected: list[dict[str, str]] = []
    for key in keys:
        for hint in adapter_hints.get(normalize_lookup_key(key), []):
            pair = (hint["kind"], hint["path"])
            if pair not in seen:
                seen.add(pair)
                selected.append(hint)
    return selected


def normalize_media_paths(paths: list[str], artifact_root: str | None) -> list[str]:
    if not artifact_root:
        return paths
    root = Path(artifact_root).expanduser().resolve()
    normalized: list[str] = []
    for raw_path in paths:
        path = Path(raw_path).expanduser()
        try:
            normalized.append(str(path.resolve().relative_to(root)))
        except ValueError:
            normalized.append(raw_path)
    return normalized


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("review_json", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--video-path", action="append", default=[])
    parser.add_argument("--surface-type", default="unknown")
    parser.add_argument("--journey-step", default="dynamic experience review")
    parser.add_argument("--default-role", default="multimodal reviewer")
    parser.add_argument("--adapter", type=Path)
    parser.add_argument("--artifact-root")
    args = parser.parse_args()

    review = json.loads(args.review_json.read_text(encoding="utf-8"))
    timeline = review.get("timeline_issues", [])
    if not isinstance(timeline, list):
        raise SystemExit("timeline_issues must be a list")

    adapter_hints = load_adapter_hints(args.adapter)
    video_paths = normalize_media_paths(args.video_path, args.artifact_root)
    packets: list[dict[str, Any]] = []
    for index, item in enumerate(timeline, start=1):
        if not isinstance(item, dict):
            continue
        start, end = parse_time_range(str(item.get("approximate_time", "")))
        severity = normalize_severity(item.get("severity"))
        raw_type = str(item.get("issue_type", "other"))
        raw_category = str(item.get("category", "other"))
        issue_type = infer_issue_type(
            raw_type,
            raw_category,
            str(item.get("observation", "")),
            str(item.get("suggested_fix", "")),
            str(item.get("evidence_from_video", "")),
        )
        category = kebab(raw_category, "other")
        needs_split, split_reason = detect_needs_split(item)
        packet = {
            "issue_id": f"EC-{index:03d}",
            "run_id": args.run_id,
            "source": "experience-capture",
            "surface_type": args.surface_type,
            "journey_step": args.journey_step,
            "role": item.get("role") or args.default_role,
            "severity": severity,
            "layer": "Game feel" if args.surface_type == "game" else "UX",
            "issue_type": issue_type,
            "category": category,
            "evidence_level": infer_evidence_level(
                str(item.get("observation", "")),
                str(item.get("suggested_fix", "")),
                str(item.get("evidence_from_video", "")),
            ),
            "evidence_type": "video",
            "video_paths": video_paths,
            "artifact_root": args.artifact_root,
            "sequence_paths": [],
            "timestamp_start": start,
            "timestamp_end": end,
            "evidence_from_media": item.get("evidence_from_video", ""),
            "description": item.get("observation", ""),
            "suggested_fix": item.get("suggested_fix", ""),
            "source_hints": hints_for_packet(adapter_hints, category, raw_category, issue_type, raw_type, args.journey_step),
            "related_packets": [],
            "merged_with": [],
            "needs_split": needs_split,
            "owner_decision_required": False,
            "cascade_conflict": "none",
            "after_verification": None,
            "recommended_next": recommended_next(issue_type, severity),
        }
        if item.get("why_it_matters"):
            packet["why_it_matters"] = item["why_it_matters"]
        if split_reason:
            packet["split_reason"] = split_reason
        packets.append(packet)

    args.out.write_text(json.dumps({"packets": packets}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(packets)} packet(s) to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
