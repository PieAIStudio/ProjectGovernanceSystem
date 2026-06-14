#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path


META_PATTERNS = [
    r"\[说明\]",
    r"TODO",
    r"CHAPTER_BRIEF_START",
    r"NOVEL_TEXT_START",
    r"```",
]
TITLE_RE = re.compile(r"^(?:#\s*)?第[一二三四五六七八九十百千0-9]+章")


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def find_eval_metadata(run_dir: Path) -> Path:
    candidates = [
        run_dir / "eval_metadata.json",
        run_dir.parent / "eval_metadata.json",
        run_dir.parent.parent / "eval_metadata.json",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(f"eval_metadata.json not found for run: {run_dir}")


def run_validator(run_dir: Path) -> dict:
    script_path = Path(__file__).with_name("validate_orchestration_run.py")
    proc = subprocess.run(
        [sys.executable, str(script_path), str(run_dir)],
        capture_output=True,
        text=True,
        check=False,
    )
    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"validator returned invalid JSON: {proc.stdout}") from exc
    payload["_returncode"] = proc.returncode
    return payload


def resolve_chapter_path(run_dir: Path, manifest: dict) -> Path | None:
    raw = manifest.get("chapter_path")
    if not raw:
        return None
    chapter_path = Path(raw)
    if chapter_path.is_absolute():
        return chapter_path
    return (run_dir / chapter_path).resolve()


def chapter_has_meta(chapter_text: str) -> bool:
    for pattern in META_PATTERNS:
        if re.search(pattern, chapter_text):
            return True
    nonempty_lines = [line.strip() for line in chapter_text.splitlines() if line.strip()]
    if nonempty_lines and TITLE_RE.match(nonempty_lines[0]):
        return True
    return False


def grade_expectation(text: str, eval_name: str, manifest: dict, run_dir: Path, validator: dict) -> tuple[bool, str]:
    loops = manifest.get("loops", [])
    controller_role = manifest.get("controller_role")
    loop_names = [loop.get("name") for loop in loops]
    loop_writers = [loop.get("writer") for loop in loops]
    chapter_path = resolve_chapter_path(run_dir, manifest)
    chapter_text = ""
    if chapter_path and chapter_path.exists():
        chapter_text = chapter_path.read_text(encoding="utf-8", errors="ignore")

    if text == "The run is marked blocked instead of generating a chapter body":
        passed = manifest.get("final_status") == "blocked" and not chapter_path
        evidence = f"final_status={manifest.get('final_status')}, chapter_path={manifest.get('chapter_path')!r}"
        return passed, evidence

    if text == "The blocked run records a concrete block_reason and next_action":
        passed = bool(manifest.get("block_reason")) and bool(manifest.get("next_action"))
        evidence = f"block_reason={manifest.get('block_reason')!r}; next_action={manifest.get('next_action')!r}"
        return passed, evidence

    if text == "The controller role still does not appear as the writer for any loop":
        passed = controller_role not in loop_writers
        evidence = f"controller_role={controller_role!r}; loop_writers={loop_writers!r}"
        return passed, evidence

    if text == "The rewrite run records draft, gate, and polish loops in run_manifest.json":
        passed = {"draft", "gate", "polish"}.issubset(set(loop_names))
        evidence = f"loop_names={loop_names!r}"
        return passed, evidence

    if text == "Claude is only used for the polish loop after the gate loop passes":
        gate_idx = next((i for i, loop in enumerate(loops) if loop.get("name") == "gate"), -1)
        polish_idx = next((i for i, loop in enumerate(loops) if loop.get("name") == "polish"), -1)
        gate_ok = gate_idx >= 0 and loops[gate_idx].get("writer") == manifest.get("repair_model")
        polish_ok = polish_idx >= 0 and loops[polish_idx].get("writer") == manifest.get("polish_model")
        order_ok = gate_idx >= 0 and polish_idx > gate_idx
        passed = gate_ok and polish_ok and order_ok
        evidence = f"gate_idx={gate_idx}, polish_idx={polish_idx}, loops={loops!r}"
        return passed, evidence

    if text == "The polish loop includes controller feedback about verbosity, boring metaphors, or removing added headings before the final version is accepted":
        issue_sheet_path = run_dir / "polish_issue_sheet.md"
        issue_sheet = issue_sheet_path.read_text(encoding="utf-8", errors="ignore") if issue_sheet_path.exists() else ""
        gate_idx = next((i for i, loop in enumerate(loops) if loop.get("name") == "gate"), -1)
        polish_idx = next((i for i, loop in enumerate(loops) if loop.get("name") == "polish"), -1)
        order_ok = gate_idx >= 0 and polish_idx > gate_idx
        feedback_hits = any(
            marker in issue_sheet
            for marker in ("啰嗦", "无聊比喻", "比喻无聊", "章节标题", "乱加标题", "评语句")
        )
        passed = validator.get("passed") and order_ok and feedback_hits
        evidence = (
            f"validator_passed={validator.get('passed')}, order_ok={order_ok}, "
            f"issue_sheet_hits={feedback_hits}, issue_sheet_path={str(issue_sheet_path)}"
        )
        return passed, evidence

    if text == "The rewritten chapter output does not include analysis, bullets, or a markdown chapter heading":
        bullet_hits = any(line.lstrip().startswith(("-", "*", "1.")) for line in chapter_text.splitlines())
        passed = validator.get("passed") and not bullet_hits and not chapter_has_meta(chapter_text)
        evidence = f"validator_passed={validator.get('passed')}, bullet_hits={bullet_hits}"
        return passed, evidence

    if text == "The repair run includes a gate_issue_sheet.md artifact":
        path = run_dir / "gate_issue_sheet.md"
        passed = path.exists()
        evidence = f"exists={path.exists()}, path={str(path)}"
        return passed, evidence

    if text == "The repair loop writer is the repair model rather than the controller role":
        gate_loop = next((loop for loop in loops if loop.get("name") == "gate"), None)
        passed = bool(gate_loop) and gate_loop.get("writer") == manifest.get("repair_model") and gate_loop.get("writer") != controller_role
        evidence = f"gate_loop={gate_loop!r}, controller_role={controller_role!r}"
        return passed, evidence

    if text == "The repaired chapter output remains pure prose without injected meta text":
        passed = validator.get("passed") and chapter_text != "" and not chapter_has_meta(chapter_text)
        evidence = f"validator_passed={validator.get('passed')}, chapter_chars={len(chapter_text)}"
        return passed, evidence

    # Fallback: treat validator success as the default signal for generic assertions.
    passed = validator.get("passed", False)
    evidence = f"fallback validator result for {eval_name}: passed={validator.get('passed')}"
    return passed, evidence


