#!/usr/bin/env python3
"""Compare before/after crops and emit a small JSON summary."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

try:
    from PIL import Image, ImageChops
except ImportError:  # pragma: no cover
    print("Pillow is required. Install it with: python3 -m pip install pillow", file=sys.stderr)
    raise


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("before", type=Path)
    parser.add_argument("after", type=Path)
    parser.add_argument("--weak-threshold", type=float, default=0.02)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    with Image.open(args.before) as before_image, Image.open(args.after) as after_image:
        before = before_image.convert("RGB")
        after = after_image.convert("RGB")
        size_mismatch = before.size != after.size
        if size_mismatch:
            result = {
                "before": str(args.before),
                "after": str(args.after),
                "before_size": list(before.size),
                "after_size": list(after.size),
                "size_mismatch": True,
                "delta_ratio": None,
                "verdict_hint": "not_evaluable",
                "warning": "before and after crops have different sizes; recapture or crop the same region before judging visual delta",
            }
            text = json.dumps(result, indent=2)
            if args.output:
                args.output.parent.mkdir(parents=True, exist_ok=True)
                args.output.write_text(text + "\n", encoding="utf-8")
            print(text)
            return 0
        diff = ImageChops.difference(before, after)
        histogram = diff.histogram()
        weighted = sum(value * (index % 256) for index, value in enumerate(histogram))
        max_weighted = before.width * before.height * 3 * 255
        delta_ratio = weighted / max_weighted if max_weighted else 0.0

    result = {
        "before": str(args.before),
        "after": str(args.after),
        "before_size": list(before.size),
        "after_size": list(after.size),
        "size_mismatch": False,
        "delta_ratio": round(delta_ratio, 6),
        "verdict_hint": "weak_visual_delta" if delta_ratio < args.weak_threshold else "needs_visual_critic"
    }

    text = json.dumps(result, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text + "\n", encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
