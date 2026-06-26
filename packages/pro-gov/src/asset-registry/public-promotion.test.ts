import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { hashAssetPathContent } from './loader';
import { checkPublicAssetPromotions } from './public-promotion';
import type { AgentAssetRegistryEntry } from './registry';

const basePublicAsset = {
  id: 'pie-skills/example',
  title: 'Example',
  family: 'pie-skills',
  kind: 'skill',
  visibility: 'public',
  sourceKind: 'local',
  sourcePath: 'skills/pie-skills/example',
  hosts: ['codex'],
  tags: ['skill'],
  publishable: true,
  origin: 'Promoted from private source.',
  notes: 'Public reviewed copy.',
} as const satisfies AgentAssetRegistryEntry;

test('checkPublicAssetPromotions accepts a reviewed public copy that differs from its private source', () => {
  const roots = createPromotionRoots({
    privateBody: 'private source with maintainer notes\n',
    publicBody: 'public reviewed copy\n',
  });

  const result = checkPublicAssetPromotions({
    publicAgentAssetsDir: roots.publicAgentAssetsDir,
    privateAgentAssetsDir: roots.privateAgentAssetsDir,
    registry: {
      schemaVersion: 1,
      assets: [
        {
          ...basePublicAsset,
          promotion: {
            privateSourcePath: 'skills/pie-skills/example',
            privateSourceHash: roots.privateHash,
            publicHash: roots.publicHash,
            sanitized: true,
            lastReviewed: '2026-06-25',
            reviewNotes: 'Removed maintainer-only details.',
          },
        },
      ],
    },
  });

  assert.deepEqual(result.issues, []);
});

test('checkPublicAssetPromotions reports source and public drift after registration', () => {
  const roots = createPromotionRoots({
    privateBody: 'private source\n',
    publicBody: 'public copy\n',
  });

  writeFileSync(join(roots.privateAgentAssetsDir, 'skills/pie-skills/example/SKILL.md'), 'private edited\n');
  writeFileSync(join(roots.publicAgentAssetsDir, 'skills/pie-skills/example/SKILL.md'), 'public edited\n');

  const result = checkPublicAssetPromotions({
    publicAgentAssetsDir: roots.publicAgentAssetsDir,
    privateAgentAssetsDir: roots.privateAgentAssetsDir,
    registry: {
      schemaVersion: 1,
      assets: [
        {
          ...basePublicAsset,
          promotion: {
            privateSourcePath: 'skills/pie-skills/example',
            privateSourceHash: roots.privateHash,
            publicHash: roots.publicHash,
            sanitized: true,
            lastReviewed: '2026-06-25',
            reviewNotes: 'Initial review.',
          },
        },
      ],
    },
  });

  assert.deepEqual(
    result.issues.map((issue) => issue.type).sort(),
    ['public-drift', 'source-drift'],
  );
});

test('checkPublicAssetPromotions requires promotion metadata for publishable public assets', () => {
  const roots = createPromotionRoots({
    privateBody: 'private source\n',
    publicBody: 'public copy\n',
  });

  const result = checkPublicAssetPromotions({
    publicAgentAssetsDir: roots.publicAgentAssetsDir,
    privateAgentAssetsDir: roots.privateAgentAssetsDir,
    registry: {
      schemaVersion: 1,
      assets: [basePublicAsset],
    },
  });

  assert.deepEqual(result.issues.map((issue) => issue.type), ['missing-promotion']);
});

function createPromotionRoots(input: { privateBody: string; publicBody: string }): {
  privateAgentAssetsDir: string;
  publicAgentAssetsDir: string;
  privateHash: string;
  publicHash: string;
} {
  const root = join(tmpdir(), `pro-gov-public-promotion-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const privateAgentAssetsDir = join(root, 'agent-assets');
  const publicAgentAssetsDir = join(root, 'public-agent-assets');
  mkdirSync(join(privateAgentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  mkdirSync(join(publicAgentAssetsDir, 'skills/pie-skills/example'), { recursive: true });
  writeFileSync(join(privateAgentAssetsDir, 'skills/pie-skills/example/SKILL.md'), input.privateBody);
  writeFileSync(join(publicAgentAssetsDir, 'skills/pie-skills/example/SKILL.md'), input.publicBody);

  return {
    privateAgentAssetsDir,
    publicAgentAssetsDir,
    privateHash: hashAssetPathContent(join(privateAgentAssetsDir, 'skills/pie-skills/example')),
    publicHash: hashAssetPathContent(join(publicAgentAssetsDir, 'skills/pie-skills/example')),
  };
}
