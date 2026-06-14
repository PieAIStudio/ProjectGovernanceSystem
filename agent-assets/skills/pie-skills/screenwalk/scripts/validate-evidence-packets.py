#!/usr/bin/env python3
"""Validate ScreenWalk evidence packets for required structured fields."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

OBSTRUCTION_CATEGORIES = {
    "head-covered",
    "cta-blocked",
    "text-clipped",
    "unreadable",
    "off-canvas",
    "overlap",
    "hud-blocking",
    "modal-blocking",
}

AFTER_VERDICTS = {"fixed", "weak_visual_delta", "still_present", "regressed", "not_evaluable"}
VALID_NEXT = {
    "fix-now",
    "map-to-work-item",
    "needs-more-evidence",
    "defer",
    "escalate-to-goalcascade",
    "send-to-experience-capture",
}
VALID_RELATIONS = {"originated-from", "merged-from", "duplicates", "follow-up"}


def load_packets(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("evidence_packets", "issues", "packets"):
            value = data.get(key)
            if isinstance(value, list):
                return value
    raise SystemExit("expected a JSON array or an object containing evidence_packets/issues/packets")


def require(condition: bool, errors: list[str], issue_id: str, message: str) -> None:
    if not condition:
        errors.append(f"{issue_id}: {message}")


def validate_packet(packet: dict[str, Any], require_after: bool) -> list[str]:
    issue_id = str(packet.get("issue_id") or "<missing issue_id>")
    errors: list[str] = []
    required = [
        "issue_id",
        "run_id",
        "source",
        "screen_id",
        "screen_label",
        "surface_type",
        "journey_step",
        "role",
        "severity",
        "layer",
        "issue_type",
        "category",
        "evidence_level",
        "evidence_type",
        "evidence_paths",
        "source_hints",
        "related_packets",
        "visual_region",
        "description",
        "repro_steps",
        "recommended_next",
    ]
    for key in required:
        require(key in packet, errors, issue_id, f"missing {key}")

    source_hints = packet.get("source_hints")
    if source_hints is not None:
        require(isinstance(source_hints, list), errors, issue_id, "source_hints must be a list")
        for index, hint in enumerate(source_hints or []):
            require(isinstance(hint, dict), errors, issue_id, f"source_hints[{index}] must be an object")
            require(hint.get("kind") in {"code-path", "asset", "config"}, errors, issue_id, f"source_hints[{index}].kind is invalid")
            require(isinstance(hint.get("path"), str) and bool(hint.get("path")), errors, issue_id, f"source_hints[{index}].path is required")

    related_packets = packet.get("related_packets")
    if related_packets is not None:
        require(isinstance(related_packets, list), errors, issue_id, "related_packets must be a list")
        for index, related in enumerate(related_packets or []):
            require(isinstance(related, dict), errors, issue_id, f"related_packets[{index}] must be an object")
            if isinstance(related, dict):
                require(isinstance(related.get("issue_id"), str) and bool(related.get("issue_id")), errors, issue_id, f"related_packets[{index}].issue_id is required")
                require(related.get("relation") in VALID_RELATIONS, errors, issue_id, f"related_packets[{index}].relation is invalid")

    require(packet.get("recommended_next") in VALID_NEXT, errors, issue_id, "recommended_next is invalid")

    category = packet.get("category")
    issue_type = packet.get("issue_type")
    is_obstruction = issue_type == "visual_obstruction" or category in OBSTRUCTION_CATEGORIES
    if is_obstruction:
        require(category in OBSTRUCTION_CATEGORIES, errors, issue_id, "visual obstruction category is invalid")
        require(packet.get("recommended_next") == "fix-now", errors, issue_id, "visual obstruction should be recommended_next=fix-now")
        require(isinstance(packet.get("crop_paths"), list) and len(packet.get("crop_paths")) >= 1, errors, issue_id, "visual obstruction requires crop_paths")
        bbox = packet.get("bbox")
        require(isinstance(bbox, dict), errors, issue_id, "visual obstruction requires bbox object")
        if isinstance(bbox, dict):
            for key in ("image_ref", "x", "y", "w", "h"):
                require(key in bbox, errors, issue_id, f"bbox missing {key}")
        findings = packet.get("obstruction_findings")
        require(isinstance(findings, list) and len(findings) >= 1, errors, issue_id, "visual obstruction requires obstruction_findings")
        for index, finding in enumerate(findings or []):
            require(isinstance(finding, dict), errors, issue_id, f"obstruction_findings[{index}] must be an object")
            for key in ("obstructed", "obstructor", "category", "evidence_crop"):
                require(key in finding and bool(finding.get(key)), errors, issue_id, f"obstruction_findings[{index}] missing {key}")
        require(isinstance(packet.get("source_hints"), list) and len(packet.get("source_hints")) >= 1, errors, issue_id, "visual obstruction requires source_hints")

    if require_after:
        after = packet.get("after_verification")
        require(isinstance(after, dict), errors, issue_id, "after_verification object is required")
        if isinstance(after, dict):
            require(after.get("verdict") in AFTER_VERDICTS, errors, issue_id, "after_verification.verdict is invalid")
            require(isinstance(after.get("after_crop_paths"), list), errors, issue_id, "after_verification.after_crop_paths must be a list")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path)
    parser.add_argument("--require-after", action="store_true")
    args = parser.parse_args()

    packets = load_packets(args.path)
    errors: list[str] = []
    for packet in packets:
        if not isinstance(packet, dict):
            errors.append("packet must be an object")
            continue
        errors.extend(validate_packet(packet, args.require_after))

    if errors:
        print("Evidence packet validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Evidence packet validation passed: {len(packets)} packet(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
