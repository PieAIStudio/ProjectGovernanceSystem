import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runInit } from './commands/init';
import { runSync } from './commands/sync';

test('sync check reports missing starter files', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-sync-missing-'));

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runSync(['--check', '--profile', 'engineering-runtime']), 1);
    })
  );

  assert.match(output, /missing: AGENTS\.md/);
});

test('sync check accepts project-local seed customization and infers the installed profile', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-sync-local-'));
  withCwd(root, () => assert.equal(runInit(['--profile', 'doc-only', '--apply']), 0));
  writeFileSync(join(root, 'AGENTS.md'), '# Local project router\n');
  writeFileSync(join(root, 'docs/policy/best-practice-for-this-project.md'), '# Local policy\n');
  writeFileSync(join(root, 'docs/reference/execution/current-work.md'), '# Local work\n');

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runSync(['--check']), 0);
    })
  );

  assert.match(output, /profile: doc-only/);
  assert.match(output, /sync check passed/);
  assert.doesNotMatch(output, /engineering-runtime-v0\.9\.md/);
});

test('sync check reports changed shared governance files', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-sync-shared-'));
  withCwd(root, () => assert.equal(runInit(['--profile', 'engineering-runtime', '--apply']), 0));
  writeFileSync(join(root, 'docs/governance/ssot-v0.9.md'), '# Drifted shared core\n');

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runSync(['--check']), 1);
    })
  );

  assert.match(output, /different: docs\/governance\/ssot-v0\.9\.md/);
});

test('sync requires --check', () => {
  const output = captureConsole(() => {
    assert.equal(runSync([]), 1);
  });

  assert.match(output, /requires --check/);
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
