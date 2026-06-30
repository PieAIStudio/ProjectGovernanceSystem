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
  const controlPlane = join(rootDir, 'PieHQ');
  const executionEngine = join(rootDir, 'ProjectGovernanceSystem');
  const target = join(rootDir, 'OwnMySpace');
  mkdirSync(controlPlane);
  mkdirSync(executionEngine);
  mkdirSync(target);
  const configPath = join(rootDir, 'portfolio.json');
  writeFileSync(
    configPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        portfolioId: 'pieai',
        controlPlane: { id: 'piehq', path: controlPlane },
        executionEngine: { id: 'project-governance-system', path: executionEngine },
        targets: [
          {
            id: 'ownmyspace',
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
  assert.equal(loaded.manifest?.portfolioId, 'pieai');
  assert.deepEqual(
    getDefaultPortfolioTargets(loaded.manifest).map((entry) => entry.id),
    ['ownmyspace'],
  );
});

test('validatePortfolioManifest rejects duplicate target ids', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
  mkdirSync(join(rootDir, 'A'));
  mkdirSync(join(rootDir, 'B'));

  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'pieai',
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
    portfolioId: 'pieai',
    targets: [{ id: 'missing', path: '/definitely/missing/pieai-target' }],
  });

  assert.ok(issues.some((issue) => issue.type === 'missing-path' && issue.id === 'missing'));
});

test('validatePortfolioManifest rejects non-array assetBundles', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
  mkdirSync(join(rootDir, 'Target'));

  const issues = validatePortfolioManifest({
    schemaVersion: 1,
    portfolioId: 'pieai',
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
    portfolioId: 'pieai',
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
    portfolioId: 'pieai',
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
    portfolioId: 'pieai',
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

test('getDefaultPortfolioTargets excludes controlPlane and executionEngine metadata', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'pro-gov-portfolio-'));
  const controlPlane = join(rootDir, 'PieHQ');
  const executionEngine = join(rootDir, 'ProjectGovernanceSystem');
  const target = join(rootDir, 'OwnMySpace');
  mkdirSync(controlPlane);
  mkdirSync(executionEngine);
  mkdirSync(target);

  const manifest = {
    schemaVersion: 1 as const,
    portfolioId: 'pieai',
    controlPlane: { id: 'piehq', path: controlPlane },
    executionEngine: { id: 'project-governance-system', path: executionEngine },
    targets: [{ id: 'ownmyspace', path: target }],
  };

  assert.deepEqual(
    getDefaultPortfolioTargets(manifest).map((entry) => entry.id),
    ['ownmyspace'],
  );
});
