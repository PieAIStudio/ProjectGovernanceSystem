import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
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
      hosts: ['codex'],
      tags: ['skill'],
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
    plan.actions.some(
      (action) => action.type === 'symlink' && action.targetPath === '.agents/skills/example',
    ),
  );
  assert.ok(
    plan.actions.some(
      (action) =>
        action.type === 'write-file' && action.targetPath === '.pro-gov/assets.lock.json',
    ),
  );
  assert.equal(existsSync(join(targetDir, '.agents')), false);
  assert.equal(existsSync(join(targetDir, '.pro-gov')), false);
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
        host: 'claude-code',
      }),
    /Only the codex host adapter/,
  );
});

function createFixture(): { agentAssetsDir: string; targetDir: string } {
  const baseDir = join(tmpdir(), `pro-gov-plan-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const agentAssetsDir = join(baseDir, 'agent-assets');
  const targetDir = join(baseDir, 'target');
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  mkdirSync(join(agentAssetsDir, 'rules/pie-rules'), { recursive: true });
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');
  writeFileSync(join(agentAssetsDir, 'rules/pie-rules/example-rule.md'), '# Rule\n');
  return { agentAssetsDir, targetDir };
}
