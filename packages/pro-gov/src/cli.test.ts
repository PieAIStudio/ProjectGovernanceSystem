import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

test('built CLI help prints the pro-gov command list', () => {
  const result = spawnSync(process.execPath, [join(packageRoot, 'dist/cli.js'), '--help'], {
    cwd: packageRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /pro-gov/);
  assert.match(result.stdout, /assets list/);
  assert.match(result.stdout, /sync --check/);
});

test('built CLI doctor resolves the bundled doc-gov dependency', () => {
  const result = spawnSync(process.execPath, [join(packageRoot, 'dist/cli.js'), 'doctor'], {
    cwd: packageRoot,
    encoding: 'utf8',
    env: { ...process.env, PATH: '/usr/bin:/bin:/usr/sbin:/sbin' },
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /doc-gov: available/);
});

test('built CLI learn recall returns relevant learning records as JSON', () => {
  const targetDir = mkdtempSync(join(tmpdir(), 'pro-gov-learn-recall-'));
  mkdirSync(join(targetDir, 'docs/solutions/workflow-issues'), { recursive: true });
  writeFileSync(
    join(targetDir, 'docs/solutions/workflow-issues/portfolio-release.md'),
    [
      '---',
      'title: Publish PGS before syncing portfolio targets',
      'tags: [portfolio-governance, release, trusted-publishing, downstream-sync]',
      '---',
      '',
      '# Publish PGS before syncing portfolio targets',
      '',
      'Run GitHub Actions Trusted Publishing before syncing downstream repositories.',
    ].join('\n'),
  );

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'learn',
      'recall',
      '--target',
      targetDir,
      '--query',
      'portfolio release downstream',
      '--json',
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const output = JSON.parse(result.stdout);
  assert.equal(output.query, 'portfolio release downstream');
  assert.equal(output.hits[0].relativePath, 'docs/solutions/workflow-issues/portfolio-release.md');
});

test('built CLI host-hook emits Codex Stop continuation JSON', () => {
  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'host-hook', '--host', 'codex', '--event', 'Stop'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
      input: JSON.stringify({
        stop_hook_active: false,
        last_assistant_message: 'Done. I changed files, ran tests, committed, and pushed.',
      }),
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(JSON.parse(result.stdout), {
    decision: 'block',
    reason: [
      'Before final reporting, pass the PGS Compound Gate.',
      'If this completed work produced reusable learning, run compound-engineering:ce-compound and report:',
      'Compound Gate: ran ce-compound -> <path>',
      'If there is no reusable learning, report:',
      'Compound Gate: skipped -> <reason>',
    ].join('\n'),
  });
});

test('built CLI host-hook can write optional debug logs without changing stdout protocol', () => {
  const debugDir = mkdtempSync(join(tmpdir(), 'pro-gov-hook-debug-'));
  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'host-hook',
      '--host',
      'antigravity',
      '--event',
      'Stop',
      '--debug-log',
      debugDir,
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
      input: JSON.stringify({
        hook_event_name: 'Stop',
        stop_hook_active: false,
        last_assistant_message: 'Done. I updated the docs and tests passed.',
      }),
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.deepEqual(JSON.parse(result.stdout), {
    decision: 'continue',
    reason: [
      'Before final reporting, pass the PGS Compound Gate.',
      'If this completed work produced reusable learning, run compound-engineering:ce-compound and report:',
      'Compound Gate: ran ce-compound -> <path>',
      'If there is no reusable learning, report:',
      'Compound Gate: skipped -> <reason>',
    ].join('\n'),
  });

  const files = readdirSync(debugDir);
  assert.equal(files.length, 1);
  const debug = JSON.parse(readFileSync(join(debugDir, files[0]), 'utf8'));
  assert.equal(debug.host, 'antigravity');
  assert.equal(debug.event, 'Stop');
  assert.equal(debug.decision.action, 'continue');
  assert.equal(existsSync(join(debugDir, files[0])), true);
});

test('built CLI host-hook exits when stdin stays open without a payload', async () => {
  const child = spawn(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'host-hook', '--host', 'antigravity', '--event', 'Stop'],
    {
      cwd: packageRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );

  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  const result = await new Promise<{ code: number | null; timedOut: boolean }>((resolve) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      resolve({ code: null, timedOut: true });
    }, 3_000);
    child.on('exit', (code) => {
      clearTimeout(timer);
      resolve({ code, timedOut: false });
    });
  });

  assert.equal(result.timedOut, false, stderr);
  assert.equal(result.code, 0, stderr || stdout);
  assert.deepEqual(JSON.parse(stdout), {});
});
