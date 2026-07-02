import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { applyAssetInstallPlan } from '../asset-targets/apply';
import { createAssetInstallPlan } from '../asset-targets/install-plan';
import type { AgentAssetBundle } from '../asset-bundles/bundles';
import type { AgentAssetRegistry } from '../asset-registry/registry';
import { inspectPortfolio } from './doctor';

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
      hosts: ['codex', 'claude-code'],
      tags: ['skill'],
      defaultPlacement: 'auto',
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

test('inspectPortfolio compares expected asset state using the target lockfile host', () => {
  const fixture = createFixture();
  applyAssetInstallPlan(
    createAssetInstallPlan({
      targetDir: fixture.targetDir,
      agentAssetsDir: fixture.agentAssetsDir,
      registry,
      bundles,
      bundleIds: ['base-governance'],
      host: 'claude-code',
    }),
  );

  const result = inspectPortfolio({
    manifest: {
      schemaVersion: 1,
      portfolioId: 'example-org',
      targets: [],
    },
    targets: [
      {
        id: 'web-app',
        path: fixture.targetDir,
        profile: 'engineering-runtime',
        assetBundles: ['base-governance'],
      },
    ],
    agentAssetsDir: fixture.agentAssetsDir,
    registry,
    bundles,
  });

  const issueTypes = result.targets[0]!.issues.map((issue) => issue.type);
  assert.equal(issueTypes.includes('asset-lock-drift'), false);
  assert.equal(issueTypes.includes('orphaned-managed-symlink'), false);
});

function createFixture(): { agentAssetsDir: string; targetDir: string } {
  const baseDir = join(tmpdir(), `pro-gov-portfolio-doctor-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const agentAssetsDir = join(baseDir, 'agent-assets');
  const targetDir = join(baseDir, 'target');
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(agentAssetsDir, 'skills/pie-skills/example/SKILL.md'), '# Example\n');
  return { agentAssetsDir, targetDir };
}
