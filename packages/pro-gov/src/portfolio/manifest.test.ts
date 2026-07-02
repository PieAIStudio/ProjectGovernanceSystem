import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  getDefaultPortfolioTargets,
  loadPortfolioManifest,
  validatePortfolioManifest,
} from './manifest';

test('loadPortfolioManifest loads a valid portfolio manifest', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
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

  const loaded = loadPortfolioManifest(configPath);

  assert.deepEqual(loaded.issues, []);
  assert.equal(loaded.manifest?.portfolioId, 'example-org');
  assert.deepEqual(
    getDefaultPortfolioTargets(loaded.manifest).map((entry) => entry.id),
    ['web-app'],
  );
});

test('loadPortfolioManifest resolves relative paths from the config directory', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-relative-'));
  const configDir = join(rootDir, 'control');
  const target = join(rootDir, 'projects', 'demo');
  mkdirSync(configDir, { recursive: true });
  mkdirSync(target, { recursive: true });
  const configPath = join(configDir, 'portfolio.json');
  writeFileSync(
    configPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        portfolioId: 'example-company',
        targets: [
          {
            id: 'demo',
            path: '../projects/demo',
            profile: 'engineering-runtime',
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const unrelatedCwd = mkdtempSync(join(tmpdir(), 'pro-gov-unrelated-cwd-'));
  const previousCwd = process.cwd();
  let loaded;
  try {
    process.chdir(unrelatedCwd);
    loaded = loadPortfolioManifest(configPath);
  } finally {
    process.chdir(previousCwd);
  }

  assert.deepEqual(loaded.issues, []);
  assert.equal(loaded.manifest?.targets[0]?.path, target);
});

test('validatePortfolioManifest rejects duplicate target ids', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
  mkdirSync(join(rootDir, 'A'));
  mkdirSync(join(rootDir, 'B'));

  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    targets: [
      { id: 'duplicate', path: join(rootDir, 'A') },
      { id: 'duplicate', path: join(rootDir, 'B') },
    ],
  });

  assert.ok(issues.some((issue) => issue.type === 'duplicate-target-id'));
});

test('validatePortfolioManifest rejects missing target paths', () => {
  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    targets: [{ id: 'missing', path: '/definitely/missing/example-target' }],
  });

  assert.ok(issues.some((issue) => issue.type === 'missing-path' && issue.id === 'missing'));
});

test('validatePortfolioManifest rejects non-array assetBundles', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
  mkdirSync(join(rootDir, 'Target'));

  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    targets: [
      {
        id: 'target',
        path: join(rootDir, 'Target'),
        assetBundles: 'base-governance',
      },
    ],
  });

  assert.ok(issues.some((issue) => issue.type === 'invalid-field' && issue.field === 'assetBundles'));
});

test('validatePortfolioManifest rejects unknown profiles', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
  mkdirSync(join(rootDir, 'Target'));

  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    targets: [
      {
        id: 'target',
        path: join(rootDir, 'Target'),
        profile: 'enginering-runtim',
      },
    ],
  });

  assert.ok(issues.some((issue) => issue.type === 'invalid-field' && issue.field === 'profile'));
});

test('validatePortfolioManifest rejects sharedRules until they are managed by plan and check', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
  mkdirSync(join(rootDir, 'Target'));

  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    targets: [
      {
        id: 'target',
        path: join(rootDir, 'Target'),
        sharedRules: ['pie-product-technology-stack'],
      },
    ],
  });

  assert.ok(issues.some((issue) => issue.type === 'invalid-field' && issue.field === 'sharedRules'));
});

test('validatePortfolioManifest rejects unknown target fields', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
  mkdirSync(join(rootDir, 'Target'));

  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    targets: [
      {
        id: 'target',
        path: join(rootDir, 'Target'),
        assetBundle: ['base-governance'],
      },
    ],
  });

  assert.ok(issues.some((issue) => issue.type === 'invalid-field' && issue.field === 'assetBundle'));
});

test('validatePortfolioManifest accepts Codex and Claude Code host tooling requirements', () => {
  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    hostTooling: [
      { host: 'codex', plugins: ['superpowers@openai-curated'] },
      { host: 'claude-code', plugins: ['superpowers@superpowers-marketplace'] },
    ],
    targets: [],
  });

  assert.deepEqual(issues, []);
});

test('validatePortfolioManifest rejects duplicate and unsupported host tooling entries', () => {
  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    hostTooling: [
      { host: 'codex', plugins: ['superpowers@openai-curated'] },
      { host: 'codex', plugins: ['ponytail@ponytail'] },
      { host: 'antigravity', plugins: ['example@marketplace'] },
    ],
    targets: [],
  });

  assert.ok(issues.some((issue) => issue.field === 'hostTooling' && /Duplicate/.test(issue.message)));
  assert.ok(issues.some((issue) => issue.field === 'hostTooling.host'));
});

test('validatePortfolioManifest rejects empty host plugin ids', () => {
  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    hostTooling: [{ host: 'codex', plugins: [''] }],
    targets: [],
  });

  assert.ok(issues.some((issue) => issue.field === 'hostTooling.plugins'));
});

test('validatePortfolioManifest rejects unknown host tooling fields', () => {
  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'example-org',
    hostTooling: [{ host: 'codex', plugins: [], autoUpdate: true }],
    targets: [],
  });

  assert.ok(issues.some((issue) => issue.field === 'autoUpdate'));
});

test('getDefaultPortfolioTargets excludes controlPlane and executionEngine metadata', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
  const controlPlane = join(rootDir, 'ControlPlane');
  const executionEngine = join(rootDir, 'ProjectGovernanceSystem');
  const target = join(rootDir, 'WebApp');
  mkdirSync(controlPlane);
  mkdirSync(executionEngine);
  mkdirSync(target);

  const manifest = {
    schemaVersion: 1 as const,
    portfolioId: 'example-org',
    controlPlane: { id: 'headquarters', path: controlPlane },
    executionEngine: { id: 'project-governance-system', path: executionEngine },
    targets: [{ id: 'web-app', path: target }],
  };

  assert.deepEqual(
    getDefaultPortfolioTargets(manifest).map((entry) => entry.id),
    ['web-app'],
  );
});
