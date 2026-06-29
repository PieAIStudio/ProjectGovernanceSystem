import assert from 'node:assert/strict';
import { mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import { loadAgentAssetRegistry } from './loader';
import { validateAssetRegistry } from './registry';

const baseAsset = {
  id: 'screenwalk',
  title: 'Screenwalk',
  family: 'pie-skills',
  kind: 'skill',
  visibility: 'private',
  sourceKind: 'local',
  sourcePath: 'skills/pie-skills/screenwalk',
  hosts: ['codex'],
  tags: ['ui'],
  defaultPlacement: 'auto',
  publishable: false,
  origin: 'OneDrive/MyProjectSkills/screenwalk',
  notes: 'Imported from Yuanfei custom skills.',
} as const;

test('validateAssetRegistry accepts a minimal safe registry', () => {
  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [baseAsset],
  });

  assert.deepEqual(issues, []);
});

test('validateAssetRegistry reports duplicate asset ids', () => {
  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [baseAsset, { ...baseAsset, title: 'Duplicate' }],
  });

  assert.ok(issues.some((issue) => issue.type === 'duplicate-id' && issue.id === 'screenwalk'));
});

test('validateAssetRegistry rejects source paths that escape agent-assets', () => {
  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [{ ...baseAsset, id: 'escaped', sourcePath: '../outside' }],
  });

  assert.ok(issues.some((issue) => issue.type === 'unsafe-source-path' && issue.id === 'escaped'));
});

test('validateAssetRegistry rejects publishable private and third-party assets', () => {
  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [
      { ...baseAsset, id: 'private-published', visibility: 'private', publishable: true },
      { ...baseAsset, id: 'third-party-published', visibility: 'third-party', publishable: true },
    ],
  });

  assert.deepEqual(
    issues
      .filter((issue) => issue.type === 'non-public-publishable')
      .map((issue) => issue.id)
      .sort(),
    ['private-published', 'third-party-published'],
  );
});

test('validateAssetRegistry reports unsupported hosts', () => {
  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [{ ...baseAsset, hosts: ['unknown-host'] as never }],
  });

  assert.ok(issues.some((issue) => issue.type === 'unsupported-host' && issue.id === 'screenwalk'));
});

test('validateAssetRegistry requires supported default placement for skill assets', () => {
  const { defaultPlacement: _removed, ...withoutPlacement } = baseAsset;

  const issues = validateAssetRegistry({
    schemaVersion: 1,
    assets: [
      withoutPlacement,
      { ...baseAsset, id: 'bad-placement', defaultPlacement: 'sideways' as never },
    ],
  });

  assert.deepEqual(
    issues
      .filter((issue) => issue.type === 'unsupported-skill-placement')
      .map((issue) => issue.id)
      .sort(),
    ['bad-placement', 'screenwalk'],
  );
});

test('validateAssetRegistry reports missing source paths and missing skill files', () => {
  const agentAssetsDir = join(tmpdir(), `pro-gov-assets-${Date.now()}`);
  mkdirSync(join(agentAssetsDir, 'skills/pie-skills/empty-skill'), { recursive: true });

  const issues = validateAssetRegistry(
    {
      schemaVersion: 1,
      assets: [
        { ...baseAsset, id: 'missing-source', sourcePath: 'skills/pie-skills/missing' },
        { ...baseAsset, id: 'missing-skill-file', sourcePath: 'skills/pie-skills/empty-skill' },
      ],
    },
    { agentAssetsDir },
  );

  assert.ok(
    issues.some((issue) => issue.type === 'missing-source-path' && issue.id === 'missing-source'),
  );
  assert.ok(
    issues.some((issue) => issue.type === 'missing-skill-file' && issue.id === 'missing-skill-file'),
  );
});

test('validateAssetRegistry rejects an internal npx compatibility layer', () => {
  const agentAssetsDir = join(tmpdir(), `pro-gov-assets-${Date.now()}`);
  mkdirSync(join(agentAssetsDir, 'skills/npx-skills'), { recursive: true });
  writeFileSync(join(agentAssetsDir, 'target'), '');
  symlinkSync('../target', join(agentAssetsDir, 'skills/npx-skills/skills'));

  const issues = validateAssetRegistry(
    {
      schemaVersion: 1,
      assets: [baseAsset],
    },
    { agentAssetsDir },
  );

  assert.ok(issues.some((issue) => issue.type === 'internal-npx-compatibility-layer'));
});

test('default agent asset registry is valid', () => {
  const loaded = loadAgentAssetRegistry();

  assert.deepEqual(loaded.issues, []);
});
