import assert from 'node:assert/strict';
import { existsSync, mkdtempSync } from 'node:fs';
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

test('init requires dry-run in the first release', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-init-safety-'));

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runInit(['--profile', 'doc-only']), 1);
    })
  );

  assert.match(output, /requires --dry-run/);
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
