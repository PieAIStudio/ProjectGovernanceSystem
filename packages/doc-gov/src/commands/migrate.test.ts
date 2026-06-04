import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { runMigrate } from './migrate';

test('migrate --check passes when the selected profile is installed', () => {
  const root = createMigrationProject('doc-only');

  withCwd(root, () => withMutedConsole(() => {
    assert.equal(runMigrate(['--profile', 'doc-only', '--check']), 0);
  }));
});

test('migrate --check fails when the selected profile route is missing', () => {
  const root = createMigrationProject('doc-only');

  withCwd(root, () => withMutedConsole(() => {
    assert.equal(runMigrate(['--profile', 'engineering-runtime', '--check']), 1);
  }));
});

function createMigrationProject(profile: 'doc-only' | 'engineering-runtime'): string {
  const root = mkdtempSync(join(tmpdir(), 'doc-gov-migrate-'));
  const route =
    profile === 'doc-only'
      ? 'docs/governance/agents-routing/doc-only-v0.9.md'
      : 'docs/governance/agents-routing/engineering-runtime-v0.9.md';
  mkdirSync(join(root, 'docs/governance/agents-routing'), { recursive: true });
  mkdirSync(join(root, 'docs/reference/execution'), { recursive: true });
  mkdirSync(join(root, 'docs/policy'), { recursive: true });

  writeFileSync(join(root, 'package.json'), '{ "name": "migration-fixture" }\n');
  writeFileSync(join(root, 'README.md'), 'Human introduction.\n');
  writeFileSync(
    join(root, 'AGENTS.md'),
    [
      '# Migration Fixture Router',
      '<!-- PGS-ROUTER:BEGIN v0.9 -->',
      'README.md is human-facing and is not the default AI startup path.',
      'Read docs/policy/.',
      'Read docs/governance/boundary.md.',
      'Read docs/governance/ssot-v0.9.md.',
      'Read docs/governance/doc-agent-rules.md.',
      'Read docs/governance/doc-types.md.',
      `Read ${route}.`,
      'Read docs/reference/execution/current-work.md.',
      '<!-- PGS-ROUTER:END -->',
    ].join('\n')
  );
  writeFileSync(
    join(root, 'CLAUDE.md'),
    [
      '# Claude Adapter',
      'Read `AGENTS.md` first and follow it as the project router.',
      'Claude-specific workflow guidance may add tool usage details, but it must not replace `AGENTS.md`.',
    ].join('\n')
  );
  writeFileSync(
    join(root, 'docs/governance/boundary.md'),
    'Product artifacts outside governed docs stay outside docs/** by default.\n'
  );
  writeFileSync(
    join(root, 'docs/governance/ssot-v0.9.md'),
    'Project Governance System does not automatically govern every Markdown file.\n'
  );
  writeFileSync(
    join(root, 'docs/governance/doc-agent-rules.md'),
    'Doc-gov governs `docs/**` by default.\n'
  );
  writeFileSync(
    join(root, 'docs/governance/doc-types.md'),
    'Markdown outside `docs/**` is not a governed doc by default.\n'
  );
  writeFileSync(
    join(root, route),
    profile === 'doc-only'
      ? 'This route does not use Superpowers TDD or Directed Development by default.\n'
      : 'Use matching Superpowers workflow if applicable.\ncurrent-work.md remains separate.\n'
  );
  writeFileSync(join(root, 'docs/reference/execution/current-work.md'), 'Current work.\n');
  return root;
}

function withCwd(root: string, fn: () => void): void {
  const previous = process.cwd();
  try {
    process.chdir(root);
    fn();
  } finally {
    process.chdir(previous);
  }
}

function withMutedConsole(fn: () => void): void {
  const originalLog = console.log;
  const originalError = console.error;
  try {
    console.log = () => undefined;
    console.error = () => undefined;
    fn();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}
