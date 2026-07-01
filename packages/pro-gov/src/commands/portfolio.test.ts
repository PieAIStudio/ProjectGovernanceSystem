import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
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
