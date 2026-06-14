#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore").rstrip()


def resolve_path(run_dir: Path, raw_path: str) -> Path:
    candidate = Path(raw_path)
    if candidate.is_absolute():
        return candidate
    return (run_dir / candidate).resolve()


def expected_prompt_log_path(chapter_path: Path) -> Path:
    return chapter_path.with_name(f"{chapter_path.stem}-提示词log.md")


def infer_model(path: Path) -> str:
    name = path.name.lower()
    if "gemini" in name:
        return "gemini"
    if "claude" in name:
        return "claude"
    return "unknown"


def infer_loop(path: Path) -> str:
    name = path.name.lower()
    if "polish" in name:
        return "polish"
    if "gate" in name or "repair" in name:
        return "gate"
    if "draft" in name or "rewrite" in name:
        return "draft"
    return "unknown"


def infer_version(path: Path) -> int:
    match = re.search(r"_v(\d+)", path.stem.lower())
    if match:
        return int(match.group(1))
    return 1


def prompt_sort_key(path: Path) -> tuple[int, int, str]:
    loop_order = {"draft": 0, "gate": 1, "polish": 2, "unknown": 9}
    return (loop_order.get(infer_loop(path), 9), infer_version(path), path.name)


def infer_purpose(path: Path) -> str:
    model = infer_model(path)
    loop = infer_loop(path)
    version = infer_version(path)

    if model == "gemini" and loop == "draft":
        return "Gemini live 起草 / 重写"
    if model == "gemini" and loop == "gate":
        return f"Gemini 门禁回修第{version}轮"
    if model == "claude" and loop == "polish" and version == 1:
        return "Claude round3 minimal 首轮润色"
    if model == "claude" and loop == "polish":
        return f"Claude 根据主控问题单继续收口，第{version}轮润色"
    if loop == "draft":
        return f"{model} draft round {version}"
    if loop == "gate":
        return f"{model} gate round {version}"
    if loop == "polish":
        return f"{model} polish round {version}"
    return path.stem


def collect_prompt_files(run_dir: Path) -> list[Path]:
    return sorted(
        [path for path in run_dir.glob("*prompt*.md") if path.is_file()],
        key=prompt_sort_key,
    )


def build_prompt_log(prompt_files: list[Path]) -> str:
    sections = ["# 提示词总日志", ""]
    for index, path in enumerate(prompt_files, start=1):
        sections.extend(
            [
                f"## Round {index}",
                f"- loop: {infer_loop(path)}",
                f"- model: {infer_model(path)}",
                f"- purpose: {infer_purpose(path)}",
                f"- source_file: {path.name}",
                "",
                "```text",
                read_text(path),
                "```",
                "",
            ]
        )
    return "\n".join(sections).rstrip() + "\n"


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: compile_prompt_log.py <run-dir>", file=sys.stderr)
        return 1

    run_dir = Path(argv[1]).resolve()
    manifest_path = run_dir / "run_manifest.json"
    if not manifest_path.exists():
        print(f"run_manifest.json 不存在: {manifest_path}", file=sys.stderr)
        return 1

    manifest = json.loads(read_text(manifest_path))
    chapter_path_raw = manifest.get("chapter_path")
    if not chapter_path_raw:
        print("run_manifest.json 缺少 chapter_path，无法生成正文旁提示词日志", file=sys.stderr)
        return 1

    chapter_path = resolve_path(run_dir, str(chapter_path_raw))
    if not chapter_path.exists():
        print(f"chapter_path 不存在: {chapter_path}", file=sys.stderr)
        return 1

    prompt_files = collect_prompt_files(run_dir)
    if not prompt_files:
        print(f"未找到任何 prompt 文件: {run_dir}", file=sys.stderr)
        return 1

    output_path = expected_prompt_log_path(chapter_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(build_prompt_log(prompt_files), encoding="utf-8")
    print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
