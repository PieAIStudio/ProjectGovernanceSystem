---
description: Generate a standardized "Handover Packet" to bootstrap the next AI session with critical context.
---

1. **Source of Truth Check**:
   - Find the project's current source-of-truth docs first. Prefer files explicitly positioned as current guidance, such as `Docs/Next.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`, active spec docs, handoff docs, or a current `task.md`.
   - Read the most authoritative current-state docs you can find, paying special attention to latest progress, open blockers, recent resolutions, and what is immediately next.

2. **Identify Critical "Blood Lessons"**:
   - Extract any recently resolved high-risk issues, integration traps, or environment gotchas that the next AI is likely to trip over again.
   - These MUST be highlighted to prevent the next AI from regressing or wasting time re-learning them.

3. **Curate Key Assets**:
   - List the 3-5 most relevant files for the _current_ focus area.
   - Include the most relevant source-of-truth doc from step 1 when one exists.
   - Prefer assets that explain the current task, current constraints, and the next immediate move.

4. **Generate the Output**:
   - Produce a structured markdown block titled **"Start Next Session with This"**.
   - **CRITICAL**: The entire output block MUST be wrapped in a single Markdown code block (triple backticks) so the user can copy it with one click.
   - **Structure**:
     - **1. Status Snapshot**: Current state, what is already working, and where the work currently stands.
     - **2. The "Must Read" Files**: The curated asset list.
     - **3. The "Minefield" (Critical Context)**: The "Blood Lessons" and specific warnings the next AI must not miss.
     - **4. Immediate Mission**: The very first concrete step for the new session.

5. **Final Action**:
   - Ask the user to copy using the "Copy" button on the code block.
