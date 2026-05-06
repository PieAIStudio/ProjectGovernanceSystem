import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Lightweight init: creates the directory skeleton and prints next steps.
 *
 * For the full starter (templates / agent-rules / lefthook / GitHub Action),
 * users currently copy from the Supa repo `governance/` and `tools/doc-gov/`.
 * Phase 2 will publish a fully self-contained `npx @pieai/doc-gov init` that
 * embeds all fixtures.
 */
export function runInit(args: string[]): number {
  const force = args.includes('--force');
  const root = process.cwd();

  const dirs = [
    'governance',
    'governance/templates',
    'docs',
    'docs/policy',
    'docs/decisions',
    'docs/specs/active',
    'docs/specs/completed',
    'docs/plans/active',
    'docs/plans/completed',
    'docs/canon',
    'docs/reference',
    'docs/archive',
  ];

  let created = 0;
  for (const dir of dirs) {
    const abs = join(root, dir);
    if (!existsSync(abs)) {
      mkdirSync(abs, { recursive: true });
      created++;
    } else if (!force) {
      // Already there; skip silently.
    }
  }

  // Add a .gitkeep marker in the always-empty starter dirs so git tracks them.
  for (const dir of ['docs/specs/completed', 'docs/plans/completed', 'docs/archive']) {
    const keep = join(root, dir, '.gitkeep');
    if (!existsSync(keep)) writeFileSync(keep, '');
  }

  console.log(`doc-gov init: ${created} directories created (existing dirs left untouched).`);
  console.log(`\nNext steps for a brand-new project:`);
  console.log(`  1. Copy "governance/agent-rules.md", "governance/doc-types.md",`);
  console.log(`     "governance/lifecycle.ts", "governance/naming.yaml",`);
  console.log(`     and "governance/templates/*.md" from the doc-gov starter.`);
  console.log(`  2. Copy "AGENTS.md", ".cursor/rules/governance.mdc", ".windsurfrules"`);
  console.log(`     and create CLAUDE.md / GEMINI.md as forwards.`);
  console.log(`  3. Copy "lefthook.yml" and ".github/workflows/docs-check.yml".`);
  console.log(`  4. Add to package.json: "doc-gov": "tsx tools/doc-gov/src/cli.ts"`);
  console.log(`  5. Run: pnpm exec lefthook install`);
  console.log(`  6. Write your first ADR: pnpm doc-gov new decision adopt-doc-gov`);
  return 0;
}
