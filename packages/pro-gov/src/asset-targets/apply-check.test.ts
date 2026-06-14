import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { applyAssetInstallPlan } from './apply';
import { checkInstalledAssets } from './check';
import { createAssetInstallPlan } from './install-plan';
import type { AgentAssetRegistry } from '../asset-registry/registry';
import type { AgentAssetBundle } from '../asset-bundles/bundles';

const registry: AgentAssetRegistry = {
  schemaVersion: 1,
  assets: [
    {
      id: 'pie-skills/example',
      title: 'Example',
      family: 'pie-skills',
      kind: 'skill',
      visibility: 'private',
      sourceKind: 'local',
      sourcePath: 'skills/pie-skills/example',
      hosts: ['codex'],
      tags: ['skill'],
      publishable: false,
      origin: 'test',
      notes: 'test',
    },
  ],
};

const bundles: AgentAssetBundle[] = [
  {
    id: 'base-governance',
    title: 'Base Governance',
    description: 'Base',
    assets: ['pie-skills/example'],
  },
];

test('applyAssetInstallPlan creates absolute symlinks and managed metadata', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  const plan = createPlan(agentAssetsDir, targetDir);

  const result = applyAssetInstallPlan(plan);

  assert.deepEqual(result.appliedActions, plan.actions.map((action) => action.type));
  const skillLink = join(targetDir, '.agents/skills/example');
  assert.equal(existsSync(skillLink), true);
  assert.equal(resolve(readlinkSync(skillLink)), join(agentAssetsDir, 'skills/pie-skills/example'));
  assert.equal(existsSync(join(targetDir, '.pro-gov/assets.json')), true);
  assert.equal(existsSync(join(targetDir, '.pro-gov/assets.lock.json')), true);
});

test('applyAssetInstallPlan refuses unmanaged target conflicts', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  mkdirSync(join(targetDir, '.agents/skills'), { recursive: true });
  writeFileSync(join(targetDir, '.agents/skills/example'), 'unmanaged\n');

  assert.throws(() => createPlan(agentAssetsDir, targetDir), /Refusing to overwrite unmanaged target/);
});

test('checkInstalledAssets reports clean install, hash drift, and dangling symlinks', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  applyAssetInstallPlan(createPlan(agentAssetsDir, targetDir));

  assert.deepEqual(checkInstalledAssets({ targetDir, agentAssetsDir, registry }).issues, []);

  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Edited\n');
  const drift = checkInstalledAssets({ targetDir, agentAssetsDir, registry });
  assert.ok(drift.issues.some((issue) => issue.type === 'hash-drift'));

  rmSync(join(agentAssetsDir, 'skills/pie-skills/example'), { recursive: true, force: true });
  const dangling = checkInstalledAssets({ targetDir, agentAssetsDir, registry });
  assert.ok(dangling.issues.some((issue) => issue.type === 'dangling-symlink'));
});

test('checkInstalledAssets reports managed skill targets in unsupported host folders', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  applyAssetInstallPlan(createPlan(agentAssetsDir, targetDir));
  mkdirSync(join(targetDir, '.claude/skills'), { recursive: true });
  symlinkSync(
    join(agentAssetsDir, 'skills/pie-skills/example'),
    join(targetDir, '.claude/skills/example'),
  );

  const lockfilePath = join(targetDir, '.pro-gov/assets.lock.json');
  const lockfile = JSON.parse(readFileSync(lockfilePath, 'utf8')) as {
    assets: Array<{ targetPath: string }>;
  };
  lockfile.assets[0].targetPath = '.claude/skills/example';
  writeFileSync(lockfilePath, `${JSON.stringify(lockfile, null, 2)}\n`);

  const result = checkInstalledAssets({ targetDir, agentAssetsDir, registry });
  assert.ok(result.issues.some((issue) => issue.type === 'unsupported-host-folder'));
});

function createPlan(agentAssetsDir: string, targetDir: string) {
  return createAssetInstallPlan({
    targetDir,
    agentAssetsDir,
    registry,
    bundles,
    bundleIds: ['base-governance'],
    host: 'codex',
  });
}

function createFixture(): { agentAssetsDir: string; targetDir: string } {
  const baseDir = join(tmpdir(), `pro-gov-apply-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const agentAssetsDir = join(baseDir, 'agent-assets');
  const targetDir = join(baseDir, 'target');
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');
  return { agentAssetsDir, targetDir };
}
