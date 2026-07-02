import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { applyAssetInstallPlan } from '../asset-targets/apply';
import { createAssetInstallPlan } from '../asset-targets/install-plan';
import type { AgentAssetBundle } from '../asset-bundles/bundles';
import type { AgentAssetRegistry } from '../asset-registry/registry';
import { comparePortfolioAssetState } from './asset-state';

const registry: AgentAssetRegistry = {
  schemaVersion: 1,
  assets: [{
    id: 'pie-skills/example',
    title: 'Example',
    family: 'pie-skills',
    kind: 'skill',
    visibility: 'private',
    sourceKind: 'local',
    sourcePath: 'skills/pie-skills/example',
    hosts: ['codex'],
    tags: ['skill'],
    defaultPlacement: 'auto',
    publishable: false,
    origin: 'test',
    notes: 'test',
  }],
};

const populatedBundle: AgentAssetBundle = {
  id: 'base-governance',
  title: 'Base Governance',
  description: 'Base',
  assets: ['pie-skills/example'],
};

test('comparePortfolioAssetState accepts a target applied from the expected plan', () => {
  const fixture = createFixture();
  const plan = createPlan(fixture, [populatedBundle], ['base-governance']);
  applyAssetInstallPlan(plan);

  assert.deepEqual(comparePortfolioAssetState({ targetDir: fixture.targetDir, expectedPlan: plan }).issues, []);
});

test('comparePortfolioAssetState reports bundle and asset-set drift', () => {
  const fixture = createFixture();
  const plan = createPlan(fixture, [populatedBundle], ['base-governance']);
  applyAssetInstallPlan(plan);
  const manifestPath = join(fixture.targetDir, '.pro-gov/assets.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    bundleIds: string[];
    assetIds: string[];
  };
  manifest.bundleIds = ['stale-bundle'];
  manifest.assetIds = [];
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const result = comparePortfolioAssetState({ targetDir: fixture.targetDir, expectedPlan: plan });

  assert.ok(result.issues.some((issue) => issue.type === 'bundle-drift'));
  assert.ok(result.issues.some((issue) => issue.type === 'asset-set-drift'));
});

test('comparePortfolioAssetState reports lock drift', () => {
  const fixture = createFixture();
  const plan = createPlan(fixture, [populatedBundle], ['base-governance']);
  applyAssetInstallPlan(plan);
  const lockPath = join(fixture.targetDir, '.pro-gov/assets.lock.json');
  const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as {
    assets: Array<{ contentHash: string }>;
  };
  lock.assets[0]!.contentHash = 'sha256:stale';
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const result = comparePortfolioAssetState({ targetDir: fixture.targetDir, expectedPlan: plan });

  assert.ok(result.issues.some((issue) => issue.type === 'asset-lock-drift'));
});

test('comparePortfolioAssetState reports a previously managed symlink absent from the expected bundle', () => {
  const fixture = createFixture();
  applyAssetInstallPlan(createPlan(fixture, [populatedBundle], ['base-governance']));
  const emptyBundle: AgentAssetBundle = {
    id: 'empty',
    title: 'Empty',
    description: 'Empty',
    assets: [],
  };
  const expectedPlan = createPlan(fixture, [emptyBundle], ['empty']);

  const result = comparePortfolioAssetState({ targetDir: fixture.targetDir, expectedPlan });

  assert.ok(result.issues.some((issue) =>
    issue.type === 'orphaned-managed-symlink' && issue.targetPath === '.agents/skills/example'));
});

function createFixture(): { agentAssetsDir: string; targetDir: string } {
  const baseDir = join(tmpdir(), `pro-gov-asset-state-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const agentAssetsDir = join(baseDir, 'agent-assets');
  const targetDir = join(baseDir, 'target');
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');
  return { agentAssetsDir, targetDir };
}

function createPlan(
  fixture: { agentAssetsDir: string; targetDir: string },
  bundles: AgentAssetBundle[],
  bundleIds: string[],
) {
  return createAssetInstallPlan({
    ...fixture,
    registry,
    bundles,
    bundleIds,
    host: 'codex',
  });
}