def build_grading(run_dir: Path) -> dict:
    eval_metadata = load_json(find_eval_metadata(run_dir))
    manifest = load_json(run_dir / "run_manifest.json")
    validator = run_validator(run_dir)
    expectations = []
    for text in eval_metadata.get("assertions", []):
        passed, evidence = grade_expectation(text, eval_metadata.get("eval_name", ""), manifest, run_dir, validator)
        expectations.append({"text": text, "passed": passed, "evidence": evidence})

    passed_count = sum(1 for item in expectations if item["passed"])
    total = len(expectations)
    failed_count = total - passed_count
    chapter_path = resolve_chapter_path(run_dir, manifest)
    output_chars = 0
    if chapter_path and chapter_path.exists():
        output_chars = len(chapter_path.read_text(encoding="utf-8", errors="ignore"))

    timing = {}
    timing_path = run_dir / "timing.json"
    if timing_path.exists():
        timing = load_json(timing_path)

    notes: list[str] = []
    if manifest.get("final_status") == "blocked":
        notes.append("State lock respected; chapter generation intentionally skipped.")
    if manifest.get("final_status") == "passed" and any(loop.get("name") == "polish" and loop.get("status") == "rejected_keep_gate_version" for loop in manifest.get("loops", [])):
        notes.append("Claude polish was evaluated but not selected as final output.")

    return {
        "expectations": expectations,
        "summary": {
            "passed": passed_count,
            "failed": failed_count,
            "total": total,
            "pass_rate": (passed_count / total) if total else 0.0,
        },
        "execution_metrics": {
            "tool_calls": {},
            "total_tool_calls": 0,
            "total_steps": len(manifest.get("loops", [])),
            "errors_encountered": 0 if validator.get("passed") else len(validator.get("errors", [])),
            "output_chars": output_chars,
            "transcript_chars": len((run_dir / "transcript.md").read_text(encoding="utf-8")) if (run_dir / "transcript.md").exists() else 0,
        },
        "timing": timing,
        "claims": [],
        "user_notes_summary": {
            "uncertainties": [],
            "needs_review": [],
            "workarounds": notes,
        },
    }


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: grade_orchestration_run.py <run-dir>", file=sys.stderr)
        return 1

    run_dir = Path(argv[1]).resolve()
    grading = build_grading(run_dir)
    grading_path = run_dir / "grading.json"
    grading_path.write_text(json.dumps(grading, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"grading_path": str(grading_path), "pass_rate": grading["summary"]["pass_rate"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
