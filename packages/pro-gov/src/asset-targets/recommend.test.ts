import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { discoverTargetSignals, recommendBundlesForTarget } from './recommend';

test('discoverTargetSignals detects frontend project signals', () => {
  const targetDir = createTempTargetDir();
  writeFileSync(
    join(targetDir, 'package.json'),
    JSON.stringify({ dependencies: { react: '^19.0.0' }, devDependencies: { vite: '^7.0.0' } }),
  );
  writeFileSync(join(targetDir, 'AGENTS.md'), '# Agent Rules\n');

  const signals = discoverTargetSignals(targetDir);

  assert.equal(signals.hasPackageJson, true);
  assert.equal(signals.hasAgentEntry, true);
  assert.ok(signals.frontendSignals.includes('react'));
  assert.ok(signals.frontendSignals.includes('vite'));
});

test('recommendBundlesForTarget recommends base and frontend bundles for apps', () => {
  const targetDir = createTempTargetDir();
  writeFileSync(join(targetDir, 'package.json'), JSON.stringify({ dependencies: { next: '^16.0.0' } }));

  const recommendations = recommendBundlesForTarget(targetDir);

  assert.deepEqual(
    recommendations.map((recommendation) => recommendation.bundleId),
    ['base-governance', 'frontend-app'],
  );
});

test('recommendBundlesForTarget recommends writing and research bundles from local signals', () => {
  const targetDir = createTempTargetDir();
  mkdirSync(join(targetDir, 'docs/research'), { recursive: true });
  mkdirSync(join(targetDir, 'chapters'), { recursive: true });
  writeFileSync(join(targetDir, 'README.md'), 'A novel research workspace.\n');

  const recommendations = recommendBundlesForTarget(targetDir);
  const bundleIds = recommendations.map((recommendation) => recommendation.bundleId);

  assert.ok(bundleIds.includes('base-governance'));
  assert.ok(bundleIds.includes('research-docs'));
  assert.ok(bundleIds.includes('novel-writing'));
});

function createTempTargetDir(): string {
  const targetDir = join(tmpdir(), `pro-gov-target-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(targetDir, { recursive: true });
  return targetDir;
}
