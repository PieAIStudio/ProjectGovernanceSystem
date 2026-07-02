import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runDoctor } from './commands/doctor';

test('doctor reports package health without failing on optional integrations', () => {
  const output = captureConsole(() => {
    assert.equal(runDoctor([]), 0);
  });

  assert.match(output, /pro-gov doctor/);
  assert.match(output, /assets:/);
  assert.match(output, /doc-gov:/);
});

test('doctor --strict-hooks fails engineering projects missing host hooks', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-doctor-hooks-missing-'));
  mkdirSync(join(root, 'docs/governance/agents-routing'), { recursive: true });
  writeFileSync(join(root, 'docs/governance/agents-routing/engineering-runtime-v0.9.md'), '# Engineering\n');

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runDoctor(['--strict-hooks']), 1);
    }),
  );

  assert.match(output, /host-hooks: missing .codex\/hooks.json/);
  assert.match(output, /host-hooks: missing .claude\/settings.json/);
  assert.match(output, /host-hooks: missing .agents\/hooks.json/);
});

test('doctor --strict-hooks accepts engineering projects with PGS host hooks wired', () => {
  const root = mkdtempSync(join(tmpdir(), 'pro-gov-doctor-hooks-ok-'));
  mkdirSync(join(root, 'docs/governance/agents-routing'), { recursive: true });
  mkdirSync(join(root, '.codex'), { recursive: true });
  mkdirSync(join(root, '.claude'), { recursive: true });
  mkdirSync(join(root, '.agents'), { recursive: true });
  writeFileSync(join(root, 'docs/governance/agents-routing/engineering-runtime-v0.9.md'), '# Engineering\n');
  writeFileSync(join(root, '.codex/hooks.json'), '{"hooks":{"Stop":[{"hooks":[{"command":"pro-gov host-hook --host codex --event Stop"}]}]}}\n');
  writeFileSync(join(root, '.claude/settings.json'), '{"hooks":{"Stop":[{"hooks":[{"command":"pro-gov host-hook --host claude-code --event Stop"}]}]}}\n');
  writeFileSync(join(root, '.agents/hooks.json'), '{"pgs-compound-gate":{"Stop":[{"hooks":[{"command":"PGS_HOST_HOOK_DEBUG=1 pro-gov host-hook --host antigravity --event Stop"}]}]}}\n');

  const output = withCwd(root, () =>
    captureConsole(() => {
      assert.equal(runDoctor(['--strict-hooks']), 0);
    }),
  );

  assert.match(output, /host-hooks: PGS Compound Gate hooks wired/);
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
