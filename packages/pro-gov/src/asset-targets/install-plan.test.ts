import assert from 'node:assert/strict';
import { existsSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { createAssetInstallPlan } from './install-plan';
import type { AgentAssetRegistry } from '../asset-registry/registry';

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
      hosts: ['codex', 'claude-code', 'gemini-cli', 'antigravity'],
      tags: ['skill'],
      defaultPlacement: 'auto',
      publishable: false,
      origin: 'test',
      notes: 'test',
    },
    {
      id: 'pie-skills/manual-example',
      title: 'Manual Example',
      family: 'pie-skills',
      kind: 'skill',
      visibility: 'private',
      sourceKind: 'local',
      sourcePath: 'skills/pie-skills/manual-example',
      hosts: ['codex', 'claude-code', 'gemini-cli', 'antigravity'],
      tags: ['skill'],
      defaultPlacement: 'manual',
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
      hosts: ['codex', 'claude-code'],
      tags: ['skill'],
      defaultPlacement: 'auto',
      defaultScope: 'user',
      publishable: false,
      origin: 'test',
      notes: 'test',
    },
    {
      id: 'pie-rules/example-rule',
      title: 'Example Rule',
      family: 'pie-rules',
      kind: 'rule',
      visibility: 'private',
      sourceKind: 'local',
      sourcePath: 'rules/pie-rules/example-rule.md',
      hosts: ['codex'],
      tags: ['rule'],
      publishable: false,
      origin: 'test',
      notes: 'test',
    },
  ],
};

test('createAssetInstallPlan creates a dry install plan without writing target files', () => {
  const { agentAssetsDir, targetDir } = createFixture();

  const plan = createAssetInstallPlan({
    targetDir,
    agentAssetsDir,
    registry,
    bundles: [
      {
        id: 'base-governance',
        title: 'Base Governance',
        description: 'Base',
        assets: ['pie-skills/example', 'pie-rules/example-rule'],
      },
    ],
    bundleIds: ['base-governance'],
    host: 'codex',
  });

  assert.equal(plan.dryRun, true);
  assert.deepEqual(plan.bundleIds, ['base-governance']);
  assert.ok(
    plan.actions.some((action) => action.type === 'create-dir' && action.targetPath === '.agents/skills'),
  );
  assert.ok(
    plan.actions.some(
      (action) => action.type === 'symlink' && action.targetPath === '.agents/skills/example',
    ),
  );
  assert.ok(
    plan.actions.some(
      (action) => action.type === 'write-file' && action.targetPath === '.pro-gov/assets.lock.json',
    ),
  );
  assert.equal(existsSync(join(targetDir, '.agents')), false);
  assert.equal(existsSync(join(targetDir, '.pro-gov')), false);
});

test('createAssetInstallPlan maps supported hosts to exact skill directories', () => {
  const { agentAssetsDir, targetDir } = createFixture();

  const bundle = [
    { id: 'base-governance', title: 'Base Governance', description: 'Base', assets: ['pie-skills/example'] },
  ];

  assert.deepEqual(
    skillTargetPaths(
      createAssetInstallPlan({
        targetDir,
        agentAssetsDir,
        registry,
        bundles: bundle,
        bundleIds: ['base-governance'],
        host: 'codex',
      }),
    ),
    ['.agents/skills/example'],
  );
  assert.deepEqual(
    skillTargetPaths(
      createAssetInstallPlan({
        targetDir,
        agentAssetsDir,
        registry,
        bundles: bundle,
        bundleIds: ['base-governance'],
        host: 'claude-code',
      }),
    ),
    ['.claude/skills/example'],
  );
  assert.deepEqual(
    skillTargetPaths(
      createAssetInstallPlan({
        targetDir,
        agentAssetsDir,
        registry,
        bundles: bundle,
        bundleIds: ['base-governance'],
        host: 'gemini-cli',
      }),
    ),
    ['.agents/skills/example'],
  );
  assert.deepEqual(
    skillTargetPaths(
      createAssetInstallPlan({
        targetDir,
        agentAssetsDir,
        registry,
        bundles: bundle,
        bundleIds: ['base-governance'],
        host: 'antigravity',
      }),
    ),
    ['.agents/skills/example'],
  );
});

test('createAssetInstallPlan maps codex manual placement to manual skill directory', () => {
  const { agentAssetsDir, targetDir } = createFixture();

  const plan = createAssetInstallPlan({
    targetDir,
    agentAssetsDir,
    registry,
    bundles: [
      {
        id: 'base-governance',
        title: 'Base Governance',
        description: 'Base',
        assets: ['pie-skills/example'],
      },
    ],
    bundleIds: ['base-governance'],
    host: 'codex',
    placement: 'manual',
  });

  assert.equal(plan.placement, 'manual');
  assert.deepEqual(skillTargetPaths(plan), ['.agents/manual-skills/example']);
  assert.ok(
    plan.actions.some(
      (action) => action.type === 'create-dir' && action.targetPath === '.agents/manual-skills',
    ),
  );
});

