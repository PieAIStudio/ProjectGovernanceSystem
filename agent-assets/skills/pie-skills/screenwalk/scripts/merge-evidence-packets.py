#!/usr/bin/env python3
"""Wrapper for the shared AI Quality Loop packet merge script."""

from __future__ import annotations

from pathlib import Path
import runpy


SHARED_SCRIPT = Path(__file__).resolve().parents[2] / "_shared" / "quality-loop" / "merge-evidence-packets.py"


if __name__ == "__main__":
    runpy.run_path(str(SHARED_SCRIPT), run_name="__main__")
