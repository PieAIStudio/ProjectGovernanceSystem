#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


REQUIRED_ARTIFACTS = [
    "run_manifest.json",
    "draft_issue_sheet.md",
    "gate_issue_sheet.md",
    "polish_issue_sheet.md",
    "orchestration_report.md",
]
REQUIRED_MANIFEST_FIELDS = [
    "task_mode",
    "final_status",
    "chapter_path",
    "controller_role",
    "draft_model",
    "repair_model",
    "polish_model",
    "loops",
]
META_PATTERNS = [
    r"\[说明\]",
    r"TODO",
    r"CHAPTER_BRIEF_START",
    r"NOVEL_TEXT_START",
    r"```",
]
TITLE_RE = re.compile(r"^(?:#\s*)?第[一二三四五六七八九十百千0-9]+章")
PROMPT_LOG_TITLE_RE = re.compile(r"(?m)^#\s*提示词总日志\s*$")
PROMPT_LOG_ROUND_RE = re.compile(r"(?m)^##\s+Round\s+\d+\s*$")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def resolve_path(run_dir: Path, raw_path: str) -> Path:
    candidate = Path(raw_path)
    if candidate.is_absolute():
        return candidate
    return (run_dir / candidate).resolve()


def validate_manifest(run_dir: Path, manifest: dict, errors: list[str]) -> Path | None:
    for field in REQUIRED_MANIFEST_FIELDS:
        if field not in manifest:
            errors.append(f"run_manifest.json 缺少字段: {field}")

    if errors:
        return None

    blocked = manifest.get("final_status") == "blocked"

    if blocked:
        if not manifest.get("block_reason"):
            errors.append("blocked run 的 run_manifest.json 必须提供 block_reason")
        if not manifest.get("next_action"):
            errors.append("blocked run 的 run_manifest.json 必须提供 next_action")
    elif not isinstance(manifest["loops"], list) or not manifest["loops"]:
        errors.append("run_manifest.json 的 loops 必须是非空列表")
        return None

    controller_role = manifest["controller_role"]
    seen_names: set[str] = set()
    for loop in manifest["loops"]:
        for field in ("name", "writer", "status"):
            if field not in loop:
                errors.append(f"loop 缺少字段: {field}")
                continue
        if loop.get("writer") == controller_role:
            errors.append(
                f"循环 {loop.get('name', '<unknown>')} 的 writer 不得等于 controller_role ({controller_role})"
            )
        name = loop.get("name")
        if isinstance(name, str):
            seen_names.add(name)

    if "draft" in seen_names:
        draft_loop = next(loop for loop in manifest["loops"] if loop["name"] == "draft")
        if draft_loop["writer"] != manifest["draft_model"]:
            errors.append("draft 循环 writer 必须等于 draft_model")

    if "gate" in seen_names:
        gate_loop = next(loop for loop in manifest["loops"] if loop["name"] == "gate")
        if gate_loop["writer"] != manifest["repair_model"]:
            errors.append("gate 循环 writer 必须等于 repair_model")

    if "polish" in seen_names:
        polish_loop = next(loop for loop in manifest["loops"] if loop["name"] == "polish")
        if polish_loop["writer"] != manifest["polish_model"]:
            errors.append("polish 循环 writer 必须等于 polish_model")

    raw_chapter_path = manifest["chapter_path"]
    if blocked:
        if raw_chapter_path:
            chapter_path = resolve_path(run_dir, str(raw_chapter_path))
            if not chapter_path.exists():
                errors.append(f"blocked run 指向了不存在的 chapter_path: {chapter_path}")
        return None

    chapter_path = resolve_path(run_dir, str(raw_chapter_path))
    if not chapter_path.exists():
        errors.append(f"chapter_path 不存在: {chapter_path}")
        return None
    return chapter_path


def validate_chapter_text(chapter_path: Path, errors: list[str]) -> None:
    text = read_text(chapter_path)
    nonempty_lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not nonempty_lines:
        errors.append("章节正文为空")
        return

    first_line = nonempty_lines[0]
    if TITLE_RE.match(first_line):
        errors.append("章节正文不应以章节标题或 markdown heading 起手")

    for pattern in META_PATTERNS:
        if re.search(pattern, text):
            errors.append(f"章节正文含有 meta 污染: {pattern}")


def expected_prompt_log_path(chapter_path: Path) -> Path:
    return chapter_path.with_name(f"{chapter_path.stem}-提示词log.md")


def validate_prompt_log(prompt_log_path: Path, errors: list[str]) -> None:
    if not prompt_log_path.exists():
        errors.append(f"缺少正文旁提示词总日志: {prompt_log_path.name}")
        return

    text = read_text(prompt_log_path)
    if not text.strip():
        errors.append("提示词总日志为空")
        return

    if not PROMPT_LOG_TITLE_RE.search(text):
        errors.append("提示词总日志格式错误: 缺少 '# 提示词总日志' 标题")

    round_matches = list(PROMPT_LOG_ROUND_RE.finditer(text))
    if not round_matches:
        errors.append("提示词总日志格式错误: 缺少按轮次记录的 '## Round N' section")
        return

    for index, match in enumerate(round_matches, start=1):
        section_start = match.end()
        section_end = round_matches[index].start() if index < len(round_matches) else len(text)
        section = text[section_start:section_end]

        for field in ("loop", "model", "purpose"):
            if not re.search(rf"(?m)^- {field}:\s*.+$", section):
                errors.append(f"提示词总日志格式错误: Round {index} 缺少字段 '{field}'")

        if not re.search(r"```(?:text)?\n[\s\S]+?\n```", section):
            errors.append(f"提示词总日志格式错误: Round {index} 缺少完整提示词代码块")


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(
            json.dumps(
                {"passed": False, "errors": ["usage: validate_orchestration_run.py <run-dir>"], "warnings": []},
                ensure_ascii=False,
            )
        )
        return 1

    run_dir = Path(argv[1]).resolve()
    errors: list[str] = []
    warnings: list[str] = []

    if not run_dir.exists():
        errors.append(f"run 目录不存在: {run_dir}")
    else:
        for artifact in REQUIRED_ARTIFACTS:
            artifact_path = run_dir / artifact
            if not artifact_path.exists():
                errors.append(f"缺少工件: {artifact}")

    chapter_path: Path | None = None
    manifest_path = run_dir / "run_manifest.json"
    if manifest_path.exists():
        manifest = json.loads(read_text(manifest_path))
        chapter_path = validate_manifest(run_dir, manifest, errors)

    if chapter_path is not None:
        validate_chapter_text(chapter_path, errors)
        validate_prompt_log(expected_prompt_log_path(chapter_path), errors)

    payload = {
        "passed": not errors,
        "errors": errors,
        "warnings": warnings,
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