test('createAssetInstallPlan uses per-skill registry placement by default', () => {
  const { agentAssetsDir, targetDir } = createFixture();

  const plan = createAssetInstallPlan({
    targetDir,
    agentAssetsDir,
    registry,
    bundles: [
      {
        id: 'mixed-placement',
        title: 'Mixed Placement',
        description: 'Mixed',
        assets: ['pie-skills/example', 'pie-skills/manual-example'],
      },
    ],
    bundleIds: ['mixed-placement'],
    host: 'codex',
  });

  assert.equal(plan.placement, 'registry');
  assert.deepEqual(skillTargetPaths(plan), [
    '.agents/manual-skills/manual-example',
    '.agents/skills/example',
  ]);
});

test('createAssetInstallPlan reports unsupported hosts and missing asset ids', () => {
  const { agentAssetsDir, targetDir } = createFixture();

  assert.throws(
    () =>
      createAssetInstallPlan({
        targetDir,
        agentAssetsDir,
        registry,
        bundles: [{ id: 'bad', title: 'Bad', description: 'Bad', assets: ['missing'] }],
        bundleIds: ['bad'],
        host: 'codex',
      }),
    /Unknown asset id/,
  );
});

test('createAssetInstallPlan rejects user-scoped skills in project install plans', () => {
  const { agentAssetsDir, targetDir } = createFixture();

  assert.throws(
    () =>
      createAssetInstallPlan({
        targetDir,
        agentAssetsDir,
        registry,
        bundles: [
          {
            id: 'user-tools',
            title: 'User Tools',
            description: 'User tools',
            assets: ['pie-skills/user-example'],
          },
        ],
        bundleIds: ['user-tools'],
        host: 'codex',
      }),
    /User-scoped asset pie-skills\/user-example must be linked at the user level/,
  );
});

test('createAssetInstallPlan refuses unmanaged existing targets', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  mkdirSync(join(targetDir, '.agents/skills'), { recursive: true });
  writeFileSync(join(targetDir, '.agents/skills/example'), 'unmanaged file\n');

  assert.throws(
    () =>
      createAssetInstallPlan({
        targetDir,
        agentAssetsDir,
        registry,
        bundles: [
          {
            id: 'base-governance',
            title: 'Base Governance',
            description: 'Base',
            assets: ['pie-skills/example'],
          },
        ],
        bundleIds: ['base-governance'],
        host: 'codex',
      }),
    /Refusing to overwrite unmanaged target/,
  );
});

test('createAssetInstallPlan allows managed symlink updates', () => {
  const { agentAssetsDir, targetDir } = createFixture();
  const oldSource = join(agentAssetsDir, 'old-example');
  writeFileSync(oldSource, 'old\n');
  mkdirSync(join(targetDir, '.agents/skills'), { recursive: true });
  mkdirSync(join(targetDir, '.pro-gov'), { recursive: true });
  symlinkSync(oldSource, join(targetDir, '.agents/skills/example'));
  writeFileSync(
    join(targetDir, '.pro-gov/assets.lock.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        host: 'codex',
        bundleIds: ['base-governance'],
        assets: [
          {
            id: 'pie-skills/example',
            sourcePath: 'skills/pie-skills/example',
            targetPath: '.agents/skills/example',
            contentHash: 'sha256:old',
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const plan = createAssetInstallPlan({
    targetDir,
    agentAssetsDir,
    registry,
    bundles: [{ id: 'base-governance', title: 'Base Governance', description: 'Base', assets: ['pie-skills/example'] }],
    bundleIds: ['base-governance'],
    host: 'codex',
  });

  assert.ok(
    plan.actions.some(
      (action) => action.type === 'update-symlink' && action.targetPath === '.agents/skills/example',
    ),
  );
});

function createFixture(): { agentAssetsDir: string; targetDir: string } {
  const baseDir = join(tmpdir(), `pro-gov-plan-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const agentAssetsDir = join(baseDir, 'agent-assets');
  const targetDir = join(baseDir, 'target');
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/manual-example'), { recursive: true });
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/user-example'), { recursive: true });
  mkdirSync(join(agentAssetsDir, 'rules/pie-rules'), { recursive: true });
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/manual-example/SKILL.md'), '# Manual\n');
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/user-example/SKILL.md'), '# User\n');
  writeFileSync(join(agentAssetsDir, 'rules/pie-rules/example-rule.md'), '# Rule\n');
  return { agentAssetsDir, targetDir };
}

function skillTargetPaths(plan: ReturnType<typeof createAssetInstallPlan>): string[] {
  return plan.actions
    .filter((action) => action.type === 'symlink' || action.type === 'update-symlink')
    .map((action) => action.targetPath)
    .sort();
}
