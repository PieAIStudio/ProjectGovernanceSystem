#!/usr/bin/env python3
"""Crop one rectangular region from an image.

Usage:
  crop-region.py image.png --bbox x,y,w,h --output crop.png
"""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    print("Pillow is required. Install it with: python3 -m pip install pillow", file=sys.stderr)
    raise


def parse_bbox(value: str) -> tuple[int, int, int, int]:
    parts = [part.strip() for part in value.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("bbox must be x,y,w,h")
    try:
        x, y, w, h = (int(part) for part in parts)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("bbox values must be integers") from exc
    if w <= 0 or h <= 0:
        raise argparse.ArgumentTypeError("bbox width and height must be positive")
    return x, y, w, h


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--bbox", required=True, type=parse_bbox, help="x,y,w,h")
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    with Image.open(args.image) as image:
        x, y, w, h = args.bbox
        left = max(0, x)
        top = max(0, y)
        right = min(image.width, x + w)
        bottom = min(image.height, y + h)
        if left >= right or top >= bottom:
            raise SystemExit(f"bbox {args.bbox} is outside {args.image}")
        crop = image.crop((left, top, right, bottom))
        args.output.parent.mkdir(parents=True, exist_ok=True)
        crop.save(args.output)

    print(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
