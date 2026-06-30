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
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { applyAssetInstallPlan } from './apply';
import { checkInstalledAssets } from './check';
import { createAssetInstallPlan } from './install-plan';
import { hashAssetPathContent } from '../asset-registry/loader';
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
      defaultPlacement: 'auto',
      publishable: false,
      origin: 'test',
      notes: 'test',
    },
    {
      id: 'pie-skills/user-example',
      title: 'User Example',
      family: 'pie-skills',
      kind: 'skill',
      visibility: 'private',
      sourceKind: 'local',
      sourcePath: 'skills/pie-skills/user-example',
      hosts: ['codex'],
      tags: ['skill'],
      defaultPlacement: 'auto',
      defaultScope: 'user',
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

test('applyAssetInstallPlan creates relative symlinks and managed metadata', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  const plan = createPlan(agentAssetsDir, targetDir);

  const result = applyAssetInstallPlan(plan);

  assert.deepEqual(result.appliedActions, plan.actions.map((action) => action.type));
  const skillLink = join(targetDir, '.agents/skills/example');
  assert.equal(existsSync(skillLink), true);
  assert.equal(isAbsolute(readlinkSync(skillLink)), false);
  assert.equal(resolve(dirname(skillLink), readlinkSync(skillLink)), join(agentAssetsDir, 'skills/pie-skills/example'));
  assert.equal(existsSync(join(targetDir, '.pro-gov/assets.json')), true);
  assert.equal(existsSync(join(targetDir, '.pro-gov/assets.lock.json')), true);
});

test('applyAssetInstallPlan creates codex manual skill symlinks that pass checks', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  const plan = createPlan(agentAssetsDir, targetDir, 'manual');

  applyAssetInstallPlan(plan);

  const skillLink = join(targetDir, '.agents/manual-skills/example');
  assert.equal(existsSync(skillLink), true);
  assert.equal(isAbsolute(readlinkSync(skillLink)), false);
  assert.equal(resolve(dirname(skillLink), readlinkSync(skillLink)), join(agentAssetsDir, 'skills/pie-skills/example'));
  assert.deepEqual(checkInstalledAssets({ targetDir, agentAssetsDir, registry }).issues, []);
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

test('checkInstalledAssets portable mode accepts locked symlink content without registry knowledge', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  mkdirSync(join(targetDir, '.agents/skills'), { recursive: true });
  mkdirSync(join(targetDir, '.pro-gov'), { recursive: true });
  const sourcePath = join(agentAssetsDir, 'skills/pie-skills/example');
  symlinkSync(sourcePath, join(targetDir, '.agents/skills/example'));
  writeFileSync(
    join(targetDir, '.pro-gov/assets.lock.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        host: 'codex',
        placement: 'registry',
        bundleIds: ['base-governance'],
        assets: [
          {
            id: 'private-skills/example',
            sourcePath: 'skills/private-skills/example',
            targetPath: '.agents/skills/example',
            contentHash: hashAssetPathContent(sourcePath),
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const result = checkInstalledAssets({
    targetDir,
    agentAssetsDir: join(agentAssetsDir, 'public-agent-assets'),
    registry: { schemaVersion: 1, assets: [] },
  });

  assert.deepEqual(result.issues, []);
});

test('checkInstalledAssets strict registry mode reports unknown locked assets', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  mkdirSync(join(targetDir, '.agents/skills'), { recursive: true });
  mkdirSync(join(targetDir, '.pro-gov'), { recursive: true });
  const sourcePath = join(agentAssetsDir, 'skills/pie-skills/example');
  symlinkSync(sourcePath, join(targetDir, '.agents/skills/example'));
  writeFileSync(
    join(targetDir, '.pro-gov/assets.lock.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        host: 'codex',
        placement: 'registry',
        bundleIds: ['base-governance'],
        assets: [
          {
            id: 'private-skills/example',
            sourcePath: 'skills/private-skills/example',
            targetPath: '.agents/skills/example',
            contentHash: hashAssetPathContent(sourcePath),
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const result = checkInstalledAssets({
    targetDir,
    agentAssetsDir,
    registry: { schemaVersion: 1, assets: [] },
    strictRegistry: true,
  });

  assert.ok(result.issues.some((issue) => issue.type === 'unknown-asset'));
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

test('checkInstalledAssets reports duplicate auto and manual skill links', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  applyAssetInstallPlan(createPlan(agentAssetsDir, targetDir));
  mkdirSync(join(targetDir, '.agents/manual-skills'), { recursive: true });
  symlinkSync(
    join(agentAssetsDir, 'skills/pie-skills/example'),
    join(targetDir, '.agents/manual-skills/example'),
  );

  const result = checkInstalledAssets({ targetDir, agentAssetsDir, registry });

  assert.ok(result.issues.some((issue) => issue.type === 'duplicate-skill-placement'));
});

test('checkInstalledAssets reports registry placement drift', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  const manualRegistry: AgentAssetRegistry = {
    schemaVersion: 1,
    assets: [{ ...registry.assets[0], defaultPlacement: 'manual' }],
  };
  mkdirSync(join(targetDir, '.agents/skills'), { recursive: true });
  mkdirSync(join(targetDir, '.pro-gov'), { recursive: true });
  symlinkSync(join(agentAssetsDir, 'skills/pie-skills/example'), join(targetDir, '.agents/skills/example'));
  writeFileSync(
    join(targetDir, '.pro-gov/assets.lock.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        host: 'codex',
        placement: 'registry',
        bundleIds: ['base-governance'],
        assets: [
          {
            id: 'pie-skills/example',
            sourcePath: 'skills/pie-skills/example',
            targetPath: '.agents/skills/example',
            contentHash: 'sha256:test',
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const result = checkInstalledAssets({ targetDir, agentAssetsDir, registry: manualRegistry });

  assert.ok(result.issues.some((issue) => issue.type === 'skill-placement-drift'));
});

test('checkInstalledAssets reports user-scoped skills still locked into a project', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  mkdirSync(join(targetDir, '.agents/skills'), { recursive: true });
  mkdirSync(join(targetDir, '.pro-gov'), { recursive: true });
  symlinkSync(
    join(agentAssetsDir, 'skills/pie-skills/user-example'),
    join(targetDir, '.agents/skills/user-example'),
  );
  writeFileSync(
    join(targetDir, '.pro-gov/assets.lock.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        host: 'codex',
        placement: 'registry',
        bundleIds: ['user-tools'],
        assets: [
          {
            id: 'pie-skills/user-example',
            sourcePath: 'skills/pie-skills/user-example',
            targetPath: '.agents/skills/user-example',
            contentHash: 'sha256:test',
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const result = checkInstalledAssets({ targetDir, agentAssetsDir, registry });

  assert.ok(result.issues.some((issue) => issue.type === 'user-scoped-asset-in-project-lock'));
});

function createPlan(agentAssetsDir: string, targetDir: string, placement: 'auto' | 'manual' = 'auto') {
  return createAssetInstallPlan({
    targetDir,
    agentAssetsDir,
    registry,
    bundles,
    bundleIds: ['base-governance'],
    host: 'codex',
    placement,
  });
}

function createFixture(): { agentAssetsDir: string; targetDir: string } {
  const baseDir = join(tmpdir(), `pro-gov-apply-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const agentAssetsDir = join(baseDir, 'agent-assets');
  const targetDir = join(baseDir, 'target');
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/user-example'), { recursive: true });
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/user-example/SKILL.md'), '# User\n');
  return { agentAssetsDir, targetDir };
}
