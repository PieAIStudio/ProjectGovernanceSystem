import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runSync } from './commands/sync';

test('sync check reports missing starter files', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-sync-missing-'));

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runSync(['--check']), 1);
    })
  );

  assert.match(output, /missing: AGENTS\.md/);
});

test('sync check reports changed starter files', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-sync-different-'));
  writeFileSync(join(root, 'AGENTS.md'), '# Local edits\n');

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runSync(['--check']), 1);
    })
  );

  assert.match(output, /different: AGENTS\.md/);
});

test('sync requires --check in the first release', () => {
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
