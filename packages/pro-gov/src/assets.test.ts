import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { listAssets } from './assets';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

test('asset inventory includes reusable project-governance assets', () => {
  const paths = listAssets().map((asset) => asset.path);

  assert.ok(paths.includes('starter/AGENTS.template.md'));
  assert.ok(paths.includes('starter/lefthook.template.yml'));
  assert.ok(paths.includes('profiles/engineering-runtime/profile.md'));
  assert.ok(paths.includes('profiles/doc-only/profile.md'));
  assert.ok(paths.includes('integrations/superpowers.md'));
  assert.ok(paths.includes('docs/reference/adoption/adoption-playbook.md'));
});

test('assets list prints packaged asset paths', () => {
  const result = spawnSync(process.execPath, [join(packageRoot, 'dist/cli.js'), 'assets', 'list'], {
    cwd: packageRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /starter\/AGENTS\.template\.md/);
  assert.match(result.stdout, /profiles\/engineering-runtime\/profile\.md/);
  assert.match(result.stdout, /docs\/reference\/adoption\/adoption-playbook\.md/);
});

test('assets list --json prints the agent asset registry', () => {
  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'list', '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.count, 74);
  assert.ok(parsed.assets.some((asset: { id: string }) => asset.id === 'pie-skills/screenwalk'));
  assert.ok(parsed.assets.some((asset: { id: string }) => asset.id === 'npx-skills/agent-browser'));
});

test('assets list --visibility filters registry assets', () => {
  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'list', '--visibility', 'third-party', '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.count, 39);
  assert.ok(
    parsed.assets.every((asset: { visibility: string }) => asset.visibility === 'third-party'),
  );
});

test('assets recommend --json recommends bundles from target signals', () => {
  const targetDir = createTempTargetDir();
  writeFileSync(join(targetDir, 'package.json'), JSON.stringify({ dependencies: { react: '^19.0.0' } }));

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'recommend', '--target', targetDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(
    parsed.recommendations.map((recommendation: { bundleId: string }) => recommendation.bundleId),
    ['base-governance', 'frontend-app'],
  );
});

test('assets plan --json creates a dry-run plan without writing target files', () => {
  const targetDir = createTempTargetDir();

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'plan',
      '--target',
      targetDir,
      '--bundle',
      'base-governance',
      '--json',
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.dryRun, true);
  assert.ok(parsed.actions.some((action: { targetPath: string }) => action.targetPath === '.pro-gov/assets.lock.json'));
  assert.equal(existsSync(join(targetDir, '.agents')), false);
  assert.equal(existsSync(join(targetDir, '.pro-gov')), false);
});

test('assets plan --out writes a plan artifact for a non-Codex host without applying it', () => {
  const targetDir = createTempTargetDir();
  const outPath = join(targetDir, 'asset-plan.json');

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'plan',
      '--target',
      targetDir,
      '--bundle',
      'project-lens',
      '--host',
      'claude-code',
      '--out',
      outPath,
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(readFileSync(outPath, 'utf8'));
  assert.equal(parsed.host, 'claude-code');
  assert.ok(
    parsed.actions.some(
      (action: { type: string; targetPath: string }) =>
        action.type === 'symlink' && action.targetPath === '.claude/skills/project-architecture-lens',
    ),
  );
  assert.equal(existsSync(join(targetDir, '.claude')), false);
  assert.equal(existsSync(join(targetDir, '.pro-gov')), false);
});

test('assets apply and check complete a managed install flow', () => {
  const targetDir = createTempTargetDir();
  const outPath = join(targetDir, 'asset-plan.json');

  const planResult = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'plan',
      '--target',
      targetDir,
      '--bundle',
      'project-lens',
      '--out',
      outPath,
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(planResult.status, 0);

  const applyResult = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'apply', '--plan', outPath],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(applyResult.status, 0);
  assert.equal(existsSync(join(targetDir, '.agents/skills/project-architecture-lens')), true);

  const checkResult = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'assets', 'check', '--target', targetDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );
  assert.equal(checkResult.status, 0);
  const parsed = JSON.parse(checkResult.stdout);
  assert.deepEqual(parsed.issues, []);
});

test('assets npx update --help does not touch or validate the npx root', () => {
  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'assets',
      'npx',
      'update',
      '--help',
      '--root',
      '/definitely/missing/npx-root',
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /pro-gov assets npx/);
});

test('lens scan --json returns a local evidence packet', () => {
  const targetDir = createTempTargetDir();
  writeFileSync(join(targetDir, 'package.json'), JSON.stringify({ scripts: { test: 'node --test' } }));
  writeFileSync(join(targetDir, 'AGENTS.md'), '# Agents\n');

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'lens', 'scan', '--target', targetDir, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(parsed.aiEntryFiles, ['AGENTS.md']);
  assert.deepEqual(parsed.packageJson.scripts, ['test']);
});

function createTempTargetDir(): string {
  const targetDir = join(tmpdir(), `pro-gov-cli-target-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(targetDir, { recursive: true });
  return targetDir;
}
