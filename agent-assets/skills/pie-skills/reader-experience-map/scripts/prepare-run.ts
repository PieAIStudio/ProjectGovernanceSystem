#!/usr/bin/env tsx
import { spawnSync } from "node:child_process";

const slug = process.argv[2];
if (slug === undefined) {
  console.error("Usage: tsx scripts/prepare-run.ts <book-slug>");
  process.exit(2);
}

const result = spawnSync("pnpm", ["--silent", "story", "--", "reader-map", "prepare", "--book", slug], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
