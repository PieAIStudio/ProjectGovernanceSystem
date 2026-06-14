#!/usr/bin/env python3
"""Create a Markdown owner review brief scaffold from experience packets."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp"}


def load_packets(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("experience_packets", "evidence_packets", "packets", "issues"):
            value = data.get(key)
            if isinstance(value, list):
                return value
    raise SystemExit("ERROR: expected a JSON array or object containing experience_packets/evidence_packets/packets/issues")


def as_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def first_media(packet: dict[str, Any]) -> str:
    for key in ("annotated_paths", "sequence_paths", "video_paths", "crop_paths", "evidence_paths"):
        for item in as_list(packet.get(key)):
            if isinstance(item, str) and item:
                return item
    return ""


def md_media(path: str) -> str:
    if not path:
        return "_No media path recorded._"
    suffix = Path(path).suffix.lower()
    if suffix in IMAGE_SUFFIXES:
        return f"![Evidence]({path})"
    return f"`{path}`"


def format_related(packet: dict[str, Any]) -> str:
    related = []
    for item in as_list(packet.get("related_packets")):
        if isinstance(item, dict):
            issue_id = item.get("issue_id", "")
            relation = item.get("relation", "")
            if issue_id:
                related.append(f"{issue_id} ({relation})" if relation else str(issue_id))
    merged = as_list(packet.get("merged_with"))
    for issue_id in merged:
        if isinstance(issue_id, str) and issue_id:
            related.append(f"{issue_id} (merged_with)")
    return ", ".join(related) if related else "none"


def severity_rank(packet: dict[str, Any]) -> tuple[int, str]:
    order = {"Blocker": 0, "High": 1, "Medium": 2, "Later": 3}
    return (order.get(str(packet.get("severity")), 9), str(packet.get("issue_id", "")))


def build_markdown(packets: list[dict[str, Any]], title: str, source_path: Path) -> str:
    sorted_packets = sorted(packets, key=severity_rank)
    lines: list[str] = [
        f"# {title}",
        "",
        "## 0. Scope",
        f"- packet_source: `{source_path}`",
        f"- packet_count: {len(packets)}",
        "- mode: review-only by default; repair requires owner-selected issue IDs",
        "- capture backend: TODO",
        "- reviewer backend: TODO",
        "",
        "## 1. Executive Summary",
        "- strongest dynamic pattern: TODO",
        "- biggest blocker: TODO",
        "- safest quick win: TODO",
        "- needs ScreenWalk confirmation: TODO",
        "- owner decision needed: TODO",
        "",
        "## 2. Clip / Packet Index",
        "| Issue | Timestamp | Severity | Recommended next | Related | Evidence |",
        "| --- | --- | --- | --- | --- | --- |",
    ]

    for packet in sorted_packets:
        timestamp = f"{packet.get('timestamp_start', '')}-{packet.get('timestamp_end', '')}"
        lines.append(
            f"| `{packet.get('issue_id', '')}` | {timestamp} | {packet.get('severity', '')} | "
            f"{packet.get('recommended_next', '')} | {format_related(packet)} | `{first_media(packet)}` |"
        )

    lines.extend(["", "## 3. Top Findings"])
    for index, packet in enumerate(sorted_packets[:10], start=1):
        desc = str(packet.get("description") or packet.get("suggested_fix") or "").replace("\n", " ")
        lines.append(f"{index}. `{packet.get('issue_id', '')}` {desc}")

    lines.extend(["", "## 4. Annotated / Keyframe Evidence"])
    for packet in sorted_packets:
        issue_id = str(packet.get("issue_id", ""))
        title_text = str(packet.get("journey_step") or packet.get("category") or "Finding")
        timestamp = f"{packet.get('timestamp_start', '')}-{packet.get('timestamp_end', '')}"
        lines.extend(
            [
                f"### {issue_id} · {title_text}",
                f"Timestamp: `{timestamp}`",
                "",
                md_media(first_media(packet)),
                "",
                f"Recommended next: `{packet.get('recommended_next', '')}`",
                f"Related packets: {format_related(packet)}",
                f"Needs split: `{packet.get('needs_split', False)}`",
                f"Owner decision required: `{packet.get('owner_decision_required', False)}`",
                "",
                "Media paths:",
            ]
        )
        for key in ("annotated_paths", "sequence_paths", "video_paths", "crop_paths", "evidence_paths"):
            for item in as_list(packet.get(key)):
                if isinstance(item, str) and item:
                    lines.append(f"- `{item}`")
        lines.extend(
            [
                "",
                "Numbered notes:",
                "1. TODO: what happens at this timestamp.",
                "2. TODO: why it matters for timing, feedback, sound, or state transition.",
                "3. TODO: suggested direction; not approved until owner selects it.",
                "",
                "Owner decision:",
                "- [ ] fix-now",
                "- [ ] send-to-screenwalk",
                "- [ ] needs more evidence",
                "- [ ] defer",
                "- [ ] escalate to goalcascade",
                "",
            ]
        )

    lines.extend(["## 5. Split / Validation Queue", "| Packet | Problem | Required recovery |", "| --- | --- | --- |"])
    for packet in sorted_packets:
        if packet.get("needs_split") is True:
            lines.append(f"| `{packet.get('issue_id', '')}` | compound issue | split before repair |")
    lines.extend(
        [
            "",
            "## 6. Decision Queue",
            "| Issue ID | Candidate decision | Owner decision | Related | Notes |",
            "| --- | --- | --- | --- | --- |",
        ]
    )
    for packet in sorted_packets:
        lines.append(
            f"| `{packet.get('issue_id', '')}` | {packet.get('recommended_next', '')} | "
            f"TODO | {format_related(packet)} | |"
        )

    lines.extend(["", "## 7. Appendix", "- This file is a scaffold. Review and tighten wording before owner handoff."])
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--packets", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--title", default="Experience Capture Owner Review Brief")
    args = parser.parse_args()

    packets = load_packets(args.packets)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(build_markdown(packets, args.title, args.packets), encoding="utf-8")
    print(str(args.out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
