import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runInit } from './commands/init';

test('init dry-run reports planned files without writing', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-init-'));

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runInit(['--profile', 'engineering-runtime', '--dry-run']), 0);
    })
  );

  assert.match(output, /DRY RUN/);
  assert.match(output, /profile: engineering-runtime/);
  assert.match(output, /AGENTS\.md/);
  assert.match(output, /docs\/governance\/agents-routing\/engineering-runtime-v0\.9\.md/);
  assert.doesNotMatch(output, /docs\/governance\/agents-routing\/doc-only-v0\.9\.md/);
  assert.equal(existsSync(join(root, 'AGENTS.md')), false);
  assert.equal(existsSync(join(root, 'docs')), false);
});

test('init rejects invalid profiles', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-init-profile-'));

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runInit(['--profile', 'wrong', '--dry-run']), 1);
    })
  );

  assert.match(output, /Invalid profile/);
});

test('init apply installs only the selected profile without overwriting project truth', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-init-apply-'));

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runInit(['--profile', 'doc-only', '--apply']), 0);
    })
  );

  assert.match(output, /APPLIED/);
  assert.equal(existsSync(join(root, 'AGENTS.md')), true);
  assert.equal(existsSync(join(root, 'lefthook.yml')), false);
  assert.equal(existsSync(join(root, '.github/workflows/docs-check.yml')), false);
  assert.equal(existsSync(join(root, 'docs/governance/agents-routing/doc-only-v0.9.md')), true);
  assert.equal(existsSync(join(root, 'docs/governance/agents-routing/engineering-runtime-v0.9.md')), false);
  assert.match(readFileSync(join(root, 'AGENTS.md'), 'utf8'), /docs\/governance\/agents-routing\/doc-only-v0\.9\.md/);
  assert.doesNotMatch(
    readFileSync(join(root, 'AGENTS.md'), 'utf8'),
    /docs\/governance\/agents-routing\/engineering-runtime-v0\.9\.md/,
  );
});

test('init apply refuses all writes when any target file already exists', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-init-conflict-'));
  writeFileSync(join(root, 'AGENTS.md'), '# Existing project router\n');

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runInit(['--profile', 'engineering-runtime', '--apply']), 1);
    })
  );

  assert.match(output, /refusing to overwrite/i);
  assert.equal(readFileSync(join(root, 'AGENTS.md'), 'utf8'), '# Existing project router\n');
  assert.equal(existsSync(join(root, 'docs')), false);
  assert.equal(existsSync(join(root, 'CLAUDE.md')), false);
});

test('init requires exactly one execution mode', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-init-safety-'));

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runInit(['--profile', 'doc-only']), 1);
      assert.equal(runInit(['--profile', 'doc-only', '--dry-run', '--apply']), 1);
    })
  );

  assert.match(output, /exactly one of --dry-run or --apply/);
});

function withCwd<T>(root: string, fn: () => T): T {
  const previous = process.cwd();
  try {
    process.chdir(root);
    return fn();
  } finally {
    process.chdir(previous);
  }
}

function captureConsole(fn: () => void): string {
  const originalLog = console.log;
  const originalError = console.error;
  const lines: string[] = [];
  try {
    console.log = (...args: unknown[]) => {
      lines.push(args.join(' '));
    };
    console.error = (...args: unknown[]) => {
      lines.push(args.join(' '));
    };
    fn();
    return lines.join('\n');
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}
