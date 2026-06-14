#!/usr/bin/env tsx
import { spawnSync } from "node:child_process";

const [slug, file] = process.argv.slice(2);
if (slug === undefined || file === undefined) {
  console.error("Usage: tsx scripts/validate-analysis.ts <book-slug> <analysis-json>");
  process.exit(2);
}

const result = spawnSync(
  "pnpm",
  ["--silent", "story", "--", "reader-map", "validate", "--book", slug, "--file", file],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
