import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

test('portfolio check requires an explicit config path', () => {
  const result = spawnSync(process.execPath, [join(packageRoot, 'dist/cli.js'), 'portfolio', 'check'], {
    cwd: packageRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Expected --config <path>/);
});

test('portfolio check --json validates a manifest', () => {
  const fixture = createPortfolioFixture();

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'portfolio', 'check', '--config', fixture.configPath, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.targetIds, ['web-app']);
});

test('portfolio plan --target --json returns dry-run asset plans for one target', () => {
  const fixture = createPortfolioFixture();

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'portfolio',
      'plan',
      '--config',
      fixture.configPath,
      '--target',
      'web-app',
      '--json',
    ],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.targets.length, 1);
  assert.equal(parsed.targets[0].id, 'web-app');
  assert.equal(parsed.targets[0].plan.dryRun, true);
  assert.deepEqual(parsed.targets[0].plan.bundleIds, ['base-governance']);
});

test('portfolio assets-check --json reports per-target asset issues', () => {
  const fixture = createPortfolioFixture();

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'portfolio', 'assets-check', '--config', fixture.configPath, '--json'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.ok, false);
  assert.equal(parsed.targets[0].id, 'web-app');
  assert.ok(parsed.targets[0].issues.some((issue: { type: string }) => issue.type === 'missing-lock'));
});

test('portfolio doctor --json reports package, target-check, and asset-state failures', () => {
  const fixture = createPortfolioFixture();

  const result = spawnSync(
    process.execPath,
    [join(packageRoot, 'dist/cli.js'), 'portfolio', 'doctor', '--config', fixture.configPath, '--json'],
    { cwd: packageRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.ok, false);
  assert.equal(parsed.targets[0].id, 'web-app');
  assert.ok(parsed.targets[0].issues.some((issue: { type: string }) =>
    issue.type === 'package-declaration-missing'));
  assert.ok(parsed.targets[0].issues.some((issue: { type: string }) =>
    issue.type === 'target-check-failed'));
  assert.ok(parsed.targets[0].issues.some((issue: { type: string }) =>
    issue.type === 'bundle-drift'));
});

test('portfolio doctor --target limits the report to one target', () => {
  const fixture = createPortfolioFixture();
  const manifest = JSON.parse(readFileSync(fixture.configPath, 'utf8')) as {
    targets: Array<{ id: string; path: string; profile: string; assetBundles: string[] }>;
  };
  const secondPath = join(dirname(fixture.configPath), 'SecondApp');
  mkdirSync(secondPath);
  manifest.targets.push({
    id: 'second-app',
    path: secondPath,
    profile: 'engineering-runtime',
    assetBundles: ['base-governance'],
  });
  writeFileSync(fixture.configPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const result = spawnSync(
    process.execPath,
    [
      join(packageRoot, 'dist/cli.js'),
      'portfolio',
      'doctor',
      '--config',
      fixture.configPath,
      '--target',
      'second-app',
      '--json',
    ],
    { cwd: packageRoot, encoding: 'utf8' },
  );

  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(parsed.targets.map((target: { id: string }) => target.id), ['second-app']);
});

function createPortfolioFixture(): { configPath: string } {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-cli-'));
  const controlPlane = join(rootDir, 'ControlPlane');
  const executionEngine = join(rootDir, 'ProjectGovernanceSystem');
  const target = join(rootDir, 'WebApp');
  mkdirSync(controlPlane);
  mkdirSync(executionEngine);
  mkdirSync(target);
  const configPath = join(rootDir, 'portfolio.json');
  writeFileSync(
    configPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        portfolioId: 'example-org',
        controlPlane: { id: 'headquarters', path: controlPlane },
        executionEngine: { id: 'project-governance-system', path: executionEngine },
        targets: [
          {
            id: 'web-app',
            path: target,
            profile: 'engineering-runtime',
            assetBundles: ['base-governance'],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  return { configPath };
}
