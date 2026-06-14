#!/usr/bin/env python3
"""Split an image into a grid of crops."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    print("Pillow is required. Install it with: python3 -m pip install pillow", file=sys.stderr)
    raise


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--rows", type=int, default=3)
    parser.add_argument("--cols", type=int, default=3)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--prefix", default=None)
    args = parser.parse_args()

    if args.rows <= 0 or args.cols <= 0:
        raise SystemExit("rows and cols must be positive")

    with Image.open(args.image) as image:
        args.output_dir.mkdir(parents=True, exist_ok=True)
        prefix = args.prefix or args.image.stem
        cell_w = image.width / args.cols
        cell_h = image.height / args.rows
        for row in range(args.rows):
            for col in range(args.cols):
                left = round(col * cell_w)
                top = round(row * cell_h)
                right = round((col + 1) * cell_w)
                bottom = round((row + 1) * cell_h)
                crop = image.crop((left, top, right, bottom))
                output = args.output_dir / f"{prefix}-r{row + 1}c{col + 1}.png"
                crop.save(output)
                print(output)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
