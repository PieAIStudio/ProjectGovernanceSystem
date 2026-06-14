#!/usr/bin/env python3
"""Validate Experience Capture evidence packets."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REQUIRED = {
    "issue_id",
    "run_id",
    "source",
    "surface_type",
    "journey_step",
    "role",
    "severity",
    "issue_type",
    "category",
    "evidence_level",
    "evidence_type",
    "timestamp_start",
    "timestamp_end",
    "description",
    "source_hints",
    "related_packets",
    "recommended_next",
}

VALID_NEXT = {
    "fix-now",
    "map-to-work-item",
    "needs-more-evidence",
    "defer",
    "escalate-to-goalcascade",
    "send-to-screenwalk",
}

VALID_VERDICTS = {"fixed", "weak_visual_delta", "still_present", "regressed", "not_evaluable"}
VALID_RELATIONS = {"originated-from", "merged-from", "duplicates", "follow-up"}


def load_packets(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("packets"), list):
        return data["packets"]
    if isinstance(data, dict) and isinstance(data.get("issues"), list):
        return data["issues"]
    raise ValueError("Expected a JSON list or an object with packets/issues list")


def validate_packet(packet: dict, index: int, allow_needs_split: bool) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    missing = sorted(REQUIRED - set(packet))
    if missing:
        errors.append(f"packet[{index}] missing required fields: {', '.join(missing)}")

    issue_id = packet.get("issue_id", "")
    if not isinstance(issue_id, str) or not issue_id.startswith("EC-"):
        errors.append(f"packet[{index}] issue_id must start with EC-")

    if packet.get("source") != "experience-capture":
        errors.append(f"packet[{index}] source must be experience-capture")

    recommended_next = packet.get("recommended_next")
    if recommended_next not in VALID_NEXT:
        errors.append(f"packet[{index}] recommended_next invalid: {recommended_next!r}")

    if packet.get("evidence_type") == "video" and not packet.get("video_paths"):
        errors.append(f"packet[{index}] video evidence requires video_paths")

    if packet.get("issue_type") == "obstruction_candidate" and recommended_next != "send-to-screenwalk":
        errors.append(f"packet[{index}] obstruction_candidate should route to send-to-screenwalk")

    if packet.get("needs_split") is True:
        message = f"packet[{index}] needs_split is true; split into one phenomenon/fix per packet before handoff"
        if allow_needs_split:
            warnings.append(message)
        else:
            errors.append(message)

    related_packets = packet.get("related_packets", [])
    if not isinstance(related_packets, list):
        errors.append(f"packet[{index}] related_packets must be a list")
    else:
        for related_index, related in enumerate(related_packets):
            if not isinstance(related, dict):
                errors.append(f"packet[{index}].related_packets[{related_index}] must be an object")
                continue
            if not isinstance(related.get("issue_id"), str) or not related.get("issue_id"):
                errors.append(f"packet[{index}].related_packets[{related_index}].issue_id missing")
            if related.get("relation") not in VALID_RELATIONS:
                errors.append(f"packet[{index}].related_packets[{related_index}].relation invalid")

    after_verification = packet.get("after_verification")
    if after_verification is not None:
        if not isinstance(after_verification, dict):
            errors.append(f"packet[{index}] after_verification must be null or object")
        elif after_verification.get("verdict") not in VALID_VERDICTS:
            errors.append(f"packet[{index}] after_verification.verdict invalid")

    source_hints = packet.get("source_hints", [])
    if source_hints is not None:
        if not isinstance(source_hints, list):
            errors.append(f"packet[{index}] source_hints must be a list")
        else:
            for hint_index, hint in enumerate(source_hints):
                if not isinstance(hint, dict):
                    errors.append(f"packet[{index}].source_hints[{hint_index}] must be an object")
                    continue
                if hint.get("kind") not in {"code-path", "asset", "config"}:
                    errors.append(f"packet[{index}].source_hints[{hint_index}].kind invalid")
                if not isinstance(hint.get("path"), str) or not hint.get("path"):
                    errors.append(f"packet[{index}].source_hints[{hint_index}].path missing")

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    parser.add_argument(
        "--allow-needs-split",
        action="store_true",
        help="allow needs_split packets for inspection only; do not use for repair handoff",
    )
    args = parser.parse_args()

    try:
        packets = load_packets(args.path)
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    errors: list[str] = []
    warnings: list[str] = []
    for index, packet in enumerate(packets):
        if not isinstance(packet, dict):
            errors.append(f"packet[{index}] is not an object")
            continue
        packet_errors, packet_warnings = validate_packet(packet, index, args.allow_needs_split)
        errors.extend(packet_errors)
        warnings.extend(packet_warnings)

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    for warning in warnings:
        print(f"WARNING: {warning}", file=sys.stderr)
    print(f"OK: {len(packets)} experience packet(s) valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
