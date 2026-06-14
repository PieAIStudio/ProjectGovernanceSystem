#!/usr/bin/env python3
"""Draw simple numbered boxes on a keyframe for owner review briefs."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover - depends on local environment
    print("ERROR: Pillow is required. Install pillow or use an environment that provides it.", file=sys.stderr)
    raise SystemExit(2)


def parse_box(value: str) -> dict[str, Any]:
    parts = [part.strip() for part in value.split(",", 5)]
    if len(parts) < 5:
        raise argparse.ArgumentTypeError("--box must be label,x,y,w,h[,caption]")
    label, x, y, w, h = parts[:5]
    caption = parts[5] if len(parts) == 6 else ""
    return {
        "label": label,
        "bbox": {"x": int(float(x)), "y": int(float(y)), "w": int(float(w)), "h": int(float(h))},
        "caption": caption,
    }


def load_spec(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit("ERROR: annotation spec must be a JSON object")
    return data


def draw_annotations(image_path: Path, output_path: Path, annotations: list[dict[str, Any]]) -> None:
    image = Image.open(image_path).convert("RGBA")
    overlay = Image.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)
    font = ImageFont.load_default()
    colors = [
        (255, 74, 74, 255),
        (255, 169, 64, 255),
        (72, 179, 255, 255),
        (92, 214, 92, 255),
        (214, 110, 255, 255),
    ]

    for index, item in enumerate(annotations):
        bbox = item.get("bbox") or {}
        try:
            x = int(bbox["x"])
            y = int(bbox["y"])
            w = int(bbox["w"])
            h = int(bbox["h"])
        except (KeyError, TypeError, ValueError) as exc:
            raise SystemExit(f"ERROR: invalid bbox for annotation {index}: {exc}") from exc

        label = str(item.get("label") or index + 1)
        color = colors[index % len(colors)]
        draw.rectangle([x, y, x + w, y + h], outline=color, width=4)
        badge_w = max(22, 10 + len(label) * 8)
        badge_h = 22
        badge_y = max(0, y - badge_h)
        draw.rectangle([x, badge_y, x + badge_w, badge_y + badge_h], fill=color)
        draw.text((x + 6, badge_y + 5), label, fill=(0, 0, 0, 255), font=font)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.alpha_composite(image, overlay).convert("RGB").save(output_path)
    print(str(output_path))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--box", action="append", type=parse_box, default=[])
    parser.add_argument("--json", type=Path, help="JSON spec with image, output, annotations")
    args = parser.parse_args()

    if args.json:
        spec = load_spec(args.json)
        image_path = Path(spec.get("image", ""))
        output_path = Path(spec.get("output", ""))
        annotations = spec.get("annotations", [])
    else:
        image_path = args.image
        output_path = args.out
        annotations = args.box

    if not image_path or not output_path:
        raise SystemExit("ERROR: provide --image and --out, or --json with image/output")
    if not annotations:
        raise SystemExit("ERROR: provide at least one annotation")
    if not image_path.exists():
        raise SystemExit(f"ERROR: image not found: {image_path}")

    draw_annotations(image_path, output_path, annotations)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
